'use client'

import { useState } from 'react'
import { Archive, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ArsipkanButton({ id, title }: { id: string; title: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleArsipkan() {
    if (!confirm(`Pindahkan "${title}" ke arsip?\nStatus akan berubah menjadi Selesai.`)) return
    setLoading(true)
    try {
      await fetch(`/api/admin/kegiatan/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'selesai' }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleArsipkan}
      disabled={loading}
      title="Pindahkan ke arsip"
      className="text-slate-400 hover:text-amber-600 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
    </button>
  )
}
