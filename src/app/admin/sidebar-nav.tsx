'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  Award,
  HelpCircle,
  Settings,
  Handshake,
  Users,
  Mail,
} from 'lucide-react'
import type { AppRole } from '@/app/actions/auth'

interface SidebarNavProps {
  userRole: AppRole
}

export function AdminSidebarNav({ userRole }: SidebarNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      roles: ['super_admin', 'staff_admin', 'guest_admin'],
    },
    {
      name: 'Completed Jobs',
      href: '/admin/jobs',
      icon: Briefcase,
      roles: ['super_admin', 'staff_admin', 'guest_admin'],
    },
    {
      name: 'Certificates & Licenses',
      href: '/admin/certificates',
      icon: Award,
      roles: ['super_admin', 'staff_admin', 'guest_admin'],
    },
    {
      name: 'Q&A Terminal',
      href: '/admin/qa',
      icon: HelpCircle,
      roles: ['super_admin', 'staff_admin'], // Guest admin excluded per PRD
    },
    {
      name: 'Subscribers (Leads)',
      href: '/admin/subscribers',
      icon: Mail,
      roles: ['super_admin'], // Super Admin exclusive access to PII
    },
    {
      name: 'Partnerships',
      href: '/admin/partnerships',
      icon: Handshake,
      roles: ['super_admin', 'staff_admin'],
    },
    {
      name: 'Team & Staff',
      href: '/admin/team',
      icon: Users,
      roles: ['super_admin'], // Only Super Admin can manage staff
    },
    {
      name: 'Company Profile & Settings',
      href: '/admin/settings',
      icon: Settings,
      roles: ['super_admin', 'staff_admin', 'guest_admin'],
    },
  ]

  const accessibleItems = navItems.filter((item) => item.roles.includes(userRole))

  return (
    <nav className="space-y-1.5 px-2">
      {accessibleItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-orange-500' : 'text-slate-400'}`} />
            <span>{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}