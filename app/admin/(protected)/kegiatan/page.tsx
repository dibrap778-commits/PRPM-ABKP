import Link from 'next/link'
import { getAdminActivities } from '@/lib/supabase/admin-queries'
import { Plus, Pencil, CalendarDays } from 'lucide-react'
import DeleteKegiatanButton from '@/components/admin/DeleteKegiatanButton'

export const dynamic = 'force-dynamic'

const CATEGORY_LABELS: Record<string, string> = {
  penelitian: 'Penelitian', pengabdian: 'Pengabdian', seminar: 'Seminar', workshop: 'Workshop',
}
const STATUS_CHIP: Record<string, string> = {
  mendatang: 'bg-sky-50 text-sky-700 border-sky-200',
  berlangsung: 'bg-amber-50 text-amber-700 border-amber-200',
  selesai: 'bg-slate-100 text-slate-500 border-slate-200',
}

export default async function AdminKegiatanPage() {
  const activities = await getAdminActivities().catch(() => [])

  return (
    <div className="px-6 py-8 lg:px-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-jakarta font-extrabold text-slate-800 text-2xl">Kelola Kegiatan</h1>
          <p className="text-slate-500 text-sm mt-1">Tambah, edit, atau hapus kegiatan LPPM yang tampil di halaman publik.</p>
        </div>
        <Link
          href="/admin/kegiatan/baru"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0C3461] hover:bg-[#081F3D] text-white font-semibold text-sm rounded-xl transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Tambah Kegiatan
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
            <CalendarDays className="w-8 h-8 opacity-40" />
            <p className="text-sm">Belum ada kegiatan. Klik &quot;Tambah Kegiatan&quot; untuk mulai.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Judul</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Kategori</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Tanggal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {activities.map(a => (
                  <tr key={a.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <p className="font-medium text-slate-800 line-clamp-1">{a.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{a.location}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell text-slate-500">
                      {CATEGORY_LABELS[a.category] ?? a.category}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell text-slate-500">
                      {new Date(a.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_CHIP[a.status] ?? STATUS_CHIP.mendatang}`}>
                        {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3 justify-end">
                        <Link href={`/admin/kegiatan/${a.id}`} className="text-slate-400 hover:text-[#0C3461] transition-colors" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <DeleteKegiatanButton id={a.id} title={a.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
