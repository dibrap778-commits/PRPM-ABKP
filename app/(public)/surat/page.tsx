'use client'

import { useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { FileText, Upload, CheckCircle, ChevronRight, ChevronLeft, Plus, Trash2, AlertCircle } from 'lucide-react'
import type { LetterType } from '@/types'
import { LETTER_TYPE_LABELS } from '@/lib/data'

/* ── Letter type metadata ── */
const LETTER_TYPES: Array<{
  id: LetterType
  icon: string
  desc: string
  color: string
}> = [
  {
    id: 'tugas-penelitian',
    icon: '🔬',
    desc: 'Untuk dosen yang melaksanakan kegiatan penelitian',
    color: 'border-blue-200 bg-blue-50 hover:border-blue-400',
  },
  {
    id: 'tugas-pengabdian',
    icon: '🤝',
    desc: 'Untuk dosen yang melaksanakan pengabdian masyarakat',
    color: 'border-green-200 bg-green-50 hover:border-green-400',
  },
  {
    id: 'keterangan-penelitian',
    icon: '📄',
    desc: 'Keterangan sedang/sudah melakukan penelitian',
    color: 'border-purple-200 bg-purple-50 hover:border-purple-400',
  },
  {
    id: 'rekomendasi',
    icon: '📝',
    desc: 'Rekomendasi atau pengantar dari PRPM untuk keperluan tertentu',
    color: 'border-orange-200 bg-orange-50 hover:border-orange-400',
  },
]

/* ── Generic form state ── */
interface FormData {
  letterType: LetterType | ''
  inputMethod: 'form' | 'upload' | ''
  // shared
  applicantName: string
  nidnNip: string
  // research/service
  title: string
  startDate: string
  endDate: string
  partnerLocation: string
  fundingSource: string
  additionalMembers: string[]
  // keterangan
  researchStatus: 'sedang' | 'selesai' | ''
  supervisorName: string
  // rekomendasi
  purpose: string
  targetInstitution: string
  notes: string
  // file
  uploadedFileName: string
}

const INITIAL_FORM: FormData = {
  letterType: '',
  inputMethod: '',
  applicantName: '',
  nidnNip: '',
  title: '',
  startDate: '',
  endDate: '',
  partnerLocation: '',
  fundingSource: '',
  additionalMembers: [],
  researchStatus: '',
  supervisorName: '',
  purpose: '',
  targetInstitution: '',
  notes: '',
  uploadedFileName: '',
}

/* ── Step indicators ── */
const STEPS = ['Jenis Surat', 'Isi Data', 'Konfirmasi']

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                done
                  ? 'bg-[#0C3461] border-[#0C3461] text-white'
                  : active
                  ? 'bg-white border-[#0C3461] text-[#0C3461]'
                  : 'bg-white border-slate-200 text-slate-400'
              }`}>
                {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${active ? 'text-[#0C3461]' : done ? 'text-slate-600' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 ${i < current ? 'bg-[#0C3461]' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Field helpers ── */
function Field({ label, required, children, hint }: {
  label: string; required?: boolean; children: React.ReactNode; hint?: string
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  )
}

const inputCls = "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#0C3461] focus:ring-2 focus:ring-[#0C3461]/10 text-slate-800 placeholder-slate-400"

/* ── Main component ── */
function SuratPageContent() {
  const searchParams = useSearchParams()
  const initialType = searchParams.get('jenis') as LetterType | null

  const [step, setStep] = useState(initialType ? 1 : 0)
  const [form, setForm] = useState<FormData>({
    ...INITIAL_FORM,
    letterType: initialType || '',
    inputMethod: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [ticketNumber, setTicketNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const update = useCallback((field: keyof FormData, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const addMember = () => update('additionalMembers', [...form.additionalMembers, ''])
  const removeMember = (i: number) =>
    update('additionalMembers', form.additionalMembers.filter((_, idx) => idx !== i))
  const updateMember = (i: number, val: string) =>
    update('additionalMembers', form.additionalMembers.map((m, idx) => idx === i ? val : m))

  /* ── Step 0: Choose letter type ── */
  if (step === 0) {
    return (
      <>
        <StepBar current={0} />
        <h2 className="font-jakarta text-lg font-bold text-slate-900 mb-2">Pilih Jenis Surat</h2>
        <p className="text-sm text-slate-500 mb-6">Pilih jenis surat yang ingin Anda ajukan permohonannya.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {LETTER_TYPES.map(lt => (
            <button
              key={lt.id}
              onClick={() => { update('letterType', lt.id); setStep(1) }}
              className={`text-left p-4 rounded-2xl border-2 transition-all ${lt.color} ${
                form.letterType === lt.id ? 'ring-2 ring-[#0C3461]' : ''
              }`}
            >
              <div className="text-2xl mb-2">{lt.icon}</div>
              <div className="font-jakarta font-bold text-slate-800 text-sm mb-1">
                {LETTER_TYPE_LABELS[lt.id]}
              </div>
              <p className="text-xs text-slate-500">{lt.desc}</p>
            </button>
          ))}
        </div>
      </>
    )
  }

  /* ── Step 1: Fill form or upload ── */
  if (step === 1 && !submitted) {
    const type = form.letterType as LetterType

    return (
      <>
        <StepBar current={1} />

        {/* Type indicator */}
        <div className="flex items-center gap-2 mb-5">
          <button onClick={() => setStep(0)} className="text-xs text-slate-400 hover:text-[#0C3461] transition-colors">
            ← Ganti jenis surat
          </button>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-semibold text-[#0C3461] bg-blue-50 px-2.5 py-1 rounded-full">
            {LETTER_TYPE_LABELS[type]}
          </span>
        </div>

        {/* Input method selector */}
        {!form.inputMethod && (
          <>
            <h2 className="font-jakarta text-lg font-bold text-slate-900 mb-2">Cara Pengisian Data</h2>
            <p className="text-sm text-slate-500 mb-5">Pilih cara yang paling nyaman untuk Anda.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => update('inputMethod', 'form')}
                className="text-left p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-[#0C3461]/40 transition-all"
              >
                <FileText className="w-6 h-6 text-[#0C3461] mb-3" />
                <div className="font-jakarta font-bold text-slate-800 text-sm mb-1">Isi Form</div>
                <p className="text-xs text-slate-500">Isi data langsung di sini — panduan tersedia di tiap field.</p>
              </button>
              <button
                onClick={() => update('inputMethod', 'upload')}
                className="text-left p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-[#0C3461]/40 transition-all"
              >
                <Upload className="w-6 h-6 text-[#B8720A] mb-3" />
                <div className="font-jakarta font-bold text-slate-800 text-sm mb-1">Upload File</div>
                <p className="text-xs text-slate-500">Upload dokumen Word/PDF yang sudah berisi data yang diperlukan.</p>
              </button>
            </div>
          </>
        )}

        {/* Form input */}
        {form.inputMethod === 'form' && (
          <>
            <h2 className="font-jakarta text-lg font-bold text-slate-900 mb-5">Isi Data Permohonan</h2>
            <div className="flex flex-col gap-4">

              {/* Shared: applicant */}
              <Field label="Nama Lengkap Pemohon" required>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="contoh: Dr. Siti Rahayu, M.Pd."
                  value={form.applicantName}
                  onChange={e => update('applicantName', e.target.value)}
                />
              </Field>
              <Field label="NIDN / NIP" required hint="Bisa diisi NIM jika pemohon adalah mahasiswa">
                <input
                  type="text"
                  className={inputCls}
                  placeholder="contoh: 0112078901"
                  value={form.nidnNip}
                  onChange={e => update('nidnNip', e.target.value)}
                />
              </Field>

              {/* Additional members (for penelitian/pengabdian) */}
              {(type === 'tugas-penelitian' || type === 'tugas-pengabdian') && (
                <Field
                  label="Anggota Tim"
                  hint="Opsional. Klik '+ Tambah Anggota' jika surat untuk tim."
                >
                  <div className="flex flex-col gap-2">
                    {form.additionalMembers.map((member, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          className={inputCls}
                          placeholder={`Nama anggota ${i + 1}`}
                          value={member}
                          onChange={e => updateMember(i, e.target.value)}
                        />
                        <button
                          onClick={() => removeMember(i)}
                          className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-slate-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addMember}
                      className="flex items-center gap-1.5 text-sm text-[#0C3461] font-medium hover:text-[#B8720A] transition-colors mt-1"
                    >
                      <Plus className="w-4 h-4" /> Tambah Anggota
                    </button>
                  </div>
                </Field>
              )}

              {/* Title — penelitian, pengabdian, keterangan */}
              {type !== 'rekomendasi' && (
                <Field
                  label={type === 'tugas-pengabdian' ? 'Judul / Nama Program Pengabdian' : 'Judul Penelitian'}
                  required
                >
                  <input
                    type="text"
                    className={inputCls}
                    placeholder={type === 'tugas-pengabdian'
                      ? 'contoh: Pendampingan UMKM Digital Desa Sukamaju'
                      : 'contoh: Analisis Faktor Motivasi Belajar Mahasiswa...'}
                    value={form.title}
                    onChange={e => update('title', e.target.value)}
                  />
                </Field>
              )}

              {/* Dates */}
              {(type === 'tugas-penelitian' || type === 'tugas-pengabdian' || type === 'keterangan-penelitian') && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tanggal Mulai" required>
                    <input type="date" className={inputCls} value={form.startDate} onChange={e => update('startDate', e.target.value)} />
                  </Field>
                  <Field label={type === 'keterangan-penelitian' ? 'Tanggal Selesai (opsional)' : 'Tanggal Selesai'} required={type !== 'keterangan-penelitian'}>
                    <input type="date" className={inputCls} value={form.endDate} onChange={e => update('endDate', e.target.value)} />
                  </Field>
                </div>
              )}

              {/* Partner / location */}
              {(type === 'tugas-penelitian' || type === 'tugas-pengabdian') && (
                <Field
                  label={type === 'tugas-pengabdian' ? 'Nama Desa / Mitra / Lokasi' : 'Lokasi / Mitra Penelitian'}
                  required={type === 'tugas-pengabdian'}
                  hint={type === 'tugas-pengabdian' ? 'Sertakan kecamatan dan kabupaten jika ada' : undefined}
                >
                  <input
                    type="text"
                    className={inputCls}
                    placeholder={type === 'tugas-pengabdian' ? 'contoh: Desa Sukamaju, Kec. Cikaret, Kab. Bogor' : 'contoh: Lab Sains, Kampus Utama'}
                    value={form.partnerLocation}
                    onChange={e => update('partnerLocation', e.target.value)}
                  />
                </Field>
              )}

              {/* Funding source */}
              {type === 'tugas-penelitian' && (
                <Field label="Sumber Dana" hint="Opsional. contoh: Hibah Internal, DIKTI PDUPT, Mandiri">
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="contoh: Hibah Internal PRPM"
                    value={form.fundingSource}
                    onChange={e => update('fundingSource', e.target.value)}
                  />
                </Field>
              )}

              {/* Keterangan status */}
              {type === 'keterangan-penelitian' && (
                <>
                  <Field label="Status Penelitian" required>
                    <select
                      className={inputCls}
                      value={form.researchStatus}
                      onChange={e => update('researchStatus', e.target.value)}
                    >
                      <option value="">-- Pilih status --</option>
                      <option value="sedang">Sedang Berlangsung</option>
                      <option value="selesai">Sudah Selesai</option>
                    </select>
                  </Field>
                  <Field label="Nama Pembimbing" hint="Opsional">
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="contoh: Prof. Dr. Budi Santoso, M.T."
                      value={form.supervisorName}
                      onChange={e => update('supervisorName', e.target.value)}
                    />
                  </Field>
                </>
              )}

              {/* Rekomendasi */}
              {type === 'rekomendasi' && (
                <>
                  <Field label="Tujuan / Keperluan Surat" required hint="Jelaskan sedetail mungkin keperluan surat ini">
                    <textarea
                      rows={3}
                      className={inputCls}
                      placeholder="contoh: Surat rekomendasi untuk mengikuti seleksi reviewer jurnal nasional Sinta 2"
                      value={form.purpose}
                      onChange={e => update('purpose', e.target.value)}
                    />
                  </Field>
                  <Field label="Instansi / Pihak yang Dituju" required>
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="contoh: Redaksi Jurnal JPTK, Universitas Negeri Yogyakarta"
                      value={form.targetInstitution}
                      onChange={e => update('targetInstitution', e.target.value)}
                    />
                  </Field>
                </>
              )}

              {/* Notes */}
              <Field label="Catatan untuk Admin" hint="Opsional — informasi tambahan yang perlu diketahui admin PRPM">
                <textarea
                  rows={2}
                  className={inputCls}
                  placeholder="Tambahan info jika ada..."
                  value={form.notes}
                  onChange={e => update('notes', e.target.value)}
                />
              </Field>
            </div>

            <div className="flex justify-between mt-7">
              <button
                onClick={() => update('inputMethod', '')}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Kembali
              </button>
              <button
                onClick={() => {
                  if (!form.applicantName || !form.nidnNip) return
                  setStep(2)
                }}
                disabled={!form.applicantName || !form.nidnNip}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0C3461] hover:bg-[#081F3D] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors"
              >
                Lanjut ke Konfirmasi <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* File upload */}
        {form.inputMethod === 'upload' && (
          <>
            <h2 className="font-jakarta text-lg font-bold text-slate-900 mb-2">Upload File</h2>
            <p className="text-sm text-slate-500 mb-5">
              Upload dokumen Word atau PDF yang sudah berisi data yang diperlukan. Admin PRPM akan meninjau dan membuatkan suratnya.
            </p>

            {/* Required fields still needed */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex gap-3">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700">
                <span className="font-semibold">Meski upload file, isi data berikut tetap diperlukan</span> agar admin bisa memverifikasi identitas pemohon.
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-5">
              <Field label="Nama Lengkap Pemohon" required>
                <input type="text" className={inputCls} placeholder="contoh: Dr. Siti Rahayu, M.Pd." value={form.applicantName} onChange={e => update('applicantName', e.target.value)} />
              </Field>
              <Field label="NIDN / NIP" required>
                <input type="text" className={inputCls} placeholder="contoh: 0112078901" value={form.nidnNip} onChange={e => update('nidnNip', e.target.value)} />
              </Field>
            </div>

            {/* Drop zone */}
            <label className="block border-2 border-dashed border-slate-300 hover:border-[#0C3461]/40 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-slate-100">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="sr-only"
                onChange={e => update('uploadedFileName', e.target.files?.[0]?.name || '')}
              />
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              {form.uploadedFileName ? (
                <p className="text-sm font-semibold text-[#0C3461]">✓ {form.uploadedFileName}</p>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-700">Klik untuk pilih file</p>
                  <p className="text-xs text-slate-400 mt-1">PDF atau Word (.doc/.docx), maksimum 5 MB</p>
                </>
              )}
            </label>

            <div className="flex justify-between mt-7">
              <button
                onClick={() => update('inputMethod', '')}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Kembali
              </button>
              <button
                onClick={() => { if (form.applicantName && form.nidnNip && form.uploadedFileName) setStep(2) }}
                disabled={!form.applicantName || !form.nidnNip || !form.uploadedFileName}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0C3461] hover:bg-[#081F3D] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors"
              >
                Lanjut ke Konfirmasi <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </>
    )
  }

  /* ── Step 2: Confirmation ── */
  if (step === 2 && !submitted) {
    const type = form.letterType as LetterType
    const rows: [string, string][] = [
      ['Jenis Surat', LETTER_TYPE_LABELS[type]],
      ['Cara Pengisian', form.inputMethod === 'upload' ? 'Upload File' : 'Isi Form'],
      ['Nama Pemohon', form.applicantName],
      ['NIDN / NIP', form.nidnNip],
    ]

    if (form.inputMethod === 'form') {
      if (form.title) rows.push(['Judul', form.title])
      if (form.startDate) rows.push(['Tanggal Mulai', new Date(form.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })])
      if (form.endDate) rows.push(['Tanggal Selesai', new Date(form.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })])
      if (form.partnerLocation) rows.push(['Lokasi / Mitra', form.partnerLocation])
      if (form.fundingSource) rows.push(['Sumber Dana', form.fundingSource])
      if (form.researchStatus) rows.push(['Status Penelitian', form.researchStatus === 'sedang' ? 'Sedang Berlangsung' : 'Sudah Selesai'])
      if (form.purpose) rows.push(['Tujuan Surat', form.purpose])
      if (form.targetInstitution) rows.push(['Instansi Dituju', form.targetInstitution])
      if (form.additionalMembers.filter(Boolean).length > 0) rows.push(['Anggota Tim', form.additionalMembers.filter(Boolean).join(', ')])
      if (form.notes) rows.push(['Catatan', form.notes])
    } else {
      rows.push(['File Upload', form.uploadedFileName])
    }

    return (
      <>
        <StepBar current={2} />
        <h2 className="font-jakarta text-lg font-bold text-slate-900 mb-2">Konfirmasi Permohonan</h2>
        <p className="text-sm text-slate-500 mb-5">Periksa kembali data berikut sebelum submit.</p>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-6">
          <table className="w-full text-sm">
            <tbody>
              {rows.map(([label, value]) => (
                <tr key={label} className="border-b border-slate-100 last:border-none">
                  <td className="py-3 px-4 text-slate-500 font-medium w-40 align-top">{label}</td>
                  <td className="py-3 px-4 text-slate-800 font-medium align-top">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Koreksi Data
          </button>
          <button
            onClick={async () => {
              setSubmitting(true)
              setSubmitError('')
              try {
                const res = await fetch('/api/surat', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    letterType: form.letterType,
                    inputMethod: form.inputMethod,
                    applicantName: form.applicantName,
                    nidnNip: form.nidnNip,
                    title: form.title,
                    startDate: form.startDate,
                    endDate: form.endDate,
                    partnerLocation: form.partnerLocation,
                    fundingSource: form.fundingSource,
                    additionalMembers: form.additionalMembers,
                    researchStatus: form.researchStatus,
                    supervisorName: form.supervisorName,
                    purpose: form.purpose,
                    targetInstitution: form.targetInstitution,
                    notes: form.notes,
                  }),
                })
                const json = await res.json()
                if (!res.ok) throw new Error(json.error || 'Gagal submit')
                setTicketNumber(json.ticketNumber)
                setSubmitted(true)
              } catch (err) {
                setSubmitError(err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.')
              } finally {
                setSubmitting(false)
              }
            }}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0C3461] hover:bg-[#081F3D] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors"
          >
            {submitting ? 'Mengirim...' : <>Submit Permohonan <ChevronRight className="w-4 h-4" /></>}
          </button>
        </div>
        {submitError && (
          <p className="mt-3 text-sm text-red-600 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {submitError}
          </p>
        )}
      </>
    )
  }

  /* ── Success ── */
  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="font-jakarta text-2xl font-bold text-slate-900 mb-2">Permohonan Diterima!</h2>
        <p className="text-slate-500 text-sm mb-5 max-w-sm mx-auto">
          Permohonan surat Anda telah dikirim ke PRPM. Simpan nomor tiket berikut untuk mengecek status.
        </p>
        <div className="inline-flex flex-col items-center bg-[#FEF4DC] border border-[#B8720A]/30 rounded-2xl px-8 py-5 mb-6">
          <span className="text-xs text-[#7A4A06] font-semibold uppercase tracking-widest mb-2">Nomor Tiket</span>
          <span className="font-jakarta text-2xl font-extrabold text-[#0C3461] tracking-wider">{ticketNumber}</span>
        </div>
        <p className="text-xs text-slate-400 mb-6">Proses penerbitan surat biasanya 1–3 hari kerja.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`/surat/status?tiket=${ticketNumber}`}
            className="px-5 py-2.5 bg-[#0C3461] hover:bg-[#081F3D] text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Cek Status Permohonan
          </a>
          <a
            href="/surat"
            className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:border-[#0C3461] hover:text-[#0C3461] font-semibold rounded-xl text-sm transition-colors"
          >
            Ajukan Surat Baru
          </a>
        </div>
      </div>
    )
  }

  return null
}

export default function SuratPage() {
  return (
    <>
      {/* Page Header */}
      <div className="bg-[#0C3461] text-white py-10 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-[#E8A030] font-semibold text-xs uppercase tracking-widest mb-2">Layanan Surat</p>
          <h1 className="font-jakarta text-2xl sm:text-3xl font-extrabold mb-3">Permohonan Surat PRPM</h1>
          <p className="text-white/60 text-sm max-w-lg">
            Ajukan permohonan surat resmi penelitian atau pengabdian masyarakat secara online. Isi form atau upload file.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Suspense fallback={<div className="text-slate-400 text-sm">Memuat formulir...</div>}>
          <SuratPageContent />
        </Suspense>
      </div>
    </>
  )
}
