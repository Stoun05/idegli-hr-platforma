# IDEGLI Supabase sazlamasy

Bu görkezme public formalary, kandidat/iş beriji kabinetlerini, reusable kandidat anketasyny, private CV Storage-i, Turnstile/rate-limit goragyny, remote admin panelini, HR audit taryhyny we Telegram/e-poçta habarnamalaryny sazlamak üçin niýetlenendir.

## 1. Supabase proýekti

Supabase Dashboard-da täze proýekt dörediň. Database parolyny ygtybarly ýerde saklaň.

Anonymous Sign-Ins gerek däl. Public arzalar `submit-application`, kandidat anketa/CV hereketleri `portal-profile`, kabinet girişleri bolsa email/password Supabase Auth arkaly işleýär.

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
- `storage.sql` — private `candidate-cvs` bucket;
- `portal_accounts.sql` — portal profilleri, `owner_id`, kandidat reusable anketa/CV metadata we own-data RLS;
- `hr_activity.sql` — HR bellikleri we audit timeline;
- `notifications.sql` — Telegram/e-poçta delivery log;
- `abuse_protection.sql` — hash rate-limit log-y;
- `assign_admin_role.sql` — Auth ulanyjysyna `admin` ýa-da `hr` roly.

Täzelenen `portal_accounts.sql` öň işledilen proýektde hem `add column if not exists` arkaly kandidat profil meýdanlaryny goşýar.

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
SUPABASE_ACCESS_TOKEN
SUPABASE_PROJECT_ID
```

Repository variables:

```text
VITE_TURNSTILE_SITE_KEY
VITE_ENABLE_LOCAL_ADMIN_MIRROR=false
```

Private açarlar frontend-e goýulmaýar.

## 4. Kandidat we iş beriji kabinetleri

Doly görkezme:

```text
docs/PORTAL_SETUP.md
```

Authentication → URL Configuration:

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
- diňe öz profilini we `owner_id = auth.uid()` bolan arzalary görkezýär;
- girişli ulanyjynyň täze formasyny hasabyna baglaýar;
- kandidat anketasyny we esasy CV-ni gaýtadan ulanýar.

## 5. Reusable kandidat anketa we CV

`portal_profiles` içinde:

```text
candidate_role
candidate_experience_key
candidate_languages
candidate_salary
candidate_message
candidate_cv_metadata
```

saklanýar.

`portal-profile` Edge Function:

- portal JWT-ni barlaýar;
- diňe kandidat hasabyna rugsat berýär;
- CV-ni `candidate-cvs/profiles/<user-id>/...` ýoluna upload edýär;
- replace/delete lifecycle-y dolandyrýar;
- browser-e service role ýa-da direct Storage upload rugsady bermeýär.

Public kandidat formasy portal sessiýasyny tapsa anketa maglumatlaryny boş meýdanlara doldurýar. Kabinetdäki CV saýlansa `submit-application` ony `candidate-cvs/applications/<application-id>/...` ýoluna aýratyn copy edýär.

## 6. Turnstile we rate-limit

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

`ALLOWED_SITE_ORIGINS` hem `portal-profile`, hem `submit-application` tarapyndan ulanylýar.

## 7. CV Storage

Doly görkezme:

```text
docs/CV_STORAGE_SETUP.md
```

```text
Profil CV:      candidate-cvs/profiles/<user-id>/<random-id>.<ext>
Application CV: candidate-cvs/applications/<application-id>/<random-id>.<ext>
```

Application profil CV-niň özbaşdak private nusgasyny alýar.

## 8. Admin Auth

```text
docs/ADMIN_AUTH_SETUP.md
```

Admin rugsady `app_metadata.role`, portal görnüşi bolsa `portal_profiles.account_type` arkaly saklanýar.

## 9. HR bellikleri we audit

```text
docs/HR_ACTIVITY_SETUP.md
```

Public we portal ulanyjylary içerki HR maglumatlaryny okap bilmeýär.

## 10. Telegram we e-poçta

```text
docs/NOTIFICATIONS_SETUP.md
```

```text
application_events INSERT
        ↓
Database Webhook
        ↓
notify-hr Edge Function
        ↓
Telegram + Resend
```

## 11. Edge Functions deployment

Function-lar:

```text
submit-application
portal-profile
notify-hr
```

CLI:

```bash
supabase functions deploy submit-application --project-ref YOUR_PROJECT_REF
supabase functions deploy portal-profile --project-ref YOUR_PROJECT_REF
supabase functions deploy notify-hr --project-ref YOUR_PROJECT_REF
```

Ýa-da GitHub Actions-daky manual `Deploy Supabase Functions` workflow-y üç function-y hem deploy edýär.

Täzelenen kandidat profil tapgyry üçin `portal-profile` ilkinji gezek, `submit-application` bolsa täzeden deploy edilmeli.

## 12. Režimler

### Supabase sazlanmadyk bolsa

- formalar localStorage-a ýazylýar;
- `#/admin` lokal demo panelini açýar;
- `#/portal` konfigurasiýa habaryny görkezýär;
- reusable kandidat anketa/CV, Turnstile, remote admin, audit we habarnamalar işlemeýär.

### Supabase sazlanan bolsa

- public forma Turnstile bilen goralýar;
- arza `submit-application` arkaly geçýär;
- kandidat anketa/CV `portal-profile` arkaly dolandyrylýar;
- girişli kandidat üçin autofill we profile CV copy işleýär;
- CV private Storage-da saklanýar;
- admin panel Auth, app role we RLS bilen goralýar.

## 13. Barlaýyş

1. SQL faýllaryny görkezilen tertipde işlediň.
2. Auth Site URL we Redirect URLs sazlaň.
3. Frontend maglumatlaryny GitHub-a goşuň.
4. Edge Function secret-laryny Supabase-a goşuň.
5. Üç Edge Function-y deploy ediň.
6. Kandidat hasaby bilen giriş ediň.
7. Kandidat anketasyny dolduryň we CV goşuň.
8. Public formadaky autofill-i barlaň.
9. Profil CV bilen arza iberiň.
10. Profil we application Storage ýollarynyň aýrydygyny barlaň.
11. Application `owner_id`, `cv_metadata.source` we RLS-i barlaň.
12. Admin panelde CV, bellik, taryh we delivery statuslaryny barlaň.
