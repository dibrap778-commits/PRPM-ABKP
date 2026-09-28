'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Filter } from 'lucide-react'
import { LETTER_TYPE_LABELS } from '@/lib/data'
import type { LetterRequestRow } from '@/lib/supabase/admin-queries'

const STATUS_CHIP: Record<string, { label: string; cls: string }> = {
  masuk:    { label: 'Masuk',    cls: 'bg-sky-50 text-sky-700 border border-sky-200' },
  diproses: { label: 'Diproses', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  selesai:  { label: 'Selesai',  cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
}

const STATUS_FILTERS = [
  { value: 'semua', label: 'Semua' },
  { value: 'masuk', label: 'Masuk' },
  { value: 'diproses', label: 'Diproses' },
  { value: 'selesai', label: 'Selesai' },
]

export default function AdminSuratPage() {
  const [requests, setRequests] = useState<LetterRequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('semua')
  const [search, setSearch] = useState('')

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'semua') params.set('status', statusFilter)
      const res = await fetch(`/api/admin/surat?${params}`)
      const data = await res.json()
      setRequests(data.requests ?? [])
    } catch {
      setRequests([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  const filtered = requests.filter(r =>
    !search || r.applicant_name.toLowerCase().includes(search.toLowerCase()) ||
    r.ticket_number.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="px-6 py-8 lg:px-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-jakarta font-extrabold text-slate-800 text-2xl">Permohonan Surat</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola semua permohonan surat dari dosen.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau tiket..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0C3461] focus:ring-2 focus:ring-[#0C3461]/10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === f.value
                    ? 'bg-[#0C3461] text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="px-6 py-16 text-center text-slate-400 text-sm">Memuat data...</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-slate-400 text-sm">Tidak ada permohonan ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tiket</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Nama Pemohon</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Jenis Surat</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Tanggal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(req => {
                  const chip = STATUS_CHIP[req.status] ?? STATUS_CHIP.masuk
                  return (
                    <tr key={req.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5">
                        <span className="font-mono text-xs text-slate-500">{req.ticket_number}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="font-medium text-slate-800">{req.applicant_name}</p>
                          <p className="text-xs text-slate-400">{req.nidn_nip}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell text-slate-500">
                        {LETTER_TYPE_LABELS[req.letter_type] ?? req.letter_type}
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell text-slate-500">
                        {new Date(req.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${chip.cls}`}>
                          {chip.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link href={`/admin/surat/${req.id}`} className="text-xs font-semibold text-[#0C3461] hover:text-[#B8720A] transition-colors whitespace-nowrap">
                          Detail →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
