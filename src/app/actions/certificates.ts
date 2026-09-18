'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { getCurrentUser } from '@/app/actions/auth'
import { revalidatePath } from 'next/cache'

/**
 * Server Action: Upload certificate image and insert record into certificates table.
 */
export async function addCertificateAction(prevState: any, formData: FormData) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return { error: 'Unauthorized: You must be logged in.' }
  }

  const title = (formData.get('title') as string)?.trim()
  const photoEntry = formData.get('image')

  if (!title) {
    return { error: 'Certificate title is required.' }
  }

  // Node.js runtime-safe file validation
  const isFileLike = Boolean(
    photoEntry &&
    typeof photoEntry === 'object' &&
    'name' in photoEntry &&
    typeof (photoEntry as any).name === 'string' &&
    (photoEntry as any).name.trim().length > 0 &&
    'size' in photoEntry &&
    typeof (photoEntry as any).size === 'number' &&
    (photoEntry as any).size > 0
  )

  if (!isFileLike) {
    return { error: 'Certificate document image is required.' }
  }

  const imageFile = photoEntry as unknown as File
  const bucketName = 'portfolio_images'
  const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
  const cleanFileName = `cert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
  const filePath = `certificates/${cleanFileName}`

  const fileBuffer = Buffer.from(await imageFile.arrayBuffer())

  // 1. Upload to Supabase Storage
  const supabase = await createClient()
  let uploadResult = await supabase.storage
    .from(bucketName)
    .upload(filePath, fileBuffer, {
      contentType: imageFile.type || 'image/jpeg',
      upsert: false,
    })

  // Fallback to admin client if user client lacks storage policy
  if (uploadResult.error) {
    try {
      const adminSupabase = createAdminClient()
      uploadResult = await adminSupabase.storage
        .from(bucketName)
        .upload(filePath, fileBuffer, {
          contentType: imageFile.type || 'image/jpeg',
          upsert: false,
        })
    } catch (adminErr: any) {
      console.error('Admin storage fallback failed:', adminErr)
    }
  }

  if (uploadResult.error) {
    return { error: `Storage upload failed: ${uploadResult.error.message}` }
  }

  // 2. Resolve Public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath)

  const publicUrl = publicUrlData?.publicUrl
  if (!publicUrl) {
    return { error: 'Failed to retrieve public URL for the uploaded certificate.' }
  }

  // 3. Insert record into certificates table
  const adminSupabase = createAdminClient()
  const { error: insertError } = await adminSupabase
    .from('certificates')
    .insert({
      title,
      image_url: publicUrl,
    })

  if (insertError) {
    return { error: `Failed to save certificate record: ${insertError.message}` }
  }

  revalidatePath('/admin/certificates')
  revalidatePath('/')

  return { success: true, message: 'Certificate successfully uploaded and published!' }
}

/**
 * Server Action: Delete a certificate record and remove its storage image.
 */
export async function deleteCertificateAction(formData: FormData) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return { error: 'Unauthorized: You must be logged in.' }
  }

  if (currentUser.role === 'guest_admin') {
    return { error: 'Permission denied: Guest Admins cannot delete certificates.' }
  }

  const certificateId = formData.get('certificate_id') as string
  if (!certificateId) {
    return { error: 'Certificate ID is required.' }
  }

  const adminSupabase = createAdminClient()

  // 1. Fetch record to get image URL for storage purge
  const { data: cert } = await adminSupabase
    .from('certificates')
    .select('image_url')
    .eq('id', certificateId)
    .single()

  // 2. Delete database record
  const { error: deleteError } = await adminSupabase
    .from('certificates')
    .delete()
    .eq('id', certificateId)

  if (deleteError) {
    return { error: `Failed to delete certificate: ${deleteError.message}` }
  }

  // 3. Purge image from storage
  if (cert?.image_url) {
    try {
      const bucketName = 'portfolio_images'
      const parts = cert.image_url.split(`${bucketName}/`)
      if (parts.length > 1) {
        await adminSupabase.storage.from(bucketName).remove([parts[1]])
      }
    } catch (purgeErr) {
      console.error('Non-blocking storage cleanup error:', purgeErr)
    }
  }

  revalidatePath('/admin/certificates')
  revalidatePath('/')

  return { success: true, message: 'Certificate deleted successfully.' }
}