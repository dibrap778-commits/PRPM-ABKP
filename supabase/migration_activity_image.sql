-- Tambah kolom image_url ke tabel activities
alter table public.activities
  add column if not exists image_url text;

-- Buat bucket 'activities' untuk foto kegiatan (public read)
insert into storage.buckets (id, name, public)
values ('activities', 'activities', true)
on conflict (id) do nothing;

-- Policy: siapa saja bisa lihat foto
create policy "Public can read activity images"
  on storage.objects for select
  using (bucket_id = 'activities');

-- Policy: admin bisa upload foto
create policy "Admin can upload activity images"
  on storage.objects for insert
  with check (bucket_id = 'activities' and auth.role() = 'authenticated');

-- Policy: admin bisa update foto
create policy "Admin can update activity images"
  on storage.objects for update
  using (bucket_id = 'activities' and auth.role() = 'authenticated');

-- Policy: admin bisa hapus foto
create policy "Admin can delete activity images"
  on storage.objects for delete
  using (bucket_id = 'activities' and auth.role() = 'authenticated');
