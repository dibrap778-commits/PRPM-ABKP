'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function DeleteKegiatanButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Hapus kegiatan "${title}"? Tindakan ini tidak bisa dibatalkan.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/kegiatan/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      } else {
        alert('Gagal menghapus kegiatan.')
      }
    } catch {
      alert('Terjadi kesalahan.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-slate-300 hover:text-red-400 transition-colors disabled:opacity-40"
      title="Hapus"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
