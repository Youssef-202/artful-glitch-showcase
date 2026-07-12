DROP POLICY IF EXISTS "Media direct file access" ON storage.objects;
DROP POLICY IF EXISTS "Avatars direct file access" ON storage.objects;

CREATE POLICY "Media direct file access"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Avatars direct file access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');