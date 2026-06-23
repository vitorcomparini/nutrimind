
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS thumbnail_url text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-thumbnails', 'lesson-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read lesson thumbs"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson-thumbnails');

CREATE POLICY "Admin upload lesson thumbs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'lesson-thumbnails' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin update lesson thumbs"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'lesson-thumbnails' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin delete lesson thumbs"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'lesson-thumbnails' AND public.has_role(auth.uid(), 'admin'));
