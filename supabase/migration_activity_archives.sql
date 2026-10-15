-- ============================================================
-- Activity Archives: foto & dokumen per kegiatan
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Tabel activity_archives
CREATE TABLE IF NOT EXISTS activity_archives (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id uuid REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  type        text CHECK (type IN ('photo', 'document')) NOT NULL,
  title       text NOT NULL,
  url         text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- 2. Row Level Security
ALTER TABLE activity_archives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_archives public read"
  ON activity_archives FOR SELECT USING (true);

CREATE POLICY "activity_archives admin insert"
  ON activity_archives FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "activity_archives admin delete"
  ON activity_archives FOR DELETE
  USING (auth.role() = 'authenticated');

-- 3. Storage bucket untuk foto (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-photos', 'activity-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "activity photos public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'activity-photos');

CREATE POLICY "activity photos admin upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'activity-photos' AND auth.role() = 'authenticated');

CREATE POLICY "activity photos admin delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'activity-photos' AND auth.role() = 'authenticated');
