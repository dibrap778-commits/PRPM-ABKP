import { getActivities } from '@/lib/supabase/queries'
import KegiatanClient from './KegiatanClient'

export default async function KegiatanPage() {
  const activities = await getActivities()

  const spotlight =
    activities.find(a => a.status === 'berlangsung') ??
    activities.find(a => a.status === 'mendatang') ??
    activities[0] ??
    null

  return <KegiatanClient activities={activities} spotlight={spotlight} />
}
