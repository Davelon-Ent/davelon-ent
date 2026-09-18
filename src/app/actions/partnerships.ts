'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { getCurrentUser } from '@/app/actions/auth'
import { revalidatePath } from 'next/cache'

export interface Partnership {
  id: string
  name: string
  logo_url: string
  agreement_url: string
  created_at: string
}

/**
 * Super Admin Action: Add a new partner business with logo and agreement document.
 */
export async function addPartnerAction(prevState: any, formData: FormData) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return { error: 'Authentication session expired or unauthenticated. Please log into the admin portal again.' }
  }
  if (currentUser.role !== 'super_admin' && currentUser.role !== 'staff_admin') {
    return {
      error: `Unauthorized: Your account (${currentUser.email}) is currently assigned the role "${currentUser.role}". Staff Admin or Super Admin clearance is required to register partners.`,
    }
  }

  const name = (formData.get('name') as string)?.trim()
  const logoEntry = formData.get('logo')
  const agreementEntry = formData.get('agreement')

  if (!name || name.length < 2) {
    return { error: 'Please provide a valid partner business name.' }
  }

  // Node.js safe file validation
  const isFileLike = (entry: any): boolean => {
    return Boolean(
      entry &&
      typeof entry === 'object' &&
      'name' in entry &&
      typeof entry.name === 'string' &&
      entry.name.trim().length > 0 &&
      'size' in entry &&
      typeof entry.size === 'number' &&
      entry.size > 0
    )
  }

  if (!isFileLike(logoEntry)) {
    return { error: 'A partner logo image file is strictly required.' }
  }

  if (!isFileLike(agreementEntry)) {
    return { error: 'A partnership agreement document or photo is strictly required.' }
  }

  const logoFile = logoEntry as unknown as File
  const agreementFile = agreementEntry as unknown as File
  const bucketName = 'partner_files'

  const adminSupabase = createAdminClient()

  // Robust helper to upload buffer with automatic retry on socket reset (ECONNRESET)
  async function uploadFileSequentially(
    path: string,
    buffer: Buffer,
    contentType: string,
    maxRetries = 2
  ) {
    let lastError: any = null
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const client = createAdminClient()
        const result = await client.storage
          .from(bucketName)
          .upload(path, buffer, {
            contentType,
            upsert: true,
            duplex: 'half',
          } as any)

        if (!result.error) {
          return { error: null }
        }

        lastError = result.error
        const isSocketError =
          result.error.message?.includes('fetch failed') ||
          (result.error as any)?.cause?.code === 'ECONNRESET'

        if (isSocketError && attempt < maxRetries) {
          console.warn(`Upload attempt ${attempt} for ${path} encountered socket reset. Retrying in 400ms...`)
          await new Promise((res) => setTimeout(res, 400))
          continue
        }

        return { error: result.error }
      } catch (err: any) {
        lastError = err
        if (attempt < maxRetries) {
          await new Promise((res) => setTimeout(res, 400))
          continue
        }
        return { error: err }
      }
    }
    return { error: lastError }
  }

  // 1. Upload Partner Logo
  const logoExt = logoFile.name.split('.').pop()?.toLowerCase() || 'png'
  const logoFileName = `logo-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${logoExt}`
  const logoPath = `logos/${logoFileName}`
  const logoBuffer = Buffer.from(await logoFile.arrayBuffer())

  const { error: logoUploadError } = await uploadFileSequentially(
    logoPath,
    logoBuffer,
    logoFile.type || 'image/png'
  )

  if (logoUploadError) {
    console.error('Logo upload error:', logoUploadError, (logoUploadError as any)?.cause)
    return { error: `Failed to upload partner logo: ${logoUploadError.message}` }
  }

  const { data: logoUrlData } = adminSupabase.storage
    .from(bucketName)
    .getPublicUrl(logoPath)

  const logoUrl = logoUrlData?.publicUrl
  if (!logoUrl) {
    return { error: 'Failed to resolve public URL for partner logo.' }
  }

  // 2. Upload Agreement Document / Photo (Executed sequentially with clean connection)
  const agreementExt = agreementFile.name.split('.').pop()?.toLowerCase() || 'jpg'
  const agreementFileName = `agreement-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${agreementExt}`
  const agreementPath = `agreements/${agreementFileName}`
  const agreementBuffer = Buffer.from(await agreementFile.arrayBuffer())

  const { error: agreementUploadError } = await uploadFileSequentially(
    agreementPath,
    agreementBuffer,
    agreementFile.type || 'image/jpeg'
  )

  if (agreementUploadError) {
    console.error('Agreement upload error:', agreementUploadError, (agreementUploadError as any)?.cause)
    // Clean up already uploaded logo to avoid orphaned storage assets
    await adminSupabase.storage.from(bucketName).remove([logoPath])
    return { error: `Failed to upload agreement photo: ${agreementUploadError.message}` }
  }

  const { data: agreementUrlData } = adminSupabase.storage
    .from(bucketName)
    .getPublicUrl(agreementPath)

  const agreementUrl = agreementUrlData?.publicUrl
  if (!agreementUrl) {
    return { error: 'Failed to resolve public URL for partnership agreement.' }
  }

  // 3. Insert record into partnerships table
  const { error: insertError } = await adminSupabase
    .from('partnerships')
    .insert({
      name,
      logo_url: logoUrl,
      agreement_url: agreementUrl,
    })

  if (insertError) {
    // Rollback storage uploads on database failure
    await adminSupabase.storage.from(bucketName).remove([logoPath, agreementPath])
    return { error: `Failed to save partner record: ${insertError.message}` }
  }

  revalidatePath('/admin/partnerships')
  revalidatePath('/')

  return { success: true, message: `Partner "${name}" successfully registered and published!` }
}

/**
 * Super Admin Action: Delete a partner and purge associated files from storage.
 */
export async function deletePartnerAction(prevStateOrFormData: any, maybeFormData?: FormData) {
  const formData = maybeFormData instanceof FormData
    ? maybeFormData
    : (prevStateOrFormData instanceof FormData ? prevStateOrFormData : (prevStateOrFormData?.get ? prevStateOrFormData : maybeFormData))

  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return { error: 'Authentication session expired or unauthenticated. Please log in again.' }
  }
  if (currentUser.role !== 'super_admin' && currentUser.role !== 'staff_admin') {
    return {
      error: `Unauthorized: Your account (${currentUser.email}) is currently assigned the role "${currentUser.role}". Staff Admin or Super Admin clearance is required to remove partners.`,
    }
  }

  const id = formData?.get('id') as string
  if (!id) {
    return { error: 'Partner ID is required.' }
  }

  const adminSupabase = createAdminClient()
  const bucketName = 'partner_files'

  // 1. Fetch record to get file URLs
  const { data: partner } = await adminSupabase
    .from('partnerships')
    .select('name, logo_url, agreement_url')
    .eq('id', id)
    .single()

  // 2. Delete row from database
  const { error: deleteError } = await adminSupabase
    .from('partnerships')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return { error: `Failed to delete partner: ${deleteError.message}` }
  }

  // 3. Purge files from storage
  if (partner) {
    const filesToRemove: string[] = []

    if (partner.logo_url) {
      const parts = partner.logo_url.split(`${bucketName}/`)
      if (parts.length > 1) filesToRemove.push(parts[1])
    }

    if (partner.agreement_url) {
      const parts = partner.agreement_url.split(`${bucketName}/`)
      if (parts.length > 1) filesToRemove.push(parts[1])
    }

    if (filesToRemove.length > 0) {
      try {
        await adminSupabase.storage.from(bucketName).remove(filesToRemove)
      } catch (purgeErr) {
        console.error('Failed to purge partner files from storage:', purgeErr)
      }
    }
  }

  revalidatePath('/admin/partnerships')
  revalidatePath('/')

  return { success: true, message: `Partner "${partner?.name || 'record'}" removed successfully.` }
}