'use client'

import { useState } from 'react'
import { submitReviewAction } from '@/app/actions/reviews'
import { Star, Send, Loader2, CheckCircle2, AlertCircle, Building2, MessageSquare } from 'lucide-react'

interface ReviewFormProps {
  token: string
  jobTitle: string
  serviceCategory: string
}

export function ReviewForm({ token, jobTitle, serviceCategory }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [clientName, setClientName] = useState('')
  const [comment, setComment] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const ratingLabels: Record<number, string> = {
    1: 'Needs Improvement',
    2: 'Fair',
    3: 'Good Quality',
    4: 'Very Satisfied',
    5: 'Exceptional Engineering',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!clientName.trim()) {
      setErrorMessage('Please enter your name or company.')
      return
    }

    if (!comment.trim()) {
      setErrorMessage('Please provide comments regarding the engineering delivery.')
      return
    }

    setIsPending(true)

    try {
      const formData = new FormData()
      formData.set('token', token)
      formData.set('rating', rating.toString())
      formData.set('client_name', clientName.trim())
      formData.set('comment', comment.trim())

      const result = await submitReviewAction(null, formData)

      if (result?.error) {
        setErrorMessage(result.error)
      } else if (result?.success) {
        setIsSuccess(true)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.')
    } finally {
      setIsPending(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center py-10 px-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Review Successfully Published
        </h2>
        <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
          Thank you for providing your verified evaluation of{' '}
          <strong className="text-orange-400 font-semibold">{jobTitle}</strong>. Your review has been linked to the official engineering record.
        </p>
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Visit Davelon Ent. Homepage
          </a>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1-5 Star Rating Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          Engineering Delivery Rating <span className="text-orange-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => {
            const activeStar = (hoverRating !== null ? hoverRating : rating) >= star
            return (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                onClick={() => setRating(star)}
                className="p-1.5 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                aria-label={`Rate ${star} star`}
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    activeStar
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-600 hover:text-slate-500'
                  }`}
                />
              </button>
            )
          })}
          <span className="text-xs font-medium text-amber-400 ml-2 font-mono">
            {ratingLabels[hoverRating || rating]}
          </span>
        </div>
      </div>

      {/* Client Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          Your Name or Organization <span className="text-orange-500">*</span>
        </label>
        <input
          type="text"
          required
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="e.g. Engr. B. Adeyemi, Lead Project Manager"
          className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
        />
      </div>

      {/* Review Comment with 1000 character limit counter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            Project Review & Assessment <span className="text-orange-500">*</span>
          </label>
          <span className={`text-[11px] font-mono ${comment.length > 950 ? 'text-red-400' : 'text-slate-500'}`}>
            {comment.length} / 1000
          </span>
        </div>
        <textarea
          required
          maxLength={1000}
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Please share details regarding structural durability, power reliability, commissioning speed, or overall fabrication finish..."
          className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all resize-none"
        />
      </div>

      {/* Submit Action */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 px-6 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-semibold rounded-xl text-sm shadow-xl shadow-orange-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting Review...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Verified Review
          </>
        )}
      </button>
    </form>
  )
}