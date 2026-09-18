'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { getCurrentUser } from '@/app/actions/auth'
import { revalidatePath } from 'next/cache'

/**
 * Public Action: Submit an engineering question to the Q&A terminal.
 * Defaults to 'pending' state; admin_reply is null.
 */
export async function submitQuestionAction(prevState: any, formData: FormData) {
  const question = (formData.get('question') as string)?.trim()
  const submitterName = (formData.get('submitter_name') as string)?.trim() || 'Anonymous'

  if (!question || question.length < 10) {
    return { error: 'Please provide a clear question (at least 10 characters).' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('q_and_a').insert({
    question,
    submitter_name: submitterName,
    status: 'pending',
    admin_reply: null,
  })

  if (error) {
    return { error: `Failed to submit question: ${error.message}` }
  }

  revalidatePath('/')
  revalidatePath('/admin/qa')
  return { success: true, message: 'Your technical inquiry has been submitted! Our engineers will review and publish a response shortly.' }
}

/**
 * Public Action: Subscribe email to promotional and engineering newsletters.
 */
export async function submitSubscriptionAction(prevState: any, formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase()

  if (!email || !email.includes('@') || !email.includes('.')) {
    return { error: 'Please enter a valid corporate or personal email address.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('subscribers')
    .insert({ email })

  if (error) {
    // If unique constraint violated (already subscribed), return friendly message
    if (error.code === '23505') {
      return { success: true, message: 'You are already subscribed to Davelon Ent. engineering bulletins.' }
    }
    return { error: `Subscription failed: ${error.message}` }
  }

  revalidatePath('/')
  revalidatePath('/admin/subscribers')
  return { success: true, message: 'Thank you for subscribing to Davelon Ent. engineering announcements!' }
}

/**
 * Admin Action: Reply to a pending inquiry and publish the thread to the live site.
 * Restricted to Staff Admin and Super Admin.
 */
export async function publishReplyAction(formData: FormData) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return { error: 'Unauthorized: Please log in.' }
  }

  if (currentUser.role === 'guest_admin') {
    return { error: 'Permission denied: Guest Admins cannot moderate Q&A.' }
  }

  const id = formData.get('id') as string
  const adminReply = (formData.get('admin_reply') as string)?.trim()

  if (!id || !adminReply) {
    return { error: 'Reply text cannot be empty.' }
  }

  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase
    .from('q_and_a')
    .update({
      admin_reply: adminReply,
      status: 'published',
      answered_by: currentUser.id,
      answered_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return { error: `Failed to publish reply: ${error.message}` }
  }

  revalidatePath('/admin/qa')
  revalidatePath('/')
  return { success: true, message: 'Answer successfully published to the live public Q&A terminal!' }
}

/**
 * Admin Action: Delete a Q&A inquiry.
 */
export async function deleteQuestionAction(formData: FormData) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return { error: 'Unauthorized: Please log in.' }
  }

  if (currentUser.role === 'guest_admin') {
    return { error: 'Permission denied: Guest Admins cannot delete Q&A records.' }
  }

  const id = formData.get('id') as string
  if (!id) {
    return { error: 'Inquiry ID is required.' }
  }

  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase
    .from('q_and_a')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: `Failed to delete inquiry: ${error.message}` }
  }

  revalidatePath('/admin/qa')
  revalidatePath('/')
  return { success: true, message: 'Inquiry deleted successfully.' }
}

/**
 * Super Admin Action: Manually add a subscriber email to the directory.
 */
export async function adminAddSubscriberAction(prevStateOrFormData: any, maybeFormData?: FormData) {
  const formData = maybeFormData instanceof FormData
    ? maybeFormData
    : (prevStateOrFormData instanceof FormData ? prevStateOrFormData : (prevStateOrFormData?.get ? prevStateOrFormData : maybeFormData))

  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== 'super_admin') {
    return { error: 'Unauthorized' }
  }

  const email = (formData?.get('email') as string)?.trim().toLowerCase()
  if (!email || !email.includes('@') || !email.includes('.')) {
    return { error: 'Please enter a valid email address.' }
  }

  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase
    .from('subscribers')
    .insert({ email })

  if (error) {
    if (error.code === '23505') {
      return { error: 'This email is already in the subscriber list.' }
    }
    return { error: `Failed to add subscriber: ${error.message}` }
  }

  revalidatePath('/admin/subscribers')
  return { success: true, message: 'Subscriber successfully added!' }
}

/**
 * Super Admin Action: Delete a subscriber by ID.
 */
export async function deleteSubscriberAction(prevStateOrFormData: any, maybeFormData?: FormData) {
  const formData = maybeFormData instanceof FormData
    ? maybeFormData
    : (prevStateOrFormData instanceof FormData ? prevStateOrFormData : (prevStateOrFormData?.get ? prevStateOrFormData : maybeFormData))

  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== 'super_admin') {
    return { error: 'Unauthorized' }
  }

  const id = formData?.get('id') as string
  if (!id) {
    return { error: 'Subscriber ID is required.' }
  }

  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase
    .from('subscribers')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: `Failed to delete subscriber: ${error.message}` }
  }

  revalidatePath('/admin/subscribers')
  return { success: true, message: 'Subscriber deleted successfully.' }
}