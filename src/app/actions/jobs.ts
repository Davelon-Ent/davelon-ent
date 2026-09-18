'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { getCurrentUser } from '@/app/actions/auth'
import { revalidatePath } from 'next/cache'

/**
 * Creates a URL-friendly slug with unique suffix
 */
function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 50)
  const randomSuffix = Math.random().toString(36).substring(2, 7)
  return `${base || 'job'}-${randomSuffix}`
}

/**
 * Server Action: Upload image to Supabase Storage and create completed_job entry.
 * STRICT ENFORCEMENT: An image is mandatory, and database insert will never run without it.
 */
export async function addJobAction(prevState: any, formData: FormData) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return { error: 'Unauthorized: You must be logged in to create jobs.' }
  }

  const title = (formData.get('title') as string)?.trim()
  const serviceCategory = formData.get('service_category') as string
  const clientName = (formData.get('client_name') as string)?.trim() || null
  const description = (formData.get('description') as string)?.trim()
  const completionDate = (formData.get('completion_date') as string) || null
  const photoEntry = formData.get('photo')

  if (!title || !serviceCategory || !description) {
    return { error: 'Please provide a title, category, and description.' }
  }

  const validCategories = ['Electro-Mechanical', 'Metal Fabrication', 'Solar Power']
  if (!validCategories.includes(serviceCategory)) {
    return { error: 'Invalid service category selected.' }
  }

  // 1. STRICT CHECK: Image is required (Node.js runtime-safe validation without instanceof File)
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
    return { error: 'A portfolio image is strictly required.' }
  }

  const imageFile = photoEntry as unknown as File
  const bucketName = 'portfolio_images'
  const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
  const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
  const filePath = `jobs/${cleanFileName}`

  const fileBuffer = Buffer.from(await imageFile.arrayBuffer())

  // 2. Attempt upload to Supabase Storage
  const supabase = await createClient()
  let uploadResult = await supabase.storage
    .from(bucketName)
    .upload(filePath, fileBuffer, {
      contentType: imageFile.type || 'image/jpeg',
      upsert: false,
    })

  // Fallback to service role admin client if authenticated client is blocked by storage policies
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

  // 3. HARD STOP: If storage upload failed, immediately halt execution and return exact error
  if (uploadResult.error) {
    return {
      error: `Storage upload failed: ${uploadResult.error.message}`,
    }
  }

  // 4. Resolve Public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath)

  const publicUrl = publicUrlData?.publicUrl
  const imageUrls: string[] = []

  if (publicUrl && typeof publicUrl === 'string' && publicUrl.trim().length > 0) {
    imageUrls.push(publicUrl)
  }

  // 5. STRICT GUARD: Under no circumstances allow falling through to DB insert without a valid image URL
  if (!imageUrls || imageUrls.length === 0 || !imageUrls[0]) {
    return { error: 'Failed to resolve public image URL. Database insert aborted.' }
  }

  // 6. Database Insert into completed_jobs (Only reached when image URL is guaranteed)
  const slug = generateSlug(title)
  const { error: insertError } = await supabase.from('completed_jobs').insert({
    title,
    slug,
    service_category: serviceCategory,
    client_name: clientName,
    description,
    completion_date: completionDate,
    images: imageUrls,
  })

  if (insertError) {
    return { error: `Failed to save job record: ${insertError.message}` }
  }

  revalidatePath('/admin/jobs')
  return { success: true, message: 'Completed job successfully published with portfolio image!' }
}

/**
 * Server Action: Delete a completed job and purge its storage assets.
 */
export async function deleteJobAction(formData: FormData) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return { error: 'Unauthorized: You must be logged in.' }
  }

  // Enforce RBAC: Guest Admins cannot delete existing content per PRD
  if (currentUser.role === 'guest_admin') {
    return { error: 'Permission denied: Guest Admins cannot delete records.' }
  }

  const jobId = formData.get('job_id') as string
  if (!jobId) {
    return { error: 'Job ID is required.' }
  }

  const supabase = await createClient()

  // 1. Fetch image URLs before deletion to clean up storage
  const { data: job } = await supabase
    .from('completed_jobs')
    .select('images')
    .eq('id', jobId)
    .single()

  // 2. Delete job record
  const { error: deleteError } = await supabase
    .from('completed_jobs')
    .delete()
    .eq('id', jobId)

  if (deleteError) {
    return { error: `Failed to delete job: ${deleteError.message}` }
  }

  // 3. Purge storage files if any
  if (job?.images && Array.isArray(job.images) && job.images.length > 0) {
    try {
      const adminSupabase = createAdminClient()
      const bucketName = 'portfolio_images'

      const filePathsToDelete = job.images
        .map((url: string) => {
          const parts = url.split(`${bucketName}/`)
          return parts.length > 1 ? parts[1] : null
        })
        .filter(Boolean) as string[]

      if (filePathsToDelete.length > 0) {
        await adminSupabase.storage.from(bucketName).remove(filePathsToDelete)
      }
    } catch (cleanErr) {
      console.error('Non-blocking storage purge error:', cleanErr)
    }
  }

  revalidatePath('/admin/jobs')
  return { success: true, message: 'Job deleted successfully.' }
}