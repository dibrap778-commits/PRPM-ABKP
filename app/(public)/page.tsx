import Link from 'next/link'
import { Calendar, MapPin, ArrowRight, FileText, Users, Award, ChevronRight, Bell } from 'lucide-react'
import { CATEGORY_LABELS, STATUS_LABELS } from '@/lib/data'
import { CategoryBadge, StatusBadge } from '@/components/ui/Badge'
import { getActivities, getActiveAnnouncement } from '@/lib/supabase/queries'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default async function HomePage() {
  const [allActivities, activeAnnouncement] = await Promise.all([
    getActivities(),
    getActiveAnnouncement(),
  ])

  const upcomingActivities = allActivities
    .filter(a => a.status !== 'selesai')
    .slice(0, 3)

  return (
    <>
      {/* Announcement Banner */}
      {activeAnnouncement && (
        <div className="bg-[#B8720A] text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-start gap-3 text-sm">
            <Bell className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              <span className="font-semibold">Pengumuman: </span>
              {activeAnnouncement.content}
            </p>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="bg-[#0C3461] text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center min-h-[440px]">
            {/* Kiri: teks */}
            <div className="py-16 sm:py-20 lg:pr-10">
              <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
                Portal Resmi PRPM
              </div>
              <h1 className="font-jakarta text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-balance mb-5">
                Penelitian &amp; Pengabdian yang{' '}
                <span className="text-[#E8A030]">Berdampak</span>
              </h1>
              <p className="text-white/65 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
                Pusat informasi kegiatan PRPM dan layanan administrasi surat resmi penelitian &amp; pengabdian masyarakat untuk sivitas akademika.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/surat"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#B8720A] hover:bg-[#A06008] text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Ajukan Permohonan Surat
                </Link>
                <Link
                  href="/kegiatan"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  Lihat Semua Kegiatan
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Kanan: foto kampus */}
            <div className="hidden lg:block relative h-full min-h-[440px]">
              {/* gradient fade ke kiri agar menyatu dengan background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0C3461] via-[#0C3461]/30 to-transparent z-10" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-kampus.png"
                alt="Kampus ABK Primaniyarta"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <div className="bg-[#081F3D]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-0 sm:divide-x sm:divide-white/10">
            {[
              { icon: Users, value: '24', label: 'Dosen Aktif Meneliti' },
              { icon: FileText, value: '70+', label: 'Surat Diterbitkan 2025' },
              { icon: Award, value: '6', label: 'Hibah Kompetitif Aktif' },
              { icon: MapPin, value: '2', label: 'Desa Binaan' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3 sm:px-6 first:pl-0">
                <div className="w-9 h-9 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-[#E8A030]" />
                </div>
                <div>
                  <div className="font-jakarta text-white font-bold text-lg leading-none">{value}</div>
                  <div className="text-white/45 text-xs mt-0.5">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Activities */}
      <section className="py-14 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[#B8720A] font-semibold text-xs uppercase tracking-widest mb-1">Agenda PRPM</p>
              <h2 className="font-jakarta text-2xl sm:text-3xl font-bold text-slate-900">Kegiatan Mendatang</h2>
            </div>
            <Link
              href="/kegiatan"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[#0C3461] hover:text-[#B8720A] transition-colors"
            >
              Lihat semua <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingActivities.map(activity => (
              <Link key={activity.id} href={`/kegiatan/${activity.slug}`} className="group">
                <article className="bg-white rounded-2xl border border-slate-200 p-5 h-full flex flex-col hover:border-[#0C3461]/30 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <CategoryBadge
                      category={activity.category}
                      label={CATEGORY_LABELS[activity.category]}
                    />
                    <StatusBadge
                      status={activity.status}
                      label={STATUS_LABELS[activity.status]}
                    />
                  </div>
                  <h3 className="font-jakarta font-bold text-slate-900 text-base leading-snug mb-3 flex-1 group-hover:text-[#0C3461] transition-colors">
                    {activity.title}
                  </h3>
                  <div className="flex flex-col gap-1.5 text-sm text-slate-500 mt-auto">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#B8720A] flex-shrink-0" />
                      {formatDate(activity.date)}
                    </div>
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#B8720A] flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{activity.location}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          <div className="mt-5 sm:hidden">
            <Link
              href="/kegiatan"
              className="flex items-center justify-center gap-1 w-full py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-[#0C3461] hover:text-[#0C3461] transition-colors"
            >
              Lihat semua kegiatan <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Letter Request CTA */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-[#0C3461] to-[#081F3D] rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-1">
              <h2 className="font-jakarta text-xl sm:text-2xl font-bold text-white mb-2">
                Butuh Surat Penelitian atau Pengabdian?
              </h2>
              <p className="text-white/60 text-sm sm:text-base leading-relaxed">
                Ajukan permohonan secara online — isi form atau upload file, dan surat siap dalam format PDF.
                Tidak perlu datang langsung ke kantor PRPM.
              </p>
              <div className="flex flex-wrap gap-3 mt-5">
                {[
                  'Surat Tugas Penelitian',
                  'Surat Tugas Pengabdian',
                  'Surat Keterangan',
                  'Rekomendasi',
                ].map(label => (
                  <span key={label} className="inline-flex items-center gap-1.5 text-xs text-white/60 bg-white/8 px-2.5 py-1 rounded-full">
                    <span className="w-1 h-1 rounded-full bg-[#E8A030]" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <Link
              href="/surat"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#B8720A] hover:bg-[#A06008] text-white font-semibold rounded-xl transition-colors text-sm flex-shrink-0"
            >
              Ajukan Sekarang
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
