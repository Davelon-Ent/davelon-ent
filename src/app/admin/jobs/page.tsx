import { getCurrentUser } from '@/app/actions/auth'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { JobForm } from './job-form'
import { JobCard, type JobRecord } from './job-card'
import { Briefcase, Layers, Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Completed Jobs Directory | Davelon Ent. CMS',
  description: 'Manage engineering portfolio, technical specs, and site photo records.',
}

export default async function AdminJobsPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect('/admin/login')
  }

  const supabase = await createClient()

  // Fetch all completed jobs ordered by creation date
  const { data: jobs, error } = await supabase
    .from('completed_jobs')
    .select('*')
    .order('created_at', { ascending: false })

  const completedJobs: JobRecord[] = jobs || []

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Directory Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Live Project Catalog
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Completed Engineering Jobs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Log, update, and manage public case studies across Electro-Mechanical, Fabrication, and Power Systems.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-orange-400" />
            <span>
              Total Logged: <strong className="text-white">{completedJobs.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Top Section: Job Creation Form */}
      <JobForm />

      {/* Bottom Section: Active Projects Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Published Projects Grid
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {completedJobs.length}
            </span>
          </div>
        </div>

        {completedJobs.length === 0 ? (
          <div className="bg-slate-900/30 border border-dashed border-slate-800/90 rounded-2xl p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No completed jobs logged yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Use the technical submission form above to add Davelon Ent&apos;s first engineering milestone with photos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedJobs.map((job) => (
              <JobCard key={job.id} job={job} userRole={currentUser.role} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}