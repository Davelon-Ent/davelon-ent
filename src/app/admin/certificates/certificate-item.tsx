'use client'

import { useActionState } from 'react'
import { deleteCertificateAction } from '@/app/actions/certificates'
import { Trash2, ExternalLink, Calendar, Loader2, Award, Lock } from 'lucide-react'
import type { AppRole } from '@/app/actions/auth'

export interface CertificateRecord {
  id: string
  title: string
  image_url: string
  created_at: string
}

interface CertificateItemProps {
  certificate: CertificateRecord
  userRole: AppRole
}

export function CertificateItem({ certificate, userRole }: CertificateItemProps) {
  const [deleteState, deleteFormAction, isDeleting] = useActionState(
    async (prev: any, formData: FormData) => {
      if (!confirm(`Are you sure you want to delete "${certificate.title}"?`)) {
        return null
      }
      return await deleteCertificateAction(formData)
    },
    null
  )

  const isGuestAdmin = userRole === 'guest_admin'

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/90 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-lg group">
      <div className="flex items-center gap-4 min-w-0">
        {/* Certificate Document Thumbnail Preview */}
        <a
          href={certificate.image_url}
          target="_blank"
          rel="noopener noreferrer"
          title="Click to view full certificate"
          className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 shrink-0 group/img block"
        >
          <img
            src={certificate.image_url}
            alt={certificate.title}
            className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
            <ExternalLink className="w-4 h-4" />
          </div>
        </a>

        {/* Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight truncate">
              {certificate.title}
            </h3>
            <a
              href={certificate.image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-orange-400 transition-colors p-1"
              title="Open full document in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              {new Date(certificate.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400/90 text-[11px] font-medium flex items-center gap-1">
              <Award className="w-3 h-3" /> Active Credential
            </span>
          </div>
        </div>
      </div>

      {/* Delete Action */}
      <div className="self-end sm:self-center">
        <form action={deleteFormAction}>
          <input type="hidden" name="certificate_id" value={certificate.id} />
          {isGuestAdmin ? (
            <span
              title="Guest Admins cannot delete certificates"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 bg-slate-900/60 rounded-lg cursor-not-allowed border border-slate-800"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Locked
            </span>
          ) : (
            <button
              type="submit"
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-white hover:bg-red-500/20 active:bg-red-500/30 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </>
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  )
}