'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { getCurrentUser } from '@/app/actions/auth'
import { revalidatePath } from 'next/cache'

export interface SystemSettings {
  id: string
  support_email: string
  company_phone: string
  office_address: string
  maintenance_mode: boolean
  require_email_verification: boolean
  updated_at: string
  updated_by?: string | null
}

const DEFAULT_SETTINGS: SystemSettings = {
  id: 'global',
  support_email: 'support@davelon.com',
  company_phone: '+1 (555) 234-5678',
  office_address: '100 Industrial Parkway, Suite 400, Austin, TX 78701',
  maintenance_mode: false,
  require_email_verification: true,
  updated_at: new Date().toISOString(),
  updated_by: 'system',
}

/**
 * Fetch platform configurations and security toggles from system_settings.
 * Gracefully falls back to standard enterprise defaults if unseeded.
 */
export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const adminSupabase = createAdminClient()
    const { data, error } = await adminSupabase
      .from('system_settings')
      .select('*')
      .eq('id', 'global')
      .single()

    if (error || !data) {
      return DEFAULT_SETTINGS
    }

    return {
      id: data.id || 'global',
      support_email: data.support_email || DEFAULT_SETTINGS.support_email,
      company_phone: data.company_phone || DEFAULT_SETTINGS.company_phone,
      office_address: data.office_address || DEFAULT_SETTINGS.office_address,
      maintenance_mode: Boolean(data.maintenance_mode),
      require_email_verification: Boolean(data.require_email_verification ?? true),
      updated_at: data.updated_at || DEFAULT_SETTINGS.updated_at,
      updated_by: data.updated_by || null,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

/**
 * Authenticated User Action: Change Password for the active session.
 * Available to all roles (Super Admin, Staff Admin, Guest Admin).
 */
export async function updatePasswordAction(prevState: any, formData: FormData) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return { error: 'Authentication session expired. Please log into the portal again.' }
  }

  const newPassword = (formData.get('password') as string)?.trim()
  const confirmPassword = (formData.get('confirm_password') as string)?.trim()

  if (!newPassword || newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters long.' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'New password and confirmation password do not match.' }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { error: error.message || 'Failed to update password.' }
    }

    return { success: true, message: 'Your password has been successfully updated!' }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred during password update.' }
  }
}

/**
 * Platform Configurations: Update public company details.
 * Tier-locked strictly to Staff Admin and Super Admin.
 */
export async function updatePlatformConfigAction(prevState: any, formData: FormData) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return { error: 'Authentication session expired. Please log in again.' }
  }

  if (currentUser.role !== 'super_admin' && currentUser.role !== 'staff_admin') {
    return {
      error: `Unauthorized: Your account tier (${currentUser.role}) does not have permission to modify platform configurations. Staff or Super Admin clearance required.`,
    }
  }

  const supportEmail = (formData.get('support_email') as string)?.trim().toLowerCase()
  const companyPhone = (formData.get('company_phone') as string)?.trim()
  const officeAddress = (formData.get('office_address') as string)?.trim()

  if (!supportEmail || !supportEmail.includes('@')) {
    return { error: 'Please provide a valid support email address.' }
  }

  if (!companyPhone || companyPhone.length < 5) {
    return { error: 'Please provide a valid company telephone number.' }
  }

  if (!officeAddress || officeAddress.length < 5) {
    return { error: 'Please provide a valid commercial office address.' }
  }

  try {
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
      .from('system_settings')
      .upsert(
        {
          id: 'global',
          support_email: supportEmail,
          company_phone: companyPhone,
          office_address: officeAddress,
          updated_at: new Date().toISOString(),
          updated_by: currentUser.email,
        },
        { onConflict: 'id' }
      )

    if (error) {
      return {
        error: `Database update failed: ${error.message}. Please verify the system_settings table exists.`,
      }
    }

    revalidatePath('/admin/settings')
    revalidatePath('/')

    return { success: true, message: 'Company platform configurations updated successfully!' }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred while saving platform configurations.' }
  }
}

/**
 * System & Security Action: Update global maintenance and verification toggles.
 * Tier-locked strictly to Super Admin ONLY.
 */
export async function updateSystemSecurityAction(prevState: any, formData: FormData) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return { error: 'Authentication session expired. Please log in again.' }
  }

  if (currentUser.role !== 'super_admin') {
    return {
      error: `Unauthorized: Your account role is "${currentUser.role}". Modifying global system security and maintenance toggles strictly requires Super Admin clearance.`,
    }
  }

  const maintenanceMode = formData.get('maintenance_mode') === 'true'
  const requireEmailVerification = formData.get('require_email_verification') === 'true'

  try {
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
      .from('system_settings')
      .upsert(
        {
          id: 'global',
          maintenance_mode: maintenanceMode,
          require_email_verification: requireEmailVerification,
          updated_at: new Date().toISOString(),
          updated_by: currentUser.email,
        },
        { onConflict: 'id' }
      )

    if (error) {
      return {
        error: `Failed to update security toggles: ${error.message}. Please verify the system_settings table exists.`,
      }
    }

    revalidatePath('/admin/settings')
    revalidatePath('/')

    return {
      success: true,
      message: `System security updated! Maintenance Mode is now ${maintenanceMode ? 'ENABLED' : 'DISABLED'}.`,
    }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred while saving security settings.' }
  }
}
