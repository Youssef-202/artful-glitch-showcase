
DROP POLICY IF EXISTS "Media direct file access" ON storage.objects;
DROP POLICY IF EXISTS "Avatars direct file access" ON storage.objects;

CREATE POLICY "Admins can list media" ON storage.objects
FOR SELECT USING (bucket_id = 'media' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can list avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own avatar" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);
