import { notFound } from 'next/navigation'
import { getLetterRequestById } from '@/lib/supabase/admin-queries'
import { LETTER_TYPE_LABELS } from '@/lib/data'
import PreviewSuratClient from './PreviewSuratClient'

export const metadata = { title: 'Preview Surat' }

export default async function PreviewSuratPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const req = await getLetterRequestById(id)
  if (!req) notFound()

  return <PreviewSuratClient req={req} typeLabel={LETTER_TYPE_LABELS[req.letter_type] ?? req.letter_type} />
}
