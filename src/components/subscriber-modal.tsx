'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { submitSubscriptionAction } from '@/app/actions/interact'
import { X, Mail, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react'

export function SubscriberModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [status, setStatus] = useState<{ error?: string; success?: string } | null>(null)

  useEffect(() => {
    try {
      const isDismissed = localStorage.getItem('davelon_newsletter_dismissed')
      const isLater = sessionStorage.getItem('davelon_newsletter_later')

      if (!isDismissed && !isLater) {
        const timer = setTimeout(() => {
          setIsOpen(true)
        }, 3000)

        return () => clearTimeout(timer)
      }
    } catch {
      // Storage access may be restricted in some browser privacy modes
    }
  }, [])

  const handleDismiss = () => {
    try {
      localStorage.setItem('davelon_newsletter_dismissed', 'true')
    } catch {}
    setIsOpen(false)
  }

  const handleAskLater = () => {
    try {
      sessionStorage.setItem('davelon_newsletter_later', 'true')
    } catch {}
    setIsOpen(false)
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus(null)

    if (!email.trim() || !email.includes('@')) {
      setStatus({ error: 'Please enter a valid corporate or personal email.' })
      return
    }

    setIsPending(true)
    try {
      const formData = new FormData()
      formData.set('email', email.trim().toLowerCase())

      const res = await submitSubscriptionAction(null, formData)
      if (res?.error) {
        setStatus({ error: res.error })
      } else if (res?.success) {
        setStatus({ success: res.message })
        setEmail('')
        try {
          localStorage.setItem('davelon_newsletter_dismissed', 'true')
        } catch {}

        // Allow user to read success message before closing modal
        setTimeout(() => {
          setIsOpen(false)
        }, 1800)
      }
    } catch (err: any) {
      setStatus({ error: err.message || 'Subscription failed.' })
    } finally {
      setIsPending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-zinc-200 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Subtle decorative bronze glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-bronze-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Action 1: Close 'X' button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Close newsletter modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Branding header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-white rounded-xl p-1.5 border border-zinc-200 flex items-center justify-center shrink-0 shadow-sm">
            <Image
              src="/logo.png"
              alt="Davelon Ent."
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-wider text-zinc-900 block">
              DAVELON ENT.
            </span>
            <span className="text-[10px] text-bronze-600 font-mono tracking-tight block uppercase font-semibold">
              Engineering Intelligence
            </span>
          </div>
        </div>

        {/* Title and Value Proposition */}
        <div className="space-y-2 mb-6">
          <h3 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight leading-tight">
            Stay Ahead in Industrial Power & Metal Fabrication
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Join engineering professionals and facility managers. Receive exclusive technical field reports, solar microgrid load calculation guides, and project case studies directly to your inbox.
          </p>
        </div>

        {/* Subscription Form */}
        <form onSubmit={handleSubscribe} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-bronze-500/40 focus:border-bronze-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="py-2.5 px-5 bg-bronze-600 hover:bg-bronze-500 active:bg-bronze-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md shadow-bronze-600/20 transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-60 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Subscribing...</span>
                </>
              ) : (
                <>
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Status Alerts */}
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
        </form>

        {/* Footer Actions: Action 2 (Ask me later) */}
        <div className="mt-5 pt-3 border-t border-zinc-200 flex items-center justify-between">
          <span className="text-[10px] sm:text-xs text-zinc-500">
            Strict privacy policy. Unsubscribe anytime.
          </span>
          <button
            type="button"
            onClick={handleAskLater}
            className="text-xs text-zinc-500 hover:text-bronze-600 underline underline-offset-4 decoration-zinc-300 hover:decoration-bronze-600 transition-colors cursor-pointer"
          >
            Ask me later
          </button>
        </div>
      </div>
    </div>
  )
}