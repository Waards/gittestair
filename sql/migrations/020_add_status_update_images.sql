-- Migration: Add status update images + storage bucket
-- Stores photo evidence per status update (proof of completion / cause of delay or failure)

ALTER TABLE installations
ADD COLUMN IF NOT EXISTS update_images JSONB DEFAULT '[]'::jsonb;

ALTER TABLE repairs
ADD COLUMN IF NOT EXISTS update_images JSONB DEFAULT '[]'::jsonb;

ALTER TABLE maintenance
ADD COLUMN IF NOT EXISTS update_images JSONB DEFAULT '[]'::jsonb;

-- Public storage bucket for job status images
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-images', 'job-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies: public read, authenticated admins can upload/update/delete
CREATE POLICY "Public read job images" ON storage.objects
  FOR SELECT USING (bucket_id = 'job-images');

CREATE POLICY "Authenticated upload job images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'job-images');

CREATE POLICY "Authenticated update job images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'job-images');

CREATE POLICY "Authenticated delete job images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'job-images');
