'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Download, RefreshCw, CheckCircle, Clock, Loader2,
  User, FileText, Calendar, MapPin, DollarSign, Users, StickyNote, Eye
} from 'lucide-react'
import { LETTER_TYPE_LABELS } from '@/lib/data'
import type { LetterRequestRow } from '@/lib/supabase/admin-queries'

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  masuk:    { label: 'Masuk',    cls: 'bg-sky-50 text-sky-700 border-sky-200',     icon: Clock },
  diproses: { label: 'Diproses', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: Loader2 },
  selesai:  { label: 'Selesai',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
}

function Field({ label, value, icon: Icon }: { label: string; value: string | null | undefined; icon?: React.ElementType }) {
  if (!value) return null
  return (
    <div className="flex gap-3 py-3 border-b border-slate-100 last:border-none">
      {Icon && <Icon className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />}
      <div className={Icon ? '' : 'pl-7'}>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm text-slate-800">{value}</p>
      </div>
    </div>
  )
}

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function AdminSuratDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [req, setReq] = useState<LetterRequestRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [updateMsg, setUpdateMsg] = useState('')

  const fetchRequest = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/surat/${id}`)
      const data = await res.json()
      setReq(data.request ?? null)
      setNewStatus(data.request?.status ?? 'masuk')
    } catch {
      setReq(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchRequest() }, [fetchRequest])

  async function handleUpdateStatus() {
    if (!req || newStatus === req.status) return
    setUpdating(true)
    setUpdateMsg('')
    try {
      const res = await fetch(`/api/admin/surat/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setReq(prev => prev ? { ...prev, status: newStatus as LetterRequestRow['status'] } : null)
        setUpdateMsg('Status berhasil diupdate.')
      } else {
        setUpdateMsg('Gagal mengupdate status.')
      }
    } catch {
      setUpdateMsg('Terjadi kesalahan.')
    } finally {
      setUpdating(false)
    }
  }

  function handleDownloadPDF() {
    window.open(`/api/admin/pdf/${id}`, '_blank')
  }

  if (loading) {
    return (
      <div className="px-6 py-8 text-slate-400 text-sm">Memuat data...</div>
    )
  }

  if (!req) {
    return (
      <div className="px-6 py-8">
        <p className="text-slate-500 text-sm mb-4">Permohonan tidak ditemukan.</p>
        <Link href="/admin/surat" className="text-sm font-semibold text-[#0C3461] hover:text-[#B8720A]">← Kembali</Link>
      </div>
    )
  }

  const chip = STATUS_CONFIG[req.status]
  const ChipIcon = chip.icon

  return (
    <div className="px-6 py-8 lg:px-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-4 mb-7">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mt-0.5"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <p className="font-mono text-xs text-slate-400 mb-1">{req.ticket_number}</p>
          <h1 className="font-jakarta font-extrabold text-slate-800 text-xl">
            {LETTER_TYPE_LABELS[req.letter_type] ?? req.letter_type}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Diajukan {formatDate(req.submitted_at)}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${chip.cls} self-start`}>
          <ChipIcon className="w-3.5 h-3.5" />
          {chip.label}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Detail */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Pemohon */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-jakarta font-bold text-slate-700 text-sm mb-3">Data Pemohon</h2>
            <Field label="Nama" value={req.applicant_name} icon={User} />
            <Field label="NIDN/NIP" value={req.nidn_nip} icon={FileText} />
            {req.additional_members && req.additional_members.length > 0 && (
              <Field label="Anggota Tim" value={req.additional_members.join(', ')} icon={Users} />
            )}
          </div>

          {/* Detail Penelitian/Pengabdian */}
          {(req.title || req.start_date || req.end_date || req.partner_location || req.funding_source) && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="font-jakarta font-bold text-slate-700 text-sm mb-3">Detail Kegiatan</h2>
              <Field label="Judul" value={req.title} icon={FileText} />
              <Field label="Tanggal Mulai" value={formatDate(req.start_date)} icon={Calendar} />
              <Field label="Tanggal Selesai" value={formatDate(req.end_date)} icon={Calendar} />
              <Field label="Lokasi Mitra" value={req.partner_location} icon={MapPin} />
              <Field label="Sumber Dana" value={req.funding_source} icon={DollarSign} />
              {req.research_status && (
                <Field label="Status Penelitian" value={req.research_status === 'selesai' ? 'Sudah Selesai' : 'Sedang Berjalan'} />
              )}
              <Field label="Pembimbing" value={req.supervisor_name} icon={User} />
            </div>
          )}

          {/* Surat Rekomendasi */}
          {(req.purpose || req.target_institution) && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="font-jakarta font-bold text-slate-700 text-sm mb-3">Detail Rekomendasi</h2>
              <Field label="Ditujukan Kepada" value={req.target_institution} icon={MapPin} />
              <Field label="Keperluan" value={req.purpose} icon={StickyNote} />
            </div>
          )}

          {req.notes && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="font-jakarta font-bold text-slate-700 text-sm mb-3">Catatan Tambahan</h2>
              <p className="text-sm text-slate-600">{req.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar Aksi */}
        <div className="flex flex-col gap-4">
          {/* Update Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-jakarta font-bold text-slate-700 text-sm mb-3">Update Status</h2>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-800 focus:outline-none focus:border-[#0C3461] focus:ring-2 focus:ring-[#0C3461]/10 mb-3"
            >
              <option value="masuk">Masuk</option>
              <option value="diproses">Sedang Diproses</option>
              <option value="selesai">Selesai</option>
            </select>
            <button
              onClick={handleUpdateStatus}
              disabled={updating || newStatus === req.status}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0C3461] hover:bg-[#081F3D] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`} />
              {updating ? 'Menyimpan...' : 'Simpan Status'}
            </button>
            {updateMsg && (
              <p className={`text-xs mt-2 text-center ${updateMsg.includes('berhasil') ? 'text-emerald-600' : 'text-red-500'}`}>
                {updateMsg}
              </p>
            )}
          </div>

          {/* Preview & Generate Surat */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-jakarta font-bold text-slate-700 text-sm mb-1">Buat Surat</h2>
            <p className="text-xs text-slate-400 mb-3">Preview surat dalam format Word, lalu kirim ke dosen setelah diverifikasi.</p>
            <Link
              href={`/admin/surat/${id}/preview`}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0C3461] hover:bg-[#081F3D] text-white font-semibold text-sm rounded-xl transition-colors mb-2"
            >
              <Eye className="w-4 h-4" />
              Preview &amp; Buat Surat
            </Link>
            <button
              onClick={handleDownloadPDF}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF Langsung
            </button>
          </div>

          {/* Input method */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 px-5 py-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Metode Input</p>
            <p className="text-sm text-slate-700 font-medium capitalize">{req.input_method === 'upload' ? 'Upload File' : 'Isi Formulir'}</p>
            {req.uploaded_file_path && (
              <a href={req.uploaded_file_path} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0C3461] hover:underline mt-1 block">
                Lihat file upload →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
