import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLetterRequestById } from '@/lib/supabase/admin-queries'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import {
  SuratTugasPenelitian,
  SuratTugasPengabdian,
  SuratKeteranganPenelitian,
  SuratRekomendasi,
} from '@/lib/pdf/templates'

async function getStorageImageUrl(name: string): Promise<string | undefined> {
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/letterhead/admin/${name}`
  try {
    const res = await fetch(base, { method: 'HEAD' })
    return res.ok ? base : undefined
  } catch {
    return undefined
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const request = await getLetterRequestById(id)
  if (!request) return NextResponse.json({ error: 'Permohonan tidak ditemukan.' }, { status: 404 })

  const noSign = req.nextUrl.searchParams.get('noSign') === '1'

  if (!noSign) {
    // Jika ada signed PDF yang diupload admin, serve itu langsung
    const signedPdfBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/letterhead/admin/signed/${request.id}.pdf`
    try {
      const check = await fetch(signedPdfBase, { method: 'HEAD' })
      if (check.ok) return NextResponse.redirect(signedPdfBase)
    } catch { /* fall through */ }
  }

  const nomorSurat = request.pdf_url ?? undefined
  const [signatureUrl, capUrl] = noSign
    ? [undefined, undefined]
    : await Promise.all([
        getStorageImageUrl('signature.png'),
        getStorageImageUrl('cap.png'),
      ])

  const templateMap: Record<string, React.ReactElement> = {
    'tugas-penelitian':       React.createElement(SuratTugasPenelitian,      { data: request, nomorSurat, signatureUrl, capUrl }),
    'tugas-pengabdian':       React.createElement(SuratTugasPengabdian,      { data: request, nomorSurat, signatureUrl, capUrl }),
    'keterangan-penelitian':  React.createElement(SuratKeteranganPenelitian, { data: request, nomorSurat, signatureUrl, capUrl }),
    'rekomendasi':            React.createElement(SuratRekomendasi,          { data: request, nomorSurat, signatureUrl, capUrl }),
  }

  const template = templateMap[request.letter_type]
  if (!template) return NextResponse.json({ error: 'Jenis surat tidak dikenali.' }, { status: 400 })

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(template as any)
    const filename = `surat-${request.ticket_number}.pdf`
    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('PDF generation error:', err)
    return NextResponse.json({ error: 'Gagal generate PDF.' }, { status: 500 })
  }
}
