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
- Checkbox we razylyk bloklarynyň responsive layout düzedişi
- IDEGLI barada professional tanyşdyryş bölümi
- Maksatly gözleg, gizlinlik we netijä çenli goldaw ýörelgeleri
- Telefon, e-poçta we Aşgabat maglumatlary bilen kontakt bölümi
- Arzalary şol brauzeriň localStorage bölüminde saklaýan demo maglumat gatlagy
- Kandidat we iş beriji ýazgylaryny görkezýän demo admin paneli
- Admin panelde gözleg, görnüş/status filtri we status üýtgetmek
- Ýazgylary pozmak, hemmesini arassalamak we CSV çykarmak
- Supabase/PostgreSQL üçin şertli production maglumat gatlagy
- Supabase sazlanmasa localStorage-a awtomatik fallback
- Public INSERT we diňe HR rollary üçin SELECT/UPDATE/DELETE RLS syýasatlary
- GitHub Pages build wagty Supabase secret-laryny kabul edýän workflow
- Düşnükli 4 tapgyrly recruitment prosesi
- Accessibility we reduced-motion sazlamalary
- GitHub Pages arkaly awtomatik ýerleşdiriş

## Saýty açmak

```text
https://stoun05.github.io/idegli-hr-platforma/
```

## Demo admin paneli

```text
https://stoun05.github.io/idegli-hr-platforma/#/admin
```

Saýtyň footer bölümindäki `Admin demo` salgylanmasy hem şol panela geçirýär.

### Demo admin çäklendirmeleri

- maglumatlar diňe arza doldurylan brauzerde saklanýar;
- başga enjamda ýa-da başga brauzerde görünmeýär;
- brauzer maglumatlary arassalansa arzalar pozulýar;
- CV faýlynyň özi saklanmaýar, diňe faýlyň ady, görnüşi we ölçegi saklanýar;
- admin panelde entek giriş/parol goragy ýok;
- Supabase remote ýazgylary häzirki demo admin panelinde görkezilmeýär.

## Backend režimleri

### 1. Local demo režimi

Supabase environment maglumatlary ýok bolsa:

- forma maglumatlary localStorage-a ýazylýar;
- ýazgy şol brauzeriň `#/admin` panelinde görünýär;
- serwer ýa-da maglumat bazasy gerek däl.

### 2. Supabase režimi

Şu environment maglumatlary berilse:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
VITE_ENABLE_LOCAL_ADMIN_MIRROR=false
```

forma maglumatlary Supabase REST Data API arkaly PostgreSQL-daky `applications` tablisasyna iberilýär.

Doly sazlama görkezmesi:

```text
docs/SUPABASE_SETUP.md
```

Maglumat bazasynyň SQL gurluşy:

```text
supabase/schema.sql
```

> `service_role` açaryny hiç wagt frontend, GitHub Pages ýa-da `VITE_*` environment üýtgeýjisine goýmaň.

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
└── SUPABASE_SETUP.md

supabase/
└── schema.sql
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

## Indiki tapgyrlar

1. Supabase Auth bilen admin girişini goşmak
2. `admin` we `hr` rollary bilen remote admin paneli
3. CV faýllaryny private Supabase Storage bucket-de saklamak
4. Admin panelde HR bellikleri we kandidat taryhy
5. Telegram/email habarnamalary
6. Iş beriji we dalaşgär şahsy kabinetleri
7. IDEGLI-niň hakyky logo we resmi brend reňkleri
8. SEO, analitika we hakyky domen

## Bellik

Häzirki wakansiýalar demo maglumatlarydyr. Supabase sazlanmadyk ýagdaýynda formalaryň maglumatlary diňe şol brauzeriň localStorage bölümine ýazylýar. Production ulanylyşy üçin Supabase schema, environment secret-lary, admin autentifikasiýasy, private CV Storage we maglumat goragy doly sazlanmalydyr.
