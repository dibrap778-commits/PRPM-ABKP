import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateActivity, deleteActivity, getAdminActivityById } from '@/lib/supabase/admin-queries'
import type { ActivityInsert } from '@/lib/supabase/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const activity = await getAdminActivityById(id)
  if (!activity) return NextResponse.json({ error: 'Tidak ditemukan.' }, { status: 404 })
  return NextResponse.json({ activity })
}

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
    const payload: Partial<ActivityInsert> = {
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
      image_url: body.imageUrl || null,
      tags: body.tags ? body.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    }
    await updateActivity(id, payload)
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
  try {
    await deleteActivity(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Gagal menghapus.' }, { status: 500 })
  }
}
