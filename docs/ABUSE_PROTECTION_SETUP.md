# IDEGLI Turnstile we rate-limit goragy

Ähli public production arzalary `submit-application` Supabase Edge Function arkaly geçýär.

## Gorag akymy

```text
React formasy
    ↓
Cloudflare Turnstile tokeni
    ↓
submit-application Edge Function
    ↓
Server-side Siteverify
    ↓
IP/contact hash rate-limit
    ↓
Täze CV upload ýa-da profil CV copy
    ↓
Private applications INSERT
```

## 1. Cloudflare Turnstile widget

Cloudflare Dashboard → Turnstile → Add widget:

```text
Widget name: IDEGLI application forms
Widget mode: Managed
Hostnames:
- stoun05.github.io
- localhost
```

Site key public, Secret key bolsa diňe Supabase Edge Function secrets-de saklanýar.

## 2. GitHub Pages site key

GitHub repository → Settings → Secrets and variables → Actions → Variables:

```text
VITE_TURNSTILE_SITE_KEY=<PUBLIC_SITE_KEY>
```

Lokal `.env`:

```env
VITE_TURNSTILE_SITE_KEY=YOUR_PUBLIC_SITE_KEY
```

Secret key-ni `VITE_*` üýtgeýjisine goýmaň.

## 3. SQL migration

```text
supabase/schema.sql
supabase/storage.sql
supabase/portal_accounts.sql
supabase/abuse_protection.sql
```

`abuse_protection.sql`:

- `submission_attempts` tablisany döredýär;
- raw IP, e-poçta ýa-da telefon saklamaýar;
- server-only pepper bilen SHA-256 hash saklaýar;
- `accepted`, `captcha_failed`, `rate_limited`, `validation_failed`, `server_failed` outcome-laryny ulanýar;
- diňe admin roluna anti-abuse log-y okatýar;
- köne ýazgylary arassalamak üçin `cleanup_submission_attempts()` döredýär.

## 4. Edge Function secret-lary

```text
TURNSTILE_SECRET_KEY=YOUR_PRIVATE_SECRET_KEY
RATE_LIMIT_PEPPER=LONG_RANDOM_PRIVATE_VALUE
ALLOWED_SITE_ORIGINS=https://stoun05.github.io,http://localhost:5173
TURNSTILE_ALLOWED_HOSTNAMES=stoun05.github.io,localhost
IP_LIMIT_PER_HOUR=8
CONTACT_LIMIT_PER_DAY=3
```

`ALLOWED_SITE_ORIGINS` həm `submit-application`, həm `portal-profile` tarapyndan ulanylýar.

Production:

```text
ALLOWED_SITE_ORIGINS=https://stoun05.github.io
TURNSTILE_ALLOWED_HOSTNAMES=stoun05.github.io
```

## 5. Edge Function deployment

```bash
supabase functions deploy submit-application --project-ref YOUR_PROJECT_REF
supabase functions deploy portal-profile --project-ref YOUR_PROJECT_REF
supabase functions deploy notify-hr --project-ref YOUR_PROJECT_REF
```

GitHub → Actions → `Deploy Supabase Functions` workflow-y üç function-y hem deploy edýär:

```text
submit-application
portal-profile
notify-hr
```

`portal-profile` Turnstile ulanmaýar; ol authenticated JWT we candidate account type bilen goralýar. `submit-application` bolsa Turnstile we rate-limit barlaglaryny hökmany geçirýär.

## 6. Rate-limit düzgünleri

```text
Bir IP:       8 synanyşyk / 1 sagat
Bir kontakt:  3 synanyşyk / 24 sagat
```

Çäkden geçilende:

```text
HTTP 429
Retry-After: 3600
code: rate_limited
```

jogaby berilýär.

## 7. Turnstile token düzgünleri

Widget `action: idegli_application` bilen render edilýär. Edge Function:

- `success=true`;
- `action=idegli_application`;
- rugsat edilen hostname

barlaglaryny geçirýär. Token her iberişden soň reset edilýär.

## 8. CV akymy

Täze CV saýlanan bolsa:

1. Turnstile tassyklanýar.
2. Rate-limit barlanýar.
3. CV `candidate-cvs/applications/<application-id>/...` ýoluna upload edilýär.
4. Arza PostgreSQL-e ýazylýar.
5. INSERT şowsuz bolsa CV pozulýar.

Kabinetdäki profil CV saýlanan bolsa:

1. Portal JWT we candidate account type barlanýar.
2. Database-däki profil CV ýolunyň user ID prefiksi barlanýar.
3. CV application ýoluna server-side copy edilýär.
4. INSERT şowsuz bolsa nusga pozulýar.

Public ulanyjy Storage-a göni upload edip bilmeýär.

## 9. Periodik arassalama

```sql
select public.cleanup_submission_attempts(30);
```

Production-da Supabase Cron arkaly her gün işletmek maslahat berilýär.

## 10. Test

1. SQL faýllaryny işlediň.
2. Function secret-laryny goşuň.
3. Üç function-y deploy ediň.
4. GitHub variable hökmünde site key goşuň.
5. Turnstile tamamlanmazdan public forma iberişiniň saklanýandygyny barlaň.
6. Dogry token bilen kandidat we iş beriji arzalaryny barlaň.
7. Girişli kandidat üçin profile CV copy akymyny barlaň.
8. `submission_attempts` içinde diňe hash maglumatlarynyň bardygyny barlaň.
9. HTTP 429 jogabyny barlaň.
10. Public direct applications INSERT we Storage upload synanyşyklarynyň ret edilýändigini barlaň.
