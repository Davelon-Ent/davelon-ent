import Image from 'next/image'
import Link from 'next/link'
import { Wrench, Shield, Lock, Mail, Phone, Clock, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Scheduled Maintenance | Davelon Ent.',
  description: 'Davelon Ent. systems are currently undergoing scheduled maintenance and engineering optimizations.',
}

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col justify-between selection:bg-amber-500/20 selection:text-amber-900">
      {/* Top Navbar */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl p-1.5 border border-zinc-200 shadow-xs flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Davelon Ent."
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-bold text-sm tracking-wide text-zinc-900 block font-mono">
                DAVELON ENT.
              </span>
              <span className="text-[11px] text-zinc-500 block">
                Engineering & Contracting
              </span>
            </div>
          </div>

          {/* Top Admin Login Link */}
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-300/80 transition-all cursor-pointer shadow-2xs"
          >
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>Admin Login</span>
          </Link>
        </div>
      </header>

      {/* Main Hero Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="max-w-xl w-full bg-white border border-zinc-200 rounded-3xl p-8 sm:p-10 shadow-xl shadow-zinc-200/50 text-center space-y-6 relative overflow-hidden">
          {/* Subtle Ambient Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-800 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="tracking-wide">Scheduled Maintenance in Progress</span>
          </div>

          {/* Central Icon */}
          <div className="w-18 h-18 rounded-3xl bg-gradient-to-b from-amber-50 to-amber-100/80 border border-amber-200/80 flex items-center justify-center mx-auto shadow-inner text-amber-700">
            <Wrench className="w-8 h-8 animate-pulse" />
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight leading-tight">
              We&apos;re Upgrading Our Systems
            </h1>
            <p className="text-sm text-zinc-600 leading-relaxed max-w-md mx-auto">
              Davelon Ent. is currently undergoing scheduled platform upgrades and infrastructure optimizations. Public access is temporarily offline while we enhance our operational services.
            </p>
          </div>

          {/* Status Details Box */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-left text-xs text-zinc-600 space-y-2">
            <div className="flex items-center justify-between text-zinc-800 font-semibold pb-1 border-b border-zinc-200">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                System Status
              </span>
              <span className="text-[11px] font-mono text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded border border-amber-200/60">
                Maintenance Mode
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500 pt-1">
              <Clock className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
              <span>Public representation temporarily paused. Certified personnel may authenticate below.</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/admin/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-zinc-900 hover:bg-zinc-800 text-white shadow-md shadow-zinc-900/10 transition-all cursor-pointer group"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Admin Login</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <a
              href="mailto:davelonentrepreneurs@gmail.com"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200/70 border border-zinc-300/80 transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4 text-zinc-500" />
              <span>Emergency Contact</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer Contact Strip */}
      <footer className="border-t border-zinc-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-700">Davelon Ent. CMS Engine</span>
            <span>&bull;</span>
            <span>All Rights Reserved &copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-600">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-zinc-400" />
              +1 (555) 234-5678
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-zinc-400" />
              davelonentrepreneurs@gmail.com
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
