import { createClient } from './server'
import { ACTIVITIES, ANNOUNCEMENTS } from '@/lib/data'
import type { Activity, Announcement } from '@/types'

function isSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co'
  )
}

// Map DB row → app type
function mapActivity(row: Record<string, unknown>): Activity {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    category: row.category as Activity['category'],
    status: row.status as Activity['status'],
    date: row.date as string,
    endDate: (row.end_date as string) ?? undefined,
    location: row.location as string,
    description: row.description as string,
    fullDescription: (row.full_description as string) ?? undefined,
    speaker: (row.speaker as string) ?? undefined,
    maxParticipants: (row.max_participants as number) ?? undefined,
    registrationUrl: (row.registration_url as string) ?? undefined,
    tags: (row.tags as string[]) ?? [],
  }
}

function mapAnnouncement(row: Record<string, unknown>): Announcement {
  return {
    id: row.id as string,
    title: row.title as string,
    content: row.content as string,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
  }
}

export async function getActivities(): Promise<Activity[]> {
  if (!isSupabaseConfigured()) return ACTIVITIES

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('date', { ascending: true })

  if (error || !data) {
    console.warn('Supabase fetch failed, using mock data:', error?.message)
    return ACTIVITIES
  }

  return data.map(mapActivity)
}

export async function getActivityBySlug(slug: string): Promise<Activity | undefined> {
  if (!isSupabaseConfigured()) {
    return ACTIVITIES.find(a => a.slug === slug)
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) return undefined
  return mapActivity(data)
}

export async function getActiveAnnouncement(): Promise<Announcement | undefined> {
  if (!isSupabaseConfigured()) {
    return ANNOUNCEMENTS.find(a => a.isActive)
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return undefined
  return mapAnnouncement(data)
}
