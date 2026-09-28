import type { Activity, Announcement } from '@/types'

export const ACTIVITIES: Activity[] = [
  {
    id: '1',
    slug: 'pelatihan-metodologi-penelitian-kuantitatif-2026',
    title: 'Pelatihan Metodologi Penelitian Kuantitatif',
    category: 'penelitian',
    status: 'mendatang',
    date: '2026-10-15',
    endDate: '2026-10-16',
    location: 'Aula Gedung A Lt. 3, Kampus Utama',
    description: 'Pelatihan dua hari untuk meningkatkan kompetensi dosen dalam merancang dan melaksanakan penelitian kuantitatif yang valid dan reliabel.',
    fullDescription: `Pelatihan ini dirancang untuk membekali para dosen dengan pemahaman mendalam tentang metodologi penelitian kuantitatif, mulai dari perumusan hipotesis, pemilihan instrumen penelitian, teknik sampling, hingga analisis data menggunakan SPSS dan software statistik lainnya.

Peserta akan mendapatkan hands-on practice dengan dataset riil dan kesempatan untuk mendiskusikan desain penelitian masing-masing secara langsung dengan narasumber.`,
    speaker: 'Prof. Dr. Ahmad Fauzan, M.Si. (Universitas Negeri Malang)',
    maxParticipants: 40,
    registrationUrl: '#',
    tags: ['metodologi', 'kuantitatif', 'SPSS', 'statistik'],
  },
  {
    id: '2',
    slug: 'program-pengabdian-desa-binaan-2026',
    title: 'Program Pengabdian Masyarakat Desa Binaan',
    category: 'pengabdian',
    status: 'berlangsung',
    date: '2026-09-01',
    endDate: '2026-11-30',
    location: 'Desa Sukamaju, Kec. Cikaret, Kab. Bogor',
    description: 'Program pendampingan tiga bulan untuk peningkatan kapasitas UMKM lokal melalui digitalisasi pemasaran dan pengelolaan keuangan sederhana.',
    fullDescription: `Program pengabdian masyarakat ini melibatkan 8 dosen dari berbagai prodi untuk mendampingi UMKM di Desa Sukamaju dalam adopsi teknologi digital.

Fokus program meliputi pembuatan akun marketplace, pelatihan fotografi produk, pencatatan keuangan digital, dan penguatan brand lokal.`,
    speaker: 'Tim PRPM (8 Dosen)',
    maxParticipants: 0,
    tags: ['UMKM', 'digitalisasi', 'desa binaan', 'keuangan'],
  },
  {
    id: '3',
    slug: 'seminar-nasional-hasil-penelitian-2026',
    title: 'Seminar Nasional Hasil Penelitian & Pengabdian 2026',
    category: 'seminar',
    status: 'mendatang',
    date: '2026-11-20',
    location: 'Ballroom Hotel Grand Cempaka, Jakarta',
    description: 'Seminar nasional tahunan PRPM sebagai forum diseminasi hasil penelitian dan pengabdian masyarakat dosen dari seluruh Indonesia.',
    fullDescription: `Seminar Nasional ini merupakan agenda tahunan PRPM yang memberikan wadah bagi para dosen dan peneliti untuk mempresentasikan hasil penelitian dan pengabdian kepada masyarakat akademik.

Tahun ini seminar akan dilaksanakan secara hybrid (luring dan daring) dengan tema "Inovasi Pendidikan Tinggi untuk Indonesia Emas 2045".`,
    speaker: 'Berbagai pembicara dari PTN/PTS terkemuka',
    maxParticipants: 200,
    registrationUrl: '#',
    tags: ['seminar nasional', 'diseminasi', 'hybrid', 'penelitian'],
  },
  {
    id: '4',
    slug: 'workshop-penulisan-artikel-jurnal-terindeks-2026',
    title: 'Workshop Penulisan Artikel Jurnal Terindeks Scopus/Sinta',
    category: 'workshop',
    status: 'mendatang',
    date: '2026-10-28',
    endDate: '2026-10-29',
    location: 'Ruang Multimedia, Gedung B Lt. 2',
    description: 'Workshop intensif menulis artikel ilmiah berkualitas tinggi yang siap dikirim ke jurnal terindeks Scopus atau Sinta 1–2.',
    fullDescription: `Workshop ini akan membahas secara praktis cara menulis artikel ilmiah yang memenuhi standar jurnal internasional, mulai dari struktur IMRaD, penggunaan referensi manajer (Mendeley/Zotero), teknik parafrase untuk menghindari plagiarisme, hingga strategi memilih jurnal target.

Setiap peserta akan pulang dengan draft artikel yang sudah direvisi oleh narasumber.`,
    speaker: 'Dr. Rini Setiawati, M.Pd. (Pakar Publikasi Internasional)',
    maxParticipants: 25,
    registrationUrl: '#',
    tags: ['jurnal', 'Scopus', 'Sinta', 'penulisan ilmiah'],
  },
  {
    id: '5',
    slug: 'pelatihan-penyusunan-proposal-penelitian-dikti-2026',
    title: 'Pelatihan Penyusunan Proposal Penelitian Hibah Dikti',
    category: 'penelitian',
    status: 'selesai',
    date: '2026-08-12',
    endDate: '2026-08-13',
    location: 'Ruang Seminar PRPM, Gedung Rektorat Lt. 4',
    description: 'Pelatihan menyusun proposal penelitian yang kompetitif untuk skema hibah Dikti: PDP, PDUPT, PKPT, dan skema internasional.',
    fullDescription: `Pelatihan ini memberikan pemahaman menyeluruh tentang mekanisme pengajuan proposal ke Simlitabmas, kriteria penilaian reviewer, teknik penulisan state of the art, dan tips membuat RAB yang realistis.`,
    speaker: 'Dr. Bambang Wibowo, M.T. (Reviewer Nasional Dikti)',
    maxParticipants: 50,
    tags: ['hibah', 'Dikti', 'proposal', 'Simlitabmas'],
  },
  {
    id: '6',
    slug: 'pengabdian-literasi-keuangan-siswa-sma-2026',
    title: 'Pengabdian Literasi Keuangan Siswa SMA Se-Kota',
    category: 'pengabdian',
    status: 'selesai',
    date: '2026-07-15',
    endDate: '2026-07-20',
    location: 'Beberapa SMA di Kota Bogor',
    description: 'Kegiatan edukasi keuangan untuk siswa SMA mencakup manajemen uang saku, menabung, dan pengenalan investasi dasar.',
    fullDescription: `Program pengabdian ini menjangkau 5 SMA Negeri dan 3 SMA Swasta di Kota Bogor dengan total 800 siswa peserta. Materi disampaikan oleh dosen Prodi Manajemen dan Akuntansi dalam format talkshow interaktif.`,
    speaker: 'Tim Dosen Prodi Manajemen & Akuntansi',
    maxParticipants: 0,
    tags: ['literasi keuangan', 'siswa SMA', 'edukasi'],
  },
]

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    title: 'Batas Pengumpulan Laporan Kemajuan Penelitian 2026',
    content: 'Seluruh peneliti penerima hibah internal wajib mengumpulkan laporan kemajuan (60%) paling lambat 31 Oktober 2026 melalui portal SIPP.',
    isActive: true,
    createdAt: '2026-09-20',
  },
]

export function getActivityBySlug(slug: string): Activity | undefined {
  return ACTIVITIES.find(a => a.slug === slug)
}

export const LETTER_TYPE_LABELS: Record<string, string> = {
  'tugas-penelitian': 'Surat Tugas Penelitian',
  'tugas-pengabdian': 'Surat Tugas Pengabdian',
  'keterangan-penelitian': 'Surat Keterangan Penelitian',
  'rekomendasi': 'Surat Rekomendasi / Pengantar',
}

export const CATEGORY_LABELS: Record<string, string> = {
  penelitian: 'Penelitian',
  pengabdian: 'Pengabdian',
  seminar: 'Seminar',
  workshop: 'Workshop',
}

export const STATUS_LABELS: Record<string, string> = {
  mendatang: 'Mendatang',
  berlangsung: 'Berlangsung',
  selesai: 'Selesai',
}
