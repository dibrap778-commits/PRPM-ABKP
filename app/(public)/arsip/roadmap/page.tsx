import { Map, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Roadmap Penelitian — PRPM Primaniyarta',
  description: 'Rencana dan arah strategis penelitian PRPM Primaniyarta.',
}

const ROADMAP = [
  {
    year: '2024',
    status: 'done' as const,
    theme: 'Penguatan Kapasitas Riset',
    items: [
      'Pemetaan kompetensi dosen dalam penelitian kuantitatif & kualitatif',
      'Pelatihan metodologi penelitian bagi dosen baru',
      'Pembentukan kluster riset per bidang studi',
    ],
  },
  {
    year: '2025',
    status: 'active' as const,
    theme: 'Kolaborasi & Pengabdian Berbasis Riset',
    items: [
      'Program pengabdian masyarakat berbasis hasil penelitian dosen',
      'Kerjasama dengan desa binaan: pendampingan ekonomi & pendidikan',
      'Penguatan sistem administrasi surat & dokumentasi PRPM',
      'Pengajuan hibah penelitian internal & eksternal',
    ],
  },
  {
    year: '2026',
    status: 'upcoming' as const,
    theme: 'Publikasi & Dampak Ilmiah',
    items: [
      'Target 10+ publikasi jurnal nasional terakreditasi',
      'Seminar nasional hasil penelitian dosen',
      'Portal repositori penelitian PRPM online',
      'Evaluasi dampak program pengabdian masyarakat',
    ],
  },
  {
    year: '2027',
    status: 'upcoming' as const,
    theme: 'Internasionalisasi Riset',
    items: [
      'Kolaborasi riset dengan institusi luar negeri',
      'Publikasi jurnal internasional bereputasi',
      'Program beasiswa penelitian bagi dosen berprestasi',
    ],
  },
]

const STATUS_CONFIG = {
  done: { label: 'Selesai', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', line: 'bg-emerald-200' },
  active: { label: 'Berjalan', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-[#B8720A] ring-4 ring-amber-100', line: 'bg-slate-200' },
  upcoming: { label: 'Mendatang', bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-300', line: 'bg-slate-200' },
}

export default function RoadmapPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-2 text-[#B8720A] text-xs font-semibold uppercase tracking-widest mb-2">
          <Map className="w-3.5 h-3.5" />
          Arsip PRPM
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#152449] mb-3">
          Roadmap Penelitian PRPM
        </h1>
        <p className="text-slate-500 text-base max-w-xl">
          Arah dan rencana strategis Pusat Riset &amp; Pengabdian Masyarakat Primaniyarta dalam pengembangan penelitian dan pengabdian kepada masyarakat.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {ROADMAP.map((phase, idx) => {
          const cfg = STATUS_CONFIG[phase.status]
          const isLast = idx === ROADMAP.length - 1
          return (
            <div key={phase.year} className="relative flex gap-6 pb-10">
              {/* Line + dot */}
              <div className="flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-1 ${cfg.dot}`} />
                {!isLast && <div className={`w-0.5 flex-1 mt-2 ${cfg.line}`} />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-2">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-jakarta font-extrabold text-[#152449] text-xl">{phase.year}</span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                    {cfg.label}
                  </span>
                </div>
                <h2 className="font-jakarta font-bold text-[#0C3461] text-base mb-3">{phase.theme}</h2>
                <ul className="flex flex-col gap-2">
                  {phase.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <ChevronRight className="w-3.5 h-3.5 text-[#B8720A] flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>

      {/* Note */}
      <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
        Roadmap ini bersifat dinamis dan dapat diperbarui sesuai perkembangan institusi dan kebutuhan sivitas akademika.
      </div>
    </div>
  )
}
