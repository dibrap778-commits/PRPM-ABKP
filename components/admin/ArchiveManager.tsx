'use client'

import { useState, useRef } from 'react'
import { ImageIcon, FileText, Trash2, Plus, Upload, Loader2, ExternalLink } from 'lucide-react'

interface ArchiveItem {
  id: string
  type: 'photo' | 'document'
  title: string
  url: string
}

interface Props {
  activityId: string
  initialItems: ArchiveItem[]
}

export default function ArchiveManager({ activityId, initialItems }: Props) {
  const [items, setItems] = useState<ArchiveItem[]>(initialItems)
  const [tab, setTab] = useState<'photo' | 'document'>('photo')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [docTitle, setDocTitle] = useState('')
  const [docUrl, setDocUrl] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const photos = items.filter(i => i.type === 'photo')
  const documents = items.filter(i => i.type === 'document')

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('activityId', activityId)
      form.append('title', file.name.replace(/\.[^.]+$/, ''))
      const res = await fetch('/api/admin/archives', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setItems(prev => [...prev, json.archive])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal upload foto.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleAddDoc(e: React.FormEvent) {
    e.preventDefault()
    if (!docTitle.trim() || !docUrl.trim()) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/archives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId, title: docTitle.trim(), url: docUrl.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setItems(prev => [...prev, json.archive])
      setDocTitle('')
      setDocUrl('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan dokumen.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus item ini?')) return
    try {
      const res = await fetch(`/api/admin/archives/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setItems(prev => prev.filter(i => i.id !== id))
    } catch {
      setError('Gagal menghapus.')
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6">
      <h2 className="font-jakarta font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">
        Arsip Kegiatan
      </h2>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-5 w-fit">
        {(['photo', 'document'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'photo' ? <ImageIcon className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
            {t === 'photo' ? `Foto (${photos.length})` : `Dokumen (${documents.length})`}
          </button>
        ))}
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
          {error}
        </div>
      )}

      {/* FOTO */}
      {tab === 'photo' && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {photos.map(photo => (
              <div key={photo.id} className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white p-1.5 rounded-lg"
                    title="Hapus foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Upload button */}
            <label className={`aspect-[4/3] flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 hover:border-[#0C3461] hover:bg-slate-50 transition-colors cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploading ? (
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              ) : (
                <>
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-xs text-slate-400 font-medium">Upload foto</span>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={uploading}
              />
            </label>
          </div>
          <p className="text-xs text-slate-400">Format: JPG, PNG, WEBP. Foto akan tersimpan di Supabase Storage.</p>
        </div>
      )}

      {/* DOKUMEN */}
      {tab === 'document' && (
        <div>
          <div className="flex flex-col gap-2 mb-4">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <FileText className="w-4 h-4 text-[#185FA5] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{doc.title}</p>
                  <p className="text-xs text-slate-400 truncate">{doc.url}</p>
                </div>
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0C3461] transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button onClick={() => handleDelete(doc.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {documents.length === 0 && (
              <p className="text-sm text-slate-400 py-2">Belum ada dokumen.</p>
            )}
          </div>

          <form onSubmit={handleAddDoc} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Tambah Dokumen</p>
            <div className="flex flex-col gap-2 mb-3">
              <input
                type="text"
                placeholder="Judul dokumen (contoh: Materi Presentasi)"
                value={docTitle}
                onChange={e => setDocTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C3461]/20 focus:border-[#0C3461] bg-white"
                required
              />
              <input
                type="url"
                placeholder="Link Google Drive (https://drive.google.com/...)"
                value={docUrl}
                onChange={e => setDocUrl(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C3461]/20 focus:border-[#0C3461] bg-white"
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving || !docTitle.trim() || !docUrl.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0C3461] hover:bg-[#081F3D] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Tambah
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
