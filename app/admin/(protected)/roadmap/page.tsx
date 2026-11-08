'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Trash2, Loader2, FileText, ExternalLink, Map } from 'lucide-react'

interface RoadmapFile {
  id: string
  title: string
  year: string
  file_url: string
  file_name: string
  file_size: number | null
  created_at: string
}

function formatSize(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AdminRoadmapPage() {
  const [files, setFiles] = useState<RoadmapFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const fileRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    fetch('/api/admin/roadmap')
      .then(r => r.json())
      .then(d => setFiles(d.files ?? []))
      .finally(() => setLoading(false))
  }, [])

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFile || !title.trim() || !year.trim()) return
    setUploading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', selectedFile)
      form.append('title', title.trim())
      form.append('year', year.trim())
      const res = await fetch('/api/admin/roadmap', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setFiles(prev => [json.file, ...prev])
      setTitle('')
      setSelectedFile(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal upload.')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string, fileName: string) {
    if (!confirm(`Hapus "${fileName}"?`)) return
    try {
      await fetch(`/api/admin/roadmap/${id}`, { method: 'DELETE' })
      setFiles(prev => prev.filter(f => f.id !== id))
    } catch {
      setError('Gagal menghapus file.')
    }
  }

  // Group by year
  const byYear = files.reduce<Record<string, RoadmapFile[]>>((acc, f) => {
    acc[f.year] = acc[f.year] ?? []
    acc[f.year].push(f)
    return acc
  }, {})
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="px-6 py-8 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Map className="w-5 h-5 text-[#B8720A]" />
          <h1 className="font-jakarta font-extrabold text-slate-800 text-2xl">Roadmap Penelitian</h1>
        </div>
        <p className="text-slate-500 text-sm">Upload dokumen roadmap penelitian PRPM (PDF, DOCX, PPT, dll.)</p>
      </div>

      {/* Form Upload */}
      <form onSubmit={handleUpload} className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
        <h2 className="font-jakarta font-bold text-slate-700 text-sm border-b border-slate-100 pb-3 mb-4">Upload Dokumen Baru</h2>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Judul Dokumen</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="contoh: Roadmap Penelitian PRPM 2024–2027"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-[#0C3461] focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tahun</label>
              <input
                type="text"
                value={year}
                onChange={e => setYear(e.target.value)}
                placeholder="2025"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-[#0C3461] focus:bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">File</label>
            <label className={`flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${selectedFile ? 'border-[#0C3461]/30 bg-blue-50/40' : 'border-slate-200 hover:border-[#0C3461]/30 hover:bg-slate-50'}`}>
              <FileText className={`w-5 h-5 flex-shrink-0 ${selectedFile ? 'text-[#0C3461]' : 'text-slate-400'}`} />
              <span className={`text-sm flex-1 truncate ${selectedFile ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                {selectedFile ? selectedFile.name : 'Klik untuk pilih file (PDF, DOCX, PPTX, dll.)'}
              </span>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                className="hidden"
                onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
                required
              />
            </label>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading || !selectedFile || !title.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0C3461] hover:bg-[#081F3D] text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Mengupload...' : 'Upload'}
            </button>
          </div>
        </div>
      </form>

      {/* Daftar File */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-jakarta font-bold text-slate-700 text-sm">Dokumen Tersimpan</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Memuat...
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">Belum ada dokumen. Upload di atas untuk mulai.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {years.map(y => (
              <div key={y}>
                <div className="px-5 py-2 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-widest">{y}</div>
                {byYear[y].map(f => (
                  <div key={f.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    <FileText className="w-4 h-4 text-[#B8720A] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{f.title}</p>
                      <p className="text-xs text-slate-400 truncate">{f.file_name}{f.file_size ? ` · ${formatSize(f.file_size)}` : ''}</p>
                    </div>
                    <a href={f.file_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0C3461] transition-colors" title="Buka file">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button onClick={() => handleDelete(f.id, f.file_name)} className="text-slate-300 hover:text-red-500 transition-colors" title="Hapus">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
