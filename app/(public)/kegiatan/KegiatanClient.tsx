'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, ArrowRight, Search } from 'lucide-react'
import { CATEGORY_LABELS, STATUS_LABELS } from '@/lib/data'
import type { Activity, ActivityCategory, ActivityStatus } from '@/types'

function formatDate(dateStr: string, endDate?: string) {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
  const start = new Date(dateStr).toLocaleDateString('id-ID', opts)
  if (!endDate) return start
  const end = new Date(endDate).toLocaleDateString('id-ID', opts)
  return `${start} – ${end}`
}

const TAGLINES: Record<ActivityCategory, string[]> = {
  penelitian: [
    'Gagasan kuat.\nRiset berkualitas.',
    'Dari gagasan\nmenuju riset\nkompetitif.',
    'Inovasi dimulai\ndari pertanyaan\nyang tepat.',
    'Membangun ilmu\nyang berdampak.',
  ],
  pengabdian: [
    'Keluarga berdaya.\nKeuangan terencana.',
    'Evaluasi hari ini.\nDampak esok hari.',
    'Bersama masyarakat,\nmembangun\nsolusi nyata.',
    'Mengabdi dengan\nhati, berkarya\nuntuk bangsa.',
  ],
  seminar: [
    'Ilmu dibagi,\ndampak\ndilipatgandakan.',
    'Forum pemikiran,\nruang kolaborasi.',
    'Satu panggung,\nbanyak perspektif.',
    'Berbagi wawasan,\nmemperluas\ncakrawala.',
  ],
  workshop: [
    'Praktik hari ini,\nkeahlian\nseumur hidup.',
    'Belajar dengan\ntangan, berpikir\ndengan kepala.',
    'Dari teori\nmenuju aksi\nnyata.',
    'Skill baru,\npeluang baru.',
  ],
}

function getTagline(activity: Activity): string {
  const list = TAGLINES[activity.category]
  const hash = activity.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return list[hash % list.length]
}

const STATUS_DOT: Record<ActivityStatus, string> = {
  mendatang: 'bg-blue-400',
  berlangsung: 'bg-emerald-400',
  selesai: 'bg-slate-400',
}

const TABS: Array<{ value: ActivityCategory | 'semua'; label: string }> = [
  { value: 'semua', label: 'Semua kegiatan' },
  { value: 'penelitian', label: 'Penelitian' },
  { value: 'pengabdian', label: 'Pengabdian' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'workshop', label: 'Workshop' },
]

export default function KegiatanClient({
  activities,
  spotlight,
}: {
  activities: Activity[]
  spotlight: Activity | null
}) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<ActivityCategory | 'semua'>('semua')

  const filtered = activities.filter(a => {
    const matchCat = category === 'semua' || a.category === category
    const matchSearch = (a.title + ' ' + a.location).toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <>
      {/* Top bar */}
      <div className="bg-[#10165c] text-[#dce3fa] text-[11px] tracking-widest px-[5%] py-2 flex justify-between gap-4 uppercase">
        <span>Akademi Bisnis dan Keuangan Primaniyarta</span>
        <span className="hidden sm:block">Riset · Kolaborasi · Pengabdian</span>
      </div>

      {/* Hero */}
      <section className="bg-white border-b border-slate-200 px-[5%] py-10 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
        {/* Kiri */}
        <div>
          <p className="text-[11px] font-semibold tracking-[2px] text-slate-400 uppercase mb-4">Kegiatan &amp; Agenda PRPM</p>
          <h1 className="font-serif text-[clamp(32px,4.5vw,50px)] leading-[1.12] font-semibold tracking-tight text-[#152449] mb-5">
            Menumbuhkan ilmu.<br />
            <em className="not-italic text-[#173f8b]">Menghadirkan dampak.</em>
          </h1>
          <p className="text-slate-500 text-sm max-w-md leading-relaxed mb-7">
            Ruang kolaborasi dosen, mitra, dan masyarakat untuk mengembangkan riset serta pengabdian yang bermakna.
          </p>
          <button
            onClick={() => document.getElementById('u-activity')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#f5ce43] text-[#10165c] font-semibold rounded-lg text-sm hover:bg-[#e8c030] transition-colors"
          >
            Jelajahi kegiatan ↓
          </button>
        </div>

        {/* Kanan: spotlight card */}
        {spotlight && (
          <Link href={`/kegiatan/${spotlight.slug}`} className="group">
            <div className="bg-[#10165c] text-white rounded-xl p-7 min-h-[280px] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute w-[220px] h-[220px] -right-20 -top-8 border-[32px] border-white/10 rounded-full" />
              <div className="absolute right-7 top-[90px] w-4 h-[100px] bg-[#f5ce43] rotate-[40deg] opacity-30" />
              <div>
                <p className="text-[#f5ce43] text-[11px] font-semibold tracking-[2px] uppercase mb-4">
                  Sorotan · {CATEGORY_LABELS[spotlight.category]}
                </p>
                <h2 className="font-serif text-[26px] leading-[1.25] font-medium max-w-xs relative z-10">
                  {spotlight.title}
                </h2>
              </div>
              <div className="flex items-end justify-between border-t border-white/20 pt-4 mt-6">
                <div>
                  <p className="text-[#c6d2ea] text-xs">{formatDate(spotlight.date, spotlight.endDate)}</p>
                  <p className="text-[#c6d2ea] text-xs mt-1">{spotlight.location}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#f5ce43] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-4 h-4 text-[#10165c]" />
                </div>
              </div>
            </div>
          </Link>
        )}
      </section>

      {/* Activity list section */}
      <section id="u-activity" className="px-[5%] py-10 bg-slate-50">
        {/* Heading + search */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="font-serif text-[28px] font-semibold text-[#152449]">Jejak kegiatan PRPM</h2>
            <p className="text-slate-500 text-sm mt-1">Penelitian, pengabdian, dan pengembangan kapasitas.</p>
          </div>
          <div className="flex items-center gap-2.5 border border-slate-200 rounded-lg px-3.5 py-2.5 bg-white w-full sm:w-[260px]">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Cari kegiatan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-slate-200 mb-6 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setCategory(t.value as ActivityCategory | 'semua')}
              className={`pb-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                category === t.value
                  ? 'border-[#f5ce43] text-[#152449] font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-400 mb-5">{filtered.length} kegiatan ditampilkan</p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(activity => (
              <article key={activity.id} className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-md transition-shadow">
                {/* Cover */}
                <div className="h-[176px] bg-[#10165c] text-white p-5 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute -right-8 -bottom-16 w-[170px] h-[170px] border-[26px] border-white/10 rounded-full" />
                  <p className="text-[#f5ce43] text-[10px] font-semibold tracking-[1.5px] uppercase">PRPM Primaniyarta</p>
                  <strong className="font-serif text-[22px] leading-[1.15] font-medium max-w-[180px] z-10 whitespace-pre-line">
                    {getTagline(activity)}
                  </strong>
                </div>

                {/* Body */}
                <div className="p-5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 tracking-wide uppercase mb-3">
                    <span>{CATEGORY_LABELS[activity.category]}</span>
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[activity.status]}`} />
                      {STATUS_LABELS[activity.status]}
                    </span>
                  </div>

                  <h3 className="font-semibold text-[#152449] text-sm leading-snug mb-4 min-h-[60px]">
                    {activity.title}
                  </h3>

                  <div className="flex flex-col gap-1.5 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      {formatDate(activity.date, activity.endDate)}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="line-clamp-1">{activity.location}</span>
                    </span>
                  </div>

                  <Link
                    href={`/kegiatan/${activity.slug}`}
                    className="block w-full text-left text-sm font-semibold text-[#152449] border-t border-slate-100 pt-3.5 hover:text-[#10165c] transition-colors"
                  >
                    Lihat kegiatan ↗
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <p className="font-semibold text-slate-600">Tidak ada kegiatan ditemukan</p>
            <p className="text-sm mt-1">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-10 p-6 bg-white border-l-4 border-[#f5ce43] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <strong className="text-[#152449] text-base">Dukungan administrasi untuk dosen</strong>
            <p className="text-slate-500 text-xs mt-1">Ajukan surat dan pantau status pengajuan melalui layanan PRPM.</p>
          </div>
          <Link
            href="/surat"
            className="flex-shrink-0 px-5 py-2.5 bg-[#f5ce43] text-[#10165c] font-semibold rounded-lg text-sm hover:bg-[#e8c030] transition-colors"
          >
            Ajukan Surat →
          </Link>
        </div>
      </section>
    </>
  )
}
