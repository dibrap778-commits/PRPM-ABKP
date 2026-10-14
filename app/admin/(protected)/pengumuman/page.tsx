'use client'

import { useEffect, useState } from 'react'
import { Bell, Plus, Pencil, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  content: string
  is_active: boolean
  created_at: string
}

export default function PengumumanPage() {
  const [list, setList] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [form, setForm] = useState({ title: '', content: '', isActive: false })

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/pengumuman')
    const json = await res.json()
    setList(json.announcements ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null)
    setForm({ title: '', content: '', isActive: false })
    setShowForm(true)
  }

  function openEdit(a: Announcement) {
    setEditing(a)
    setForm({ title: a.title, content: a.content, isActive: a.is_active })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) return
    setSaving(true)
    try {
      if (editing) {
        await fetch(`/api/admin/pengumuman/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      } else {
        await fetch('/api/admin/pengumuman', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      }
      setShowForm(false)
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(a: Announcement) {
    await fetch(`/api/admin/pengumuman/${a.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: a.title, content: a.content, isActive: !a.is_active }),
    })
    await load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus pengumuman ini?')) return
    setDeleting(id)
    await fetch(`/api/admin/pengumuman/${id}`, { method: 'DELETE' })
    await load()
    setDeleting(null)
  }

  return (
    <div className="px-6 py-8 lg:px-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-jakarta font-extrabold text-slate-800 text-2xl">Pengumuman</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola banner pengumuman yang tampil di halaman publik.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0C3461] text-white text-sm font-semibold rounded-xl hover:bg-[#0a2d55] transition-colors"
        >
          <Plus className="w-4 h-4" /> Buat Baru
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="font-jakarta font-bold text-slate-800 text-base mb-4">
            {editing ? 'Edit Pengumuman' : 'Pengumuman Baru'}
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Judul</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Judul pengumuman (opsional, hanya untuk referensi admin)"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0C3461] focus:ring-2 focus:ring-[#0C3461]/10"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Isi Pengumuman</label>
              <textarea
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Teks pengumuman yang akan tampil di banner website..."
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0C3461] focus:ring-2 focus:ring-[#0C3461]/10 resize-none"
              />
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                className="w-4 h-4 rounded accent-[#0C3461]"
              />
              <span className="text-sm font-medium text-slate-700">Tampilkan sekarang di website</span>
              <span className="text-xs text-slate-400">(hanya 1 yang bisa aktif)</span>
            </label>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSave}
              disabled={saving || !form.content.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0C3461] text-white text-sm font-semibold rounded-xl hover:bg-[#0a2d55] disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 border border-slate-200 text-sm font-semibold text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 py-10 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" /> Memuat...
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-slate-600">Belum ada pengumuman</p>
          <p className="text-sm mt-1">Klik "Buat Baru" untuk menambahkan pengumuman.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map(a => (
            <div
              key={a.id}
              className={`bg-white rounded-2xl border p-5 flex gap-4 items-start transition-all ${
                a.is_active ? 'border-[#B8720A]/40 bg-amber-50/30' : 'border-slate-200'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {a.is_active ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      <XCircle className="w-3 h-3" /> Tidak aktif
                    </span>
                  )}
                  {a.title && <span className="text-xs text-slate-400">{a.title}</span>}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{a.content}</p>
                <p className="text-[11px] text-slate-400 mt-2">
                  {new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleToggleActive(a)}
                  title={a.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  className={`p-2 rounded-lg text-sm transition-colors ${
                    a.is_active
                      ? 'text-amber-600 hover:bg-amber-100'
                      : 'text-slate-400 hover:bg-slate-100 hover:text-emerald-600'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEdit(a)}
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  disabled={deleting === a.id}
                  className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  {deleting === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
