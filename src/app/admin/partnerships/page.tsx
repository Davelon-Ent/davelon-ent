import { getCurrentUser } from '@/app/actions/auth'
import { createAdminClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Handshake, ShieldAlert, ShieldCheck } from 'lucide-react'
import { PartnerManager } from './partner-manager'
import type { Partnership } from '@/app/actions/partnerships'

export const metadata = {
  title: 'Strategic Partnerships & Affiliates | Davelon Ent. CMS',
  description: 'Manage verified corporate partners, logos, and executed partnership agreements.',
}

export default async function PartnershipsPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/admin/login')
  }

  // STRICT RBAC CHECK: Super Admin & Staff Admin only (Guest Admin restricted)
  if (currentUser.role !== 'super_admin' && currentUser.role !== 'staff_admin') {
    return (
      <div className="bg-slate-900/40 border border-red-500/20 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-white">Staff Admin or Super Admin Clearance Required</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The Strategic Partnerships module controls corporate agreements and public affiliations. Access is restricted to Staff and Super Administrators.
        </p>
      </div>
    )
  }

  const adminSupabase = createAdminClient()

  // Fetch partnerships list
  const { data: partnerRows } = await adminSupabase
    .from('partnerships')
    .select('*')
    .order('created_at', { ascending: false })

  const partners: Partnership[] = (partnerRows as Partnership[]) || []

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Corporate Affiliations Desk
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Strategic Partnerships & Vendors
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage public partner representations and binding joint-venture agreement documents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 flex items-center gap-2">
            <Handshake className="w-4 h-4 text-orange-400" />
            <span>
              Active Partners: <strong className="text-white">{partners.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Partner Manager Component */}
      <PartnerManager initialPartners={partners} />
    </div>
  )
}