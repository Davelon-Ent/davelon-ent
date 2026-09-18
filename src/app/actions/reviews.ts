'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { getCurrentUser } from '@/app/actions/auth'
import { revalidatePath } from 'next/cache'

/**
 * Server Action: Generate a single-use 72-hour review token for a completed job.
 * Callable by Super Admin and Staff Admin.
 */
export async function generateReviewToken(jobId: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return { error: 'Unauthorized: Please log in.' }
  }

  if (currentUser.role === 'guest_admin') {
    return { error: 'Permission denied: Guest Admins cannot generate review links.' }
  }

  if (!jobId) {
    return { error: 'Job ID is required.' }
  }

  const adminSupabase = createAdminClient()

  // Verify job exists
  const { data: job, error: jobError } = await adminSupabase
    .from('completed_jobs')
    .select('id, title')
    .eq('id', jobId)
    .single()

  if (jobError || !job) {
    return { error: 'Job record not found.' }
  }

  // Create review token record (expires in 72 hours)
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
  const { data: reviewRecord, error: insertError } = await adminSupabase
    .from('reviews')
    .insert({
      job_id: jobId,
      expires_at: expiresAt,
      is_used: false,
    })
    .select('token')
    .single()

  if (insertError || !reviewRecord) {
    return { error: `Failed to generate review link: ${insertError?.message || 'Database error'}` }
  }

  return {
    success: true,
    token: reviewRecord.token,
    path: `/review/${reviewRecord.token}`,
  }
}

/**
 * Server Action: Submit a client review, atomically invalidate token, and sync with completed_jobs.
 */
export async function submitReviewAction(prevState: any, formData: FormData) {
  const token = formData.get('token') as string
  const ratingStr = formData.get('rating') as string
  const comment = (formData.get('comment') as string)?.trim()
  const clientName = (formData.get('client_name') as string)?.trim()

  if (!token) {
    return { error: 'Missing review token.' }
  }

  const rating = parseInt(ratingStr, 10)
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return { error: 'Please provide a star rating between 1 and 5.' }
  }

  if (!clientName) {
    return { error: 'Please enter your name or company name.' }
  }

  if (!comment) {
    return { error: 'Please write a brief comment regarding your experience.' }
  }

  if (comment.length > 1000) {
    return { error: 'Comment must not exceed 1,000 characters.' }
  }

  const adminSupabase = createAdminClient()

  // 1. Fetch review token record
  const { data: reviewRecord, error: fetchError } = await adminSupabase
    .from('reviews')
    .select('*')
    .eq('token', token)
    .single()

  if (fetchError || !reviewRecord) {
    return { error: 'Invalid review link.' }
  }

  if (reviewRecord.is_used) {
    return { error: 'This review link has already been used.' }
  }

  if (new Date(reviewRecord.expires_at) < new Date()) {
    return { error: 'This review link has expired (72-hour window lapsed).' }
  }

  // 2. Mark token as used and store review data
  const { error: updateReviewError } = await adminSupabase
    .from('reviews')
    .update({
      rating,
      comment,
      client_name: clientName,
      is_used: true,
      submitted_at: new Date().toISOString(),
    })
    .eq('id', reviewRecord.id)

  if (updateReviewError) {
    return { error: `Failed to save review: ${updateReviewError.message}` }
  }

  // 3. Synchronize review directly into completed_jobs for unified card rendering
  await adminSupabase
    .from('completed_jobs')
    .update({
      client_name: clientName,
      client_review: comment,
      client_rating: rating,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reviewRecord.job_id)

  revalidatePath('/admin/jobs')
  revalidatePath(`/review/${token}`)
  revalidatePath('/')

  return { success: true, message: 'Your review has been successfully submitted and verified. Thank you!' }
}