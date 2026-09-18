'use client'

import { useState, useRef } from 'react'
import {
  createTeamMemberAction,
  deleteTeamMemberAction,
  updateTeamMemberRoleAction,
  type TeamMember,
} from '@/app/actions/team'
import type { AppRole } from '@/app/actions/auth'
import {
  UserPlus,
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Lock,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Search,
  KeyRound,
  ChevronDown,
} from 'lucide-react'

interface TeamManagerProps {
  initialMembers: TeamMember[]
  currentUserId: string
  currentUserEmail: string
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
    description: 'Unrestricted full access across CMS, PII subscribers, team management, and partnerships.',
  },
  staff_admin: {
    title: 'Staff Admin',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-500',
    description: 'Content operations: manage jobs, certificates, partnerships, and answer Q&A inquiries.',
  },
  guest_admin: {
    title: 'Guest Admin',
    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    dot: 'bg-sky-500',
    description: 'Field/contractor logging: can submit completed jobs and certificates. PII & team restricted.',
  },
}

export function TeamManager({ initialMembers, currentUserId, currentUserEmail }: TeamManagerProps) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers)
  const [isCreating, setIsCreating] = useState(false)
  const [createStatus, setCreateStatus] = useState<{ error?: string; success?: string } | null>(null)
  const [tableStatus, setTableStatus] = useState<{ error?: string; success?: string } | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<AppRole>('staff_admin')
  const [showPassword, setShowPassword] = useState(false)

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  const formRef = useRef<HTMLFormElement>(null)

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreateStatus(null)
    setTableStatus(null)

    if (!email.trim()) {
      setCreateStatus({ error: 'Please enter a valid email address.' })
      return
    }

    if (!password || password.length < 6) {
      setCreateStatus({ error: 'Password must be at least 6 characters long.' })
      return
    }

    setIsCreating(true)

    try {
      const formData = new FormData()
      formData.set('email', email.trim().toLowerCase())
      formData.set('password', password)
      formData.set('role', role)

      const res = await createTeamMemberAction(null, formData)
      if (res?.error) {
        setCreateStatus({ error: res.error })
      } else if (res?.success) {
        setCreateStatus({ success: res.message })
        setEmail('')
        setPassword('')
        setRole('staff_admin')
        setShowPassword(false)
        if (formRef.current) formRef.current.reset()

        // Optimistically add to members list
        const newMember: TeamMember = {
          id: Math.random().toString(),
          email: email.trim().toLowerCase(),
          role,
          created_at: new Date().toISOString(),
          last_sign_in_at: null,
        }
        setMembers((prev) => [newMember, ...prev])
      }
    } catch (err: any) {
      setCreateStatus({ error: err.message || 'Failed to create account.' })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (member: TeamMember) => {
    setTableStatus(null)

    if (member.id === currentUserId) {
      alert('You cannot delete your own active Super Admin account.')
      return
    }

    if (member.is_root_admin) {
      alert('The designated primary Root Super Admin account cannot be deleted.')
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete account "${member.email}"? This user will immediately lose access to the administrative system.`
    )
    if (!confirmed) return

    setActionLoadingId(member.id)

    try {
      const formData = new FormData()
      formData.set('userId', member.id)

      const res = await deleteTeamMemberAction(null, formData)
      if (res?.error) {
        setTableStatus({ error: res.error })
      } else if (res?.success) {
        setTableStatus({ success: res.message })
        setMembers((prev) => prev.filter((m) => m.id !== member.id))
      }
    } catch (err: any) {
      setTableStatus({ error: err.message || 'Failed to delete account.' })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleRoleChange = async (member: TeamMember, newRole: AppRole) => {
    if (member.role === newRole) return
    setTableStatus(null)

    if (member.is_root_admin && newRole !== 'super_admin') {
      alert('The primary Root Super Admin account cannot be demoted.')
      return
    }

    setActionLoadingId(member.id)

    try {
      const formData = new FormData()
      formData.set('userId', member.id)
      formData.set('role', newRole)

      const res = await updateTeamMemberRoleAction(null, formData)
      if (res?.error) {
        setTableStatus({ error: res.error })
      } else if (res?.success) {
        setTableStatus({ success: res.message })
        setMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, role: newRole } : m))
        )
      }
    } catch (err: any) {
      setTableStatus({ error: err.message || 'Failed to update role.' })
    } finally {
      setActionLoadingId(null)
    }
  }

  // Filtered list
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || m.role === roleFilter
    return matchesSearch && matchesRole
  })

  // Metrics summary
  const superCount = members.filter((m) => m.role === 'super_admin').length
  const staffCount = members.filter((m) => m.role === 'staff_admin').length
  const guestCount = members.filter((m) => m.role === 'guest_admin').length

  return (
    <div className="space-y-8">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white tracking-tight">{superCount}</div>
            <div className="text-xs text-slate-400">Super Admins</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white tracking-tight">{staffCount}</div>
            <div className="text-xs text-slate-400">Staff Admins</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white tracking-tight">{guestCount}</div>
            <div className="text-xs text-slate-400">Guest Admins</div>
          </div>
        </div>
      </div>

      {/* Admin Creation Form */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Provision New Team Account
              </h2>
              <p className="text-xs text-slate-400">
                Grant staff or field contractors authenticated access to the Davelon Ent. CMS.
              </p>
            </div>
          </div>
          <span className="text-[10px] text-orange-400 font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
            Required: Super Admin
          </span>
        </div>

        {createStatus?.error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{createStatus.error}</span>
          </div>
        )}

        {createStatus?.success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{createStatus.success}</span>
          </div>
        )}

        <form ref={formRef} onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Staff Email Address <span className="text-orange-400">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@davelon.com"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                Temporary Password <span className="text-orange-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                Assigned RBAC Role <span className="text-orange-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AppRole)}
                  className="w-full appearance-none px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all cursor-pointer pr-10"
                >
                  <option value="staff_admin">Staff Admin (Operations & Content)</option>
                  <option value="guest_admin">Guest Admin (Field / Contractor)</option>
                  <option value="super_admin">Super Admin (Full Authority)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Role Permission Preview */}
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-start gap-2.5">
            <span
              className={`mt-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border shrink-0 ${ROLE_CONFIG[role].badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${ROLE_CONFIG[role].dot}`} />
              {ROLE_CONFIG[role].title}
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              {ROLE_CONFIG[role].description}
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Provisioning Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Staff Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* User Management Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Table Header / Filters */}
        <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Active Team Accounts</h2>
              <p className="text-xs text-slate-400">
                Directory of provisioned users and active security clearances ({members.length} registered)
              </p>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by email..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admins</option>
                <option value="staff_admin">Staff Admins</option>
                <option value="guest_admin">Guest Admins</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-500">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {tableStatus?.error && (
          <div className="m-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{tableStatus.error}</span>
          </div>
        )}

        {tableStatus?.success && (
          <div className="m-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{tableStatus.success}</span>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-6">User Account</th>
                <th className="py-3.5 px-6">Assigned RBAC Role</th>
                <th className="py-3.5 px-6">Account Created</th>
                <th className="py-3.5 px-6">Last Sign-in</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No team members found matching your search.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const isCurrentUser = member.id === currentUserId || member.email.toLowerCase() === currentUserEmail.toLowerCase()
                  const isRoot = member.is_root_admin
                  const isLoading = actionLoadingId === member.id

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Email / User Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                            <Mail className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white tracking-tight">
                                {member.email}
                              </span>
                              {isCurrentUser && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                  You
                                </span>
                              )}
                              {isRoot && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                  Primary Root
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">
                              ID: {member.id.substring(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${ROLE_CONFIG[member.role].badge}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${ROLE_CONFIG[member.role].dot}`} />
                            {ROLE_CONFIG[member.role].title}
                          </span>

                          {/* Quick Role Change dropdown (disabled for root or self) */}
                          {!isRoot && !isCurrentUser && (
                            <select
                              value={member.role}
                              disabled={isLoading}
                              onChange={(e) => handleRoleChange(member, e.target.value as AppRole)}
                              title="Change Role"
                              className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-400 hover:text-white rounded px-2 py-1 focus:outline-none cursor-pointer"
                            >
                              <option value="super_admin">Set Super Admin</option>
                              <option value="staff_admin">Set Staff Admin</option>
                              <option value="guest_admin">Set Guest Admin</option>
                            </select>
                          )}
                        </div>
                      </td>

                      {/* Created Date Column */}
                      <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {new Date(member.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Last Sign-in Column */}
                      <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {member.last_sign_in_at
                              ? new Date(member.last_sign_in_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Never logged in'}
                          </span>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        {isCurrentUser ? (
                          <span className="text-[11px] text-slate-500 italic">Current Session</span>
                        ) : isRoot ? (
                          <span className="text-[11px] text-amber-500/70 italic">Protected Account</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDelete(member)}
                            disabled={isLoading}
                            title={`Delete account ${member.email}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
