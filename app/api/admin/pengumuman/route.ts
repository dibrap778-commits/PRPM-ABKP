import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
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
    const admin = await createAdminClient()

    if (body.isActive) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any).from('announcements').update({ is_active: false }).neq('id', '')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (admin as any)
      .from('announcements')
      .insert({ title: body.title ?? '', content: body.content, is_active: body.isActive ?? false })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ announcement: data }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Gagal menyimpan.' }, { status: 500 })
  }
}
