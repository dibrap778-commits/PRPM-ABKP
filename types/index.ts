export type ActivityCategory = 'penelitian' | 'pengabdian' | 'seminar' | 'workshop'
export type ActivityStatus = 'mendatang' | 'berlangsung' | 'selesai'

export interface Activity {
  id: string
  slug: string
  title: string
  category: ActivityCategory
  status: ActivityStatus
  date: string
  endDate?: string
  location: string
  description: string
  fullDescription?: string
  speaker?: string
  maxParticipants?: number
  registrationUrl?: string
  image?: string
  tags: string[]
}

export type LetterType =
  | 'tugas-penelitian'
  | 'tugas-pengabdian'
  | 'keterangan-penelitian'
  | 'rekomendasi'

export interface LetterRequest {
  id: string
  ticketNumber: string
  letterType: LetterType
  status: 'masuk' | 'diproses' | 'selesai'
  submittedAt: string
  // Shared fields
  applicantName: string
  nidnNip: string
  // Dynamic fields
  researchTitle?: string
  serviceTitle?: string
  startDate?: string
  endDate?: string
  partnerName?: string
  location?: string
  fundingSource?: string
  additionalMembers?: string[]
  purpose?: string
  targetInstitution?: string
  notes?: string
  uploadedFile?: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  isActive: boolean
  createdAt: string
}
