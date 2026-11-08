import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('roadmap_files')
    .select('*')
    .order('year', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Gagal mengambil data.' }, { status: 500 })
  return NextResponse.json({ files: data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const title = formData.get('title') as string
  const year = formData.get('year') as string

  if (!file || !title || !year) {
    return NextResponse.json({ error: 'File, judul, dan tahun wajib diisi.' }, { status: 400 })
  }

  const admin = await createAdminClient()
  const ext = file.name.split('.').pop() ?? 'pdf'
  const path = `${year}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const bytes = await file.arrayBuffer()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: uploadError } = await (admin as any).storage
    .from('roadmap-files')
    .upload(path, bytes, { contentType: file.type, upsert: false })

  if (uploadError) return NextResponse.json({ error: 'Gagal upload file.' }, { status: 500 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: urlData } = (admin as any).storage.from('roadmap-files').getPublicUrl(path)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('roadmap_files')
    .insert({ title, year, file_url: urlData.publicUrl, file_name: file.name, file_size: file.size })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Gagal menyimpan.' }, { status: 500 })
  return NextResponse.json({ file: data }, { status: 201 })
}
