'use client'

import { useState } from 'react'
import type { AppRole, UserSessionData } from '@/app/actions/auth'
import {
  updatePasswordAction,
  updatePlatformConfigAction,
  updateSystemSecurityAction,
  type SystemSettings,
} from '@/app/actions/settings'
import {
  UserCircle,
  Building2,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  Phone,
  MapPin,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Shield,
  Server,
  Power,
  Users,
  Info,
  ExternalLink,
} from 'lucide-react'

interface SettingsManagerProps {
  currentUser: UserSessionData
  initialSettings: SystemSettings
}

const ROLE_CONFIG: Record<
  AppRole,
  {
    title: string
    badge: string
    dot: string
    description: string
  }
> = {
  super_admin: {
    title: 'Super Admin',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-500',
    description: 'Complete administrative authority over CMS, lead PII, team provisioning, and security.',
  },
  staff_admin: {
    title: 'Staff Admin',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-500',
    description: 'Operational privileges: manage jobs, certificates, partnerships, and platform contact info.',
  },
  guest_admin: {
    title: 'Guest Admin',
    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    dot: 'bg-sky-500',
    description: 'Contractor profile: field logging for completed jobs and certificates. Configurations locked.',
  },
}

export function SettingsManager({ currentUser, initialSettings }: SettingsManagerProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'platform' | 'security'>('profile')

  // Toast Notification state
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev))
    }, 5000)
  }

  // Profile / Password State
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  // Platform Configs State
  const [settings, setSettings] = useState<SystemSettings>(initialSettings)
  const [isSavingPlatform, setIsSavingPlatform] = useState(false)

  // Security Toggles State
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(initialSettings.maintenance_mode)
  const [requireEmailVerification, setRequireEmailVerification] = useState<boolean>(
    initialSettings.require_email_verification
  )
  const [isSavingSecurity, setIsSavingSecurity] = useState(false)

  // Clearance helpers
  const isSuperAdmin = currentUser.role === 'super_admin'
  const isStaffOrSuper = currentUser.role === 'super_admin' || currentUser.role === 'staff_admin'
  const isGuest = currentUser.role === 'guest_admin'

  const copyUserId = () => {
    navigator.clipboard.writeText(currentUser.id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  // Submit Handlers
  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      showToast('error', 'Password must be at least 6 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'New password and confirmation password do not match.')
      return
    }

    setIsUpdatingPassword(true)
    try {
      const formData = new FormData()
      formData.set('password', newPassword)
      formData.set('confirm_password', confirmPassword)

      const res = await updatePasswordAction(null, formData)
      if (res?.error) {
        showToast('error', res.error)
      } else if (res?.success) {
        showToast('success', res.message)
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update password.')
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handlePlatformSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isStaffOrSuper) {
      showToast('error', 'Action denied: Staff Admin or Super Admin clearance required.')
      return
    }

    setIsSavingPlatform(true)
    try {
      const formData = new FormData()
      formData.set('support_email', settings.support_email)
      formData.set('company_phone', settings.company_phone)
      formData.set('office_address', settings.office_address)

      const res = await updatePlatformConfigAction(null, formData)
      if (res?.error) {
        showToast('error', res.error)
      } else if (res?.success) {
        showToast('success', res.message)
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save platform configurations.')
    } finally {
      setIsSavingPlatform(false)
    }
  }

  const handleSecuritySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isSuperAdmin) {
      showToast('error', 'Action denied: Super Admin clearance strictly required.')
      return
    }

    setIsSavingSecurity(true)
    try {
      const formData = new FormData()
      formData.set('maintenance_mode', maintenanceMode ? 'true' : 'false')
      formData.set('require_email_verification', requireEmailVerification ? 'true' : 'false')

      const res = await updateSystemSecurityAction(null, formData)
      if (res?.error) {
        showToast('error', res.error)
      } else if (res?.success) {
        showToast('success', res.message)
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save system security toggles.')
    } finally {
      setIsSavingSecurity(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl shadow-2xl flex items-center gap-3 border animate-in slide-in-from-bottom-5 fade-in duration-200 ${
            toast.type === 'success'
              ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-400 shadow-emerald-500/10'
              : 'bg-slate-900/95 border-red-500/40 text-red-400 shadow-red-500/10'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium leading-relaxed">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-auto text-slate-500 hover:text-white p-1"
          >
            &times;
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2.5 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-orange-500 text-white bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <UserCircle className="w-4 h-4 text-orange-400" />
          <span>My Profile</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase bg-slate-800 text-slate-400">
            All Roles
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('platform')}
          className={`flex items-center gap-2.5 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'platform'
              ? 'border-orange-500 text-white bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span>Platform Configurations</span>
          {isGuest ? (
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-mono uppercase bg-slate-800/80 text-slate-500">
              <Lock className="w-2.5 h-2.5" /> Locked
            </span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Staff & Super
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2.5 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-orange-500 text-white bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>System & Security</span>
          {!isSuperAdmin ? (
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-mono uppercase bg-slate-800/80 text-slate-500">
              <Lock className="w-2.5 h-2.5" /> Restricted
            </span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Super Admin
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: MY PROFILE */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Identity & Account Specs Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center font-bold text-lg">
                  {currentUser.email.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Authenticated User Profile
                  </h2>
                  <p className="text-xs text-slate-400">
                    Active identity credentials and verified RBAC clearance tier.
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border shrink-0 ${ROLE_CONFIG[currentUser.role].badge}`}
              >
                <span className={`w-2 h-2 rounded-full ${ROLE_CONFIG[currentUser.role].dot}`} />
                {ROLE_CONFIG[currentUser.role].title}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email Address */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Primary Email Account
                </span>
                <div className="text-sm font-semibold text-white truncate flex items-center gap-2">
                  <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>{currentUser.email}</span>
                </div>
              </div>

              {/* User UUID */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Supabase Auth User ID
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-300 truncate" title={currentUser.id}>
                    {currentUser.id}
                  </span>
                  <button
                    type="button"
                    onClick={copyUserId}
                    title="Copy User ID"
                    className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors shrink-0"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Clearance Description Notice */}
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-200">{ROLE_CONFIG[currentUser.role].title} Clearance:</strong>{' '}
                {ROLE_CONFIG[currentUser.role].description}
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Security Credentials: Change Password</h3>
                <p className="text-xs text-slate-400">
                  Update your personal administrative password across all active portals.
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  New Password <span className="text-orange-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Confirm New Password <span className="text-orange-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {confirmPassword && newPassword && (
                  <div className="pt-1 text-[11px] flex items-center gap-1.5">
                    {newPassword === confirmPassword ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingPassword || (newPassword.length > 0 && newPassword !== confirmPassword)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: PLATFORM CONFIGURATIONS */}
      {activeTab === 'platform' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Public Platform Configurations
                  </h2>
                  <p className="text-xs text-slate-400">
                    Official corporate contact channels displayed on the public website and customer footer.
                  </p>
                </div>
              </div>

              {isGuest ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] text-amber-400 font-mono tracking-wider uppercase px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                  <Lock className="w-3 h-3" /> Read-Only (Guest Clearance)
                </span>
              ) : (
                <span className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                  Staff & Super Admin Active
                </span>
              )}
            </div>

            {/* Guest Admin Warning Alert */}
            {isGuest && (
              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs flex items-center gap-3">
                <Lock className="w-4 h-4 shrink-0 text-sky-400" />
                <span>
                  <strong>Notice for Guest Admins:</strong> Modifying public corporate contact parameters is tier-locked. Requires Staff Admin or Super Admin clearance.
                </span>
              </div>
            )}

            <form onSubmit={handlePlatformSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Support Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      Official Support Email
                    </span>
                    {isGuest && (
                      <span className="text-[10px] text-amber-400/80 font-mono flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      disabled={isGuest}
                      value={settings.support_email}
                      onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                      title={isGuest ? 'Requires Staff or Super Admin clearance' : undefined}
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                </div>

                {/* Company Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      Corporate Hotline / Phone
                    </span>
                    {isGuest && (
                      <span className="text-[10px] text-amber-400/80 font-mono flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      disabled={isGuest}
                      value={settings.company_phone}
                      onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                      title={isGuest ? 'Requires Staff or Super Admin clearance' : undefined}
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Office Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Headquarters / Office Address
                  </span>
                  {isGuest && (
                    <span className="text-[10px] text-amber-400/80 font-mono flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </label>
                <textarea
                  rows={2}
                  required
                  disabled={isGuest}
                  value={settings.office_address}
                  onChange={(e) => setSettings({ ...settings, office_address: e.target.value })}
                  title={isGuest ? 'Requires Staff or Super Admin clearance' : undefined}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingPlatform || isGuest}
                  title={isGuest ? 'Requires Staff or Super Admin clearance' : undefined}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSavingPlatform ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Configurations...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Platform Configurations
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM & SECURITY (TIER-LOCKED TO SUPER ADMIN) */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Global System & Security Toggles
                  </h2>
                  <p className="text-xs text-slate-400">
                    Mission-critical master controls for site maintenance and staff credential validation.
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-amber-400 font-mono tracking-wider uppercase px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                Super Admin Only
              </span>
            </div>

            {/* Locked Overlay for Non-Super Admins */}
            {!isSuperAdmin && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mb-3">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Super Admin Access Required</h3>
                <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-3">
                  System maintenance toggles and enterprise security controls require elevated Super Admin credentials. Your current clearance is{' '}
                  <span className="text-white underline font-semibold">{ROLE_CONFIG[currentUser.role].title}</span>.
                </p>
                <span className="text-[10px] text-slate-500 font-mono">
                  RBAC Clearance Enforcement Active
                </span>
              </div>
            )}

            {/* Interactive Form for Super Admin */}
            <form onSubmit={handleSecuritySubmit} className="space-y-6 pt-5">
              {/* Toggle 1: Maintenance Mode */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Power className={`w-4 h-4 ${maintenanceMode ? 'text-red-400' : 'text-emerald-400'}`} />
                    <span className="text-sm font-semibold text-white">Site Maintenance Mode</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        maintenanceMode
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {maintenanceMode ? 'Maintenance Offline' : 'Live & Operational'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                    When active, external public visitors are served a temporary maintenance notice. Only authenticated staff and super administrators can access CMS operations.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    disabled={!isSuperAdmin}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>

              {/* Toggle 2: Require Email Verification */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-400" />
                    <span className="text-sm font-semibold text-white">
                      Require Email Verification for New Staff
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        requireEmailVerification
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {requireEmailVerification ? 'Enforced' : 'Optional'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                    Forces all newly provisioned staff members to verify ownership of their email inbox before their first successful login.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={requireEmailVerification}
                    onChange={(e) => setRequireEmailVerification(e.target.checked)}
                    disabled={!isSuperAdmin}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingSecurity || !isSuperAdmin}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSavingSecurity ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Security Toggles...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Save System Security
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
