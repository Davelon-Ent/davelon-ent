import { getCurrentUser } from '@/app/actions/auth'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { QAReplyCard, type QAItem } from './qa-reply-card'
import { HelpCircle, Clock, CheckCircle2, Lock } from 'lucide-react'

export const metadata = {
  title: 'Q&A Terminal Moderation | Davelon Ent. CMS',
  description: 'Moderate customer inquiries and publish technical replies.',
}

export default async function AdminQAPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect('/admin/login')
  }

  if (currentUser.role === 'guest_admin') {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-white">Access Restricted</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Guest Admins are restricted from replying to customer technical inquiries. Q&A moderation requires Staff Admin or Super Admin credentials.
        </p>
      </div>
    )
  }

  const supabase = await createClient()

  // Fetch all inquiries
  const { data: inquiries } = await supabase
    .from('q_and_a')
    .select('*')
    .order('created_at', { ascending: false })

  const items: QAItem[] = inquiries || []
  const pendingItems = items.filter((i) => i.status === 'pending')
  const publishedItems = items.filter((i) => i.status === 'published')

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            Engineering Knowledge Base
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Q&A Terminal Moderation
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review incoming technical questions, draft engineering specifications, and publish responses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>
              Pending: <strong className="text-amber-400">{pendingItems.length}</strong>
            </span>
          </div>
          <div className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              Published: <strong className="text-emerald-400">{publishedItems.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: Pending Inquiries Awaiting Reply */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Inquiries Awaiting Engineer Response
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
              {pendingItems.length}
            </span>
          </h2>
        </div>

        {pendingItems.length === 0 ? (
          <div className="bg-slate-900/30 border border-dashed border-slate-800/90 rounded-2xl p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white">All caught up!</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              No technical questions are currently pending reply.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingItems.map((item) => (
              <QAReplyCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Published Threads Live on Site */}
      {publishedItems.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Published Live Knowledge Base
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                {publishedItems.length}
              </span>
            </h2>
          </div>

          <div className="space-y-4">
            {publishedItems.map((item) => (
              <QAReplyCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}