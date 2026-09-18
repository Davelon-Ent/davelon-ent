import { getCurrentUser } from '@/app/actions/auth'
import { getTeamMembers } from '@/app/actions/team'
import { redirect } from 'next/navigation'
import { Users, ShieldAlert, ShieldCheck } from 'lucide-react'
import { TeamManager } from './team-manager'

export const metadata = {
  title: 'Team & Staff Management | Davelon Ent. CMS',
  description: 'Manage administrator accounts, provisioning, and RBAC clearances (Super Admin Restricted).',
}

export default async function TeamPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/admin/login')
  }

  // STRICT RBAC CHECK: Super Admin only
  if (currentUser.role !== 'super_admin') {
    return (
      <div className="bg-slate-900/40 border border-red-500/20 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-white">Super Admin Access Required</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The Team & Staff administration module controls credential provisioning and global security clearances. Access is restricted exclusively to the primary company Super Admin.
        </p>
      </div>
    )
  }

  // Fetch team members with their verified roles
  const { members = [], error: fetchError } = await getTeamMembers()

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Super Admin Control Center
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Team & Staff Access Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Provision staff user accounts and manage Role-Based Access Control (RBAC) security tiers.
          </p>
        </div>
      </div>

      {fetchError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          <strong>Database Notice:</strong> {fetchError}
        </div>
      )}

      {/* Main Team Manager Interface */}
      <TeamManager
        initialMembers={members}
        currentUserId={currentUser.id}
        currentUserEmail={currentUser.email}
      />
    </div>
  )
}
