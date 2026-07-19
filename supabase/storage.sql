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
drop policy if exists "CV owners and HR can read private CV" on storage.objects;
drop policy if exists "CV owners and HR can delete private CV" on storage.objects;
drop policy if exists "HR team can read private CV" on storage.objects;
drop policy if exists "HR team can delete private CV" on storage.objects;

create policy "HR team can read private CV"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'candidate-cvs'
  and (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'hr')
);

create policy "HR team can delete private CV"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'candidate-cvs'
  and (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'hr')
);

comment on table storage.objects is
  'Candidate CV uploads are created only by the protected Edge Function service role; HR access remains protected by Storage RLS.';

commit;
