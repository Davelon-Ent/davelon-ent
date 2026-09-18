import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getCurrentUser, signOutAction } from '@/app/actions/auth'
import { AdminSidebarNav } from './sidebar-nav'
import { LogOut, Shield, UserCircle, ExternalLink } from 'lucide-react'

export const metadata = {
  title: 'Admin Dashboard | Davelon Ent.',
  description: 'Davelon Ent. Corporate Website & Custom CMS Administration',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  // Let the login page render cleanly without the dashboard shell
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/admin/login')
  }

  const roleStyles = {
    super_admin: {
      label: 'Super Admin',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      dot: 'bg-amber-500',
    },
    staff_admin: {
      label: 'Staff Admin',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dot: 'bg-emerald-500',
    },
    guest_admin: {
      label: 'Guest Admin',
      badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      dot: 'bg-sky-500',
    },
  }[currentUser.role]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900/80 backdrop-blur-md border-r border-slate-800 flex flex-col shrink-0 justify-between">
        <div>
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl p-1.5 border border-slate-700 flex items-center justify-center shrink-0">
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
                <span className="font-bold text-sm tracking-wide text-white block">
                  DAVELON ENT.
                </span>
                <span className="text-[11px] text-slate-400 block tracking-tight">
                  Custom CMS Engine
                </span>
              </div>
            </Link>

            <Link
              href="/"
              target="_blank"
              title="View Public Site"
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          {/* Nav Links */}
          <div className="py-4">
            <div className="px-4 mb-2">
              <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                Navigation
              </span>
            </div>
            <AdminSidebarNav userRole={currentUser.role} />
          </div>
        </div>

        {/* User Profile & Sign Out Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3 mb-2">
            <div className="flex items-center gap-2 mb-1.5">
              <UserCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs font-medium text-slate-200 truncate" title={currentUser.email}>
                {currentUser.email}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${roleStyles.badge}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${roleStyles.dot}`} />
                {roleStyles.label}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">RBAC Active</span>
            </div>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}