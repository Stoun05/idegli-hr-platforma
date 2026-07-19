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
- database trigger bilen üýtgedilip bilinmeýän kandidat timeline-y.

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

### 1. Local demo režimi

Supabase environment maglumatlary ýok bolsa:

- formalar localStorage-a ýazylýar;
- maglumat diňe şol brauzerde görünýär;
- `#/admin` lokal demo panelini açýar;
- CV-niň faýly saklanmaýar, diňe ady, ölçegi we MIME görnüşi saklanýar;
- HR bellikleri we audit taryhy işlemeýär;
- brauzer maglumatlary arassalansa ýazgylar pozulýar.

### 2. Supabase production režimi

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
VITE_ENABLE_LOCAL_ADMIN_MIRROR=false
```

Bu režimde:

- iş beriji sargytlary PostgreSQL-daky `applications` tablisasyna ýazylýar;
- kandidat anonymous Supabase Auth sessiýasy alýar;
- CV `candidate-cvs` private bucket-e diňe kandidatyň UUID bukjasyna ýüklenýär;
- CV Storage ýoly arza metadata-syna birikdirilýär;
- public ulanyjy kandidat bazasyny, CV-leri, HR belliklerini ýa-da taryhy okap bilmeýär;
- `admin` we `hr` rollary remote maglumatlary dolandyrýar;
- arza ýazgysy şowsuz bolsa, ýüklenen CV awtomatik yzyna pozulýar;
- status üýtgeşmeleri we bellik goşulyşy database trigger arkaly audit taryhyna ýazylýar.

> `service_role`, `sb_secret_...` ýa-da başga secret açary hiç wagt frontend, GitHub Pages ýa-da `VITE_*` üýtgeýjisine goýmaň.

## Supabase sazlamasy

SQL faýllaryny şu tertipde işlediň:

```text
supabase/schema.sql
supabase/storage.sql
supabase/hr_activity.sql
supabase/assign_admin_role.sql
```

Doly görkezmeler:

```text
docs/SUPABASE_SETUP.md
docs/ADMIN_AUTH_SETUP.md
docs/CV_STORAGE_SETUP.md
docs/HR_ACTIVITY_SETUP.md
```

Production üçin Supabase Dashboard-da **Anonymous Sign-Ins** hem açylmaly. Public anonymous sign-in akymy üçin CAPTCHA ýa-da Cloudflare Turnstile sazlamak maslahat berilýär.

## GitHub Pages deployment

Repository → Settings → Pages bölüminde source hökmünde `GitHub Actions` saýlanýar.

Repository → Settings → Secrets and variables → Actions bölüminde:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

secret-laryny goşuň. Her `main` commit-den soň build we GitHub Pages deployment awtomatik işleýär.

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
- PostgreSQL
- Row Level Security
- PostgreSQL triggers
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
└── HR_ACTIVITY_SETUP.md

supabase/
├── schema.sql
├── storage.sql
├── hr_activity.sql
└── assign_admin_role.sql
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
10. Anonymous kandidat sessiýasy, private CV Storage, admin download we bilelikde pozma akymy
11. HR bellikleri, status taryhy we database-trigger audit timeline-y

## 11-nji tapgyrda goşulanlar

- `application_notes` içerki HR bellik tablisasy;
- `application_events` üýtgedilip bilinmeýän audit taryhy;
- arza döredilende awtomatik `created` wakasy;
- status üýtgände öňki we täze status bilen `status_changed` wakasy;
- bellik goşulanda `note_added` wakasy;
- öňki arzalar üçin başlangyç taryh backfill-i;
- admin kartlarynda iki sütünli bellik we timeline paneli;
- bellik goşmak, awtoryny/wagtyny görmek we pozmak;
- ähli remote maglumatlary bir wagtda täzeden ýüklemek.

## Çäklendirmeler

- häzirki wakansiýalar demo maglumatlarydyr;
- Supabase secret-lary goşulmasa live saýt local demo režiminde işleýär;
- private CV Storage diňe `schema.sql` we `storage.sql` işledilenden soň işleýär;
- HR bellikleri we audit taryhy diňe `hr_activity.sql` işledilenden soň işleýär;
- anonymous sign-in abuse-dan goramak üçin production-da CAPTCHA/Turnstile gerek;
- kandidat we iş beriji şahsy kabinetleri entek ýok;
- Telegram/e-poçta habarnamalary entek birikdirilmedi;
- resmi IDEGLI logo we gutarnykly brend reňkleri entek tassyklanmady.

## Indiki ýol kartasy

1. Telegram we e-poçta habarnamalary
2. CAPTCHA/Turnstile we forma rate-limit goragy
3. Kandidat we iş beriji şahsy kabinetleri
4. Hakyky IDEGLI logo, brend reňkleri we wakansiýalar
5. SEO, analitika we hakyky domen
