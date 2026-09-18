'use client'

import { useState, useRef } from 'react'
import { addCertificateAction } from '@/app/actions/certificates'
import {
  UploadCloud,
  Award,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  FileBadge,
} from 'lucide-react'

export function CertificateForm() {
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
      setErrorMessage('Please upload a certificate document image.')
      return
    }

    setIsPending(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.set('image', selectedFile)

      const result = await addCertificateAction(null, formData)

      if (result?.error) {
        setErrorMessage(result.error)
      } else if (result?.success) {
        setSuccessMessage(result.message || 'Certificate published successfully!')
        formRef.current?.reset()
        setSelectedFile(null)
        setPreviewUrl(null)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while uploading the certificate.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-7 shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-500" />
            Upload Certificate or License
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Add official accreditation, COREN license, or regulatory compliance certificates.
          </p>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
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
          {/* Certificate Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileBadge className="w-3.5 h-3.5 text-slate-400" />
              Certificate Title <span className="text-orange-500">*</span>
            </label>
            <input
              name="title"
              type="text"
              required
              placeholder="e.g. COREN Engineering Practice License"
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Image Upload Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5 text-slate-400" />
              Certificate Document Image <span className="text-orange-500">*</span>
            </label>

            {previewUrl ? (
              <div className="relative rounded-xl border border-slate-800 bg-slate-950/60 p-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={previewUrl}
                    alt="Certificate preview"
                    className="w-12 h-12 object-cover rounded-lg border border-slate-700 shrink-0"
                  />
                  <div className="text-xs text-slate-300 truncate max-w-[200px]">
                    {selectedFile?.name || 'File ready'}
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
                  Upload Scanned Document (PNG, JPG, WebP)
                </span>
                <input
                  ref={fileInputRef}
                  name="image"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="py-2.5 px-6 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-medium rounded-xl text-sm shadow-lg shadow-orange-600/20 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading Certificate...
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                Publish Certificate
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}