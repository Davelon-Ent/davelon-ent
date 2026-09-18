'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type AppRole = 'super_admin' | 'staff_admin' | 'guest_admin'

export interface UserSessionData {
  id: string
  email: string
  role: AppRole
}

/**
 * Resolves the authenticated user and their validated RBAC role.
 * Automatically synchronizes the designated SUPER_ADMIN_EMAIL.
 */
export async function getCurrentUser(): Promise<UserSessionData | null> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user || !user.email) {
    return null
  }

  const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'davelonentrepreneurs@gmail.com').toLowerCase()
  const userEmail = user.email.toLowerCase()

  const adminSupabase = createAdminClient()

  // 1. Check if user is the designated Super Admin
  if (userEmail === superAdminEmail) {
    try {
      await adminSupabase
        .from('user_roles')
        .upsert(
          { user_id: user.id, role: 'super_admin', updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )
    } catch {
      // Ignore if handled by trigger or DB constraint
    }
    return { id: user.id, email: user.email, role: 'super_admin' }
  }

  // 2. Fetch role from user_roles table using admin client (bypasses RLS read restrictions)
  const { data: roleRecord } = await adminSupabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const role: AppRole = (roleRecord?.role as AppRole) || 'guest_admin'

  return {
    id: user.id,
    email: user.email,
    role,
  }
}

/**
 * Authenticates user via email and password.
 */
export async function loginAction(prevState: { error?: string } | null, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Please provide both email and password.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'davelonentrepreneurs@gmail.com').toLowerCase()
  if (data.user && data.user.email?.toLowerCase() === superAdminEmail) {
    try {
      await supabase
        .from('user_roles')
        .upsert(
          { user_id: data.user.id, role: 'super_admin', updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )
    } catch {}
  }

  redirect('/admin')
}

/**
 * Signs out current user and redirects to /admin/login.
 */
export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

/**
 * Super Admin action: Provision Staff Admin or Guest Admin credentials.
 */
export async function createStaffUser(formData: FormData) {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== 'super_admin') {
    return { error: 'Unauthorized: Only the Super Admin can create staff accounts.' }
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as AppRole

  if (!email || !password || !role) {
    return { error: 'Email, password, and role are required.' }
  }

  if (!['staff_admin', 'guest_admin'].includes(role)) {
    return { error: 'Invalid role specified.' }
  }

  try {
    const adminSupabase = createAdminClient()

    const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError || !newUser.user) {
      return { error: createError?.message || 'Failed to create user.' }
    }

    const { error: roleError } = await adminSupabase
      .from('user_roles')
      .upsert({
        user_id: newUser.user.id,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (roleError) {
      return { error: `User created, but role assignment failed: ${roleError.message}` }
    }

    revalidatePath('/admin/team')
    return { success: true, message: `Successfully created ${role} account for ${email}` }
  } catch (err: any) {
    return {
      error: err.message || 'Error occurred. Ensure SUPABASE_SERVICE_ROLE_KEY is set in .env.local',
    }
  }
}
