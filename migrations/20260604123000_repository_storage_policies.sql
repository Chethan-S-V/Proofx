CREATE POLICY "repository_files_select_policy"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'repository-files'
  AND EXISTS (
    SELECT 1
    FROM public.repositories
    LEFT JOIN public.repository_members
      ON repository_members.repository_id = repositories.id
      AND repository_members.user_id = auth.uid()
    WHERE repositories.id = split_part(storage.objects.name, '/', 1)::uuid
      AND (
        repositories.visibility IN ('public', 'unlisted')
        OR repositories.owner_id = auth.uid()
        OR repository_members.id IS NOT NULL
      )
  )
);
--> statement-breakpoint
CREATE POLICY "repository_files_insert_policy"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'repository-files'
  AND EXISTS (
    SELECT 1
    FROM public.repositories
    LEFT JOIN public.repository_members
      ON repository_members.repository_id = repositories.id
      AND repository_members.user_id = auth.uid()
    WHERE repositories.id = split_part(storage.objects.name, '/', 1)::uuid
      AND (
        repositories.owner_id = auth.uid()
        OR repository_members.role IN ('owner', 'maintainer', 'contributor')
      )
  )
);
--> statement-breakpoint
CREATE POLICY "repository_files_update_policy"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'repository-files'
  AND EXISTS (
    SELECT 1
    FROM public.repositories
    LEFT JOIN public.repository_members
      ON repository_members.repository_id = repositories.id
      AND repository_members.user_id = auth.uid()
    WHERE repositories.id = split_part(storage.objects.name, '/', 1)::uuid
      AND (
        repositories.owner_id = auth.uid()
        OR repository_members.role IN ('owner', 'maintainer', 'contributor')
      )
  )
)
WITH CHECK (
  bucket_id = 'repository-files'
  AND EXISTS (
    SELECT 1
    FROM public.repositories
    LEFT JOIN public.repository_members
      ON repository_members.repository_id = repositories.id
      AND repository_members.user_id = auth.uid()
    WHERE repositories.id = split_part(storage.objects.name, '/', 1)::uuid
      AND (
        repositories.owner_id = auth.uid()
        OR repository_members.role IN ('owner', 'maintainer', 'contributor')
      )
  )
);
--> statement-breakpoint
CREATE POLICY "repository_files_delete_policy"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'repository-files'
  AND EXISTS (
    SELECT 1
    FROM public.repositories
    LEFT JOIN public.repository_members
      ON repository_members.repository_id = repositories.id
      AND repository_members.user_id = auth.uid()
    WHERE repositories.id = split_part(storage.objects.name, '/', 1)::uuid
      AND (
        repositories.owner_id = auth.uid()
        OR repository_members.role IN ('owner', 'maintainer')
      )
  )
);
