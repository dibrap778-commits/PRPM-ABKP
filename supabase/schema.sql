-- ══════════════════════════════════════════════════════════
-- LPPM Portal — Database Schema
-- Jalankan di Supabase: Dashboard → SQL Editor → New query
-- ══════════════════════════════════════════════════════════

-- ── 1. Activities ──────────────────────────────────────────
create table public.activities (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  title            text not null,
  category         text not null check (category in ('penelitian','pengabdian','seminar','workshop')),
  status           text not null check (status in ('mendatang','berlangsung','selesai')),
  date             date not null,
  end_date         date,
  location         text not null,
  description      text not null,
  full_description text,
  speaker          text,
  max_participants integer,
  registration_url text,
  tags             text[] not null default '{}',
  created_at       timestamptz not null default now()
);

-- ── 2. Announcements ───────────────────────────────────────
create table public.announcements (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  content    text not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── 3. Letter Requests ─────────────────────────────────────
create table public.letter_requests (
  id                   uuid primary key default gen_random_uuid(),
  ticket_number        text unique not null,
  letter_type          text not null check (letter_type in ('tugas-penelitian','tugas-pengabdian','keterangan-penelitian','rekomendasi')),
  status               text not null default 'masuk' check (status in ('masuk','diproses','selesai')),
  input_method         text not null check (input_method in ('form','upload')),
  applicant_name       text not null,
  nidn_nip             text not null,
  title                text,
  start_date           date,
  end_date             date,
  partner_location     text,
  funding_source       text,
  additional_members   text[],
  research_status      text check (research_status in ('sedang','selesai')),
  supervisor_name      text,
  purpose              text,
  target_institution   text,
  notes                text,
  uploaded_file_path   text,
  pdf_url              text,
  submitted_at         timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger letter_requests_updated_at
  before update on public.letter_requests
  for each row execute function public.set_updated_at();

-- ══════════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- ══════════════════════════════════════════════════════════

alter table public.activities       enable row level security;
alter table public.announcements    enable row level security;
alter table public.letter_requests  enable row level security;

-- Activities: siapa saja bisa baca, hanya admin yang bisa ubah
create policy "Public can read activities"
  on public.activities for select using (true);

create policy "Admin can manage activities"
  on public.activities for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Announcements: siapa saja bisa baca yang aktif, hanya admin ubah
create policy "Public can read active announcements"
  on public.announcements for select using (is_active = true);

create policy "Admin can manage announcements"
  on public.announcements for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Letter requests: siapa saja bisa insert, hanya admin yang bisa baca/ubah semua
create policy "Anyone can submit letter request"
  on public.letter_requests for insert with check (true);

create policy "Admin can read all letter requests"
  on public.letter_requests for select
  using (auth.role() = 'authenticated');

create policy "Admin can update letter requests"
  on public.letter_requests for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Dosen bisa baca permohonan miliknya via ticket_number (tanpa login)
-- Ini ditangani di API route, bukan RLS langsung


-- ══════════════════════════════════════════════════════════
-- Seed Data — Kegiatan & Pengumuman
-- ══════════════════════════════════════════════════════════

insert into public.announcements (title, content, is_active) values (
  'Batas Pengumpulan Laporan Kemajuan Penelitian 2026',
  'Seluruh peneliti penerima hibah internal wajib mengumpulkan laporan kemajuan (60%) paling lambat 31 Oktober 2026 melalui portal SIPP.',
  true
);

insert into public.activities (slug, title, category, status, date, end_date, location, description, full_description, speaker, max_participants, registration_url, tags) values
(
  'pelatihan-metodologi-penelitian-kuantitatif-2026',
  'Pelatihan Metodologi Penelitian Kuantitatif',
  'penelitian', 'mendatang', '2026-10-15', '2026-10-16',
  'Aula Gedung A Lt. 3, Kampus Utama',
  'Pelatihan dua hari untuk meningkatkan kompetensi dosen dalam merancang dan melaksanakan penelitian kuantitatif yang valid dan reliabel.',
  'Pelatihan ini dirancang untuk membekali para dosen dengan pemahaman mendalam tentang metodologi penelitian kuantitatif, mulai dari perumusan hipotesis, pemilihan instrumen penelitian, teknik sampling, hingga analisis data menggunakan SPSS dan software statistik lainnya.' || chr(10) || chr(10) || 'Peserta akan mendapatkan hands-on practice dengan dataset riil dan kesempatan untuk mendiskusikan desain penelitian masing-masing secara langsung dengan narasumber.',
  'Prof. Dr. Ahmad Fauzan, M.Si. (Universitas Negeri Malang)',
  40, '#',
  array['metodologi','kuantitatif','SPSS','statistik']
),
(
  'program-pengabdian-desa-binaan-2026',
  'Program Pengabdian Masyarakat Desa Binaan',
  'pengabdian', 'berlangsung', '2026-09-01', '2026-11-30',
  'Desa Sukamaju, Kec. Cikaret, Kab. Bogor',
  'Program pendampingan tiga bulan untuk peningkatan kapasitas UMKM lokal melalui digitalisasi pemasaran dan pengelolaan keuangan sederhana.',
  'Program pengabdian masyarakat ini melibatkan 8 dosen dari berbagai prodi untuk mendampingi UMKM di Desa Sukamaju dalam adopsi teknologi digital.' || chr(10) || chr(10) || 'Fokus program meliputi pembuatan akun marketplace, pelatihan fotografi produk, pencatatan keuangan digital, dan penguatan brand lokal.',
  'Tim LPPM (8 Dosen)',
  null, null,
  array['UMKM','digitalisasi','desa binaan','keuangan']
),
(
  'seminar-nasional-hasil-penelitian-2026',
  'Seminar Nasional Hasil Penelitian & Pengabdian 2026',
  'seminar', 'mendatang', '2026-11-20', null,
  'Ballroom Hotel Grand Cempaka, Jakarta',
  'Seminar nasional tahunan LPPM sebagai forum diseminasi hasil penelitian dan pengabdian masyarakat dosen dari seluruh Indonesia.',
  'Seminar Nasional ini merupakan agenda tahunan LPPM yang memberikan wadah bagi para dosen dan peneliti untuk mempresentasikan hasil penelitian dan pengabdian kepada masyarakat akademik.' || chr(10) || chr(10) || 'Tahun ini seminar akan dilaksanakan secara hybrid (luring dan daring) dengan tema "Inovasi Pendidikan Tinggi untuk Indonesia Emas 2045".',
  'Berbagai pembicara dari PTN/PTS terkemuka',
  200, '#',
  array['seminar nasional','diseminasi','hybrid','penelitian']
),
(
  'workshop-penulisan-artikel-jurnal-terindeks-2026',
  'Workshop Penulisan Artikel Jurnal Terindeks Scopus/Sinta',
  'workshop', 'mendatang', '2026-10-28', '2026-10-29',
  'Ruang Multimedia, Gedung B Lt. 2',
  'Workshop intensif menulis artikel ilmiah berkualitas tinggi yang siap dikirim ke jurnal terindeks Scopus atau Sinta 1–2.',
  'Workshop ini akan membahas secara praktis cara menulis artikel ilmiah yang memenuhi standar jurnal internasional, mulai dari struktur IMRaD, penggunaan referensi manajer (Mendeley/Zotero), teknik parafrase untuk menghindari plagiarisme, hingga strategi memilih jurnal target.' || chr(10) || chr(10) || 'Setiap peserta akan pulang dengan draft artikel yang sudah direvisi oleh narasumber.',
  'Dr. Rini Setiawati, M.Pd. (Pakar Publikasi Internasional)',
  25, '#',
  array['jurnal','Scopus','Sinta','penulisan ilmiah']
),
(
  'pelatihan-penyusunan-proposal-penelitian-dikti-2026',
  'Pelatihan Penyusunan Proposal Penelitian Hibah Dikti',
  'penelitian', 'selesai', '2026-08-12', '2026-08-13',
  'Ruang Seminar LPPM, Gedung Rektorat Lt. 4',
  'Pelatihan menyusun proposal penelitian yang kompetitif untuk skema hibah Dikti: PDP, PDUPT, PKPT, dan skema internasional.',
  'Pelatihan ini memberikan pemahaman menyeluruh tentang mekanisme pengajuan proposal ke Simlitabmas, kriteria penilaian reviewer, teknik penulisan state of the art, dan tips membuat RAB yang realistis.',
  'Dr. Bambang Wibowo, M.T. (Reviewer Nasional Dikti)',
  50, null,
  array['hibah','Dikti','proposal','Simlitabmas']
),
(
  'pengabdian-literasi-keuangan-siswa-sma-2026',
  'Pengabdian Literasi Keuangan Siswa SMA Se-Kota',
  'pengabdian', 'selesai', '2026-07-15', '2026-07-20',
  'Beberapa SMA di Kota Bogor',
  'Kegiatan edukasi keuangan untuk siswa SMA mencakup manajemen uang saku, menabung, dan pengenalan investasi dasar.',
  'Program pengabdian ini menjangkau 5 SMA Negeri dan 3 SMA Swasta di Kota Bogor dengan total 800 siswa peserta. Materi disampaikan oleh dosen Prodi Manajemen dan Akuntansi dalam format talkshow interaktif.',
  'Tim Dosen Prodi Manajemen & Akuntansi',
  null, null,
  array['literasi keuangan','siswa SMA','edukasi']
);
