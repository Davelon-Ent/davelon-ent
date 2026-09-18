import { getCurrentUser } from '@/app/actions/auth'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Users, ShieldAlert, ShieldCheck } from 'lucide-react'
import { SubscriberManager, type Subscriber } from './subscriber-manager'

export const metadata = {
  title: 'Subscribers & Marketing Leads | Davelon Ent. CMS',
  description: 'Confidential client opt-in email directory (Super Admin Restricted).',
}

export default async function SubscribersPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/admin/login')
  }

  // STRICT RBAC CHECK: Block Staff Admin & Guest Admin
  if (currentUser.role !== 'super_admin') {
    return (
      <div className="bg-slate-900/40 border border-red-500/20 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-white">Super Admin Access Required</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The subscribers and marketing lead directory contains protected Customer Personally Identifiable Information (PII). Access is restricted exclusively to the primary company Super Admin.
        </p>
      </div>
    )
  }

  const supabase = await createClient()

  // Fetch subscribers list
  const { data: subscriberRows } = await supabase
    .from('subscribers')
    .select('*')
    .order('created_at', { ascending: false })

  const subscribers: Subscriber[] = (subscriberRows as Subscriber[]) || []

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Confidential Client Directory
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Opt-in Subscribers & Leads
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Protected email list submitted via the Davelon Ent. website newsletter funnel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>
              Total Subscribers: <strong className="text-white">{subscribers.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Subscriber Manager (Add Form + Delete-enabled Table) */}
      <SubscriberManager initialSubscribers={subscribers} />
    </div>
  )
}