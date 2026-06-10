INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('profile-media', 'profile-media', true, 1000000, ARRAY['image/jpeg'])
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
--> statement-breakpoint
CREATE POLICY "profile_media_select_policy"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-media');
--> statement-breakpoint
CREATE POLICY "profile_media_insert_policy"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-media'
  AND auth.uid()::text = split_part(storage.objects.name, '/', 1)
);
--> statement-breakpoint
CREATE POLICY "profile_media_update_policy"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-media'
  AND auth.uid()::text = split_part(storage.objects.name, '/', 1)
)
WITH CHECK (
  bucket_id = 'profile-media'
  AND auth.uid()::text = split_part(storage.objects.name, '/', 1)
);
--> statement-breakpoint
CREATE POLICY "profile_media_delete_policy"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-media'
  AND auth.uid()::text = split_part(storage.objects.name, '/', 1)
);
