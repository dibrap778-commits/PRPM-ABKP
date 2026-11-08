-- Tabel file roadmap penelitian
CREATE TABLE IF NOT EXISTS roadmap_files (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title       text NOT NULL,
  year        text NOT NULL,
  file_url    text NOT NULL,
  file_name   text NOT NULL,
  file_size   bigint,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE roadmap_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roadmap_files public read"
  ON roadmap_files FOR SELECT USING (true);

CREATE POLICY "roadmap_files admin insert"
  ON roadmap_files FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "roadmap_files admin delete"
  ON roadmap_files FOR DELETE
  USING (auth.role() = 'authenticated');

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('roadmap-files', 'roadmap-files', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "roadmap files public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'roadmap-files');

CREATE POLICY "roadmap files admin upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'roadmap-files' AND auth.role() = 'authenticated');

CREATE POLICY "roadmap files admin delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'roadmap-files' AND auth.role() = 'authenticated');
