export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

// ── Row types ──────────────────────────────────────────────

export type ActivityRow = {
  id: string
  slug: string
  title: string
  category: 'penelitian' | 'pengabdian' | 'seminar' | 'workshop'
  status: 'mendatang' | 'berlangsung' | 'selesai'
  date: string
  end_date: string | null
  location: string
  description: string
  full_description: string | null
  speaker: string | null
  max_participants: number | null
  registration_url: string | null
  image_url: string | null
  tags: string[]
  created_at: string
}

export type AnnouncementRow = {
  id: string
  title: string
  content: string
  is_active: boolean
  created_at: string
}

export type LetterRequestRow = {
  id: string
  ticket_number: string
  letter_type: 'tugas-penelitian' | 'tugas-pengabdian' | 'keterangan-penelitian' | 'rekomendasi'
  status: 'masuk' | 'diproses' | 'selesai'
  input_method: 'form' | 'upload'
  applicant_name: string
  nidn_nip: string
  title: string | null
  start_date: string | null
  end_date: string | null
  partner_location: string | null
  funding_source: string | null
  additional_members: string[] | null
  research_status: 'sedang' | 'selesai' | null
  supervisor_name: string | null
  purpose: string | null
  target_institution: string | null
  notes: string | null
  uploaded_file_path: string | null
  pdf_url: string | null
  submitted_at: string
  updated_at: string
}

// ── Insert types ───────────────────────────────────────────

export type ActivityInsert = Omit<ActivityRow, 'id' | 'created_at'>
export type AnnouncementInsert = Omit<AnnouncementRow, 'id' | 'created_at'>
export type LetterRequestInsert = Omit<LetterRequestRow, 'id' | 'submitted_at' | 'updated_at' | 'status' | 'pdf_url'>
export type LetterRequestUpdate = Partial<Pick<LetterRequestRow, 'status' | 'pdf_url' | 'updated_at'>>

// ── Database schema ────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      activities: {
        Row: ActivityRow
        Insert: ActivityInsert
        Update: Partial<ActivityInsert>
      }
      announcements: {
        Row: AnnouncementRow
        Insert: AnnouncementInsert
        Update: Partial<AnnouncementRow>
      }
      letter_requests: {
        Row: LetterRequestRow
        Insert: LetterRequestInsert
        Update: LetterRequestUpdate
      }
    }
  }
}
