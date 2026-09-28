import type { ActivityCategory, ActivityStatus } from '@/types'

const CATEGORY_STYLES: Record<ActivityCategory, string> = {
  penelitian: 'bg-blue-100 text-blue-700',
  pengabdian: 'bg-green-100 text-green-700',
  seminar: 'bg-purple-100 text-purple-700',
  workshop: 'bg-orange-100 text-orange-700',
}

const STATUS_STYLES: Record<ActivityStatus, string> = {
  mendatang: 'bg-sky-100 text-sky-700',
  berlangsung: 'bg-emerald-100 text-emerald-700',
  selesai: 'bg-slate-100 text-slate-500',
}

const STATUS_DOT: Record<ActivityStatus, string> = {
  mendatang: 'bg-sky-400',
  berlangsung: 'bg-emerald-400',
  selesai: 'bg-slate-400',
}

export function CategoryBadge({ category, label }: { category: ActivityCategory; label: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${CATEGORY_STYLES[category]}`}>
      {label}
    </span>
  )
}

export function StatusBadge({ status, label }: { status: ActivityStatus; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]} ${status === 'berlangsung' ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  )
}
