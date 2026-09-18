'use client'

import { useState, useActionState } from 'react'
import { publishReplyAction, deleteQuestionAction } from '@/app/actions/interact'
import {
  HelpCircle,
  MessageSquare,
  CheckCircle2,
  Trash2,
  Send,
  Loader2,
  User,
  Calendar,
  AlertCircle,
  Clock,
} from 'lucide-react'

export interface QAItem {
  id: string
  question: string
  submitter_name: string
  admin_reply: string | null
  status: 'pending' | 'published'
  created_at: string
}

interface QAReplyCardProps {
  item: QAItem
}

export function QAReplyCard({ item }: QAReplyCardProps) {
  const [replyText, setReplyText] = useState(item.admin_reply || '')
  const [isReplying, setIsReplying] = useState(false)
  const [feedback, setFeedback] = useState<{ error?: string; success?: string } | null>(null)

  const [deleteState, deleteAction, isDeleting] = useActionState(
    async (prev: any, formData: FormData) => {
      if (!confirm('Are you sure you want to delete this technical inquiry?')) return null
      return await deleteQuestionAction(formData)
    },
    null
  )

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)

    if (!replyText.trim()) {
      setFeedback({ error: 'Please enter a technical response before publishing.' })
      return
    }

    setIsReplying(true)
    try {
      const formData = new FormData()
      formData.set('id', item.id)
      formData.set('admin_reply', replyText.trim())

      const res = await publishReplyAction(formData)
      if (res?.error) {
        setFeedback({ error: res.error })
      } else if (res?.success) {
        setFeedback({ success: res.message })
      }
    } catch (err: any) {
      setFeedback({ error: err.message || 'Failed to publish response.' })
    } finally {
      setIsReplying(false)
    }
  }

  const isPending = item.status === 'pending'

  return (
    <div className={`bg-slate-900/70 border rounded-2xl p-5 md:p-6 transition-all shadow-lg space-y-4 ${
      isPending ? 'border-amber-500/30' : 'border-slate-800'
    }`}>
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <User className="w-3.5 h-3.5 text-slate-500" />
            {item.submitter_name || 'Anonymous Visitor'}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-400">
            <Calendar className="w-3 h-3 text-slate-500" />
            {new Date(item.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isPending ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
              <Clock className="w-3 h-3" />
              Pending Response
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              Live on Site
            </span>
          )}

          <form action={deleteAction}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              disabled={isDeleting}
              title="Delete question"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* The Question */}
      <div className="space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-orange-400" />
          Customer Technical Question
        </span>
        <p className="text-sm font-semibold text-white leading-relaxed">
          {item.question}
        </p>
      </div>

      {/* Status Alerts */}
      {feedback?.error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedback.error}</span>
        </div>
      )}

      {feedback?.success && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback.success}</span>
        </div>
      )}

      {/* Admin Reply Section */}
      <form onSubmit={handlePublish} className="space-y-3 pt-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
            {isPending ? 'Draft Official Engineering Response' : 'Published Response (Editable)'}
          </label>
          <textarea
            rows={3}
            required
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Provide technical clarification, generator sizing details, solar capacity, or material specifications..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all resize-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isReplying}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-medium rounded-xl text-xs shadow-lg shadow-orange-600/20 transition-all disabled:opacity-60 cursor-pointer"
          >
            {isReplying ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                {isPending ? 'Publish Response to Site' : 'Update Response'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}