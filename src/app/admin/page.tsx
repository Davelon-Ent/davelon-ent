import { getCurrentUser } from '@/app/actions/auth'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import {
  Briefcase,
  Award,
  HelpCircle,
  Users,
  ShieldCheck,
  ArrowUpRight,
  PlusCircle,
  Sparkles,
  Lock,
} from 'lucide-react'

export default async function AdminDashboardPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return null
  }

  const supabase = await createClient()

  // Dynamic counts based on RLS permissions
  const [
    { count: jobsCount },
    { count: certsCount },
    { count: pendingQnaCount },
    subscribersResult,
  ] = await Promise.all([
    supabase.from('completed_jobs').select('*', { count: 'exact', head: true }),
    supabase.from('certificates_licenses').select('*', { count: 'exact', head: true }),
    supabase.from('q_and_a').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    currentUser.role === 'super_admin'
      ? supabase.from('subscribers').select('*', { count: 'exact', head: true })
      : Promise.resolve({ count: null }),
  ])

  const roleDetails = {
    super_admin: {
      title: 'Super Admin',
      description:
        'Complete administrative authority. Full CRUD across all collections, exclusive access to customer PII and marketing subscriber data, and team member provisioning.',
      color: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
    },
    staff_admin: {
      title: 'Staff Admin',
      description:
        'Full content management capabilities. Can create, edit, and publish completed jobs, certificates, partnerships, and answer incoming customer Q&A inquiries. PII and subscriber data are protected.',
      color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
    },
    guest_admin: {
      title: 'Guest Admin (Temporary)',
      description:
        'Field/contractor logging profile. Can draft new completed jobs and certificates. Editing existing records, deletions, Q&A terminal, and customer contact data are restricted.',
      color: 'border-sky-500/30 bg-sky-500/5 text-sky-400',
    },
  }[currentUser.role]

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <ShieldCheck className="w-64 h-64 text-orange-500" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border border-orange-500/30 bg-orange-500/10 text-orange-400 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Davelon Ent. Operations Center
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Welcome, <span className="text-orange-400 font-mono text-xl md:text-2xl">{currentUser.email}</span>
          </h1>

          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            You are authenticated under the role:{' '}
            <strong className="text-white underline decoration-orange-500 underline-offset-4">
              {roleDetails.title}
            </strong>
            .
          </p>

          <div className={`mt-4 p-4 rounded-xl border text-xs leading-relaxed ${roleDetails.color}`}>
            <span className="font-semibold block mb-1 uppercase tracking-wider text-[10px]">
              Active RBAC Permissions Profile
            </span>
            {roleDetails.description}
          </div>
        </div>
      </div>

      {/* Metrics & Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completed Jobs */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Completed Jobs</span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white font-mono">
            {jobsCount ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Projects logged in database
          </p>
        </div>

        {/* Certificates */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Certificates</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white font-mono">
            {certsCount ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Credentials & compliance records
          </p>
        </div>

        {/* Pending Q&A Inquiries */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Q&A</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white font-mono flex items-center gap-2">
            {currentUser.role === 'guest_admin' ? (
              <span className="text-xs text-slate-500 font-sans flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Restricted
              </span>
            ) : (
              <>
                {pendingQnaCount ?? 0}
                {(pendingQnaCount ?? 0) > 0 && (
                  <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Needs reply
                  </span>
                )}
              </>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {currentUser.role === 'guest_admin'
              ? 'Q&A moderation requires Staff Admin'
              : 'Awaiting engineering verification'}
          </p>
        </div>

        {/* Subscribers (Super Admin Exclusive) */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Newsletter Leads</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white font-mono">
            {currentUser.role === 'super_admin' ? (
              subscribersResult.count ?? 0
            ) : (
              <span className="text-xs text-slate-500 font-sans flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Super Admin Only
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {currentUser.role === 'super_admin'
              ? 'Opt-in subscriber emails'
              : 'Protected client PII'}
          </p>
        </div>
      </div>

      {/* Quick Launch & CMS Actions */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Quick Launch Operations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/jobs"
            className="group p-5 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-orange-500/40 rounded-2xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                  Manage Completed Jobs
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400 transition-colors" />
              </div>
              <p className="text-xs text-slate-400">
                Log new fabrication & power installations or generate single-use review tokens.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-orange-400 font-medium">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Go to Jobs Directory</span>
            </div>
          </Link>

          <Link
            href="/admin/certificates"
            className="group p-5 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-2xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                  Certificates & Accreditations
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </div>
              <p className="text-xs text-slate-400">
                Upload COREN licenses, corporate registration, and safety compliance documents.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-blue-400 font-medium">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>View Accreditations</span>
            </div>
          </Link>

          {currentUser.role !== 'guest_admin' ? (
            <Link
              href="/admin/qna"
              className="group p-5 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-2xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                    Moderate Q&A Terminal
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
                </div>
                <p className="text-xs text-slate-400">
                  Review public inquiries, draft technical answers, and publish to the live site.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-purple-400 font-medium">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Open Q&A Terminal</span>
              </div>
            </Link>
          ) : (
            <div className="p-5 bg-slate-900/20 border border-slate-800/50 rounded-2xl opacity-60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-400">
                    Q&A Terminal Moderation
                  </span>
                  <Lock className="w-4 h-4 text-slate-600" />
                </div>
                <p className="text-xs text-slate-500">
                  Answering customer queries is reserved for Staff and Super Admins.
                </p>
              </div>
              <div className="mt-4 text-xs text-slate-600 font-mono">
                Access Restricted
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
