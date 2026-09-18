'use client'

import { useState, useRef } from 'react'
import { addJobAction } from '@/app/actions/jobs'
import {
  UploadCloud,
  PlusCircle,
  Loader2,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building,
  Tag,
  FileText,
} from 'lucide-react'

export function JobForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const clearSelectedPhoto = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setPreviewUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!selectedFile) {
      setErrorMessage('A portfolio image is strictly required.')
      return
    }

    setIsPending(true)

    try {
      const formData = new FormData(e.currentTarget)
      // Manually set the explicit File object from state into FormData
      formData.set('photo', selectedFile)

      const result = await addJobAction(null, formData)

      if (result?.error) {
        setErrorMessage(result.error)
        // User text inputs are deliberately preserved
      } else if (result?.success) {
        setSuccessMessage(result.message || 'Job published successfully!')
        formRef.current?.reset()
        setSelectedFile(null)
        setPreviewUrl(null)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while saving the job.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-7 shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-orange-500" />
            Log New Completed Job
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Add engineering achievements, high-res site photos, and technical specs to the live portfolio.
          </p>
        </div>
      </div>

      {/* Intercepted form using client onSubmit */}
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
        {/* Status Alerts */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Title */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Project Title <span className="text-orange-500">*</span>
            </label>
            <input
              name="title"
              type="text"
              required
              placeholder="e.g. 50kVA Hybrid Microgrid & Acoustic Security Enclosure"
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Engineering Category <span className="text-orange-500">*</span>
            </label>
            <select
              name="service_category"
              required
              defaultValue="Electro-Mechanical"
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all cursor-pointer"
            >
              <option value="Electro-Mechanical">Electro-Mechanical</option>
              <option value="Metal Fabrication">Metal Fabrication</option>
              <option value="Solar Power">Solar Power</option>
            </select>
          </div>

          {/* Client Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              Client Name / Facility
            </label>
            <input
              name="client_name"
              type="text"
              placeholder="e.g. TotalEnergies Terminal / Private Estate"
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Completion Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Completion Date
            </label>
            <input
              name="completion_date"
              type="date"
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Photo File Input with Visual Dropzone & Preview */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              Site Photo (Portfolio Image) <span className="text-orange-500">*</span>
            </label>

            {previewUrl ? (
              <div className="relative rounded-xl border border-slate-800 bg-slate-950/60 p-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-lg border border-slate-700 shrink-0"
                  />
                  <div className="text-xs text-slate-300 truncate max-w-[200px]">
                    {selectedFile?.name || 'Photo selected'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearSelectedPhoto}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2.5 w-full bg-slate-950/60 border border-dashed border-slate-800 hover:border-orange-500/50 rounded-xl py-2.5 px-4 cursor-pointer transition-colors group">
                <UploadCloud className="w-4 h-4 text-slate-500 group-hover:text-orange-400 transition-colors" />
                <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
                  Choose JPEG, PNG, or WebP <span className="text-orange-500 font-bold">*</span>
                </span>
                <input
                  ref={fileInputRef}
                  name="photo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Technical Scope & Solution Description <span className="text-orange-500">*</span>
            </label>
            <textarea
              name="description"
              required
              rows={3}
              placeholder="Outline the client's engineering challenge, Davelon Ent's fabrication methodology, and validated outcomes..."
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all resize-none"
            />
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="py-2.5 px-6 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-medium rounded-xl text-sm shadow-lg shadow-orange-600/20 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading & Publishing Job...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                Publish to Portfolio
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}