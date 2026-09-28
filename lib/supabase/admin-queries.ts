import { createAdminClient } from './server'
import type { LetterRequestRow, LetterRequestUpdate, ActivityRow, ActivityInsert } from './types'

export type { LetterRequestRow, ActivityRow }

// ── Activities (admin) ─────────────────────────────────────

export async function getAdminActivities(): Promise<ActivityRow[]> {
  const supabase = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('activities')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getAdminActivityById(id: string): Promise<ActivityRow | null> {
  const supabase = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('activities')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function createActivity(payload: ActivityInsert): Promise<ActivityRow> {
  const supabase = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('activities')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateActivity(id: string, payload: Partial<ActivityInsert>): Promise<void> {
  const supabase = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('activities')
    .update(payload)
    .eq('id', id)
  if (error) throw error
}

export async function deleteActivity(id: string): Promise<void> {
  const supabase = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('activities')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function getLetterRequests(status?: string): Promise<LetterRequestRow[]> {
  const supabase = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('letter_requests')
    .select('*')
    .order('submitted_at', { ascending: false })

  if (status && status !== 'semua') {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getLetterRequestById(id: string): Promise<LetterRequestRow | null> {
  const supabase = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('letter_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function updateLetterRequest(id: string, updates: LetterRequestUpdate) {
  const supabase = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('letter_requests')
    .update(updates)
    .eq('id', id)

  if (error) throw error
}

export async function getLetterStats(): Promise<Record<string, number>> {
  const supabase = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('letter_requests')
    .select('status')

  if (error || !data) return { total: 0, masuk: 0, diproses: 0, selesai: 0 }

  const counts = { total: data.length, masuk: 0, diproses: 0, selesai: 0 }
  for (const row of data) {
    if (row.status in counts) counts[row.status as keyof typeof counts]++
  }
  return counts
}
