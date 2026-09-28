'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2 } from 'lucide-react'
import type { ActivityRow } from '@/lib/supabase/admin-queries'

type FormData = {
  title: string
  category: string
  status: string
  date: string
  endDate: string
  location: string
  description: string
  fullDescription: string
  speaker: string
  maxParticipants: string
  registrationUrl: string
  tags: string
}

const INITIAL: FormData = {
  title: '', category: 'penelitian', status: 'mendatang',
  date: '', endDate: '', location: '', description: '',
  fullDescription: '', speaker: '', maxParticipants: '',
  registrationUrl: '', tags: '',
}

function activityToForm(a: ActivityRow): FormData {
  return {
    title: a.title,
    category: a.category,
    status: a.status,
    date: a.date,
    endDate: a.end_date ?? '',
    location: a.location,
    description: a.description,
    fullDescription: a.full_description ?? '',
    speaker: a.speaker ?? '',
    maxParticipants: a.max_participants?.toString() ?? '',
    registrationUrl: a.registration_url ?? '',
    tags: a.tags?.join(', ') ?? '',
  }
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 focus:outline-none focus:border-[#0C3461] focus:ring-2 focus:ring-[#0C3461]/10 focus:bg-white transition-colors"

export default function KegiatanForm({ existing }: { existing?: ActivityRow }) {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(existing ? activityToForm(existing) : INITIAL)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.date || !form.location || !form.description) {
      setError('Isi semua field yang wajib.')
      return
    }
    setSaving(true)
    setError('')

    const url = existing ? `/api/admin/kegiatan/${existing.id}` : '/api/admin/kegiatan'
    const method = existing ? 'PATCH' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Terjadi kesalahan.')
        return
      }
      router.push('/admin/kegiatan')
      router.refresh()
    } catch {
      setError('Terjadi kesalahan.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-2xl">
      {/* Baris 1: Judul */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4">
        <h2 className="font-jakarta font-bold text-slate-700 text-sm border-b border-slate-100 pb-3">Informasi Utama</h2>

        <Field label="Judul Kegiatan" required>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="contoh: Pelatihan Metodologi Penelitian Kuantitatif"
            className={inputCls} required />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Kategori" required>
            <select value={form.category} onChange={e => set('category', e.target.value)} className={inputCls}>
              <option value="penelitian">Penelitian</option>
              <option value="pengabdian">Pengabdian</option>
              <option value="seminar">Seminar</option>
              <option value="workshop">Workshop</option>
            </select>
          </Field>
          <Field label="Status" required>
            <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}>
              <option value="mendatang">Mendatang</option>
              <option value="berlangsung">Berlangsung</option>
              <option value="selesai">Selesai</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Tanggal Mulai" required>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Tanggal Selesai">
            <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} className={inputCls} />
          </Field>
        </div>

        <Field label="Lokasi" required>
          <input type="text" value={form.location} onChange={e => set('location', e.target.value)}
            placeholder="contoh: Aula Gedung A Lt. 3, Kampus Utama"
            className={inputCls} required />
        </Field>
      </div>

      {/* Deskripsi */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4">
        <h2 className="font-jakarta font-bold text-slate-700 text-sm border-b border-slate-100 pb-3">Deskripsi</h2>

        <Field label="Deskripsi Singkat" required>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Deskripsi 1–2 kalimat untuk ditampilkan di daftar kegiatan"
            rows={3} className={`${inputCls} resize-none`} required />
        </Field>

        <Field label="Deskripsi Lengkap">
          <textarea value={form.fullDescription} onChange={e => set('fullDescription', e.target.value)}
            placeholder="Detail kegiatan, tujuan, materi, dll. (opsional)"
            rows={6} className={`${inputCls} resize-none`} />
        </Field>
      </div>

      {/* Detail Tambahan */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4">
        <h2 className="font-jakarta font-bold text-slate-700 text-sm border-b border-slate-100 pb-3">Detail Tambahan</h2>

        <Field label="Narasumber / Tim Pelaksana">
          <input type="text" value={form.speaker} onChange={e => set('speaker', e.target.value)}
            placeholder="contoh: Prof. Dr. Ahmad Fauzan, M.Si."
            className={inputCls} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Maks. Peserta">
            <input type="number" value={form.maxParticipants} onChange={e => set('maxParticipants', e.target.value)}
              placeholder="kosongkan jika tidak terbatas"
              className={inputCls} min={1} />
          </Field>
          <Field label="Link Pendaftaran">
            <input type="url" value={form.registrationUrl} onChange={e => set('registrationUrl', e.target.value)}
              placeholder="https://..."
              className={inputCls} />
          </Field>
        </div>

        <Field label="Tags">
          <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)}
            placeholder="pisahkan dengan koma: metodologi, kuantitatif, SPSS"
            className={inputCls} />
        </Field>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()}
          className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800 rounded-xl text-sm font-semibold transition-colors">
          Batal
        </button>
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#0C3461] hover:bg-[#081F3D] disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors">
          <Save className={`w-4 h-4 ${saving ? 'hidden' : ''}`} />
          <Loader2 className={`w-4 h-4 animate-spin ${saving ? '' : 'hidden'}`} />
          {saving ? 'Menyimpan...' : existing ? 'Simpan Perubahan' : 'Tambah Kegiatan'}
        </button>
      </div>
    </form>
  )
}
