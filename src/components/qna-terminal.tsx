'use client'

import { useState } from 'react'
import { submitQuestionAction } from '@/app/actions/interact'
import {
  HelpCircle,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  User,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

export interface PublishedQA {
  id: string
  question: string
  submitter_name: string
  admin_reply: string | null
  created_at: string
}

interface QnATerminalProps {
  initialThreads: PublishedQA[]
}

export function QnATerminal({ initialThreads }: QnATerminalProps) {
  const [question, setQuestion] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{ error?: string; success?: string } | null>(null)
  const [openThread, setOpenThread] = useState<string | null>(
    initialThreads.length > 0 ? initialThreads[0].id : null
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus(null)

    if (!question.trim()) {
      setStatus({ error: 'Please enter your technical question.' })
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.set('question', question.trim())
      formData.set('submitter_name', name.trim() || 'Anonymous')

      const result = await submitQuestionAction(null, formData)
      if (result?.error) {
        setStatus({ error: result.error })
      } else if (result?.success) {
        setStatus({ success: result.message })
        setQuestion('')
        setName('')
      }
    } catch (err: any) {
      setStatus({ error: err.message || 'An unexpected error occurred.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-bronze-50 text-bronze-700 border border-bronze-200 shadow-sm">
          <HelpCircle className="w-3.5 h-3.5 text-bronze-600" />
          Direct Technical Inquiries
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
          Ask an Engineer & Q&A Terminal
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
          Submit technical questions regarding metal fabrication standards, acoustic enclosure decibel reduction, or solar microgrid sizing. Our lead engineers review and publish answers publicly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Public Submission Form */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100">
            <div className="w-8 h-8 rounded-lg bg-bronze-50 text-bronze-600 flex items-center justify-center border border-bronze-200">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Ask an Engineering Question</h3>
              <p className="text-[11px] text-zinc-500">Directly routed to the Davelon Ent. engineering desk</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {status?.error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{status.error}</span>
              </div>
            )}

            {status?.success && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{status.success}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                Your Name / Company (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <User className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Facilities Manager, Lagos"
                  className="w-full bg-white border border-zinc-300 rounded-xl py-2 pl-9 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-bronze-500/40 focus:border-bronze-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                Technical Inquiry / Question <span className="text-bronze-600">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. What gauge of steel is recommended for soundproofing a 150kVA diesel generator in a residential compound?"
                className="w-full bg-white border border-zinc-300 rounded-xl py-2 px-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-bronze-500/40 focus:border-bronze-500 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-bronze-600 hover:bg-bronze-500 active:bg-bronze-700 text-white font-medium rounded-xl text-xs shadow-md shadow-bronze-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Routing to Engineers...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Technical Inquiry</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Published Q&A Threads */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-bronze-600" />
              Published Engineering Knowledge Threads
            </h3>
            <span className="text-xs font-mono text-zinc-500">
              {initialThreads.length} Answers Available
            </span>
          </div>

          {initialThreads.length === 0 ? (
            <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl p-10 text-center">
              <HelpCircle className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <p className="text-xs text-zinc-500">
                No technical questions published yet. Submit the first inquiry on the left!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {initialThreads.map((thread) => {
                const isOpen = openThread === thread.id
                return (
                  <div
                    key={thread.id}
                    className="bg-white border border-zinc-200 rounded-2xl overflow-hidden transition-all shadow-sm hover:shadow-md hover:border-zinc-300"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenThread(isOpen ? null : thread.id)}
                      className="w-full p-4.5 text-left flex items-start justify-between gap-4 hover:bg-zinc-50/60 transition-colors cursor-pointer"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
                          <span>{thread.submitter_name || 'Visitor'}</span>
                          <span>•</span>
                          <span>
                            {new Date(thread.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-zinc-900 leading-snug">
                          {thread.question}
                        </h4>
                      </div>

                      <div className="p-1 rounded-lg text-zinc-400 shrink-0 mt-0.5">
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-bronze-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-zinc-400" />
                        )}
                      </div>
                    </button>

                    {isOpen && thread.admin_reply && (
                      <div className="px-5 pb-5 pt-2 border-t border-zinc-100 bg-zinc-50/80 space-y-2 animate-in fade-in duration-200">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-bronze-700 uppercase tracking-wider font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5 text-bronze-600" />
                          Davelon Ent. Technical Directorate Response:
                        </div>
                        <p className="text-xs text-zinc-700 leading-relaxed pl-4 border-l-2 border-bronze-500">
                          {thread.admin_reply}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}