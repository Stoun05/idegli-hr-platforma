# IDEGLI Turnstile we rate-limit goragy

Bu tapgyr public kandidat we iş beriji formalaryny göni PostgreSQL/Storage-a ibermekden aýyrýar. Ähli production arzalary `submit-application` Supabase Edge Function arkaly geçýär.

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
Private CV upload + applications INSERT
```

## 1. Cloudflare Turnstile widget döretmek

Cloudflare Dashboard → Turnstile → Add widget:

```text
Widget name: IDEGLI application forms
Widget mode: Managed
Hostnames:
- stoun05.github.io
- localhost          # diňe lokal test üçin
```

Iki açar berilýär:

- Site key — public, frontendde ulanylýar;
- Secret key — private, diňe Supabase Edge Function secrets-de saklanýar.

## 2. GitHub Pages site key

GitHub repository → Settings → Secrets and variables → Actions → Variables:

```text
VITE_TURNSTILE_SITE_KEY=<PUBLIC_SITE_KEY>
```

Bu secret däl; widget site key brauzerde görünýär. Secret key-ni GitHub Pages ýa-da `VITE_*` üýtgeýjisine goýmaň.

Lokal `.env`:

```env
VITE_TURNSTILE_SITE_KEY=YOUR_PUBLIC_SITE_KEY
```

## 3. SQL migration

Supabase SQL Editor-de esasy SQL faýllaryndan soň işlediň:

```text
supabase/abuse_protection.sql
```

Bu faýl:

- `submission_attempts` tablisany döredýär;
- raw IP, e-poçta ýa-da telefon saklamaýar;
- IP we kontakt üçin server-only pepper bilen SHA-256 hash saklaýar;
- outcome hökmünde `accepted`, `captcha_failed`, `rate_limited`, `validation_failed`, `server_failed` ulanýar;
- diňe `admin` roluna anti-abuse log-y okatýar;
- 30 günden köne ýazgylary arassalamak üçin `cleanup_submission_attempts()` funksiýasyny döredýär.

Täzelenen `schema.sql` we `storage.sql` hem gaýtadan işledilmeli. Olar public direct INSERT/upload syýasatlaryny aýyrýar; täze ýazgylar diňe Edge Function service role arkaly döredilýär.

## 4. Edge Function secret-lary

Supabase Edge Functions → Secrets:

```text
TURNSTILE_SECRET_KEY=YOUR_PRIVATE_SECRET_KEY
RATE_LIMIT_PEPPER=LONG_RANDOM_PRIVATE_VALUE
ALLOWED_SITE_ORIGINS=https://stoun05.github.io,http://localhost:5173
TURNSTILE_ALLOWED_HOSTNAMES=stoun05.github.io,localhost
IP_LIMIT_PER_HOUR=8
CONTACT_LIMIT_PER_DAY=3
```

`RATE_LIMIT_PEPPER` uzyn we tötänleýin bolmaly. Ony üýtgetmek öňki hash ýazgylary bilen täze ýazgylaryň deňeşdirilmegini bes eder.

Production-da localhost bahalaryny aýyrmak bolýar:

```text
ALLOWED_SITE_ORIGINS=https://stoun05.github.io
TURNSTILE_ALLOWED_HOSTNAMES=stoun05.github.io
```

## 5. Edge Function deployment

CLI:

```bash
supabase functions deploy submit-application --project-ref YOUR_PROJECT_REF
```

Ýa-da GitHub → Actions → `Deploy Supabase Functions` → `Run workflow`.

Workflow iki function-y hem deploy edýär:

```text
submit-application
notify-hr
```

## 6. Rate-limit düzgünleri

Default çäkler:

```text
Bir IP:       8 synanyşyk / 1 sagat
Bir kontakt:  3 synanyşyk / 24 sagat
```

Kontakt hash-i normalizirlenen e-poçta + telefon kombinasiýasyndan döredilýär. Raw bahalar anti-abuse tablisada saklanmaýar.

Çäkden geçilende endpoint:

```text
HTTP 429
Retry-After: 3600
code: rate_limited
```

jogabyny berýär. Frontend ulanyja bir sagatdan soň täzeden synanyşmagy aýdýar.

## 7. Turnstile token düzgünleri

Widget `action: idegli_application` bilen render edilýär. Edge Function Siteverify jogabynda:

- `success=true`;
- `action=idegli_application`;
- rugsat edilen hostname

barlaglaryny geçirýär.

Token her iberişden soň reset edilýär. Möhleti gutaran ýa-da öň ulanylan token täzeden kabul edilmeýär.

## 8. CV akymy

Kandidat formasynda:

1. Turnstile serverde tassyklanýar.
2. Rate-limit barlanýar.
3. CV service role arkaly private `candidate-cvs/applications/<application-id>/...` ýoluna ýüklenýär.
4. Arza PostgreSQL-e ýazylýar.
5. DB INSERT şowsuz bolsa CV awtomatik pozulýar.

Public ulanyjy Storage-a göni upload edip bilmeýär.

## 9. Periodik arassalama

SQL Editor-den el bilen:

```sql
select public.cleanup_submission_attempts(30);
```

Production-da Supabase Cron arkaly her gün işletmek maslahat berilýär. Funksiýa 1–365 gün retention kabul edýär.

## 10. Test

Cloudflare-nyň resmi test site/secret key-laryny staging ýa-da lokal test üçin ulanyň. Production secret bilen test tokeni, test secret bilen production tokeni kabul edilmeýär.

Barlaýyş:

1. `schema.sql`, `storage.sql`, `abuse_protection.sql` işlediň.
2. Function secret-laryny goşuň.
3. `submit-application` deploy ediň.
4. GitHub variable hökmünde site key goşuň.
5. GitHub Pages deployment tamamlanandan soň formany açyň.
6. Turnstile tamamlanmazdan iberişiň saklanýandygyny barlaň.
7. Dogry token bilen kandidat we iş beriji arzalaryny barlaň.
8. `submission_attempts` tablisada diňe hash maglumatlarynyň bardygyny barlaň.
9. Çäkden geçip HTTP 429 we frontend habaryny barlaň.
10. Public REST arkaly `applications` INSERT we Storage upload synanyşygynyň RLS/grant sebäpli ret edilýändigini barlaň.
