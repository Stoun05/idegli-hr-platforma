# IDEGLI HR Platforma

IDEGLI üçin işgär saýlap-seçiş, Executive Search, karýera konsultasiýasy, kandidat arzalary we iş beriji sargytlaryny bir ýerde dolandyrýan iki dilli HR web-platforma.

## Taslama kim üçin

- iş gözleýän kandidatlar;
- täze işgär gözleýän kompaniýalar;
- IDEGLI HR topary;
- karýera konsultasiýasyna mätäç hünärmenler.

## Esasy mümkinçilikler

### Public web-saýt

- Türkmen we rus dilleri;
- premium, mobil enjamlara uýgun baş sahypa;
- Recruitment, Executive Search we karýera konsultasiýasy;
- gözleg we filtrler bilen wakansiýalar katalogy;
- her wakansiýa üçin giňişleýin maglumat paneli;
- saýlanan wakansiýany kandidat formasyna awtomatik geçirmek;
- “Biz barada”, iş prosesi we kontakt bölümleri.

### Kandidat formasy

- şäher, wezipe, tejribe, diller we garaşylýan aýlyk;
- PDF, DOC we DOCX CV saýlamak;
- faýl görnüşi we 5 MB ölçeg barlagy;
- şahsy maglumatlaryň işlenmegine razylyk;
- Supabase režiminde CV-ni private Storage-a hakyky ýüklemek;
- local demo režiminde diňe CV metadata-syny saklamak.

### Iş beriji formasy

- kompaniýa we kontakt maglumatlary;
- wezipe, işgär sany, iş formaty, tejribe we aýlyk aralygy;
- borçlar, talaplar, şertler we möhletler;
- gizlin wakansiýa sargydy;
- Supabase/PostgreSQL ýa-da localStorage fallback.

### Admin paneli

- Supabase Auth e-poçta/parol giriş sahypasy;
- diňe `admin` we `hr` rollary;
- JWT sessiýasy we refresh akymy;
- kandidat we iş beriji arzalaryny görmek;
- gözleg, görnüş we status filtrleri;
- status üýtgetmek we ýazgy pozmak;
- CSV eksporty;
- private CV-ni JWT arkaly ýükläp almak;
- arza pozulanda degişli private CV-ni hem pozmak;
- her arza üçin içerki HR bellikleri;
- belligiň awtory, roly we wagty;
- arza döredilişiniň we status üýtgeşmeleriniň audit taryhy;
- Telegram/e-poçta delivery statusy, wagty we synanyşyk sany.

### Habarnamalar

- täze kandidat arzasy üçin Telegram we e-poçta;
- täze iş beriji sargydy üçin Telegram we e-poçta;
- status üýtgeşmesi üçin habarnama;
- islege görä täze HR belligi üçin habarnama;
- Supabase Database Webhook → Edge Function akymy;
- gizlin tokenleriň diňe Supabase Function secrets-de saklanmagy;
- Resend idempotency key bilen gaýtalanan e-poçtanyň öňüni almak;
- `notification_deliveries` tablisasynda delivery audit log-y.

## Live salgylar

Saýt:

```text
https://stoun05.github.io/idegli-hr-platforma/
```

Admin paneli:

```text
https://stoun05.github.io/idegli-hr-platforma/#/admin
```

## Backend režimleri

### Local demo režimi

Supabase environment maglumatlary ýok bolsa:

- formalar localStorage-a ýazylýar;
- maglumat diňe şol brauzerde görünýär;
- `#/admin` lokal demo panelini açýar;
- CV-niň faýly saklanmaýar, diňe ady, ölçegi we MIME görnüşi saklanýar;
- HR bellikleri, audit taryhy we habarnamalar işlemeýär;
- brauzer maglumatlary arassalansa ýazgylar pozulýar.

### Supabase production režimi

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
VITE_ENABLE_LOCAL_ADMIN_MIRROR=false
```

Bu režimde:

- formalar PostgreSQL-daky `applications` tablisasyna ýazylýar;
- kandidat anonymous Supabase Auth sessiýasy alýar;
- CV `candidate-cvs` private bucket-e kandidatyň UUID bukjasyna ýüklenýär;
- public ulanyjy kandidat bazasyny, CV-leri, HR belliklerini ýa-da taryhy okap bilmeýär;
- `admin` we `hr` rollary remote maglumatlary dolandyrýar;
- status we bellik wakalary database trigger arkaly audit taryhyna ýazylýar;
- `application_events` INSERT webhook-y `notify-hr` Edge Function-y çagyrýar;
- Function Telegram Bot API we Resend arkaly HR toparyna habar berýär.

> `service_role`, `sb_secret_...`, Telegram tokeni ýa-da Resend key hiç wagt frontend, GitHub Pages ýa-da `VITE_*` üýtgeýjisine goýulmaýar.

## Supabase sazlamasy

SQL faýllaryny şu tertipde işlediň:

```text
supabase/schema.sql
supabase/storage.sql
supabase/hr_activity.sql
supabase/notifications.sql
supabase/assign_admin_role.sql
```

Doly görkezmeler:

```text
docs/SUPABASE_SETUP.md
docs/ADMIN_AUTH_SETUP.md
docs/CV_STORAGE_SETUP.md
docs/HR_ACTIVITY_SETUP.md
docs/NOTIFICATIONS_SETUP.md
```

Production üçin Supabase Dashboard-da **Anonymous Sign-Ins** hem açylmaly. Public anonymous sign-in akymy üçin CAPTCHA ýa-da Cloudflare Turnstile sazlamak maslahat berilýär.

## Edge Function deployment

Function:

```text
supabase/functions/notify-hr/index.ts
```

CLI:

```bash
supabase functions deploy notify-hr --project-ref YOUR_PROJECT_REF
```

Manual GitHub workflow:

```text
.github/workflows/deploy-supabase-functions.yml
```

Gerekli GitHub repository secrets:

```text
SUPABASE_ACCESS_TOKEN
SUPABASE_PROJECT_ID
```

## GitHub Pages deployment

Repository → Settings → Pages bölüminde source hökmünde `GitHub Actions` saýlanýar.

Frontend build secret-lary:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Her `main` commit-den soň GitHub Pages deployment awtomatik işleýär. Supabase Edge Function deployment-i howpsuzlyk sebäpli manual workflow hökmünde aýratyn işleýär.

## Lokal işletmek

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Tehnologiýalar

- React
- Vite
- Arassa CSS
- Browser localStorage
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
├── CV_STORAGE_SETUP.md
├── HR_ACTIVITY_SETUP.md
└── NOTIFICATIONS_SETUP.md

supabase/
├── config.toml
├── schema.sql
├── storage.sql
├── hr_activity.sql
├── notifications.sql
├── assign_admin_role.sql
└── functions/
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
10. Anonymous kandidat sessiýasy we private CV Storage
11. HR bellikleri, status taryhy we database-trigger audit timeline-y
12. Telegram/e-poçta Edge Function habarnamalary we delivery audit log-y

## 12-nji tapgyrda goşulanlar

- `notification_deliveries` tablisa we RLS;
- `notify-hr` Supabase Edge Function;
- webhook secret barlagy;
- Telegram HTML habarlary;
- Resend HTML/text e-poçtalary;
- e-poçta idempotency key;
- Telegram we e-poçta kanallarynyň garaşsyz işlemegi;
- şowsuz synanyşyk sebäpleriniň saklanmagy;
- admin kartasynda delivery taryhy;
- manual Supabase Function deployment workflow-y;
- doly notification sazlama dokumentasiýasy.

## Çäklendirmeler

- häzirki wakansiýalar demo maglumatlarydyr;
- Supabase secret-lary goşulmasa live saýt local demo režiminde işleýär;
- private CV Storage diňe `schema.sql` we `storage.sql` işledilenden soň işleýär;
- HR bellikleri we audit taryhy diňe `hr_activity.sql` işledilenden soň işleýär;
- habarnamalar diňe `notifications.sql`, Function secrets, Edge Function deployment we Database Webhook sazlanandan soň işleýär;
- Resend iberiji domeni tassyklanmalydyr;
- Telegram bot degişli chat-a habar ibermäge rugsatly bolmalydyr;
- production-da CAPTCHA/Turnstile we rate-limit goragy entek goşulmady;
- kandidat we iş beriji şahsy kabinetleri entek ýok;
- resmi IDEGLI logo we gutarnykly brend reňkleri entek tassyklanmady.

## Indiki ýol kartasy

1. CAPTCHA/Turnstile we forma rate-limit goragy
2. Kandidat we iş beriji şahsy kabinetleri
3. Hakyky IDEGLI logo, brend reňkleri we wakansiýalar
4. SEO, analitika we hakyky domen
