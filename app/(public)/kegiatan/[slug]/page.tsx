import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Users, ArrowLeft, User, Tag, ExternalLink } from 'lucide-react'
import { ACTIVITIES, CATEGORY_LABELS, STATUS_LABELS } from '@/lib/data'
import { CategoryBadge, StatusBadge } from '@/components/ui/Badge'
import { getActivityBySlug, getActivities } from '@/lib/supabase/queries'
import type { Metadata } from 'next'

function formatDate(dateStr: string, endDate?: string) {
  const opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  const start = new Date(dateStr).toLocaleDateString('id-ID', opts)
  if (!endDate) return start
  const endOpts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
  const end = new Date(endDate).toLocaleDateString('id-ID', endOpts)
  return `${start} – ${end}`
}

export async function generateStaticParams() {
  // Use mock data for static generation at build time
  return ACTIVITIES.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const activity = await getActivityBySlug(slug)
  if (!activity) return {}
  return {
    title: activity.title,
    description: activity.description,
  }
}

export default async function ActivityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [activity, allActivities] = await Promise.all([
    getActivityBySlug(slug),
    getActivities(),
  ])

  if (!activity) notFound()

  const related = allActivities
    .filter(a => a.id !== activity.id && a.category === activity.category)
    .slice(0, 3)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <Link
        href="/kegiatan"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0C3461] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Kegiatan
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <CategoryBadge category={activity.category} label={CATEGORY_LABELS[activity.category]} />
            <StatusBadge status={activity.status} label={STATUS_LABELS[activity.status]} />
          </div>

          <h1 className="font-jakarta text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug mb-5 text-balance">
            {activity.title}
          </h1>

          <div className="prose prose-slate prose-sm max-w-none">
            <p className="text-slate-600 text-base leading-relaxed mb-4">{activity.description}</p>
            {activity.fullDescription && (
              <div className="text-slate-600 leading-relaxed whitespace-pre-line">
                {activity.fullDescription}
              </div>
            )}
          </div>

          {/* Tags */}
          {activity.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-6 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              {activity.tags.map(tag => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="font-jakarta font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">
              Detail Kegiatan
            </h2>
            <dl className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-[#B8720A] mt-0.5 flex-shrink-0" />
                <div>
                  <dt className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Waktu</dt>
                  <dd className="text-sm text-slate-700 font-medium">{formatDate(activity.date, activity.endDate)}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#B8720A] mt-0.5 flex-shrink-0" />
                <div>
                  <dt className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Lokasi</dt>
                  <dd className="text-sm text-slate-700 font-medium">{activity.location}</dd>
                </div>
              </div>
              {activity.speaker && (
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-[#B8720A] mt-0.5 flex-shrink-0" />
                  <div>
                    <dt className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Narasumber</dt>
                    <dd className="text-sm text-slate-700 font-medium">{activity.speaker}</dd>
                  </div>
                </div>
              )}
              {activity.maxParticipants && activity.maxParticipants > 0 && (
                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-[#B8720A] mt-0.5 flex-shrink-0" />
                  <div>
                    <dt className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Kapasitas</dt>
                    <dd className="text-sm text-slate-700 font-medium">{activity.maxParticipants} peserta</dd>
                  </div>
                </div>
              )}
            </dl>

            {activity.registrationUrl && activity.status !== 'selesai' && (
              <a
                href={activity.registrationUrl}
                className="mt-5 flex items-center justify-center gap-2 w-full py-3 bg-[#0C3461] hover:bg-[#081F3D] text-white font-semibold rounded-xl text-sm transition-colors"
              >
                Daftar Sekarang
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {activity.status === 'selesai' && (
              <div className="mt-5 py-2.5 text-center text-sm text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                Kegiatan sudah selesai
              </div>
            )}
          </div>

          {/* CTA Surat */}
          <div className="bg-[#FEF4DC] border border-[#B8720A]/20 rounded-2xl p-5">
            <h3 className="font-jakarta font-bold text-[#7A4A06] text-sm mb-2">Perlu Surat Tugas?</h3>
            <p className="text-[#7A4A06]/70 text-xs leading-relaxed mb-3">
              Ajukan permohonan surat tugas penelitian atau pengabdian secara online.
            </p>
            <Link
              href="/surat"
              className="block text-center py-2.5 bg-[#B8720A] hover:bg-[#A06008] text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Ajukan Surat
            </Link>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-200">
          <h2 className="font-jakarta text-lg font-bold text-slate-900 mb-5">
            Kegiatan Serupa
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map(a => (
              <Link key={a.id} href={`/kegiatan/${a.slug}`} className="group">
                <article className="bg-white border border-slate-200 rounded-xl p-4 hover:border-[#0C3461]/30 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={a.status} label={STATUS_LABELS[a.status]} />
                  </div>
                  <h3 className="font-jakarta font-semibold text-slate-800 text-sm leading-snug group-hover:text-[#0C3461] transition-colors">
                    {a.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                    <Calendar className="w-3 h-3" />
                    {new Date(a.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
