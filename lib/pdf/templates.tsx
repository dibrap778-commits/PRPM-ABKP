import React from 'react'
import { Document, Page, Text, View, StyleSheet, Line, Svg, Image } from '@react-pdf/renderer'
import type { LetterRequestRow } from '@/lib/supabase/admin-queries'
import path from 'path'

const PRPM = {
  nama: 'AKADEMI BISNIS DAN KEUANGAN PRIMANIYARTA',
  unit: 'PUSAT RISET DAN PENGABDIAN MASYARAKAT',
  alamat: 'Jl. A.A. Maramis No. 273, Kel. Paniki I, Kec. Mapanget, Kota Manado, Sulawesi Utara, 95111',
  email: 'abkprimaniyarta@gmail.com',
  telp: '0811-4390-3993 | 0811-4358-998',
  kota: 'Manado',
  kepala: 'Surya Danang, S.E., M.M.',
  jabatan: 'Kepala PRPM',
  nuptk: '9453770671130293',
  institusi: 'Akademi Bisnis dan Keuangan Primaniyarta',
}

const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII']

const LOGO_PATH = path.join(process.cwd(), 'public', 'logo-abkp.png')

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 50,
    paddingLeft: 54,
    paddingRight: 46,
    fontFamily: 'Times-Roman',
    fontSize: 11,
    color: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 12,
  },
  logo: { width: 62, height: 62 },
  headerText: { flex: 1, textAlign: 'center' },
  unitText: {
    fontSize: 13,
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  namaKampus: {
    fontSize: 15,
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 1,
  },
  addressText: { fontSize: 8.5, marginTop: 3, lineHeight: 1.4 },
  dividerWrap: { marginTop: 4, marginBottom: 10 },
  titleBlock: { textAlign: 'center', marginBottom: 4, marginTop: 2 },
  titleText: {
    fontSize: 12,
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textDecoration: 'underline',
  },
  nomorRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  nomorText: { fontSize: 11 },
  section: { marginBottom: 6 },
  row: { flexDirection: 'row', marginBottom: 2 },
  label: { width: 80, fontSize: 11 },
  colon: { width: 12, fontSize: 11 },
  value: { flex: 1, fontSize: 11 },
  body: {
    fontSize: 11,
    lineHeight: 1.7,
    textAlign: 'justify',
    marginBottom: 4,
  },
  bodyBold: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 1.5,
  },
  signature: { marginTop: 20, flexDirection: 'row', justifyContent: 'flex-end' },
  sigBox: { width: 250, alignItems: 'center' },
  sigCity: { fontSize: 11, marginBottom: 2 },
  sigTitle: { fontSize: 11, fontFamily: 'Times-Bold' },
  sigSpace: { height: 55 },
  sigImgWrap: { width: 250, height: 120, position: 'relative' },
  sigCap: { position: 'absolute', left: 0, top: 0, width: 120, height: 120, opacity: 0.85 },
  sigTtd: { position: 'absolute', left: 40, top: 18, width: 210, height: 84 },
  sigName: { fontSize: 11, fontFamily: 'Times-Bold', textDecoration: 'underline' },
  sigNuptk: { fontSize: 10 },
})

function toRoman(month: number) { return ROMAN[month] }

function generateNomor(ticketNumber: string, now: Date) {
  const seq = String(parseInt(ticketNumber.split('-').pop() ?? '1', 10)).padStart(3, '0')
  return `${seq}/PRPM-ABKP/${toRoman(now.getMonth())}/${now.getFullYear()}`
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Reusable Header Components ─────────────────────────────

function KopSurat({ judulSurat, nomor }: { judulSurat: string; nomor: string }) {
  return (
    <View>
      <View style={styles.header}>
        <Image src={LOGO_PATH} style={styles.logo} />
        <View style={styles.headerText}>
          <Text style={styles.unitText}>{PRPM.unit}</Text>
          <Text style={styles.namaKampus}>{PRPM.nama}</Text>
          <Text style={styles.addressText}>{PRPM.alamat}.</Text>
          <Text style={styles.addressText}>Email: {PRPM.email} | Telp. {PRPM.telp}</Text>
        </View>
      </View>
      <View style={styles.dividerWrap}>
        <Svg height={4}>
          <Line x1={0} y1={1.5} x2={495} y2={1.5} strokeWidth={3} stroke="#000" />
          <Line x1={0} y1={3.5} x2={495} y2={3.5} strokeWidth={0.8} stroke="#000" />
        </Svg>
      </View>
      <View style={styles.titleBlock}>
        <Text style={styles.titleText}>{judulSurat}</Text>
      </View>
      <View style={styles.nomorRow}>
        <Text style={styles.nomorText}>Nomor: {nomor}</Text>
      </View>
    </View>
  )
}

// ── Signature Block ─────────────────────────────────────────

interface SigProps {
  tanggal: string
  signatureUrl?: string
  capUrl?: string
}

function SignatureBlock({ tanggal, signatureUrl, capUrl }: SigProps) {
  const hasImages = !!(signatureUrl || capUrl)
  return (
    <View style={styles.signature}>
      <View style={styles.sigBox}>
        <Text style={styles.sigCity}>{PRPM.kota}, {tanggal}</Text>
        <Text style={styles.sigTitle}>Kepala PRPM,</Text>
        {hasImages ? (
          <View style={styles.sigImgWrap}>
            {capUrl && <Image src={capUrl} style={styles.sigCap} />}
            {signatureUrl && <Image src={signatureUrl} style={styles.sigTtd} />}
          </View>
        ) : (
          <View style={styles.sigSpace} />
        )}
        <Text style={styles.sigName}>{PRPM.kepala}</Text>
        <Text style={styles.sigNuptk}>NUPTK: {PRPM.nuptk}</Text>
      </View>
    </View>
  )
}

// ── Penanda Tangan rows ────────────────────────────────────

function PenandaTangan() {
  return (
    <View style={styles.section}>
      <Text style={styles.body}>Yang bertanda tangan di bawah ini:</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Nama</Text>
        <Text style={styles.colon}>:</Text>
        <Text style={styles.value}>{PRPM.kepala}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Jabatan</Text>
        <Text style={styles.colon}>:</Text>
        <Text style={styles.value}>{PRPM.jabatan}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Instansi</Text>
        <Text style={styles.colon}>:</Text>
        <Text style={styles.value}>{PRPM.institusi}</Text>
      </View>
    </View>
  )
}

// ── Template props type ────────────────────────────────────

interface TemplateProps {
  data: LetterRequestRow
  nomorSurat?: string
  signatureUrl?: string
  capUrl?: string
}

// ── Surat Tugas Penelitian ─────────────────────────────────

export function SuratTugasPenelitian({ data, nomorSurat, signatureUrl, capUrl }: TemplateProps) {
  const now = new Date()
  const nomor = nomorSurat ?? generateNomor(data.ticket_number, now)
  const tanggal = formatDate(now.toISOString())
  const members = [data.applicant_name, ...(data.additional_members ?? [])]

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <KopSurat judulSurat="SURAT TUGAS PENELITIAN" nomor={nomor} />

        <PenandaTangan />

        <View style={styles.section}>
          <Text style={styles.body}>Dengan ini memberikan Surat Tugas Penelitian kepada:</Text>
          {members.map((name, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.label}>{i === 0 ? 'Nama' : ''}</Text>
              <Text style={styles.colon}>{i === 0 ? ':' : ''}</Text>
              <Text style={styles.value}>{i + 1}. {name}</Text>
            </View>
          ))}
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>Dosen</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Institusi</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{PRPM.institusi}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.body}>Untuk melaksanakan kegiatan Penelitian dengan judul:</Text>
          <Text style={styles.bodyBold}>"{data.title}"</Text>
        </View>

        {(data.start_date || data.end_date) && (
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.label}>Periode</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{formatDate(data.start_date)} s.d. {formatDate(data.end_date)}</Text>
            </View>
            {data.funding_source && (
              <View style={styles.row}>
                <Text style={styles.label}>Sumber Dana</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.value}>{data.funding_source}</Text>
              </View>
            )}
          </View>
        )}

        <Text style={styles.body}>
          Penelitian ini dilaksanakan dalam rangka pelaksanaan Tri Dharma Perguruan Tinggi, khususnya di bidang penelitian ilmiah yang memberikan kontribusi bagi pengembangan ilmu pengetahuan dan masyarakat.
        </Text>
        <Text style={styles.body}>
          Surat tugas ini berlaku sejak tanggal ditetapkan sampai dengan selesainya kegiatan penelitian yang dimaksud.
        </Text>
        <Text style={styles.body}>
          Demikian surat tugas ini dibuat untuk dipergunakan sebagaimana mestinya.
        </Text>

        <SignatureBlock tanggal={tanggal} signatureUrl={signatureUrl} capUrl={capUrl} />
      </Page>
    </Document>
  )
}

// ── Surat Tugas Pengabdian ────────────────────────────────

export function SuratTugasPengabdian({ data, nomorSurat, signatureUrl, capUrl }: TemplateProps) {
  const now = new Date()
  const nomor = nomorSurat ?? generateNomor(data.ticket_number, now)
  const tanggal = formatDate(now.toISOString())
  const members = [data.applicant_name, ...(data.additional_members ?? [])]

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <KopSurat judulSurat="SURAT TUGAS PENGABDIAN KEPADA MASYARAKAT" nomor={nomor} />

        <PenandaTangan />

        <View style={styles.section}>
          <Text style={styles.body}>Dengan ini memberikan Surat Tugas Pengabdian kepada Masyarakat kepada:</Text>
          {members.map((name, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.label}>{i === 0 ? 'Nama' : ''}</Text>
              <Text style={styles.colon}>{i === 0 ? ':' : ''}</Text>
              <Text style={styles.value}>{i + 1}. {name}</Text>
            </View>
          ))}
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>Dosen</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Institusi</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{PRPM.institusi}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.body}>Untuk melaksanakan kegiatan Pengabdian kepada Masyarakat dengan judul:</Text>
          <Text style={styles.bodyBold}>"{data.title}"</Text>
        </View>

        {(data.start_date || data.end_date || data.partner_location) && (
          <View style={styles.section}>
            {(data.start_date || data.end_date) && (
              <View style={styles.row}>
                <Text style={styles.label}>Periode</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.value}>{formatDate(data.start_date)} s.d. {formatDate(data.end_date)}</Text>
              </View>
            )}
            {data.partner_location && (
              <View style={styles.row}>
                <Text style={styles.label}>Lokasi</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.value}>{data.partner_location}</Text>
              </View>
            )}
            {data.funding_source && (
              <View style={styles.row}>
                <Text style={styles.label}>Sumber Dana</Text>
                <Text style={styles.colon}>:</Text>
                <Text style={styles.value}>{data.funding_source}</Text>
              </View>
            )}
          </View>
        )}

        <Text style={styles.body}>
          Pengabdian kepada Masyarakat ini dilaksanakan dalam rangka pelaksanaan Tri Dharma Perguruan Tinggi, khususnya di bidang pengabdian kepada masyarakat yang memberikan manfaat nyata bagi masyarakat.
        </Text>
        <Text style={styles.body}>
          Surat tugas ini berlaku sejak tanggal ditetapkan sampai dengan selesainya kegiatan pengabdian yang dimaksud.
        </Text>
        <Text style={styles.body}>
          Demikian surat tugas ini dibuat untuk dipergunakan sebagaimana mestinya.
        </Text>

        <SignatureBlock tanggal={tanggal} signatureUrl={signatureUrl} capUrl={capUrl} />
      </Page>
    </Document>
  )
}

// ── Surat Keterangan Penelitian ───────────────────────────

export function SuratKeteranganPenelitian({ data, nomorSurat, signatureUrl, capUrl }: TemplateProps) {
  const now = new Date()
  const nomor = nomorSurat ?? generateNomor(data.ticket_number, now)
  const tanggal = formatDate(now.toISOString())
  const statusLabel = data.research_status === 'selesai' ? 'telah selesai melaksanakan' : 'sedang melaksanakan'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <KopSurat judulSurat="SURAT KETERANGAN PENELITIAN" nomor={nomor} />

        <PenandaTangan />

        <Text style={styles.body}>Dengan ini menerangkan bahwa:</Text>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Nama</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{data.applicant_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>NIDN/NIP</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{data.nidn_nip}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>Dosen</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Institusi</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{PRPM.institusi}</Text>
          </View>
        </View>

        <Text style={styles.body}>
          {`Bahwa yang bersangkutan ${statusLabel} penelitian dengan judul:`}
        </Text>
        <Text style={styles.bodyBold}>"{data.title}"</Text>

        {(data.start_date || data.end_date) && (
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.label}>Periode</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{formatDate(data.start_date)} s.d. {formatDate(data.end_date)}</Text>
            </View>
          </View>
        )}

        <Text style={styles.body}>
          Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
        </Text>

        <SignatureBlock tanggal={tanggal} signatureUrl={signatureUrl} capUrl={capUrl} />
      </Page>
    </Document>
  )
}

// ── Surat Rekomendasi ─────────────────────────────────────

export function SuratRekomendasi({ data, nomorSurat, signatureUrl, capUrl }: TemplateProps) {
  const now = new Date()
  const nomor = nomorSurat ?? generateNomor(data.ticket_number, now)
  const tanggal = formatDate(now.toISOString())

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <KopSurat judulSurat="SURAT REKOMENDASI" nomor={nomor} />

        <PenandaTangan />

        <Text style={styles.body}>Dengan ini merekomendasikan:</Text>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Nama</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{data.applicant_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>NIDN/NIP</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{data.nidn_nip}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>Dosen</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Institusi</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{PRPM.institusi}</Text>
          </View>
          {data.target_institution && (
            <View style={styles.row}>
              <Text style={styles.label}>Kepada</Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.value}>{data.target_institution}</Text>
            </View>
          )}
        </View>

        {data.purpose && (
          <View style={styles.section}>
            <Text style={styles.body}>Untuk keperluan:</Text>
            <Text style={[styles.body, { marginLeft: 16 }]}>{data.purpose}</Text>
          </View>
        )}

        <Text style={styles.body}>
          Demikian surat rekomendasi ini kami berikan. Besar harapan kami kiranya Bapak/Ibu dapat memberikan bantuan dan kerjasama yang diperlukan.
        </Text>

        <SignatureBlock tanggal={tanggal} signatureUrl={signatureUrl} capUrl={capUrl} />
      </Page>
    </Document>
  )
}
