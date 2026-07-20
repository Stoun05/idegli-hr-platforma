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
- kompaniýa, wakansiýa, iş formaty, aýlyk we möhlet maglumatlary;
- PDF, DOC we DOCX, iň köp 5 MB;
- şahsy maglumatlaryň işlenmegine razylyk;
- Cloudflare Turnstile bot goragy;
- server-side Siteverify;
- IP/contact hash rate-limit;
- production-da diňe Supabase Edge Function arkaly arza kabul etmek;
- girişli portal ulanyjysynyň täze arzasyny öz kabinetine baglamak;
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
- paroly dikeltmek;
- girişli hasapda paroly üýtgetmek;
- häzirki parol ýa-da reauthentication nonce barlagy;
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

## Backend režimleri

### Local demo

Supabase frontend maglumatlary ýok bolsa:

- forma localStorage-a ýazylýar;
- CV-niň diňe metadata-sy saklanýar;
- `#/admin` lokal demo panelini açýar;
- `#/portal` konfigurasiýa habaryny görkezýär;
- remote audit, Turnstile, kabinet we habarnamalar işlemeýär.

### Supabase production

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
Portal JWT — giriş edilen bolsa
    ↓
Cloudflare Turnstile
    ↓
submit-application Edge Function
    ↓
JWT/profile + Siteverify + hash rate-limit
    ↓
Private CV Storage + PostgreSQL owner_id
    ↓
Audit event + HR notification
```

Public ulanyja `applications` tablisasynda INSERT ýa-da `candidate-cvs` bucket-de upload rugsady berilmeýär. Bu hereketleri diňe server-side Edge Function service role ýerine ýetirýär.

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
supabase/functions/notify-hr/index.ts
```

```bash
supabase functions deploy submit-application --project-ref YOUR_PROJECT_REF
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

## Portal Auth callback-lary

```text
?portal=callback   — registrasiýa we email-change tassyklamasy
?portal=recovery   — password recovery sahypasy
#/portal           — giriş we dashboard
```

Callback access token-i URL fragmentinden alýar we Auth `/user` endpoint-i arkaly täzeden tassyklaýar.

## Portal howpsuzlygy

- `portal_profiles.id = auth.users.id`;
- `account_type` diňe `candidate` ýa-da `employer`;
- hasap görnüşi frontend tarapyndan üýtgedilmeýär;
- öz profilini diňe `auth.uid() = id` bolan ulanyjy görýär;
- öz arzalaryny diňe `applications.owner_id = auth.uid()` bolan ulanyjy görýär;
- kandidat hasaby diňe kandidat formasyny, iş beriji hasaby diňe iş beriji formasyny öz kabinetine baglap biler;
- guest arzalar `owner_id = null` bolup galýar;
- portal we admin sessiýalary dürli localStorage key-lerinde saklanýar;
- password recovery sessiýasy parol täzelenenden soň arassalanýar;
- e-poçta üýtgetmezden öň häzirki parol täzeden barlanýar;
- Secure password change açyk bolsa reauthentication nonce ulanylýar.

## Turnstile we rate-limit

Default çäkler:

```text
Bir IP:       8 synanyşyk / 1 sagat
Bir kontakt:  3 synanyşyk / 24 sagat
```

`submission_attempts` tablisasy raw IP, e-poçta ýa-da telefon saklamaýar. Diňe server-only pepper bilen SHA-256 hash, outcome we wagt saklanýar.

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

## Taslama gurluşy

```text
src/
├── components/
├── config/
├── data/
├── services/
└── *.css

docs/
├── SUPABASE_SETUP.md
├── ADMIN_AUTH_SETUP.md
├── PORTAL_SETUP.md
├── CV_STORAGE_SETUP.md
├── HR_ACTIVITY_SETUP.md
├── NOTIFICATIONS_SETUP.md
└── ABUSE_PROTECTION_SETUP.md

supabase/
├── config.toml
├── schema.sql
├── storage.sql
├── portal_accounts.sql
├── hr_activity.sql
├── notifications.sql
├── abuse_protection.sql
├── assign_admin_role.sql
└── functions/
    ├── submit-application/
    │   └── index.ts
    └── notify-hr/
        └── index.ts
```

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

## 15-nji tapgyrda goşulanlar

- giriş sahypasynda **Paroly ýatdan çykardyňyzmy?** akymy;
- `/auth/v1/recover` bilen recovery e-poçtasy;
- `?portal=recovery` password update sahypasy;
- callback fragment tokenini `/auth/v1/user` arkaly barlamak;
- recovery tamamlananda sessiýany arassalamak;
- dashboard-da **Hasap howpsuzlygy** paneli;
- häzirki parol bilen password update;
- `/auth/v1/reauthenticate` arkaly 6 belgili nonce;
- Secure password change bilen nonce update;
- häzirki paroly täzeden barlap e-poçta üýtgetmek;
- `?portal=callback` registrasiýa/email-change callback-i;
- Auth sessiýasynyň öňki expiry maglumatyny saklamak;
- password/email security flow dokumentasiýasy.

## Çäklendirmeler

- häzirki wakansiýalar demo maglumatlarydyr;
- SQL migration-lar we Edge Function deployment aýratyn ýerine ýetirilmelidir;
- Auth Site URL we Redirect URLs sazlanmalydyr;
- production recovery/confirmation e-poçtalary üçin custom SMTP maslahat berilýär;
- öňki guest arzalar täze hasaba awtomatik baglanmaýar;
- kandidat kabinetinde CV-ni täzeden ýüklemek ýa-da arzany yzyna almak entek ýok;
- iş beriji üçin birnäçe team member entek ýok;
- resmi IDEGLI logo we gutarnykly brend reňkleri entek tassyklanmady.

## Indiki ýol kartasy

1. Kandidat CV/anketa profilini gaýtadan ulanmak
2. Kandidat arzasyny yzyna almak we CV-ni täzelemek
3. Iş beriji kompaniýa profili we birnäçe team member
4. Hakyky IDEGLI logo, brend reňkleri we wakansiýalar
5. SEO, analitika we hakyky domen
6. Maglumat saklama möhleti we awtomatik privacy cleanup
