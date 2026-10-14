import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const body = await req.json()
    const admin = await createAdminClient()

    if (body.isActive) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any).from('announcements').update({ is_active: false }).neq('id', id)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin as any)
      .from('announcements')
      .update({ title: body.title ?? '', content: body.content, is_active: body.isActive ?? false })
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Gagal mengupdate.' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const admin = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('announcements').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Gagal menghapus.' }, { status: 500 })
  return NextResponse.json({ success: true })
}
