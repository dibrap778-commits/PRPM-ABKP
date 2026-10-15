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

  // Cek dulu typenya — kalau foto, hapus dari storage juga
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: item } = await (admin as any)
    .from('activity_archives')
    .select('type, url, activity_id')
    .eq('id', id)
    .single()

  if (item?.type === 'photo') {
    // Ekstrak path dari URL: .../activity-photos/<activityId>/<filename>
    try {
      const url = new URL(item.url)
      const parts = url.pathname.split('/activity-photos/')
      if (parts[1]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (admin as any).storage.from('activity-photos').remove([parts[1]])
      }
    } catch {
      // storage delete non-fatal
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('activity_archives').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Gagal menghapus.' }, { status: 500 })
  return NextResponse.json({ success: true })
}
