import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLetterRequests } from '@/lib/supabase/admin-queries'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const status = req.nextUrl.searchParams.get('status') ?? undefined
  try {
    const requests = await getLetterRequests(status)
    return NextResponse.json({ requests })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Gagal mengambil data.' }, { status: 500 })
  }
}
