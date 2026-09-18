'use server'

import { createAdminClient } from '@/utils/supabase/server'
import { getCurrentUser, type AppRole } from '@/app/actions/auth'
import { revalidatePath } from 'next/cache'

export interface TeamMember {
  id: string
  email: string
  role: AppRole
  created_at: string
  last_sign_in_at: string | null
  is_root_admin?: boolean
}

/**
 * Normalizes role string to canonical AppRole
 */
function normalizeRole(roleInput: string): AppRole | null {
  const cleaned = roleInput.trim().toLowerCase()
  if (cleaned === 'super_admin' || cleaned === 'super') return 'super_admin'
  if (cleaned === 'staff_admin' || cleaned === 'staff') return 'staff_admin'
  if (cleaned === 'guest_admin' || cleaned === 'guest') return 'guest_admin'
  return null
}

/**
 * Super Admin Action: Fetch all team members and their associated RBAC roles.
 */
export async function getTeamMembers(): Promise<{ members?: TeamMember[]; error?: string }> {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return { error: 'Authentication session expired. Please log in again.' }
  }
  if (currentUser.role !== 'super_admin') {
    return { error: 'Unauthorized: Only Super Admins can view the team roster.' }
  }

  try {
    const adminSupabase = createAdminClient()
    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'davelonentrepreneurs@gmail.com').toLowerCase()

    // 1. Fetch all users from Supabase Auth
    const { data: usersData, error: usersError } = await adminSupabase.auth.admin.listUsers({
      perPage: 100,
    })

    if (usersError || !usersData?.users) {
      return { error: usersError?.message || 'Failed to list auth users.' }
    }

    // 2. Fetch all role mappings from public.user_roles
    const { data: rolesData, error: rolesError } = await adminSupabase
      .from('user_roles')
      .select('user_id, role')

    if (rolesError) {
      return { error: `Failed to load user roles: ${rolesError.message}` }
    }

    const roleMap = new Map<string, AppRole>()
    rolesData?.forEach((r) => {
      roleMap.set(r.user_id, r.role as AppRole)
    })

    // 3. Assemble TeamMember list
    const members: TeamMember[] = usersData.users.map((u) => {
      const email = u.email || 'No email'
      const isRoot = email.toLowerCase() === superAdminEmail

      // If user is root admin or has assigned role in DB
      let role: AppRole = 'guest_admin'
      if (isRoot) {
        role = 'super_admin'
      } else if (roleMap.has(u.id)) {
        role = roleMap.get(u.id)!
      }

      return {
        id: u.id,
        email,
        role,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at || null,
        is_root_admin: isRoot,
      }
    })

    // Sort: Root Super Admin first, then newest accounts
    members.sort((a, b) => {
      if (a.is_root_admin) return -1
      if (b.is_root_admin) return 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return { members }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred while fetching team members.' }
  }
}

/**
 * Super Admin Action: Create a new user account and immediately assign their role.
 */
export async function createTeamMemberAction(prevState: any, formData: FormData) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return { error: 'Authentication session expired. Please log in again.' }
  }
  if (currentUser.role !== 'super_admin') {
    return { error: 'Unauthorized: Only Super Admins are permitted to provision new accounts.' }
  }

  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = (formData.get('password') as string)?.trim()
  const rawRole = (formData.get('role') as string)?.trim()

  if (!email || !email.includes('@') || !email.includes('.')) {
    return { error: 'Please enter a valid email address.' }
  }

  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' }
  }

  const canonicalRole = normalizeRole(rawRole || '')
  if (!canonicalRole) {
    return { error: 'Please select a valid role (Guest Admin, Staff Admin, or Super Admin).' }
  }

  try {
    const adminSupabase = createAdminClient()

    // 1. Create auth user in Supabase Auth
    const { data: createdUser, error: createError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: canonicalRole,
        provisioned_by: currentUser.email,
      },
    })

    if (createError || !createdUser.user) {
      if (createError?.message?.toLowerCase().includes('already registered')) {
        return { error: `An account with email "${email}" already exists.` }
      }
      return { error: createError?.message || 'Failed to create user account in Supabase Auth.' }
    }

    const newUserId = createdUser.user.id

    // 2. Assign role immediately in public.user_roles
    const { error: roleError } = await adminSupabase
      .from('user_roles')
      .upsert(
        {
          user_id: newUserId,
          role: canonicalRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

    if (roleError) {
      return {
        error: `User account created, but role assignment failed in database: ${roleError.message}`,
      }
    }

    revalidatePath('/admin/team')
    revalidatePath('/admin')

    return {
      success: true,
      message: `Account for "${email}" successfully created with role: ${canonicalRole.replace('_', ' ').toUpperCase()}!`,
    }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred while creating the account.' }
  }
}

/**
 * Super Admin Action: Delete a user account and purge their role assignment.
 */
export async function deleteTeamMemberAction(prevStateOrFormData: any, maybeFormData?: FormData) {
  const formData = maybeFormData instanceof FormData
    ? maybeFormData
    : (prevStateOrFormData instanceof FormData ? prevStateOrFormData : (prevStateOrFormData?.get ? prevStateOrFormData : maybeFormData))

  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return { error: 'Authentication session expired. Please log in again.' }
  }
  if (currentUser.role !== 'super_admin') {
    return { error: 'Unauthorized: Only Super Admins can remove accounts.' }
  }

  const targetUserId = formData?.get('userId') as string
  if (!targetUserId) {
    return { error: 'User ID is required for account removal.' }
  }

  // Safety check: Cannot delete own account
  if (targetUserId === currentUser.id) {
    return { error: 'You cannot delete your own currently logged-in Super Admin account.' }
  }

  const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'davelonentrepreneurs@gmail.com').toLowerCase()

  try {
    const adminSupabase = createAdminClient()

    // 1. Fetch user to verify they are not the root super admin
    const { data: targetUserData } = await adminSupabase.auth.admin.getUserById(targetUserId)
    if (targetUserData?.user?.email?.toLowerCase() === superAdminEmail) {
      return { error: 'The primary root Super Admin account cannot be deleted.' }
    }

    // 2. Remove role assignment from public.user_roles
    await adminSupabase.from('user_roles').delete().eq('user_id', targetUserId)

    // 3. Delete user from Supabase Auth
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(targetUserId)
    if (deleteError) {
      return { error: `Failed to delete user from Supabase Auth: ${deleteError.message}` }
    }

    revalidatePath('/admin/team')
    revalidatePath('/admin')

    return {
      success: true,
      message: `Account "${targetUserData?.user?.email || targetUserId}" has been permanently removed.`,
    }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred while removing the account.' }
  }
}

/**
 * Super Admin Action: Change an existing user's RBAC role.
 */
export async function updateTeamMemberRoleAction(prevStateOrFormData: any, maybeFormData?: FormData) {
  const formData = maybeFormData instanceof FormData
    ? maybeFormData
    : (prevStateOrFormData instanceof FormData ? prevStateOrFormData : (prevStateOrFormData?.get ? prevStateOrFormData : maybeFormData))

  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return { error: 'Authentication session expired. Please log in again.' }
  }
  if (currentUser.role !== 'super_admin') {
    return { error: 'Unauthorized: Only Super Admins can modify account roles.' }
  }

  const targetUserId = formData?.get('userId') as string
  const rawRole = formData?.get('role') as string

  if (!targetUserId || !rawRole) {
    return { error: 'User ID and Role are required.' }
  }

  const canonicalRole = normalizeRole(rawRole)
  if (!canonicalRole) {
    return { error: 'Invalid role specified.' }
  }

  const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'davelonentrepreneurs@gmail.com').toLowerCase()

  try {
    const adminSupabase = createAdminClient()

    // Prevent changing root super admin's role
    const { data: targetUserData } = await adminSupabase.auth.admin.getUserById(targetUserId)
    if (targetUserData?.user?.email?.toLowerCase() === superAdminEmail && canonicalRole !== 'super_admin') {
      return { error: 'The primary root Super Admin role cannot be demoted.' }
    }

    const { error: updateError } = await adminSupabase
      .from('user_roles')
      .upsert(
        {
          user_id: targetUserId,
          role: canonicalRole,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

    if (updateError) {
      return { error: `Failed to update role: ${updateError.message}` }
    }

    revalidatePath('/admin/team')
    revalidatePath('/admin')

    return {
      success: true,
      message: `Role for "${targetUserData?.user?.email || targetUserId}" updated to ${canonicalRole.replace('_', ' ').toUpperCase()}.`,
    }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred while updating the role.' }
  }
}
