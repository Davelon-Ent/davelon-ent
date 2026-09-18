'use client'

import { useActionState, useState } from 'react'
import { deleteJobAction } from '@/app/actions/jobs'
import { generateReviewToken } from '@/app/actions/reviews'
import {
  Trash2,
  Calendar,
  Building,
  Tag,
  Loader2,
  Star,
  Lock,
  Layers,
  Link2,
  Check,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react'
import type { AppRole } from '@/app/actions/auth'

export interface JobRecord {
  id: string
  title: string
  slug: string
  service_category: string
  description: string
  images: string[]
  completion_date: string | null
  client_name: string | null
  client_review: string | null
  client_rating: number | null
  created_at: string
}

interface JobCardProps {
  job: JobRecord
  userRole: AppRole
}

export function JobCard({ job, userRole }: JobCardProps) {
  const [deleteState, deleteFormAction, isDeleting] = useActionState(
    async (prev: any, formData: FormData) => {
      if (!confirm(`Are you sure you want to delete "${job.title}"? This cannot be undone.`)) {
        return null
      }
      return await deleteJobAction(formData)
    },
    null
  )

  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const categoryColors: Record<string, string> = {
    'Electro-Mechanical': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Metal Fabrication': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Solar Power': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  }

  const badgeClass =
    categoryColors[job.service_category] ||
    'bg-slate-500/10 text-slate-400 border-slate-500/20'

  const thumbnail =
    job.images && job.images.length > 0 ? job.images[0] : null

  const isGuestAdmin = userRole === 'guest_admin'

  const handleGenerateReviewLink = async () => {
    setIsGenerating(true)
    setActionError(null)

    try {
      const result = await generateReviewToken(job.id)
      if (result?.error) {
        setActionError(result.error)
      } else if (result?.path) {
        const fullUrl = `${window.location.origin}${result.path}`
        await navigator.clipboard.writeText(fullUrl)
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 3500)
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to copy link to clipboard.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/90 rounded-2xl overflow-hidden transition-all flex flex-col justify-between shadow-lg group">
      <div>
        {/* Thumbnail Preview Banner */}
        <div className="relative w-full h-48 bg-slate-950/80 border-b border-slate-800 overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={job.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-2 bg-slate-950">
              <Layers className="w-8 h-8 text-slate-700" />
              <span className="text-xs">No image attached</span>
            </div>
          )}

          {/* Category Overlay Tag */}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-md ${badgeClass}`}
            >
              {job.service_category}
            </span>
          </div>

          {/* Star Rating Badge */}
          {job.client_rating && (
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-500/40 flex items-center gap-1.5 text-amber-400 text-xs font-bold shadow-lg">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{job.client_rating}.0</span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3.5">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight line-clamp-1 group-hover:text-orange-400 transition-colors">
              {job.title}
            </h3>
            {job.client_name && (
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{job.client_name}</span>
              </p>
            )}
          </div>

          <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
            {job.description}
          </p>

          {/* Direct Verified Client Review Section */}
          {job.client_review ? (
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${
                        (job.client_rating || 5) >= s
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                  <span className="text-[11px] font-bold ml-1 text-white">
                    {job.client_rating || 5}.0
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Review
                </span>
              </div>

              <p className="text-xs text-slate-300 italic leading-relaxed">
                &quot;{job.client_review}&quot;
              </p>

              {job.client_name && (
                <div className="text-[11px] text-slate-400 font-medium text-right">
                  — {job.client_name}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-950/40 border border-dashed border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                No client evaluation yet
              </span>

              {!isGuestAdmin && (
                <button
                  type="button"
                  onClick={handleGenerateReviewLink}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-orange-400 hover:text-white bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : copiedLink ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-3 h-3" />
                      Generate Review Link
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {actionError && (
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px]">
              {actionError}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Metadata, Review Link Shortcut & Delete Button */}
      <div className="px-5 py-3.5 bg-slate-950/50 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>
            {job.completion_date
              ? new Date(job.completion_date).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })
              : 'Ongoing / Logged'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* If already reviewed, still allow generating a fresh link if needed */}
          {job.client_review && !isGuestAdmin && (
            <button
              type="button"
              onClick={handleGenerateReviewLink}
              disabled={isGenerating}
              title="Generate fresh single-use review link"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-orange-400 hover:bg-slate-800 rounded-lg border border-slate-800 transition-all cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Link2 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">New Link</span>
                </>
              )}
            </button>
          )}

          {/* Delete Form */}
          <form action={deleteFormAction}>
            <input type="hidden" name="job_id" value={job.id} />
            {isGuestAdmin ? (
              <span
                title="Guest Admins cannot delete records"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-slate-400 bg-slate-900/60 rounded-lg cursor-not-allowed border border-slate-800"
              >
                <Lock className="w-3 h-3 text-slate-400" />
                Locked
              </span>
            ) : (
              <button
                type="submit"
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:text-white hover:bg-red-500/20 active:bg-red-500/30 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </>
                )}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}