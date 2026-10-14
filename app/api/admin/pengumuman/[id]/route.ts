import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AnnouncementInsert } from '@/lib/supabase/types'

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

    if (body.isActive) {
      await supabase
        .from('announcements')
        .update({ is_active: false } as AnnouncementInsert)
        .neq('id', id)
    }

    const payload: AnnouncementInsert = {
      title: body.title ?? '',
      content: body.content,
      is_active: body.isActive ?? false,
    }

    const { error } = await supabase
      .from('announcements')
      .update(payload)
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
  const { error } = await supabase.from('announcements').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Gagal menghapus.' }, { status: 500 })
  return NextResponse.json({ success: true })
}
