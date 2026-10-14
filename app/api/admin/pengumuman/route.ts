import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AnnouncementInsert } from '@/lib/supabase/types'

export async function GET(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Gagal mengambil data.' }, { status: 500 })
  return NextResponse.json({ announcements: data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()

    if (body.isActive) {
      await supabase
        .from('announcements')
        .update({ is_active: false } as AnnouncementInsert)
        .neq('id', '')
    }

    const payload: AnnouncementInsert = {
      title: body.title ?? '',
      content: body.content,
      is_active: body.isActive ?? false,
    }

    const { data, error } = await supabase
      .from('announcements')
      .insert(payload)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ announcement: data }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Gagal menyimpan.' }, { status: 500 })
  }
}
