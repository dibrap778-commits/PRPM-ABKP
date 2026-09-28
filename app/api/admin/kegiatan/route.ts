import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminActivities, createActivity } from '@/lib/supabase/admin-queries'
import type { ActivityInsert } from '@/lib/supabase/types'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function GET(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const activities = await getAdminActivities()
    return NextResponse.json({ activities })
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const year = body.date ? new Date(body.date).getFullYear() : new Date().getFullYear()
    const slug = `${slugify(body.title)}-${year}`

    const payload: ActivityInsert = {
      slug,
      title: body.title,
      category: body.category,
      status: body.status,
      date: body.date,
      end_date: body.endDate || null,
      location: body.location,
      description: body.description,
      full_description: body.fullDescription || null,
      speaker: body.speaker || null,
      max_participants: body.maxParticipants ? Number(body.maxParticipants) : null,
      registration_url: body.registrationUrl || null,
      tags: body.tags ? body.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    }

    const activity = await createActivity(payload)
    return NextResponse.json({ activity }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Gagal menyimpan kegiatan.' }, { status: 500 })
  }
}
