import { getCurrentUser } from '@/app/actions/auth'
import { getSystemSettings } from '@/app/actions/settings'
import { redirect } from 'next/navigation'
import { Settings, ShieldCheck } from 'lucide-react'
import { SettingsManager } from './settings-manager'

export const metadata = {
  title: 'Company Profile & Settings | Davelon Ent. CMS',
  description: 'Manage administrator profile credentials, corporate configurations, and global security controls.',
}

export default async function SettingsPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/admin/login')
  }

  // Fetch persisted system settings (with fallback defaults if unseeded)
  const settings = await getSystemSettings()

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Enterprise Control Center
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Company Profile & Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your personal administrative credentials, corporate contact parameters, and global system security.
          </p>
        </div>
      </div>

      {/* Main Settings Manager */}
      <SettingsManager
        currentUser={currentUser}
        initialSettings={settings}
      />
    </div>
  )
}
