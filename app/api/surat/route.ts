import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { LetterRequestInsert } from '@/lib/supabase/types'

function generateTicketNumber(): string {
  const year = new Date().getFullYear()
  const num = String(Math.floor(Math.random() * 9000) + 1000)
  return `PRPM-${year}-${num}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = await createClient()

    const ticketNumber = generateTicketNumber()

    const payload: LetterRequestInsert = {
      ticket_number: ticketNumber,
      letter_type: body.letterType as LetterRequestInsert['letter_type'],
      input_method: (body.inputMethod ?? 'form') as LetterRequestInsert['input_method'],
      applicant_name: body.applicantName,
      nidn_nip: body.nidnNip,
      title: body.title || null,
      start_date: body.startDate || null,
      end_date: body.endDate || null,
      partner_location: body.partnerLocation || null,
      funding_source: body.fundingSource || null,
      additional_members: body.additionalMembers?.filter(Boolean) ?? null,
      research_status: (body.researchStatus || null) as LetterRequestInsert['research_status'],
      supervisor_name: body.supervisorName || null,
      purpose: body.purpose || null,
      target_institution: body.targetInstitution || null,
      notes: body.notes || null,
      uploaded_file_path: body.uploadedFilePath || null,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('letter_requests')
      .insert(payload)
      .select('ticket_number')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Gagal menyimpan permohonan.' }, { status: 500 })
    }

    return NextResponse.json({ ticketNumber: data.ticket_number }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan.' }, { status: 500 })
  }
}
