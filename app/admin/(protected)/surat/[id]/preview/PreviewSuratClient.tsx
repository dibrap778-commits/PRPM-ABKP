'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Download, Printer, Upload, CheckCircle2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { LetterRequestRow } from '@/lib/supabase/admin-queries'

const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII']

function generateNomor(ticketNumber: string) {
  const now = new Date()
  const seq = String(parseInt(ticketNumber.split('-').pop() ?? '1', 10)).padStart(3, '0')
  return `${seq}/PRPM-ABKP/${ROMAN[now.getMonth()]}/${now.getFullYear()}`
}

function formatTanggal(d: Date) {
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const PRPM = {
  nama: 'AKADEMI BISNIS DAN KEUANGAN PRIMANIYARTA',
  unit: 'PUSAT RISET DAN PENGABDIAN MASYARAKAT',
  alamat: 'Jl. A.A. Maramis No. 273, Kel. Paniki I, Kec. Mapanget, Kota Manado, Sulawesi Utara, 95111',
  email: 'abkprimaniyarta@gmail.com',
  telp: '0811-4390-3993 | 0811-4358-998',
  kota: 'Manado',
  kepala: 'Surya Danang, S.E., M.M.',
  nuptk: '9453770671130293',
  institusi: 'Akademi Bisnis dan Keuangan Primaniyarta',
}

function getStorageUrl(filename: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/letterhead/admin/${filename}`
}

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

type Props = {
  req: LetterRequestRow
  typeLabel: string
}

export default function PreviewSuratClient({ req, typeLabel }: Props) {
  const router = useRouter()
  const [nomorSurat, setNomorSurat] = useState(req.pdf_url ?? generateNomor(req.ticket_number))
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState('')

  // TTD & Cap state
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null)
  const [capUrl, setCapUrl] = useState<string | null>(null)
  const [signatureFailed, setSignatureFailed] = useState(false)
  const [capFailed, setCapFailed] = useState(false)
  const [ttdState, setTtdState] = useState<UploadState>('idle')
  const [capState, setCapState] = useState<UploadState>('idle')

  // Signed PDF state
  const [signedPdfState, setSignedPdfState] = useState<UploadState>('idle')
  const [hasSignedPdf, setHasSignedPdf] = useState(false)

  const ttdInputRef = useRef<HTMLInputElement>(null)
  const capInputRef = useRef<HTMLInputElement>(null)
  const signedPdfInputRef = useRef<HTMLInputElement>(null)

  const tanggal = formatTanggal(new Date())
  const members = [req.applicant_name, ...(req.additional_members ?? [])]

  const judul = req.letter_type === 'tugas-penelitian'
    ? 'SURAT TUGAS PENELITIAN'
    : req.letter_type === 'tugas-pengabdian'
    ? 'SURAT TUGAS PENGABDIAN KEPADA MASYARAKAT'
    : req.letter_type === 'keterangan-penelitian'
    ? 'SURAT KETERANGAN PENELITIAN'
    : 'SURAT REKOMENDASI'

  // Load existing TTD, Cap, and signed PDF on mount
  useEffect(() => {
    const tryLoad = async (name: string, setter: (u: string) => void, setFailed: (b: boolean) => void) => {
      const url = getStorageUrl(name)
      try {
        const res = await fetch(url, { method: 'HEAD' })
        if (res.ok) {
          setter(url + `?t=${Date.now()}`)
          setFailed(false)
        }
      } catch {
        setFailed(true)
      }
    }
    tryLoad('signature.png', setSignatureUrl, setSignatureFailed)
    tryLoad('cap.png', setCapUrl, setCapFailed)

    // Check if signed PDF already exists
    const signedUrl = getStorageUrl(`signed/${req.id}.pdf`)
    fetch(signedUrl, { method: 'HEAD' })
      .then(r => { if (r.ok) { setHasSignedPdf(true); setSignedPdfState('done') } })
      .catch(() => {})
  }, [req.id])

  const handleUpload = useCallback(async (
    type: 'signature' | 'cap',
    file: File,
    setState: (s: UploadState) => void,
    setUrl: (u: string) => void,
    setFailed: (b: boolean) => void,
  ) => {
    setState('uploading')
    try {
      const supabase = createClient()
      const path = `admin/${type}.png`
      const { error } = await supabase.storage
        .from('letterhead')
        .upload(path, file, { upsert: true, contentType: file.type || 'image/png' })
      if (error) {
        console.error('Upload error:', error)
        setState('error')
        return
      }
      const url = getStorageUrl(`${type}.png`) + `?t=${Date.now()}`
      setUrl(url)
      setFailed(false)
      setState('done')
    } catch {
      setState('error')
    }
  }, [])

  function onTtdChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    handleUpload('signature', file, setTtdState, setSignatureUrl, setSignatureFailed)
  }

  function onCapChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    handleUpload('cap', file, setCapState, setCapUrl, setCapFailed)
  }

  async function onSignedPdfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSignedPdfState('uploading')
    try {
      const supabase = createClient()
      const path = `admin/signed/${req.id}.pdf`
      const { error } = await supabase.storage
        .from('letterhead')
        .upload(path, file, { upsert: true, contentType: 'application/pdf' })
      if (error) { setSignedPdfState('error'); return }
      setHasSignedPdf(true)
      setSignedPdfState('done')
    } catch {
      setSignedPdfState('error')
    }
  }

  async function handleKirim() {
    if (!nomorSurat.trim()) return setMsg('Nomor surat tidak boleh kosong.')
    setSending(true)
    setMsg('')
    try {
      const res = await fetch(`/api/admin/surat/${req.id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomorSurat: nomorSurat.trim() }),
      })
      if (res.ok) {
        router.push(`/admin/surat/${req.id}`)
        router.refresh()
      } else {
        const d = await res.json()
        setMsg(d.error ?? 'Gagal mengirim surat.')
      }
    } catch {
      setMsg('Terjadi kesalahan.')
    } finally {
      setSending(false)
    }
  }

  const hasSignature = signatureUrl && !signatureFailed
  const hasCap = capUrl && !capFailed

  return (
    <div className="min-h-screen bg-[#E8EDF2]">
      {/* Toolbar */}
      <div className="print:hidden sticky top-0 z-10 bg-[#0C3461] text-white shadow-lg">
        {/* Main toolbar row */}
        <div className="px-4 py-2.5 flex items-center gap-3">
          <Link
            href={`/admin/surat/${req.id}`}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>

          <div className="flex-1 min-w-0">
            <p className="font-mono text-xs text-white/40 leading-none">{req.ticket_number}</p>
            <p className="font-semibold text-sm truncate">{typeLabel}</p>
          </div>

          {/* Nomor Surat */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <label className="text-xs text-white/60">No. Surat:</label>
            <input
              value={nomorSurat}
              onChange={e => setNomorSurat(e.target.value)}
              className="bg-white/10 border border-white/20 text-white text-xs px-2.5 py-1.5 rounded-lg font-mono w-48 focus:outline-none focus:border-white/60"
              placeholder="XXX/PRPM-ABKP/I/2026"
            />
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-white/20 hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
          <a
            href={`/api/admin/pdf/${req.id}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Download PDF dengan TTD & cap otomatis"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-white/20 hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh + TTD
          </a>
          <a
            href={`/api/admin/pdf/${req.id}?noSign=1`}
            target="_blank"
            rel="noopener noreferrer"
            title="Download PDF kosong tanpa TTD/cap — untuk diedit manual lalu diupload kembali"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-white/20 text-white/60 hover:bg-white/10 hover:text-white transition-colors flex-shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh Kosong
          </a>

          {/* Upload PDF yang sudah ditandatangani */}
          <input
            ref={signedPdfInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={onSignedPdfChange}
          />
          <button
            onClick={() => signedPdfInputRef.current?.click()}
            disabled={signedPdfState === 'uploading'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors flex-shrink-0 ${
              hasSignedPdf
                ? 'border-emerald-400 text-emerald-300 hover:bg-emerald-400/10'
                : 'border-amber-400 text-amber-300 hover:bg-amber-400/10'
            }`}
          >
            {signedPdfState === 'uploading'
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : hasSignedPdf
              ? <CheckCircle2 className="w-3.5 h-3.5" />
              : <Upload className="w-3.5 h-3.5" />
            }
            {hasSignedPdf ? 'PDF Bertandatangan ✓' : 'Upload PDF Bertandatangan'}
          </button>
          {signedPdfState === 'error' && <span className="text-xs text-red-400">Gagal upload</span>}

          <button
            onClick={handleKirim}
            disabled={sending || req.status === 'selesai'}
            className="flex items-center gap-2 px-4 py-2 bg-[#E8A030] hover:bg-[#d09020] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Mengirim...' : req.status === 'selesai' ? 'Sudah Dikirim ✓' : 'Kirim ke Dosen'}
          </button>
        </div>

        {/* TTD & Cap upload bar */}
        <div className="px-4 pb-2.5 flex items-center gap-4 border-t border-white/10 pt-2.5">
          <span className="text-xs text-white/50 flex-shrink-0">TTD &amp; Cap:</span>

          {/* TTD Upload */}
          <input ref={ttdInputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={onTtdChange} />
          <button
            onClick={() => ttdInputRef.current?.click()}
            disabled={ttdState === 'uploading'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors flex-shrink-0 ${
              hasSignature
                ? 'border-emerald-400 text-emerald-300 hover:bg-emerald-400/10'
                : 'border-white/20 text-white/70 hover:bg-white/10'
            }`}
          >
            {ttdState === 'uploading'
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : hasSignature
              ? <CheckCircle2 className="w-3.5 h-3.5" />
              : <Upload className="w-3.5 h-3.5" />
            }
            {hasSignature ? 'TTD ✓ (ganti)' : 'Upload TTD'}
          </button>
          {ttdState === 'error' && <span className="text-xs text-red-400">Gagal upload</span>}

          {/* Cap Upload */}
          <input ref={capInputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={onCapChange} />
          <button
            onClick={() => capInputRef.current?.click()}
            disabled={capState === 'uploading'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors flex-shrink-0 ${
              hasCap
                ? 'border-emerald-400 text-emerald-300 hover:bg-emerald-400/10'
                : 'border-white/20 text-white/70 hover:bg-white/10'
            }`}
          >
            {capState === 'uploading'
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : hasCap
              ? <CheckCircle2 className="w-3.5 h-3.5" />
              : <Upload className="w-3.5 h-3.5" />
            }
            {hasCap ? 'Cap ✓ (ganti)' : 'Upload Cap'}
          </button>
          {capState === 'error' && <span className="text-xs text-red-400">Gagal upload</span>}

          {(!hasSignature || !hasCap) && (
            <span className="text-xs text-white/40">
              Upload sekali, dipakai di semua surat. Format PNG transparan.
            </span>
          )}

          {msg && <p className="text-xs text-red-300 ml-auto">{msg}</p>}
        </div>
      </div>

      {/* A4 Paper */}
      <div className="py-8 px-4 flex justify-center print:py-0 print:px-0">
        <div
          className="bg-white shadow-2xl print:shadow-none"
          style={{ width: '794px', minHeight: '1123px', padding: '40px 54px 60px 54px', fontFamily: "'Times New Roman', Times, serif" }}
        >
          {/* Kop Surat */}
          <div className="flex items-center gap-4 mb-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-abkp.png" alt="Logo ABKP" className="w-20 h-20 object-contain flex-shrink-0" />
            <div className="flex-1 text-center">
              <p className="font-bold uppercase text-sm tracking-wide leading-tight">{PRPM.unit}</p>
              <p className="font-bold uppercase text-lg tracking-wide leading-tight mt-0.5">{PRPM.nama}</p>
              <p className="text-[11px] mt-1 leading-snug">{PRPM.alamat}.</p>
              <p className="text-[11px] leading-snug">Email: {PRPM.email} | Telp. {PRPM.telp}</p>
            </div>
          </div>

          {/* Garis kop */}
          <div className="border-t-[3px] border-black mt-2" />
          <div className="border-t border-black mt-0.5 mb-5" />

          {/* Judul Surat */}
          <div className="text-center mb-1">
            <p className="font-bold uppercase tracking-widest text-sm underline">{judul}</p>
          </div>
          <div className="text-center mb-6">
            <p className="text-sm">Nomor: {nomorSurat}</p>
          </div>

          {/* Yang bertanda tangan */}
          <div className="mb-4 text-sm leading-7">
            <p className="mb-2">Yang bertanda tangan di bawah ini:</p>
            <table className="w-full">
              <tbody>
                <tr><td className="w-28 align-top">Nama</td><td className="w-4 align-top">:</td><td>{PRPM.kepala}</td></tr>
                <tr><td className="align-top">Jabatan</td><td className="align-top">:</td><td>Kepala PRPM</td></tr>
                <tr><td className="align-top">Instansi</td><td className="align-top">:</td><td>{PRPM.institusi}</td></tr>
              </tbody>
            </table>
          </div>

          {/* Penerima */}
          <div className="mb-4 text-sm leading-7">
            {req.letter_type === 'tugas-penelitian' && <p className="mb-2">Dengan ini memberikan Surat Tugas Penelitian kepada:</p>}
            {req.letter_type === 'tugas-pengabdian' && <p className="mb-2">Dengan ini memberikan Surat Tugas Pengabdian kepada Masyarakat kepada:</p>}
            {req.letter_type === 'keterangan-penelitian' && <p className="mb-2">Dengan ini menerangkan bahwa:</p>}
            {req.letter_type === 'rekomendasi' && <p className="mb-2">Dengan ini merekomendasikan:</p>}

            <table className="w-full">
              <tbody>
                {(req.letter_type === 'tugas-penelitian' || req.letter_type === 'tugas-pengabdian') ? (
                  <>
                    {members.map((name, i) => (
                      <tr key={i}>
                        <td className="w-28 align-top">{i === 0 ? 'Nama' : ''}</td>
                        <td className="w-4 align-top">{i === 0 ? ':' : ''}</td>
                        <td>{i + 1}. {name}</td>
                      </tr>
                    ))}
                    <tr><td className="align-top">Status</td><td className="align-top">:</td><td>Dosen</td></tr>
                    <tr><td className="align-top">Institusi</td><td className="align-top">:</td><td>{PRPM.institusi}</td></tr>
                  </>
                ) : (
                  <>
                    <tr><td className="w-28 align-top">Nama</td><td className="w-4 align-top">:</td><td>{req.applicant_name}</td></tr>
                    <tr><td className="align-top">NIDN/NIP</td><td className="align-top">:</td><td>{req.nidn_nip}</td></tr>
                    <tr><td className="align-top">Status</td><td className="align-top">:</td><td>Dosen</td></tr>
                    <tr><td className="align-top">Institusi</td><td className="align-top">:</td><td>{PRPM.institusi}</td></tr>
                    {req.target_institution && (
                      <tr><td className="align-top">Kepada</td><td className="align-top">:</td><td>{req.target_institution}</td></tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Judul & Keperluan */}
          {req.title && (
            <div className="mb-4 text-sm leading-7">
              {req.letter_type === 'tugas-penelitian' && <p>Untuk melaksanakan kegiatan Penelitian dengan judul:</p>}
              {req.letter_type === 'tugas-pengabdian' && <p>Untuk melaksanakan kegiatan Pengabdian kepada Masyarakat dengan judul:</p>}
              {req.letter_type === 'keterangan-penelitian' && (
                <p>{req.research_status === 'selesai' ? 'Telah selesai melaksanakan' : 'Sedang melaksanakan'} penelitian dengan judul:</p>
              )}
              <p className="font-bold text-center mt-1 mb-1">&ldquo;{req.title}&rdquo;</p>
            </div>
          )}
          {req.letter_type === 'rekomendasi' && req.purpose && (
            <div className="mb-4 text-sm leading-7">
              <p>Untuk keperluan: {req.purpose}</p>
            </div>
          )}

          {/* Periode */}
          {(req.start_date || req.funding_source || req.partner_location) && (
            <div className="mb-4 text-sm leading-7">
              <table className="w-full">
                <tbody>
                  {req.start_date && (
                    <tr>
                      <td className="w-28 align-top">Periode</td>
                      <td className="w-4 align-top">:</td>
                      <td>
                        {new Date(req.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {req.end_date && ` s.d. ${new Date(req.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                      </td>
                    </tr>
                  )}
                  {req.partner_location && <tr><td className="align-top">Lokasi</td><td className="align-top">:</td><td>{req.partner_location}</td></tr>}
                  {req.funding_source && <tr><td className="align-top">Sumber Dana</td><td className="align-top">:</td><td>{req.funding_source}</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* Body paragraf */}
          <div className="text-sm leading-7 text-justify space-y-3 mb-6">
            {req.letter_type === 'tugas-penelitian' && (
              <>
                <p>Penelitian ini dilaksanakan dalam rangka pelaksanaan Tri Dharma Perguruan Tinggi, khususnya di bidang penelitian ilmiah yang memberikan kontribusi bagi pengembangan ilmu pengetahuan dan masyarakat.</p>
                <p>Surat tugas ini berlaku sejak tanggal ditetapkan sampai dengan selesainya kegiatan penelitian yang dimaksud.</p>
              </>
            )}
            {req.letter_type === 'tugas-pengabdian' && (
              <>
                <p>Pengabdian kepada Masyarakat ini dilaksanakan dalam rangka pelaksanaan Tri Dharma Perguruan Tinggi, khususnya di bidang pengabdian kepada masyarakat yang memberikan manfaat nyata bagi masyarakat.</p>
                <p>Surat tugas ini berlaku sejak tanggal ditetapkan sampai dengan selesainya kegiatan pengabdian yang dimaksud.</p>
              </>
            )}
            <p>
              {req.letter_type === 'rekomendasi'
                ? 'Demikian surat rekomendasi ini kami berikan. Besar harapan kami kiranya Bapak/Ibu dapat memberikan bantuan dan kerjasama yang diperlukan.'
                : 'Demikian surat ini dibuat untuk dipergunakan sebagaimana mestinya.'
              }
            </p>
          </div>

          {/* Tanda Tangan */}
          <div className="flex justify-end text-sm">
            <div className="text-center w-52">
              <p>{PRPM.kota}, {tanggal}</p>
              <p className="font-bold mt-1">Kepala PRPM,</p>

              {/* TTD + Cap area — cap di kiri, TTD mulai dari tengah cap agar bersentuhan */}
              <div style={{ position: 'relative', width: 300, height: 140, margin: '4px auto' }}>
                {hasCap && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={capUrl!}
                    alt="Cap"
                    onError={() => setCapFailed(true)}
                    style={{ position: 'absolute', width: 145, height: 145, left: 0, top: -2, objectFit: 'contain', opacity: 0.85, zIndex: 1 }}
                  />
                )}
                {hasSignature && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={signatureUrl!}
                    alt="TTD"
                    onError={() => setSignatureFailed(true)}
                    style={{ position: 'absolute', width: 250, height: 100, left: 50, top: 22, objectFit: 'contain', zIndex: 2 }}
                  />
                )}
                {!hasSignature && !hasCap && <div style={{ height: 140 }} />}
              </div>

              <p className="font-bold underline">{PRPM.kepala}</p>
              <p>NUPTK: {PRPM.nuptk}</p>
            </div>
          </div>
        </div>
      </div>

      {req.status === 'selesai' && (
        <div className="print:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg">
          Surat sudah dikirim ke dosen ✓
        </div>
      )}
    </div>
  )
}
