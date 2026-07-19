begin;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'candidate-cvs',
  'candidate-cvs',
  false,
  5242880,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anonymous candidates upload own CV" on storage.objects;
create policy "Anonymous candidates upload own CV"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'candidate-cvs'
  and coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = true
  and (storage.foldername(name))[1] = 'anonymous'
  and (storage.foldername(name))[2] = (select auth.uid())::text
  and lower(storage.extension(name)) in ('pdf', 'doc', 'docx')
);

drop policy if exists "CV owners and HR can read private CV" on storage.objects;
create policy "CV owners and HR can read private CV"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'candidate-cvs'
  and (
    (
      coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = true
      and (storage.foldername(name))[1] = 'anonymous'
      and (storage.foldername(name))[2] = (select auth.uid())::text
    )
    or
    (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'hr')
  )
);

drop policy if exists "CV owners and HR can delete private CV" on storage.objects;
create policy "CV owners and HR can delete private CV"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'candidate-cvs'
  and (
    (
      coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) = true
      and (storage.foldername(name))[1] = 'anonymous'
      and (storage.foldername(name))[2] = (select auth.uid())::text
    )
    or
    (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'hr')
  )
);

commit;
