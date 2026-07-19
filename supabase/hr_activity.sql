begin;

create table if not exists public.application_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 4000),
  created_by uuid not null default auth.uid(),
  created_by_email text default (auth.jwt() ->> 'email'),
  created_by_role text default (auth.jwt() -> 'app_metadata' ->> 'role'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists application_notes_application_created_idx
  on public.application_notes (application_id, created_at desc);

create table if not exists public.application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  event_type text not null check (event_type in ('created', 'status_changed', 'note_added')),
  from_status text,
  to_status text,
  actor_id uuid,
  actor_email text,
  actor_role text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists application_events_application_created_idx
  on public.application_events (application_id, created_at desc);

create or replace function public.capture_application_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_actor_id uuid := auth.uid();
  current_actor_email text := auth.jwt() ->> 'email';
  current_actor_role text := auth.jwt() -> 'app_metadata' ->> 'role';
begin
  if tg_op = 'INSERT' then
    insert into public.application_events (
      application_id,
      event_type,
      to_status,
      actor_id,
      actor_email,
      actor_role,
      metadata
    ) values (
      new.id,
      'created',
      new.status,
      current_actor_id,
      current_actor_email,
      current_actor_role,
      jsonb_build_object('audience', new.audience, 'source', new.source)
    );

    return new;
  end if;

  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    insert into public.application_events (
      application_id,
      event_type,
      from_status,
      to_status,
      actor_id,
      actor_email,
      actor_role
    ) values (
      new.id,
      'status_changed',
      old.status,
      new.status,
      current_actor_id,
      current_actor_email,
      current_actor_role
    );
  end if;

  return new;
end;
$$;

create or replace function public.capture_note_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.application_events (
    application_id,
    event_type,
    actor_id,
    actor_email,
    actor_role,
    metadata
  ) values (
    new.application_id,
    'note_added',
    new.created_by,
    new.created_by_email,
    new.created_by_role,
    jsonb_build_object('note_id', new.id)
  );

  return new;
end;
$$;

drop trigger if exists applications_capture_audit_event on public.applications;
create trigger applications_capture_audit_event
after insert or update of status on public.applications
for each row execute function public.capture_application_audit_event();

drop trigger if exists application_notes_capture_audit_event on public.application_notes;
create trigger application_notes_capture_audit_event
after insert on public.application_notes
for each row execute function public.capture_note_audit_event();

drop trigger if exists application_notes_set_updated_at on public.application_notes;
create trigger application_notes_set_updated_at
before update on public.application_notes
for each row execute function public.set_updated_at();

alter table public.application_notes enable row level security;
alter table public.application_events enable row level security;

revoke all on table public.application_notes from anon, authenticated;
revoke all on table public.application_events from anon, authenticated;

grant select, insert, update, delete on table public.application_notes to authenticated;
grant select on table public.application_events to authenticated;

drop policy if exists "HR team can read application notes" on public.application_notes;
create policy "HR team can read application notes"
on public.application_notes
for select
to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'hr')
);

drop policy if exists "HR team can create application notes" on public.application_notes;
create policy "HR team can create application notes"
on public.application_notes
for insert
to authenticated
with check (
  (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'hr')
  and created_by = (select auth.uid())
  and char_length(trim(body)) between 1 and 4000
);

drop policy if exists "HR team can update application notes" on public.application_notes;
create policy "HR team can update application notes"
on public.application_notes
for update
to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'hr')
)
with check (
  (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'hr')
);

drop policy if exists "HR team can delete application notes" on public.application_notes;
create policy "HR team can delete application notes"
on public.application_notes
for delete
to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'hr')
);

drop policy if exists "HR team can read application audit history" on public.application_events;
create policy "HR team can read application audit history"
on public.application_events
for select
to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'hr')
);

insert into public.application_events (
  application_id,
  event_type,
  to_status,
  metadata,
  created_at
)
select
  application.id,
  'created',
  application.status,
  jsonb_build_object(
    'audience', application.audience,
    'source', application.source,
    'backfilled', true
  ),
  application.created_at
from public.applications as application
where not exists (
  select 1
  from public.application_events as event
  where event.application_id = application.id
    and event.event_type = 'created'
);

comment on table public.application_notes is
  'Internal HR notes attached to candidate applications and employer requests.';

comment on table public.application_events is
  'Immutable application audit timeline generated by database triggers.';

commit;
