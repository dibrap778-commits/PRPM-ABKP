'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, CheckCircle, Clock, FileCheck, AlertCircle, Download } from 'lucide-react'
import { LETTER_TYPE_LABELS } from '@/lib/data'

const STATUS_CONFIG = {
  masuk: {
    icon: Clock,
    label: 'Permohonan Diterima',
    desc: 'Permohonan Anda telah diterima dan sedang menunggu antrian untuk diproses oleh admin LPPM.',
    color: 'text-sky-600 bg-sky-50 border-sky-200',
    iconColor: 'text-sky-500',
  },
  diproses: {
    icon: FileCheck,
    label: 'Sedang Diproses',
    desc: 'Admin LPPM sedang meninjau data Anda dan menyiapkan dokumen suratnya.',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    iconColor: 'text-amber-500',
  },
  selesai: {
    icon: CheckCircle,
    label: 'Surat Selesai',
    desc: 'Surat Anda sudah selesai dibuat. Silakan download PDF surat di bawah ini.',
    color: 'text-green-600 bg-green-50 border-green-200',
    iconColor: 'text-green-500',
  },
}

const PROGRESS_STEPS = [
  { key: 'masuk', label: 'Permohonan Masuk' },
  { key: 'diproses', label: 'Sedang Diproses' },
  { key: 'selesai', label: 'Surat Selesai' },
]

type SearchResult = {
  ticket_number: string
  letter_type: string
  status: 'masuk' | 'diproses' | 'selesai'
  applicant_name: string
  submitted_at: string
} | null

function StatusPageContent() {
  const searchParams = useSearchParams()
  const initialTicket = searchParams.get('tiket') || ''

  const [ticket, setTicket] = useState(initialTicket)
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SearchResult>(null)

  const handleSearch = async (t = ticket) => {
    const key = t.trim().toUpperCase()
    if (!key) return
    setLoading(true)
    setSearched(false)
    try {
      const res = await fetch(`/api/surat/status?tiket=${encodeURIComponent(key)}`)
      const data = await res.json()
      setResult(res.ok ? data : null)
    } catch {
      setResult(null)
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  // Auto-search if tiket param provided
  useEffect(() => {
    if (initialTicket) handleSearch(initialTicket)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const currentStepIdx = result ? PROGRESS_STEPS.findIndex(s => s.key === result.status) : -1

  return (
    <>
      {/* Search box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
        <h2 className="font-jakarta font-bold text-slate-800 text-base mb-1">Masukkan Nomor Tiket</h2>
        <p className="text-sm text-slate-500 mb-4">
          Nomor tiket diberikan saat Anda berhasil submit permohonan surat.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={ticket}
            onChange={e => setTicket(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
            placeholder="contoh: PRPM-2026-0042"
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0C3461] focus:ring-2 focus:ring-[#0C3461]/10 font-mono text-slate-800 placeholder-slate-400 uppercase"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0C3461] hover:bg-[#081F3D] disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors flex-shrink-0"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Mencari...' : 'Cek Status'}
          </button>
        </div>
      </div>

      {/* Result */}
      {searched && !result && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-semibold">Nomor tiket tidak ditemukan.</span> Periksa kembali nomor tiket Anda atau hubungi kantor LPPM jika perlu bantuan.
          </div>
        </div>
      )}

      {searched && result && (
        <div className="flex flex-col gap-5">
          {/* Status card */}
          {(() => {
            const cfg = STATUS_CONFIG[result.status]
            const Icon = cfg.icon
            return (
              <div className={`flex items-start gap-4 p-5 rounded-2xl border ${cfg.color}`}>
                <Icon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${cfg.iconColor}`} />
                <div>
                  <p className="font-jakarta font-bold text-base mb-1">{cfg.label}</p>
                  <p className="text-sm opacity-80">{cfg.desc}</p>
                </div>
              </div>
            )
          })()}

          {/* Progress */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h3 className="font-jakarta font-bold text-slate-800 text-sm mb-4">Progress Permohonan</h3>
            <div className="flex items-center gap-0">
              {PROGRESS_STEPS.map((s, i) => {
                const done = i <= currentStepIdx
                const active = i === currentStepIdx
                return (
                  <div key={s.key} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                        done ? 'bg-[#0C3461] border-[#0C3461]' : 'bg-white border-slate-200'
                      }`}>
                        {done
                          ? <CheckCircle className="w-4 h-4 text-white" />
                          : <span className="text-xs text-slate-400 font-semibold">{i + 1}</span>
                        }
                      </div>
                      <span className={`text-xs font-medium text-center leading-tight max-w-[80px] ${active ? 'text-[#0C3461] font-semibold' : done ? 'text-slate-600' : 'text-slate-400'}`}>
                        {s.label}
                      </span>
                    </div>
                    {i < PROGRESS_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mb-5 mx-1 ${i < currentStepIdx ? 'bg-[#0C3461]' : 'bg-slate-200'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Detail */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-jakarta font-bold text-slate-700 text-sm">Detail Permohonan</h3>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ['Nomor Tiket', result.ticket_number],
                  ['Nama Pemohon', result.applicant_name],
                  ['Jenis Surat', LETTER_TYPE_LABELS[result.letter_type] ?? result.letter_type],
                  ['Tanggal Diajukan', new Date(result.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-slate-100 last:border-none">
                    <td className="py-3 px-5 text-slate-500 font-medium w-40">{label}</td>
                    <td className="py-3 px-5 text-slate-800 font-semibold">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Download PDF */}
          {result.status === 'selesai' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-jakarta font-bold text-emerald-800 text-sm">Surat Siap Didownload</p>
                <p className="text-xs text-emerald-700 mt-0.5">Dokumen surat resmi dalam format PDF.</p>
              </div>
              <a
                href={`/api/surat/pdf?tiket=${encodeURIComponent(result.ticket_number)}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors flex-shrink-0"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            </div>
          )}

          {/* Contact note */}
          <p className="text-xs text-slate-400 text-center">
            Butuh bantuan? Hubungi PRPM di <span className="font-medium text-slate-600">abkprimaniyarta@gmail.com</span> atau{' '}
            <span className="font-medium text-slate-600">0811-4390-3993</span>
          </p>
        </div>
      )}

      {!searched && !loading && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500">
          Masukkan nomor tiket yang Anda terima setelah submit permohonan surat, lalu klik <span className="font-semibold">Cek Status</span>.
        </div>
      )}
    </>
  )
}

export default function StatusPage() {
  return (
    <>
      <div className="bg-[#0C3461] text-white py-10 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-[#E8A030] font-semibold text-xs uppercase tracking-widest mb-2">Layanan Surat PRPM</p>
          <h1 className="font-jakarta text-2xl sm:text-3xl font-extrabold mb-3">Cek Status Permohonan</h1>
          <p className="text-white/60 text-sm max-w-lg">
            Masukkan nomor tiket yang Anda terima setelah submit permohonan untuk melihat status terkini.
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
        <Suspense fallback={<div className="text-slate-400 text-sm">Memuat...</div>}>
          <StatusPageContent />
        </Suspense>
      </div>
    </>
  )
}
