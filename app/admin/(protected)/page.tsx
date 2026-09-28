import Link from 'next/link'
import { getLetterRequests, getLetterStats } from '@/lib/supabase/admin-queries'
import { LETTER_TYPE_LABELS } from '@/lib/data'
import { FileText, Clock, Loader2, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react'

const STATUS_CHIP: Record<string, { label: string; cls: string }> = {
  masuk:    { label: 'Masuk',    cls: 'bg-sky-50 text-sky-700 border border-sky-200' },
  diproses: { label: 'Diproses', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  selesai:  { label: 'Selesai',  cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
}

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const [stats, requests] = await Promise.all([
    getLetterStats().catch(() => ({ total: 0, masuk: 0, diproses: 0, selesai: 0 })),
    getLetterRequests().catch(() => []),
  ])

  const recent = requests.slice(0, 10)

  return (
    <div className="px-6 py-8 lg:px-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-jakarta font-extrabold text-slate-800 text-2xl">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Ringkasan permohonan surat masuk.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Permohonan', value: stats.total, icon: FileText, color: 'text-slate-600', bg: 'bg-slate-100' },
          { label: 'Menunggu Proses',  value: stats.masuk,    icon: Clock,    color: 'text-sky-600',   bg: 'bg-sky-50' },
          { label: 'Sedang Diproses',  value: stats.diproses, icon: Loader2,  color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Selesai',          value: stats.selesai,  icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-4.5 h-4.5 ${s.color}`} strokeWidth={2} />
              </div>
              <p className="font-jakarta font-extrabold text-slate-800 text-2xl tabular-nums">{s.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <h2 className="font-jakarta font-bold text-slate-700 text-sm">Permohonan Terbaru</h2>
          </div>
          <Link href="/admin/surat" className="flex items-center gap-1 text-xs font-semibold text-[#0C3461] hover:text-[#B8720A] transition-colors">
            Lihat semua <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400 text-sm">
            Belum ada permohonan surat masuk.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tiket</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Nama</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Jenis Surat</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Tanggal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {recent.map(req => {
                  const chip = STATUS_CHIP[req.status] ?? STATUS_CHIP.masuk
                  return (
                    <tr key={req.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5">
                        <span className="font-mono text-xs text-slate-500">{req.ticket_number}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-slate-800">{req.applicant_name}</span>
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
                        <Link href={`/admin/surat/${req.id}`} className="text-xs font-semibold text-[#0C3461] hover:text-[#B8720A] transition-colors">
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
