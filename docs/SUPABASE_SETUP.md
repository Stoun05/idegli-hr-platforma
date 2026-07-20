# IDEGLI Supabase sazlamasy

Bu görkezme public formalary, kandidat/iş beriji kabinetlerini, private CV Storage-i, Turnstile/rate-limit goragyny, remote admin panelini, HR audit taryhyny we Telegram/e-poçta habarnamalaryny sazlamak üçin niýetlenendir.

## 1. Supabase proýekti

Supabase Dashboard-da täze proýekt dörediň. Database parolyny ygtybarly ýerde saklaň.

Anonymous Sign-Ins gerek däl. Public arzalar `submit-application` Edge Function service role arkaly, kabinet hasaplary bolsa email/password Supabase Auth arkaly işleýär.

## 2. SQL tertibi

SQL Editor-de şu tertipde işlediň:

```text
supabase/schema.sql
supabase/storage.sql
supabase/portal_accounts.sql
supabase/hr_activity.sql
supabase/notifications.sql
supabase/abuse_protection.sql
supabase/assign_admin_role.sql
```

- `schema.sql` — applications tablisa, statuslar we HR/admin RLS;
- `storage.sql` — private `candidate-cvs` bucket, diňe HR/admin read/delete;
- `portal_accounts.sql` — kandidat/iş beriji profilleri, `owner_id`, Auth trigger we own-data RLS;
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

GitHub Actions repository secrets:

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

## 4. Kandidat we iş beriji kabinetleri

Doly görkezme:

```text
docs/PORTAL_SETUP.md
```

Supabase Dashboard → Authentication → URL Configuration:

```text
Site URL:
https://stoun05.github.io/idegli-hr-platforma/

Redirect URLs:
https://stoun05.github.io/idegli-hr-platforma/**
http://localhost:5173/**
```

Kabinet:

- `#/portal` arkaly açylýar;
- `candidate` we `employer` hasaplaryny döredýär;
- öz profilini we diňe `owner_id = auth.uid()` bolan arzalary görkezýär;
- girişli ulanyjynyň täze formasyny Edge Function arkaly hasabyna baglaýar;
- guest arzalary `owner_id = null` ýagdaýynda kabul edýär.

## 5. Turnstile we rate-limit

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

Production forma akymy:

```text
Optional portal JWT → Turnstile → Siteverify → hash rate-limit → private CV upload → applications INSERT
```

## 6. CV Storage

Doly görkezme:

```text
docs/CV_STORAGE_SETUP.md
```

Kandidat CV-si:

```text
candidate-cvs/applications/<application-id>/<random-id>.<ext>
```

ýoluna service role arkaly ýüklenýär. DB INSERT şowsuz bolsa faýl yzyna pozulýar. HR/admin private JWT bilen download/delete edýär.

## 7. Admin Auth

Doly görkezme:

```text
docs/ADMIN_AUTH_SETUP.md
```

1. Authentication → Users bölüminde admin ulanyjysyny dörediň.
2. `assign_admin_role.sql` içindäki e-poçtany we roly üýtgediň.
3. SQL-ni işlediň.
4. Ulanyjy çykyp, täzeden giriş etsin.

Admin/HR hasaby portal hasabyndan aýratyn roldur. Admin rugsady `app_metadata.role`, portal görnüşi bolsa `portal_profiles.account_type` arkaly saklanýar.

## 8. HR bellikleri we audit

```text
docs/HR_ACTIVITY_SETUP.md
```

Remote admin panelde bellik, status taryhy, awtor, rol we wagt görkezilýär. Public we portal ulanyjylary içerki HR maglumatlaryny okap bilmeýär.

## 9. Telegram we e-poçta

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

## 10. Edge Functions deployment

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

`portal_accounts.sql` goşulandan soň `submit-application` täzeden deploy edilmeli, sebäbi ol portal JWT-ni we account type maglumatyny barlaýar.

## 11. Režimler

### Supabase sazlanmadyk bolsa

- formalar localStorage-a ýazylýar;
- `#/admin` lokal demo panelini açýar;
- `#/portal` konfigurasiýa habaryny görkezýär;
- CV-niň diňe metadata-sy saklanýar;
- Turnstile, remote admin, kabinet, audit we habarnamalar işlemeýär.

### Supabase sazlanan bolsa

- public forma diňe Turnstile site key hem sazlanan ýagdaýynda açyk bolýar;
- arza `submit-application` Edge Function arkaly geçýär;
- girişli portal ulanyjynyň JWT-si serverde täzeden barlanýar;
- rate-limit we server-side Siteverify hökmany;
- CV private Storage-a ýüklenýär;
- `#/portal` öz profilini we öz arzalaryny görkezýär;
- `#/admin` Supabase Auth, app role we RLS bilen goralýar;
- audit we notification delivery taryhy görünýär.

## 12. Barlaýyş

1. SQL faýllaryny görkezilen tertipde işlediň.
2. Auth Site URL we Redirect URLs sazlaň.
3. Cloudflare Turnstile widget dörediň.
4. Frontend site key we Supabase maglumatlaryny GitHub-a goşuň.
5. Edge Function secret-laryny Supabase-a goşuň.
6. Iki Edge Function-y deploy ediň.
7. Kandidat we iş beriji portal hasaplaryny dörediň.
8. Kabinet sessiýasy açyk wagty degişli formalary iberiň.
9. `applications.owner_id` we own-data RLS-i barlaň.
10. Admin hasaby we rol dörediň.
11. Notification Database Webhook dörediň.
12. `submission_attempts` içinde raw IP/contact ýokdugyny barlaň.
13. Public direct applications INSERT we Storage upload synanyşyklarynyň ret edilýändigini barlaň.
14. Admin panelde CV, bellik, taryh we delivery statuslaryny barlaň.
