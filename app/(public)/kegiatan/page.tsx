import { getActivities } from '@/lib/supabase/queries'
import KegiatanClient from './KegiatanClient'

export default async function KegiatanPage() {
  const activities = await getActivities()

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

      <KegiatanClient activities={activities} />
    </>
  )
}
