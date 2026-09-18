import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, ExternalLink } from 'lucide-react'

export async function PublicFooter() {
  const supabase = await createClient()
  const { data: certificates } = await supabase
    .from('certificates')
    .select('id, title, image_url')
    .order('created_at', { ascending: false })

  return (
    <footer className="w-full bg-zinc-950 border-t border-zinc-800 text-zinc-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Brand & Contact Info */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl p-1.5 flex items-center justify-center border border-zinc-800 shrink-0">
              <Image
                src="/logo.png"
                alt="Davelon Ent."
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-wide">
                DAVELON ENT.
              </span>
              <p className="text-xs text-zinc-400">
                Engineering Contracting, Metal Fabrication & Power Systems
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
            <a
              href="mailto:davelonentrepreneurs@gmail.com"
              className="hover:text-bronze-400 transition-colors"
            >
              davelonentrepreneurs@gmail.com
            </a>
            <span className="text-zinc-700 hidden sm:inline">•</span>
            <a
              href="https://wa.me/2347026322798"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              WhatsApp: +234 702 632 2798
            </a>
          </div>
        </div>

        {/* Subtle Certificates & Licenses Links */}
        {certificates && certificates.length > 0 && (
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-bronze-500" />
              Verified Accreditations & Licenses:
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 text-xs text-zinc-400">
              {certificates.map((cert) => (
                <a
                  key={cert.id}
                  href={cert.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-zinc-300 hover:text-bronze-400 underline underline-offset-4 decoration-zinc-800 hover:decoration-bronze-400 transition-colors"
                >
                  <span>{cert.title}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Copyright & Admin Portal Link */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-[11px] text-zinc-500">
          <p>© {new Date().getFullYear()} Davelon Ent. All rights reserved.</p>
          <Link
            href="/admin"
            className="hover:text-zinc-300 transition-colors underline underline-offset-4 decoration-zinc-800"
          >
            Staff & Administration Portal
          </Link>
        </div>
      </div>
    </footer>
  )
}