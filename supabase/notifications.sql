begin;

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.application_events(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  event_type text not null check (event_type in ('created', 'status_changed', 'note_added')),
  channel text not null check (channel in ('telegram', 'email')),
  recipient text not null,
  status text not null default 'processing' check (status in ('processing', 'sent', 'failed', 'skipped')),
  attempts integer not null default 1 check (attempts > 0),
  provider_message_id text,
  error_message text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (event_id, channel, recipient)
);

create index if not exists notification_deliveries_application_created_idx
  on public.notification_deliveries (application_id, created_at desc);

create index if not exists notification_deliveries_status_created_idx
  on public.notification_deliveries (status, created_at desc);

drop trigger if exists notification_deliveries_set_updated_at on public.notification_deliveries;
create trigger notification_deliveries_set_updated_at
before update on public.notification_deliveries
for each row execute function public.set_updated_at();

alter table public.notification_deliveries enable row level security;

revoke all on table public.notification_deliveries from anon, authenticated;
grant select on table public.notification_deliveries to authenticated;
grant all on table public.notification_deliveries to service_role;

drop policy if exists "HR team can read notification deliveries" on public.notification_deliveries;
create policy "HR team can read notification deliveries"
on public.notification_deliveries
for select
to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'hr')
);

comment on table public.notification_deliveries is
  'Server-side Telegram and email delivery attempts for IDEGLI application events.';

comment on column public.notification_deliveries.payload is
  'Sanitized notification metadata. CV files and full sensitive form payloads must not be stored here.';

commit;
