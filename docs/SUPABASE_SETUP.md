# IDEGLI Supabase sazlamasy

Bu görkezme public formalary, private CV Storage-i, Turnstile/rate-limit goragyny, remote admin panelini, HR audit taryhyny we Telegram/e-poçta habarnamalaryny sazlamak üçin niýetlenendir.

## 1. Supabase proýekti

Supabase Dashboard-da täze proýekt dörediň. Database parolyny ygtybarly ýerde saklaň.

Anonymous Sign-Ins indi gerek däl. Public kandidat we iş beriji arzalary `submit-application` Edge Function service role arkaly kabul edilýär.

## 2. SQL tertibi

SQL Editor-de şu tertipde işlediň:

```text
supabase/schema.sql
supabase/storage.sql
supabase/hr_activity.sql
supabase/notifications.sql
supabase/abuse_protection.sql
supabase/assign_admin_role.sql
```

- `schema.sql` — applications tablisa, statuslar we diňe HR/admin RLS;
- `storage.sql` — private `candidate-cvs` bucket, diňe HR/admin read/delete;
- `hr_activity.sql` — HR bellikleri we audit timeline;
- `notifications.sql` — Telegram/e-poçta delivery log;
- `abuse_protection.sql` — hash rate-limit synanyşyk log-y;
- `assign_admin_role.sql` — Auth ulanyjysyna `admin` ýa-da `hr` roly.

`schema.sql` we `storage.sql` public direct INSERT/upload rugsatlaryny aýyrýar. Production ýazgylary diňe Edge Function tarapyndan döredilýär.

## 3. Frontend maglumatlary

Lokal `.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
VITE_TURNSTILE_SITE_KEY=YOUR_PUBLIC_TURNSTILE_SITE_KEY
VITE_ENABLE_LOCAL_ADMIN_MIRROR=false
```

GitHub Actions:

Repository secrets:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Repository variables:

```text
VITE_TURNSTILE_SITE_KEY
VITE_ENABLE_LOCAL_ADMIN_MIRROR=false
```

Turnstile site key public bolýar. Turnstile secret, service role, Telegram tokeni ýa-da Resend key frontend-e goýulmaýar.

## 4. Turnstile we rate-limit

Doly görkezme:

```text
docs/ABUSE_PROTECTION_SETUP.md
```

Edge Function secret-lary:

```text
TURNSTILE_SECRET_KEY
RATE_LIMIT_PEPPER
ALLOWED_SITE_ORIGINS
TURNSTILE_ALLOWED_HOSTNAMES
IP_LIMIT_PER_HOUR
CONTACT_LIMIT_PER_DAY
```

Production form akymy:

```text
Turnstile → Siteverify → hash rate-limit → private CV upload → applications INSERT
```

## 5. CV Storage

Doly görkezme:

```text
docs/CV_STORAGE_SETUP.md
```

Kandidat CV-si:

```text
candidate-cvs/applications/<application-id>/<random-id>.<ext>
```

ýoluna service role arkaly ýüklenýär. DB INSERT şowsuz bolsa faýl yzyna pozulýar. HR/admin private JWT bilen download/delete edýär.

## 6. Admin Auth

Doly görkezme:

```text
docs/ADMIN_AUTH_SETUP.md
```

1. Authentication → Users bölüminde admin ulanyjysyny dörediň.
2. `assign_admin_role.sql` içindäki e-poçtany we roly üýtgediň.
3. SQL-ni işlediň.
4. Ulanyjy çykyp, täzeden giriş etsin.

## 7. HR bellikleri we audit

```text
docs/HR_ACTIVITY_SETUP.md
```

Remote admin panelde bellik, status taryhy, awtor, rol we wagt görkezilýär. Public ulanyjy bu maglumatlary okap bilmeýär.

## 8. Telegram we e-poçta

```text
docs/NOTIFICATIONS_SETUP.md
```

Akym:

```text
application_events INSERT
        ↓
Database Webhook
        ↓
notify-hr Edge Function
        ↓
Telegram + Resend
```

## 9. Edge Functions deployment

Function-lar:

```text
submit-application
notify-hr
```

CLI:

```bash
supabase functions deploy submit-application --project-ref YOUR_PROJECT_REF
supabase functions deploy notify-hr --project-ref YOUR_PROJECT_REF
```

Ýa-da GitHub Actions-daky manual `Deploy Supabase Functions` workflow-y ulanyň.

Gerekli GitHub secrets:

```text
SUPABASE_ACCESS_TOKEN
SUPABASE_PROJECT_ID
```

## 10. Režimler

### Supabase sazlanmadyk bolsa

- formalar localStorage-a ýazylýar;
- `#/admin` lokal demo panelini açýar;
- CV-niň diňe metadata-sy saklanýar;
- Turnstile, remote admin, audit we habarnamalar işlemeýär.

### Supabase sazlanan bolsa

- public forma diňe Turnstile site key hem sazlanan ýagdaýynda açyk bolýar;
- arza `submit-application` Edge Function arkaly geçýär;
- rate-limit we server-side Siteverify hökmany;
- CV private Storage-a ýüklenýär;
- admin panel Supabase Auth we RLS bilen goralýar;
- audit we notification delivery taryhy görünýär.

## 11. Barlaýyş

1. SQL faýllaryny görkezilen tertipde işlediň.
2. Cloudflare Turnstile widget dörediň.
3. Frontend site key we Supabase maglumatlaryny GitHub-a goşuň.
4. Edge Function secret-laryny Supabase-a goşuň.
5. Iki Edge Function-y deploy ediň.
6. Admin hasaby we rol dörediň.
7. Notification Database Webhook dörediň.
8. Kandidat we iş beriji formalaryny barlaň.
9. `submission_attempts` içinde raw IP/contact ýokdugyny barlaň.
10. Public direct applications INSERT we Storage upload synanyşyklarynyň ret edilýändigini barlaň.
11. Admin panelde CV, bellik, taryh we delivery statuslaryny barlaň.
