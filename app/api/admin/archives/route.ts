import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await createAdminClient()
  const contentType = req.headers.get('content-type') ?? ''

  if (contentType.includes('multipart/form-data')) {
    // Upload foto ke Supabase Storage
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const activityId = formData.get('activityId') as string
    const title = formData.get('title') as string

    if (!file || !activityId) {
      return NextResponse.json({ error: 'File dan activityId wajib diisi.' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${activityId}/${Date.now()}.${ext}`
    const bytes = await file.arrayBuffer()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: uploadError } = await (admin as any).storage
      .from('activity-photos')
      .upload(path, bytes, { contentType: file.type, upsert: false })

    if (uploadError) {
      return NextResponse.json({ error: 'Gagal upload foto.' }, { status: 500 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: urlData } = (admin as any).storage
      .from('activity-photos')
      .getPublicUrl(path)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (admin as any)
      .from('activity_archives')
      .insert({ activity_id: activityId, type: 'photo', title: title || file.name, url: urlData.publicUrl })
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Gagal menyimpan data foto.' }, { status: 500 })
    return NextResponse.json({ archive: data }, { status: 201 })
  }

  // Tambah dokumen (link Google Drive)
  const body = await req.json()
  const { activityId, title, url } = body
  if (!activityId || !title || !url) {
    return NextResponse.json({ error: 'activityId, title, dan url wajib diisi.' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('activity_archives')
    .insert({ activity_id: activityId, type: 'document', title, url })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Gagal menyimpan dokumen.' }, { status: 500 })
  return NextResponse.json({ archive: data }, { status: 201 })
}
