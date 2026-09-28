import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import KegiatanForm from '@/components/admin/KegiatanForm'

export const metadata = { title: 'Tambah Kegiatan' }

export default function TambahKegiatanPage() {
  return (
    <div className="px-6 py-8 lg:px-8">
      <Link href="/admin/kegiatan" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </Link>
      <div className="mb-6">
        <h1 className="font-jakarta font-extrabold text-slate-800 text-2xl">Tambah Kegiatan Baru</h1>
        <p className="text-slate-500 text-sm mt-1">Kegiatan yang ditambahkan akan langsung tampil di halaman publik.</p>
      </div>
      <KegiatanForm />
    </div>
  )
}
