import { Map, FileText, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Roadmap Penelitian — PRPM Primaniyarta',
  description: 'Rencana dan arah strategis penelitian PRPM Primaniyarta.',
}

interface RoadmapFile {
  id: string
  title: string
  year: string
  file_url: string
  file_name: string
  file_size: number | null
}

function formatSize(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return 'PDF'
  if (['doc', 'docx'].includes(ext)) return 'DOC'
  if (['ppt', 'pptx'].includes(ext)) return 'PPT'
  if (['xls', 'xlsx'].includes(ext)) return 'XLS'
  return 'FILE'
}

async function getRoadmapFiles(): Promise<RoadmapFile[]> {
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('roadmap_files')
      .select('id, title, year, file_url, file_name, file_size')
      .order('year', { ascending: false })
      .order('created_at', { ascending: false })
    if (error || !data) return []
    return data
  } catch { return [] }
}

export default async function RoadmapPage() {
  const files = await getRoadmapFiles()

  // Group by year
  const byYear = files.reduce<Record<string, RoadmapFile[]>>((acc, f) => {
    acc[f.year] = acc[f.year] ?? []
    acc[f.year].push(f)
    return acc
  }, {})
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-[#B8720A] text-xs font-semibold uppercase tracking-widest mb-2">
          <Map className="w-3.5 h-3.5" />
          Arsip PRPM
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#152449] mb-3">
          Roadmap Penelitian
        </h1>
        <p className="text-slate-500 text-base max-w-xl">
          Dokumen perencanaan dan arah strategis penelitian &amp; pengabdian masyarakat PRPM Primaniyarta.
        </p>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Map className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Dokumen roadmap belum tersedia.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {years.map(y => (
            <div key={y}>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-jakarta font-extrabold text-[#152449] text-2xl">{y}</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <div className="flex flex-col gap-3">
                {byYear[y].map(f => (
                  <a
                    key={f.id}
                    href={f.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-[#0C3461]/30 hover:shadow-sm transition-all"
                  >
                    <div className="w-10 h-10 bg-[#0C3461] rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[10px] font-bold tracking-wide">{fileIcon(f.file_name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-[#0C3461] transition-colors truncate">{f.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{f.file_name}{f.file_size ? ` · ${formatSize(f.file_size)}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 group-hover:text-[#0C3461] transition-colors flex-shrink-0">
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Unduh</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
