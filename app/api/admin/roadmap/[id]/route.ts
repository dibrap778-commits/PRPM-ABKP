import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const admin = await createAdminClient()

  // Ambil file_url dulu untuk hapus dari storage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: item } = await (admin as any)
    .from('roadmap_files')
    .select('file_url')
    .eq('id', id)
    .single()

  if (item?.file_url) {
    try {
      const url = new URL(item.file_url)
      const parts = url.pathname.split('/roadmap-files/')
      if (parts[1]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (admin as any).storage.from('roadmap-files').remove([decodeURIComponent(parts[1])])
      }
    } catch { /* non-fatal */ }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('roadmap_files').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Gagal menghapus.' }, { status: 500 })
  return NextResponse.json({ success: true })
}
