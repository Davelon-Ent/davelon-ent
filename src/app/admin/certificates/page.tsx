import { getCurrentUser } from '@/app/actions/auth'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CertificateForm } from './certificate-form'
import { CertificateItem, type CertificateRecord } from './certificate-item'
import { Award, ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'Certificates & Licenses | Davelon Ent. CMS',
  description: 'Manage regulatory compliance, engineering accreditation, and safety licenses.',
}

export default async function AdminCertificatesPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect('/admin/login')
  }

  const supabase = await createClient()

  // Fetch all certificates ordered by newest
  const { data: certs } = await supabase
    .from('certificates')
    .select('*')
    .order('created_at', { ascending: false })

  const certificates: CertificateRecord[] = certs || []

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Directory Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Compliance & Legal Directory
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Certificates & Licenses
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload and manage engineering certifications, COREN practice licenses, and safety documentation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 flex items-center gap-2">
            <Award className="w-4 h-4 text-orange-400" />
            <span>
              Total On Record: <strong className="text-white">{certificates.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Top Section: Upload Form */}
      <CertificateForm />

      {/* Bottom Section: Active Certificates Grid / List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-slate-400" />
            Published Credentials
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {certificates.length}
            </span>
          </h2>
        </div>

        {certificates.length === 0 ? (
          <div className="bg-slate-900/30 border border-dashed border-slate-800/90 rounded-2xl p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No certificates uploaded yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Use the form above to attach Davelon Ent&apos;s legal credentials or engineering licenses.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <CertificateItem
                key={cert.id}
                certificate={cert}
                userRole={currentUser.role}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}