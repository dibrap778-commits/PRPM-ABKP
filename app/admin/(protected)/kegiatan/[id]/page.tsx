import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import KegiatanForm from '@/components/admin/KegiatanForm'
import { getAdminActivityById } from '@/lib/supabase/admin-queries'

export const metadata = { title: 'Edit Kegiatan' }

export default async function EditKegiatanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const activity = await getAdminActivityById(id)
  if (!activity) notFound()

  return (
    <div className="px-6 py-8 lg:px-8">
      <Link href="/admin/kegiatan" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </Link>
      <div className="mb-6">
        <h1 className="font-jakarta font-extrabold text-slate-800 text-2xl">Edit Kegiatan</h1>
        <p className="text-slate-500 text-sm mt-1 line-clamp-1">{activity.title}</p>
      </div>
      <KegiatanForm existing={activity} />
    </div>
  )
}
