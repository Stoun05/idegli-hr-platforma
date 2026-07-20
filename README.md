# IDEGLI HR Platforma

IDEGLI üçin işgär saýlap-seçiş, Executive Search, karýera konsultasiýasy, kandidat arzalary we iş beriji sargytlaryny bir ýerde dolandyrýan iki dilli HR web-platforma.

## Esasy mümkinçilikler

### Public web-saýt

- Türkmen we rus dilleri;
- premium, mobil enjamlara uýgun baş sahypa;
- Recruitment, Executive Search we karýera konsultasiýasy;
- gözleg we filtrler bilen wakansiýalar katalogy;
- wakansiýanyň giňişleýin maglumat paneli;
- saýlanan wakansiýany kandidat formasyna geçirmek;
- “Biz barada”, iş prosesi we kontakt bölümleri.

### Kandidat we iş beriji formalary

- giňişleýin kandidat maglumatlary we CV;
- iş beriji üçin kompaniýa, wakansiýa, iş formaty, aýlyk we möhlet maglumatlary;
- PDF, DOC we DOCX, iň köp 5 MB;
- Cloudflare Turnstile we server-side Siteverify;
- IP/contact hash rate-limit;
- production-da diňe Supabase Edge Function arkaly arza kabul etmek;
- girişli portal ulanyjysynyň täze arzasyny öz kabinetine baglamak;
- kandidat kabinet anketasyndan awtomatik doldurmak;
- kabinetdäki esasy CV-ni application üçin aýratyn private nusgalamak;
- Supabase sazlanmasa localStorage demo fallback.

### Kandidat we iş beriji şahsy kabinetleri

- `#/portal` arkaly giriş we registrasiýa;
- kandidat ýa-da iş beriji hasap görnüşi;
- email/password Supabase Auth;
- e-poçta tassyklama callback-i;
- access/refresh token sessiýasy;
- öz profilini görmek we redaktirlemek;
- diňe öz `owner_id` ýazgylaryny görmek;
- arza statusy, iberilen wagt we soňky täzelenme;
- kandidat üçin reusable anketa: wezipe, tejribe, diller, aýlyk we gysga maglumat;
- private esasy CV upload, replace we delete;
- anketa dolulygy görkezijisi;
- paroly dikeltmek we girişli hasapda paroly üýtgetmek;
- reauthentication nonce;
- e-poçtany üýtgetmek we tassyklama callback-i;
- RLS arkaly başga ulanyjynyň maglumatyndan izolýasiýa.

### Admin paneli

- Supabase Auth e-poçta/parol giriş sahypasy;
- diňe `admin` we `hr` rollary;
- kandidat we iş beriji arzalary;
- gözleg, görnüş we status filtrleri;
- status üýtgetmek, ýazgy we CV pozmak;
- private CV download;
- CSV eksporty;
- içerki HR bellikleri;
- database-trigger audit timeline;
- Telegram/e-poçta delivery statuslary.

### Habarnamalar

- täze kandidat arzasy;
- täze iş beriji sargydy;
- status üýtgeşmesi;
- islege görä HR belligi;
- Supabase Database Webhook → Edge Function;
- Telegram Bot API we Resend;
- delivery audit log we idempotency.

## Live salgylar

```text
Saýt:          https://stoun05.github.io/idegli-hr-platforma/
Şahsy kabinet: https://stoun05.github.io/idegli-hr-platforma/#/portal
Admin paneli:  https://stoun05.github.io/idegli-hr-platforma/#/admin
```

## Supabase production

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
VITE_TURNSTILE_SITE_KEY=YOUR_PUBLIC_SITE_KEY
VITE_ENABLE_LOCAL_ADMIN_MIRROR=false
```

Production arza akymy:

```text
React formasy
    ↓
Portal anketa autofill + optional profile CV
    ↓
Portal JWT — giriş edilen bolsa
    ↓
Cloudflare Turnstile
    ↓
submit-application Edge Function
    ↓
JWT/profile + Siteverify + hash rate-limit
    ↓
Profile CV copy ýa-da täze upload
    ↓
Private application CV + PostgreSQL owner_id
    ↓
Audit event + HR notification
```

Public ulanyja `applications` tablisasynda INSERT ýa-da `candidate-cvs` bucket-de upload rugsady berilmeýär. Server-side hereketleri diňe Edge Functions service role arkaly ýerine ýetirýär.

> `service_role`, `sb_secret_...`, Turnstile secret, Telegram tokeni we Resend key frontend ýa-da GitHub Pages build-e goýulmaýar.

## Supabase SQL tertibi

```text
supabase/schema.sql
supabase/storage.sql
supabase/portal_accounts.sql
supabase/hr_activity.sql
supabase/notifications.sql
supabase/abuse_protection.sql
supabase/assign_admin_role.sql
```

## Edge Functions

```text
supabase/functions/submit-application/index.ts
supabase/functions/portal-profile/index.ts
supabase/functions/notify-hr/index.ts
```

```bash
supabase functions deploy submit-application --project-ref YOUR_PROJECT_REF
supabase functions deploy portal-profile --project-ref YOUR_PROJECT_REF
supabase functions deploy notify-hr --project-ref YOUR_PROJECT_REF
```

Manual deployment workflow:

```text
.github/workflows/deploy-supabase-functions.yml
```

GitHub repository secrets:

```text
SUPABASE_ACCESS_TOKEN
SUPABASE_PROJECT_ID
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

GitHub repository variables:

```text
VITE_TURNSTILE_SITE_KEY
VITE_ENABLE_LOCAL_ADMIN_MIRROR=false
```

## Kandidat anketa we CV gurluşy

`portal_profiles` içinde:

```text
candidate_role
candidate_experience_key
candidate_languages
candidate_salary
candidate_message
candidate_cv_metadata
```

Storage ýollary:

```text
Profil CV:      candidate-cvs/profiles/<user-id>/<random-id>.<ext>
Application CV: candidate-cvs/applications/<application-id>/<random-id>.<ext>
```

Kabinetdäki CV arza iberilende application üçin aýratyn private copy döredilýär. Profil CV soň çalşyrylsa ýa-da aýrylsa, öňki arzalaryň CV nusgalary saklanýar.

## Portal Auth callback-lary

```text
?portal=callback   — registrasiýa we email-change tassyklamasy
?portal=recovery   — password recovery sahypasy
#/portal           — giriş we dashboard
```

## Portal howpsuzlygy

- `portal_profiles.id = auth.users.id`;
- `account_type` frontend tarapyndan üýtgedilmeýär;
- öz profilini diňe `auth.uid() = id` bolan ulanyjy görýär;
- öz arzalaryny diňe `applications.owner_id = auth.uid()` bolan ulanyjy görýär;
- kandidat anketa meýdanlaryna public REST update grant ýok;
- anketa/CV update-i `portal-profile` function JWT we account type barlagyndan geçirýär;
- profil CV ýoly şol ulanyjynyň `profiles/<user-id>/` prefiksi bilen barlanýar;
- kandidat hasaby diňe kandidat formasyny öz kabinetine baglap biler;
- guest arzalar `owner_id = null` bolup galýar;
- portal we admin sessiýalary aýratyn saklanýar;
- recovery token localStorage-da saklanmaýar;
- e-poçta üýtgetmezden öň häzirki parol täzeden barlanýar.

## Turnstile we rate-limit

```text
Bir IP:       8 synanyşyk / 1 sagat
Bir kontakt:  3 synanyşyk / 24 sagat
```

`submission_attempts` raw IP, e-poçta ýa-da telefon saklamaýar. Diňe pepper bilen SHA-256 hash, outcome we wagt saklanýar.

## Dokumentasiýa

```text
docs/SUPABASE_SETUP.md
docs/ADMIN_AUTH_SETUP.md
docs/PORTAL_SETUP.md
docs/CV_STORAGE_SETUP.md
docs/HR_ACTIVITY_SETUP.md
docs/NOTIFICATIONS_SETUP.md
docs/ABUSE_PROTECTION_SETUP.md
```

## Tehnologiýalar

- React
- Vite
- Arassa CSS
- Browser localStorage
- Cloudflare Turnstile
- Supabase Auth
- Supabase REST Data API
- Supabase private Storage
- Supabase Edge Functions
- Supabase Database Webhooks
- PostgreSQL
- Row Level Security
- PostgreSQL triggers
- Telegram Bot API
- Resend Email API
- GitHub Actions
- GitHub Pages

## Tamamlanan tapgyrlar

1. Premium baş sahypa
2. Komponentlere bölünen kod gurluşy
3. Wakansiýalar katalogy, gözleg we filtrler
4. Giňeldilen kandidat formasy we CV interfeýsi
5. Giňeldilen iş beriji sargyt formasy
6. “Biz barada”, kontakt we responsive düzedişler
7. LocalStorage maglumat gatlagy we demo admin paneli
8. Supabase/PostgreSQL schema we RLS
9. Supabase Auth, `admin`/`hr` rollary we remote admin paneli
10. Private CV Storage
11. HR bellikleri we audit timeline
12. Telegram/e-poçta Edge Function habarnamalary
13. Cloudflare Turnstile, server-side Siteverify we privacy-preserving rate-limit
14. Kandidat we iş beriji şahsy kabinetleri, profil RLS we owner-linked arzalar
15. Password recovery, email change, reauthentication we kabinet howpsuzlyk sazlamalary
16. Reusable kandidat anketa/CV, application autofill we private profile-CV copy

## 16-njy tapgyrda goşulanlar

- kandidat reusable anketa database meýdanlary;
- dil-independent experience key;
- `portal-profile` authenticated Edge Function;
- kandidat CV upload, replace we delete lifecycle-y;
- kabinetde anketa dolulygy görkezijisi;
- ady, telefon, e-poçta, şäher, wezipe, tejribe, diller, aýlyk we maglumat autofill-i;
- wakansiýadan saýlanan wezipäni profil wezipeden ileri tutmak;
- kabinetdäki CV-ni forma saýlamak;
- profile CV ýoluny serverde user ID boýunça barlamak;
- application üçin aýratyn private Storage copy;
- application metadata-da `selected-file` we `portal-profile-copy` çeşmeleri;
- üç Edge Function-y deploy edýän workflow;
- portal, CV Storage we Supabase dokumentasiýasynyň täzelenmegi.

## Çäklendirmeler

- häzirki wakansiýalar demo maglumatlarydyr;
- täzelenen SQL migration we üç Edge Function deployment aýratyn ýerine ýetirilmelidir;
- Auth Site URL, Redirect URLs we custom SMTP production üçin sazlanmalydyr;
- öňki guest arzalar täze hasaba awtomatik baglanmaýar;
- kandidat arzasyny yzyna almak ýa-da iberilen application CV-ni kandidat tarapyndan çalyşmak entek ýok;
- iş beriji üçin birnäçe team member entek ýok;
- resmi IDEGLI logo we gutarnykly brend reňkleri entek tassyklanmady.

## Indiki ýol kartasy

1. Kandidat arzasyny yzyna almak we application CV-ni täzelemek
2. Iş beriji kompaniýa profili we birnäçe team member
3. Hakyky IDEGLI logo, brend reňkleri we wakansiýalar
4. SEO, analitika we hakyky domen
5. Maglumat saklama möhleti we awtomatik privacy cleanup
