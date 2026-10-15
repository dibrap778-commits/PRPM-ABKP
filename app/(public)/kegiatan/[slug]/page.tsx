import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Users, ArrowLeft, User, Tag, ExternalLink, Image as ImageIcon, FileText } from 'lucide-react'
import { ACTIVITIES, CATEGORY_LABELS, STATUS_LABELS } from '@/lib/data'
import { CategoryBadge, StatusBadge } from '@/components/ui/Badge'
import { getActivityBySlug, getActivities, getActivityArchives } from '@/lib/supabase/queries'
import type { ArchiveItem } from '@/types'
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

  const archives = await getActivityArchives(activity.id)
  const photos = archives.filter(a => a.type === 'photo')
  const documents = archives.filter(a => a.type === 'document')

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

      {/* Banner foto (opsional) */}
      {activity.image && (
        <div className="mb-8 rounded-2xl overflow-hidden border border-slate-200 max-h-72">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activity.image}
            alt={activity.title}
            className="w-full h-72 object-cover"
          />
        </div>
      )}

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

      {/* Arsip */}
      {archives.length > 0 && (
        <div className="mt-10 pt-8 border-t border-slate-200">
          <p className="text-[#B8720A] font-semibold text-xs uppercase tracking-widest mb-1">Arsip kegiatan</p>
          <h2 className="font-serif text-xl font-semibold text-[#152449] mb-6">Dokumentasi &amp; Materi</h2>

          {/* Foto */}
          {photos.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="w-4 h-4 text-[#B8720A]" />
                <span className="text-sm font-semibold text-slate-700">Foto Kegiatan</span>
                <span className="text-xs text-slate-400 ml-auto">{photos.length} foto</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {photos.map(photo => (
                  <a
                    key={photo.id}
                    href={photo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group aspect-[4/3] block rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[#0C3461]/0 group-hover:bg-[#0C3461]/30 transition-colors flex items-center justify-center">
                      <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Dokumen */}
          {documents.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-[#B8720A]" />
                <span className="text-sm font-semibold text-slate-700">Dokumen &amp; Materi</span>
              </div>
              <div className="flex flex-col gap-2">
                {documents.map(doc => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-xl hover:border-[#0C3461]/40 hover:shadow-sm transition-all"
                  >
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[#185FA5]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M19 2H8.941C7.314 2 6 3.314 6 4.941V6H4a2 2 0 00-2 2v11a2 2 0 002 2h2v.059C6 22.686 7.314 24 8.941 24H20a2 2 0 002-2V5a2 2 0 00-2-2h-1V2zM8 4.941C8 4.421 8.421 4 8.941 4H18v2H8V4.941zM4 8h14v12H4V8zm16 12V8h2v14H8.941C8.421 22 8 21.579 8 21.059V20h12z"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-[#0C3461] transition-colors truncate">{doc.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Google Drive</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-[#0C3461] transition-colors flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
