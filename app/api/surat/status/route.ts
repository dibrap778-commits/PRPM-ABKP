import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const ticket = req.nextUrl.searchParams.get('tiket')?.trim().toUpperCase()

  if (!ticket) {
    return NextResponse.json({ error: 'Nomor tiket diperlukan.' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('letter_requests')
    .select('ticket_number, letter_type, status, applicant_name, submitted_at')
    .eq('ticket_number', ticket)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Nomor tiket tidak ditemukan.' }, { status: 404 })
  }

  return NextResponse.json(data)
}
