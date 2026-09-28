import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLetterRequestById, updateLetterRequest } from '@/lib/supabase/admin-queries'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const request = await getLetterRequestById(id)
  if (!request) return NextResponse.json({ error: 'Tidak ditemukan.' }, { status: 404 })
  return NextResponse.json({ request })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { status } = body

  if (!['masuk', 'diproses', 'selesai'].includes(status)) {
    return NextResponse.json({ error: 'Status tidak valid.' }, { status: 400 })
  }

  try {
    await updateLetterRequest(id, { status })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Gagal mengupdate status.' }, { status: 500 })
  }
}
