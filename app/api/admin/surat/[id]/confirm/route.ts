import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateLetterRequest } from '@/lib/supabase/admin-queries'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const nomorSurat = (body.nomorSurat ?? '').trim()
  if (!nomorSurat) return NextResponse.json({ error: 'Nomor surat wajib diisi.' }, { status: 400 })

  try {
    await updateLetterRequest(id, { status: 'selesai', pdf_url: nomorSurat })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('confirm error:', err)
    return NextResponse.json({ error: 'Gagal mengkonfirmasi surat.' }, { status: 500 })
  }
}
