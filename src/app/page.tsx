import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { PublicFooter } from '@/components/public-footer'
import { QnATerminal, type PublishedQA } from '@/components/qna-terminal'
import { SubscriberModal } from '@/components/subscriber-modal'
import { PartnersBanner } from '@/components/partners-banner'
import type { Partnership } from '@/app/actions/partnerships'
import {
  Wrench,
  Shield,
  Sun,
  Star,
  MessageCircle,
  Mail,
} from 'lucide-react'

export const metadata = {
  title: 'Davelon Ent. | Multidisciplinary Engineering Contracting & Solar Power',
  description:
    'Engineering contracting specialists in heavy metal fabrication, acoustic security enclosures, and 3-phase hybrid solar microgrids.',
}

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch published completed jobs
  const { data: jobs } = await supabase
    .from('completed_jobs')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch published Q&A threads
  const { data: qnaThreads } = await supabase
    .from('q_and_a')
    .select('id, question, submitter_name, admin_reply, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  // Fetch published partnerships
  const { data: partnerRows } = await supabase
    .from('partnerships')
    .select('*')
    .order('created_at', { ascending: false })

  const completedJobs = jobs || []
  const publishedQA: PublishedQA[] = (qnaThreads as PublishedQA[]) || []
  const partnerships: Partnership[] = (partnerRows as Partnership[]) || []

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col selection:bg-bronze-500 selection:text-white">
      {/* Sticky Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white rounded-xl p-1.5 border border-zinc-200 flex items-center justify-center shrink-0 shadow-sm">
              <Image
                src="/logo.png"
                alt="Davelon Ent."
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-wider text-zinc-900 block">
                DAVELON ENT.
              </span>
              <span className="text-[10px] text-bronze-600 font-mono tracking-tight block font-semibold uppercase">
                Engineering & Contracting
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="https://wa.me/2347026322798"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Talk to an Engineer</span>
            </a>

            <Link
              href="/admin/login"
              className="px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 transition-all"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-zinc-50 border-b border-zinc-200 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e760_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e760_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-bronze-500/30 bg-bronze-50 text-bronze-700 shadow-sm">
            <Shield className="w-3.5 h-3.5 text-bronze-600" />
            Precision Industrial Engineering & Power Infrastructure
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-zinc-900 tracking-tight leading-tight">
            High-Performance Fabrication & <br className="hidden sm:inline" />
            <span className="text-bronze-600">Commercial Solar Solutions</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            Davelon Ent. executes mission-critical structural fabrication, soundproof generator security enclosures, and grid-scale solar installations across industrial and commercial facilities.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-3 sm:gap-4">
            <a
              href="https://wa.me/2347026322798"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-bronze-600 hover:bg-bronze-500 text-white shadow-lg shadow-bronze-600/25 transition-all cursor-pointer"
            >
              Request Engineering Consultation
            </a>
            <a
              href="mailto:davelonentrepreneurs@gmail.com"
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 shadow-sm transition-all flex items-center gap-2"
            >
              <Mail className="w-4 h-4 text-zinc-500" />
              <span>Email Blueprint</span>
            </a>
          </div>
        </div>
      </section>

      {/* Core Engineering Divisions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Our Core Engineering Disciplines
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600">
            Specialized engineering delivery compliant with COREN standards and national safety codes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Division 1: Metal & Security Fabrication */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md hover:border-bronze-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-bronze-50 text-bronze-600 flex items-center justify-center border border-bronze-200">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Metal & Security Fabrication</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Industrial acoustic generator enclosures, heavy structural steel tank towers, high-security gates, and specialized architectural metalwork.
            </p>
          </div>

          {/* Division 2: Electro-Mechanical Engineering */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-800 flex items-center justify-center border border-zinc-200">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Electro-Mechanical Systems</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Industrial automated actuators, robotic prototyping, electromechanical assembly, switchgear installation, and plant machinery commissioning.
            </p>
          </div>

          {/* Division 3: Solar & Power Infrastructure */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md hover:border-bronze-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Sun className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Solar Power & Microgrids</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Commercial 3-phase hybrid inverters (5kVA–100kVA), high-voltage LiFePO4 battery active balancing, and microgrid engineering for zero downtime.
            </p>
          </div>
        </div>
      </section>

      {/* Completed Jobs & Verified Reviews Portfolio */}
      {completedJobs.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-zinc-200 bg-zinc-50/60">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-bronze-600 uppercase tracking-wider block mb-1">
                  Validated Track Record
                </span>
                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
                  Completed Projects & Client Evaluations
                </h2>
              </div>
              <span className="text-xs text-zinc-500 font-mono">
                {completedJobs.length} Milestone Deliveries Logged
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedJobs.map((job) => {
                const thumbnail = job.images && job.images.length > 0 ? job.images[0] : null
                return (
                  <div
                    key={job.id}
                    className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-zinc-300 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="relative w-full h-48 bg-zinc-100 overflow-hidden">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={job.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400 bg-zinc-100">
                            <Wrench className="w-8 h-8" />
                          </div>
                        )}

                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/90 backdrop-blur-md text-zinc-800 border border-zinc-200 shadow-sm">
                            {job.service_category}
                          </span>
                        </div>

                        {job.client_rating && (
                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 text-amber-700 text-xs font-bold shadow-sm">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{job.client_rating}.0</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <h3 className="font-bold text-zinc-900 text-base tracking-tight">
                          {job.title}
                        </h3>
                        <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed">
                          {job.description}
                        </p>

                        {/* Verified Review Snippet */}
                        {job.client_review && (
                          <div className="mt-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-0.5 text-amber-500">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-2.5 h-2.5 ${
                                      (job.client_rating || 5) >= s
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-zinc-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Verified Client
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-600 italic">
                              &quot;{job.client_review}&quot;
                            </p>
                            {job.client_name && (
                              <p className="text-[10px] text-zinc-500 text-right">
                                — {job.client_name}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-5 py-3 bg-zinc-50/90 border-t border-zinc-100 text-[11px] text-zinc-500 flex items-center justify-between">
                      <span>{job.client_name || 'Commercial Client'}</span>
                      <span>
                        {job.completion_date
                          ? new Date(job.completion_date).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Completed'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Q&A Terminal Section */}
      <QnATerminal initialThreads={publishedQA} />

      {/* Polite Visitor Pop-up Modal */}
      <SubscriberModal />

      {/* Strategic Partnerships Section */}
      <PartnersBanner initialPartners={partnerships} />

      {/* Public Footer containing Dynamic Certificates Links */}
      <PublicFooter />
    </div>
  )
}