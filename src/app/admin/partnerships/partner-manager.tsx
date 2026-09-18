'use client'

import { useState, useRef } from 'react'
import { addPartnerAction, deletePartnerAction, type Partnership } from '@/app/actions/partnerships'
import {
  Handshake,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Building,
  Plus,
  ExternalLink,
} from 'lucide-react'

interface PartnerManagerProps {
  initialPartners: Partnership[]
}

export function PartnerManager({ initialPartners }: PartnerManagerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formStatus, setFormStatus] = useState<{ error?: string; success?: string } | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [partnerName, setPartnerName] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [agreementFile, setAgreementFile] = useState<File | null>(null)
  const [agreementPreview, setAgreementPreview] = useState<string | null>(null)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const agreementInputRef = useRef<HTMLInputElement>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleAgreementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAgreementFile(file)
      setAgreementPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormStatus(null)

    if (!partnerName.trim()) {
      setFormStatus({ error: 'Please enter the partner company name.' })
      return
    }

    if (!logoFile) {
      setFormStatus({ error: 'Please select a company logo file.' })
      return
    }

    if (!agreementFile) {
      setFormStatus({ error: 'Please select an agreement document or photo.' })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.set('name', partnerName.trim())
      formData.set('logo', logoFile)
      formData.set('agreement', agreementFile)

      const res = await addPartnerAction(null, formData)
      if (res?.error) {
        setFormStatus({ error: res.error })
      } else if (res?.success) {
        setFormStatus({ success: res.message })
        // Reset form
        setPartnerName('')
        setLogoFile(null)
        setLogoPreview(null)
        setAgreementFile(null)
        setAgreementPreview(null)
        if (logoInputRef.current) logoInputRef.current.value = ''
        if (agreementInputRef.current) agreementInputRef.current.value = ''
      }
    } catch (err: any) {
      setFormStatus({ error: err.message || 'An unexpected error occurred while adding the partner.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (e: React.FormEvent<HTMLFormElement>, partner: Partnership) => {
    e.preventDefault()
    setDeleteError(null)

    const confirmed = window.confirm(
      `Are you sure you want to remove partner "${partner.name}"? This will delete all associated agreement and logo files.`
    )
    if (!confirmed) return

    setDeletingId(partner.id)

    try {
      const formData = new FormData()
      formData.set('id', partner.id)

      const res = await deletePartnerAction(null, formData)
      if (res?.error) {
        setDeleteError(res.error)
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete partner.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Add Partner Form */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Register New Strategic Partner
              </h2>
              <p className="text-xs text-slate-400">
                Upload commercial partnership details and verified agreement documentation.
              </p>
            </div>
          </div>
          <span className="text-[10px] text-orange-400 font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
            Staff & Super Admin Active
          </span>
        </div>

        {formStatus?.error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formStatus.error}</span>
          </div>
        )}

        {formStatus?.success && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{formStatus.success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Partner Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Partner Business / Corporate Name <span className="text-orange-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Building className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="e.g. Siemens Energy West Africa / Julius Berger Steel"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Logo File Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Partner Logo Image <span className="text-orange-500">*</span>
              </label>
              <div className="border-2 border-dashed border-slate-800 hover:border-orange-500/40 rounded-2xl p-4 bg-slate-950/50 text-center transition-colors">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="partner-logo-input"
                />
                <label
                  htmlFor="partner-logo-input"
                  className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  {logoPreview ? (
                    <div className="relative group">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-16 w-auto max-w-[160px] object-contain rounded-lg bg-white p-2 border border-slate-700"
                      />
                      <span className="text-[10px] text-orange-400 mt-1 block">Click to change</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                        <Upload className="w-5 h-5 text-orange-400" />
                      </div>
                      <span className="text-xs font-medium text-slate-300">
                        Upload Partner Logo
                      </span>
                      <span className="text-[10px] text-slate-500">
                        PNG, JPG, SVG or WEBP (Transparent recommended)
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Agreement Photo Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Agreement Document / Photo <span className="text-orange-500">*</span>
              </label>
              <div className="border-2 border-dashed border-slate-800 hover:border-orange-500/40 rounded-2xl p-4 bg-slate-950/50 text-center transition-colors">
                <input
                  ref={agreementInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAgreementChange}
                  className="hidden"
                  id="partner-agreement-input"
                />
                <label
                  htmlFor="partner-agreement-input"
                  className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  {agreementPreview ? (
                    <div className="relative group">
                      <img
                        src={agreementPreview}
                        alt="Agreement preview"
                        className="h-16 w-auto max-w-[160px] object-cover rounded-lg border border-slate-700 shadow-md"
                      />
                      <span className="text-[10px] text-orange-400 mt-1 block">Click to change</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                        <FileText className="w-5 h-5 text-orange-400" />
                      </div>
                      <span className="text-xs font-medium text-slate-300">
                        Upload Agreement Photo
                      </span>
                      <span className="text-[10px] text-slate-500">
                        High-res scanned image or signed document photo
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading Files & Registering Partner...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Publish Strategic Partner</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Delete Error Alert */}
      {deleteError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      {/* Existing Partners Grid */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4">
        <div className="p-4 sm:px-6 border-b border-slate-800/80 bg-slate-900/90 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Strategic Partners ({initialPartners.length})
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Direct Storage & DB Sync
          </span>
        </div>

        {initialPartners.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Handshake className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-xs">No strategic partners registered yet.</p>
          </div>
        ) : (
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {initialPartners.map((partner) => (
              <div
                key={partner.id}
                className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div className="space-y-4">
                  {/* Logo Container */}
                  <div className="w-full h-24 bg-white rounded-xl p-3 flex items-center justify-center border border-slate-800/80 overflow-hidden">
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-sm tracking-tight">
                      {partner.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Added on {new Date(partner.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <a
                    href={partner.agreement_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 font-medium transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Agreement</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>

                  {/* Delete Button */}
                  <form onSubmit={(e) => handleDelete(e, partner)}>
                    <button
                      type="submit"
                      disabled={deletingId === partner.id}
                      title={`Remove ${partner.name}`}
                      aria-label={`Remove ${partner.name}`}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {deletingId === partner.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}