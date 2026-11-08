import Link from 'next/link'
import { Calendar, MapPin, ChevronRight, Archive } from 'lucide-react'
import { getActivities } from '@/lib/supabase/queries'
import { CATEGORY_LABELS } from '@/lib/data'
import { CategoryBadge } from '@/components/ui/Badge'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Arsip Kegiatan — PRPM Primaniyarta',
  description: 'Dokumentasi dan arsip kegiatan PRPM yang telah selesai dilaksanakan.',
}

export default async function ArsipKegiatanPage() {
  const all = await getActivities()
  const arsip = all.filter(a => a.status === 'selesai')

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-[#B8720A] text-xs font-semibold uppercase tracking-widest mb-2">
          <Archive className="w-3.5 h-3.5" />
          Arsip PRPM
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#152449] mb-3">
          Arsip Kegiatan
        </h1>
        <p className="text-slate-500 text-base max-w-xl">
          Dokumentasi seluruh kegiatan penelitian dan pengabdian masyarakat yang telah selesai dilaksanakan oleh PRPM Primaniyarta.
        </p>
      </div>

      {arsip.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Archive className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Belum ada kegiatan yang diarsipkan.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-400 mb-6">{arsip.length} kegiatan tercatat</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {arsip.map(activity => {
              const d = new Date(activity.date)
              const year = d.getFullYear()
              const month = d.toLocaleDateString('id-ID', { month: 'long' })
              return (
                <Link key={activity.id} href={`/kegiatan/${activity.slug}`} className="group">
                  <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-full flex flex-col hover:shadow-md transition-all">
                    {/* Banner foto jika ada */}
                    {activity.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={activity.image} alt={activity.title} className="w-full h-36 object-cover" />
                    )}

                    {/* Header card */}
                    <div className="bg-[#0C3461] px-5 py-4">
                      <div className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-1">{month} {year}</div>
                      <div className="font-jakarta font-bold text-white text-sm leading-snug line-clamp-2">
                        {activity.title.split(' ').slice(0, 4).join(' ')}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="mb-3">
                        <CategoryBadge category={activity.category} label={CATEGORY_LABELS[activity.category]} />
                      </div>
                      <h3 className="font-jakarta font-bold text-[#152449] text-sm leading-snug mb-3 flex-1 group-hover:text-[#0C3461] transition-colors">
                        {activity.title}
                      </h3>
                      <div className="flex flex-col gap-1.5 text-xs text-slate-400 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          {d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{activity.location}</span>
                        </div>
                      </div>
                      <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-[#B8720A] transition-colors">
                        Lihat dokumentasi
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
