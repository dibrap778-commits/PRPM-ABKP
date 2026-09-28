'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Search, Users } from 'lucide-react'
import { ACTIVITIES, CATEGORY_LABELS, STATUS_LABELS } from '@/lib/data'
import { CategoryBadge, StatusBadge } from '@/components/ui/Badge'
import type { ActivityCategory, ActivityStatus } from '@/types'

function formatDate(dateStr: string, endDate?: string) {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
  const start = new Date(dateStr).toLocaleDateString('id-ID', opts)
  if (!endDate) return start
  const end = new Date(endDate).toLocaleDateString('id-ID', opts)
  return `${start} – ${end}`
}

const FILTER_CATEGORIES: Array<{ value: ActivityCategory | 'semua'; label: string }> = [
  { value: 'semua', label: 'Semua' },
  { value: 'penelitian', label: 'Penelitian' },
  { value: 'pengabdian', label: 'Pengabdian' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'workshop', label: 'Workshop' },
]

const FILTER_STATUS: Array<{ value: ActivityStatus | 'semua'; label: string }> = [
  { value: 'semua', label: 'Semua Status' },
  { value: 'mendatang', label: 'Mendatang' },
  { value: 'berlangsung', label: 'Berlangsung' },
  { value: 'selesai', label: 'Selesai' },
]

export default function KegiatanPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<ActivityCategory | 'semua'>('semua')
  const [status, setStatus] = useState<ActivityStatus | 'semua'>('semua')

  const filtered = ACTIVITIES.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'semua' || a.category === category
    const matchStatus = status === 'semua' || a.status === status
    return matchSearch && matchCategory && matchStatus
  })

  return (
    <>
      {/* Page Header */}
      <div className="bg-[#0C3461] text-white py-10 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-[#E8A030] font-semibold text-xs uppercase tracking-widest mb-2">Agenda PRPM</p>
          <h1 className="font-jakarta text-2xl sm:text-3xl font-extrabold mb-3">Kegiatan &amp; Agenda</h1>
          <p className="text-white/60 text-sm max-w-xl">
            Pelatihan penelitian, program pengabdian masyarakat, seminar, dan workshop yang diselenggarakan PRPM.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-7">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari judul kegiatan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#0C3461] focus:ring-2 focus:ring-[#0C3461]/10"
            />
          </div>

          {/* Category filter */}
          <div className="flex gap-1.5 flex-wrap">
            {FILTER_CATEGORIES.map(f => (
              <button
                key={f.value}
                onClick={() => setCategory(f.value as ActivityCategory | 'semua')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${
                  category === f.value
                    ? 'bg-[#0C3461] text-white border-[#0C3461]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#0C3461]/40'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <select
            value={status}
            onChange={e => setStatus(e.target.value as ActivityStatus | 'semua')}
            className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:border-[#0C3461] focus:ring-2 focus:ring-[#0C3461]/10 cursor-pointer"
          >
            {FILTER_STATUS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Result count */}
        <p className="text-sm text-slate-500 mb-5">
          Menampilkan <span className="font-semibold text-slate-700">{filtered.length}</span> kegiatan
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(activity => (
              <Link key={activity.id} href={`/kegiatan/${activity.slug}`} className="group">
                <article className="bg-white rounded-2xl border border-slate-200 p-5 h-full flex flex-col hover:border-[#0C3461]/30 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <CategoryBadge category={activity.category} label={CATEGORY_LABELS[activity.category]} />
                    <StatusBadge status={activity.status} label={STATUS_LABELS[activity.status]} />
                  </div>

                  <h3 className="font-jakarta font-bold text-slate-900 text-base leading-snug mb-2 flex-1 group-hover:text-[#0C3461] transition-colors">
                    {activity.title}
                  </h3>

                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">
                    {activity.description}
                  </p>

                  <div className="flex flex-col gap-1.5 text-sm text-slate-500 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#B8720A] flex-shrink-0" />
                      {formatDate(activity.date, activity.endDate)}
                    </div>
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#B8720A] flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{activity.location}</span>
                    </div>
                    {activity.maxParticipants && activity.maxParticipants > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#B8720A] flex-shrink-0" />
                        Maks. {activity.maxParticipants} peserta
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-semibold text-slate-600">Tidak ada kegiatan ditemukan</p>
            <p className="text-sm mt-1">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        )}
      </div>
    </>
  )
}
