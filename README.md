# IDEGLI HR Platforma

IDEGLI üçin işgär saýlap-seçiş, Executive Search we karýera konsultasiýasy hyzmatlaryny bir ýerde jemleýän web-platforma.

## Taslama kim üçin

- iş gözleýän kandidatlar;
- täze işgär gözleýän kompaniýalar;
- IDEGLI HR topary;
- karýera konsultasiýasyna mätäç hünärmenler.

## Häzirki wersiýada

- Türkmen we rus dilleri
- Premium, mobil enjamlara uýgunlaşýan baş sahypa
- Recruitment, Executive Search we karýera konsultasiýasy bölümleri
- Gözleg we üç görnüşli filtr bilen wakansiýalar katalogy
- Her wakansiýa üçin giňişleýin maglumat paneli
- Saýlanan wakansiýanyň arza formasyna awtomatik geçirilmegi
- Giňeldilen dalaşgär arza formasy
- PDF, DOC we DOCX CV saýlamak interfeýsi
- CV görnüşi we 5 MB ölçeg çägi boýunça frontend barlagy
- Şahsy maglumatlaryň işlenmegine razylyk barlagy
- Giňeldilen iş beriji işgär sargyt formasy
- Kompaniýa, wezipe, işgär sany, tejribe, iş formaty, aýlyk we möhlet maglumatlary
- Gizlin wakansiýa sargydy üçin aýratyn saýlaw
- IDEGLI barada professional tanyşdyryş we kontakt bölümleri
- LocalStorage demo maglumat gatlagy we demo admin paneli
- Supabase/PostgreSQL production maglumat gatlagy
- Public INSERT we diňe HR rollary üçin SELECT/UPDATE/DELETE RLS syýasatlary
- Supabase Auth email/parol giriş sahypasy
- `admin` we `hr` rollary boýunça frontend we database awtorizasiýasy
- JWT sessiýasynyň brauzerde saklanyşy we möhleti gutaranda refresh akymy
- Remote admin panelde maglumatlary görmek, gözlemek, filtrlemek, status üýtgetmek we pozmak
- CSV eksporty we remote maglumatlary täzeden ýüklemek
- Supabase sazlanmasa localStorage-a awtomatik fallback
- GitHub Pages build wagty Supabase secret-laryny kabul edýän workflow
- Accessibility we reduced-motion sazlamalary
- GitHub Pages arkaly awtomatik ýerleşdiriş

## Saýty açmak

```text
https://stoun05.github.io/idegli-hr-platforma/
```

## Admin paneli

```text
https://stoun05.github.io/idegli-hr-platforma/#/admin
```

Supabase sazlanmadyk bolsa bu salgy localStorage demo panelini açýar.

Supabase sazlanan bolsa:

- Supabase Auth login sahypasy açylýar;
- diňe `admin` ýa-da `hr` roly bolan ulanyjy kabul edilýär;
- arzalar remote PostgreSQL bazasyndan ýüklenýär;
- maglumatlara giriş RLS bilen täzeden barlanýar.

## Backend režimleri

### 1. Local demo režimi

Supabase environment maglumatlary ýok bolsa:

- forma maglumatlary localStorage-a ýazylýar;
- ýazgy şol brauzeriň `#/admin` panelinde görünýär;
- başga enjamda görünmeýär;
- brauzer maglumatlary arassalansa ýazgylar pozulýar.

### 2. Supabase režimi

Şu environment maglumatlary berilse:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
VITE_ENABLE_LOCAL_ADMIN_MIRROR=false
```

- public formalar Supabase REST Data API arkaly `applications` tablisasyna ýazýar;
- publishable key diňe `apikey` header-de ulanylýar;
- login eden adminiň JWT-si `Authorization` header-de iberilýär;
- açyk ulanyjy kandidat maglumatlaryny SELECT edip bilmeýär.

Doly backend sazlamasy:

```text
docs/SUPABASE_SETUP.md
```

Admin giriş we rol sazlamasy:

```text
docs/ADMIN_AUTH_SETUP.md
```

SQL faýllary:

```text
supabase/schema.sql
supabase/assign_admin_role.sql
```

> `service_role` ýa-da secret key-ni hiç wagt frontend, GitHub Pages ýa-da `VITE_*` environment üýtgeýjisine goýmaň.

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

## GitHub Pages deployment

Repository → Settings → Pages bölüminde source hökmünde `GitHub Actions` saýlanýar.

Supabase režimi üçin Repository → Settings → Secrets and variables → Actions bölüminde şu repository secrets goşulýar:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Her `main` commit-den soň build we GitHub Pages deployment awtomatik işleýär.

## Tehnologiýalar

- React
- Vite
- Arassa CSS
- Browser localStorage
- Supabase Auth
- Supabase REST Data API
- PostgreSQL
- Row Level Security
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
└── ADMIN_AUTH_SETUP.md

supabase/
├── schema.sql
└── assign_admin_role.sql
```

## Tamamlanan tapgyrlar

1. Başlangyç premium baş sahypa
2. Kod gurluşyny aýratyn komponentlere bölmek
3. Wakansiýalar katalogy, gözleg, filtrler we giňişleýin maglumat paneli
4. Giňeldilen dalaşgär formasy we CV ýüklemek interfeýsi
5. Giňeldilen iş beriji işgär sargyt formasy
6. Checkbox layout düzedişi, “Biz barada” we professional kontakt bölümleri
7. Brauzer demo maglumat gatlagy we HR admin paneli
8. Supabase/PostgreSQL schema, RLS we şertli remote arza iberişi
9. Supabase Auth, `admin`/`hr` rollary we goralan remote admin paneli

## Indiki tapgyrlar

1. CV faýllaryny private Supabase Storage bucket-de saklamak
2. Admin panelde HR bellikleri we kandidat taryhy
3. Telegram/email habarnamalary
4. Iş beriji we dalaşgär şahsy kabinetleri
5. IDEGLI-niň hakyky logo we resmi brend reňkleri
6. SEO, analitika we hakyky domen

## Bellik

Häzirki wakansiýalar demo maglumatlarydyr. Supabase açarlary GitHub Actions secret-laryna goşulýança live saýt local demo režiminde işleýär. Production üçin Supabase schema, publishable key, admin Auth ulanyjysy, `admin`/`hr` roly we private CV Storage doly sazlanmalydyr.
