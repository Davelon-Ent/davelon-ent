'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
  Handshake,
  FileText,
  X,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import type { Partnership } from '@/app/actions/partnerships'

interface PartnersBannerProps {
  initialPartners?: Partnership[]
}

export function PartnersBanner({ initialPartners = [] }: PartnersBannerProps) {
  const [partners, setPartners] = useState<Partnership[]>(initialPartners)
  const [selectedPartner, setSelectedPartner] = useState<Partnership | null>(null)

  // Fetch or sync partners if initialPartners is empty
  useEffect(() => {
    if (initialPartners.length > 0) {
      setPartners(initialPartners)
      return
    }

    async function fetchPartners() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('partnerships')
          .select('*')
          .order('created_at', { ascending: false })

        if (data) {
          setPartners(data)
        }
      } catch (err) {
        console.error('Failed to load partners:', err)
      }
    }

    fetchPartners()
  }, [initialPartners])

  if (partners.length === 0) {
    return null
  }

  return (
    <>
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-zinc-200 bg-zinc-50/70">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-bronze-50 text-bronze-700 border border-bronze-200 shadow-sm">
              <Handshake className="w-3.5 h-3.5 text-bronze-600" />
              Strategic Alliances & Joint Ventures
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              Certified Commercial & Engineering Partners
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Davelon Ent. collaborates with certified manufacturers, international industrial suppliers, and institutional infrastructure contractors. Click any partner to view executed cooperation agreements.
            </p>
          </div>

          {/* Horizontal Partners Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {partners.map((partner) => (
              <button
                type="button"
                key={partner.id}
                onClick={() => setSelectedPartner(partner)}
                className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-bronze-500/40 transition-all flex flex-col items-center justify-between gap-3 text-center cursor-pointer group focus:outline-none focus:ring-2 focus:ring-bronze-500/30"
              >
                {/* Logo Image */}
                <div className="w-full h-20 flex items-center justify-center p-2 rounded-xl bg-zinc-50/80 group-hover:bg-white transition-colors">
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Partner Name & Agreement Callout */}
                <div className="space-y-1 w-full">
                  <h3 className="text-xs font-bold text-zinc-900 group-hover:text-bronze-600 transition-colors truncate">
                    {partner.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500 group-hover:text-bronze-600 font-mono transition-colors">
                    <FileText className="w-3 h-3" />
                    <span>Agreement</span>
                    <ChevronRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Sleek Centered Agreement Photo Modal */}
      {selectedPartner && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setSelectedPartner(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:px-6 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-white border border-zinc-200 p-1 flex items-center justify-center shrink-0">
                  <img
                    src={selectedPartner.logo_url}
                    alt={selectedPartner.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-zinc-900 truncate">
                    {selectedPartner.name}
                  </h3>
                  <span className="text-[10px] text-bronze-600 font-mono uppercase tracking-wider block font-semibold">
                    Executed Partnership Agreement
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPartner(null)}
                className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-lg transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-zinc-100/70">
              <img
                src={selectedPartner.agreement_url}
                alt={`${selectedPartner.name} Agreement Document`}
                className="w-full h-auto max-h-[62vh] object-contain rounded-xl shadow-md border border-zinc-200 bg-white"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:px-6 border-t border-zinc-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Legal Partnership Record — Davelon Ent. Corporate Registry</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedPartner.agreement_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <span>Open Full Size</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedPartner(null)}
                  className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}