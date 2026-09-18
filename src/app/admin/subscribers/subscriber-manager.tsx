'use client'

import { useActionState, useRef, useEffect, useState } from 'react'
import { adminAddSubscriberAction, deleteSubscriberAction } from '@/app/actions/interact'
import {
  Mail,
  Calendar,
  UserPlus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
} from 'lucide-react'

export interface Subscriber {
  id: string
  email: string
  created_at: string
}

interface SubscriberManagerProps {
  initialSubscribers: Subscriber[]
}

export function SubscriberManager({ initialSubscribers }: SubscriberManagerProps) {
  const [state, formAction, isPending] = useActionState(adminAddSubscriberAction, null)
  const formRef = useRef<HTMLFormElement>(null)

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
    }
  }, [state])

  const handleDelete = async (e: React.FormEvent<HTMLFormElement>, id: string, email: string) => {
    e.preventDefault()
    setDeleteError(null)

    const confirmed = window.confirm(
      `Are you sure you want to remove subscriber "${email}"? This action cannot be undone.`
    )
    if (!confirmed) return

    setDeletingId(id)
    try {
      const formData = new FormData(e.currentTarget)
      const res = await deleteSubscriberAction(null, formData)
      if (res?.error) {
        setDeleteError(res.error)
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete subscriber.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Inline Add Subscriber Form Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Add Subscriber Manually
              </h3>
              <p className="text-[11px] text-slate-400">
                Register verified client contact directly into the marketing directory.
              </p>
            </div>
          </div>
          <span className="text-[10px] text-orange-400/80 font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
            Super Admin
          </span>
        </div>

        <form ref={formRef} action={formAction} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                required
                placeholder="executive@clientcompany.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="py-2.5 px-4 sm:px-5 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-60 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add Subscriber</span>
                </>
              )}
            </button>
          </div>

          {state?.error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          {state?.success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{state.message}</span>
            </div>
          )}
        </form>
      </div>

      {/* Global Delete Error Alert */}
      {deleteError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      {/* Subscribers Table / List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/90 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Registered Subscriber Emails ({initialSubscribers.length})
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Direct Database Sync
          </span>
        </div>

        {initialSubscribers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Mail className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-xs">No email subscribers logged yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {initialSubscribers.map((sub, index) => (
              <div
                key={sub.id || index}
                className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                    <Mail className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-white truncate">
                    {sub.email}
                  </span>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 hidden sm:flex">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {new Date(sub.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Delete Button Form with Native window.confirm */}
                  <form onSubmit={(e) => handleDelete(e, sub.id, sub.email)}>
                    <input type="hidden" name="id" value={sub.id} />
                    <button
                      type="submit"
                      disabled={deletingId === sub.id}
                      title={`Delete subscriber ${sub.email}`}
                      aria-label={`Delete subscriber ${sub.email}`}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {deletingId === sub.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}