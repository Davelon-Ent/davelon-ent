import { createAdminClient } from '@/utils/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { ReviewForm } from './review-form'
import { ShieldCheck, Clock, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Client Review Terminal | Davelon Ent.',
  description: 'Verified single-use client engineering assessment portal.',
}

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function ReviewPage({ params }: PageProps) {
  const { token } = await params

  const adminSupabase = createAdminClient()

  // Fetch token record and linked job
  const { data: reviewRecord, error } = await adminSupabase
    .from('reviews')
    .select('*, completed_jobs(title, service_category, client_name)')
    .eq('token', token)
    .single()

  const isValidToken = Boolean(reviewRecord && !error)
  const isUsed = Boolean(reviewRecord?.is_used)
  const isExpired = Boolean(
    reviewRecord?.expires_at && new Date(reviewRecord.expires_at) < new Date()
  )

  const job = reviewRecord?.completed_jobs as { title: string; service_category: string; client_name?: string } | null

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="group flex flex-col items-center mb-4">
            <div className="w-16 h-16 bg-white rounded-2xl p-2 shadow-2xl shadow-orange-500/10 border border-slate-800 flex items-center justify-center mb-3 transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Davelon Ent. Logo"
                width={55}
                height={55}
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-white block">
              DAVELON ENT.
            </span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Client Feedback Portal
          </div>
        </div>

        {/* State 1: Invalid Token */}
        {!isValidToken && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">Invalid Review Link</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              This review link is unrecognized or has expired. If you believe this is an error, please contact Davelon Ent. engineering support.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs text-orange-400 hover:text-orange-300 transition-colors font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Website
              </Link>
            </div>
          </div>
        )}

        {/* State 2: Already Used */}
        {isValidToken && isUsed && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">Review Already Submitted</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Thank you! The evaluation for this completed project has already been submitted and securely logged in our verified portfolio records.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs text-orange-400 hover:text-orange-300 transition-colors font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Website
              </Link>
            </div>
          </div>
        )}

        {/* State 3: Expired */}
        {isValidToken && !isUsed && isExpired && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Clock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">Review Link Expired</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              This review link has expired. Review invitations are valid for 72 hours following generation for security and audit compliance.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs text-orange-400 hover:text-orange-300 transition-colors font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Website
              </Link>
            </div>
          </div>
        )}

        {/* State 4: Valid Active Review Form */}
        {isValidToken && !isUsed && !isExpired && job && (
          <div className="space-y-4">
            {/* Job Summary Banner */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block">
                  Project Under Review
                </span>
                <span className="text-sm font-bold text-white block mt-0.5">
                  {job.title}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                {job.service_category}
              </span>
            </div>

            {/* Interactive Form Component */}
            <ReviewForm
              token={token}
              jobTitle={job.title}
              serviceCategory={job.service_category}
            />
          </div>
        )}
      </div>
    </div>
  )
}