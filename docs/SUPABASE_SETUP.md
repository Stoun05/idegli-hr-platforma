# IDEGLI Supabase sazlamasy

Bu görkezme public arza formalaryny Supabase/PostgreSQL bazasyna ibermek, private CV Storage-i sazlamak we goralan remote admin panelini açmak üçin niýetlenendir.

## 1. Supabase proýektini döretmek

Supabase Dashboard-da täze proýekt dörediň. Database parolyny ygtybarly ýerde saklaň.

## 2. Anonymous Sign-Ins açmak

Supabase Dashboard → Authentication → Providers → Anonymous Sign-Ins bölüminde anonymous girişleri işjeňleşdiriň.

Bu diňe kandidat CV upload akymy üçin ulanylýar. Kandidat e-poçtasyz sessiýa alýar we CV diňe şol sessiýanyň UUID bukjasyna ýüklenýär.

Production açylyşdan öň Cloudflare Turnstile ýa-da CAPTCHA sazlamak maslahat berilýär.

## 3. SQL gurluşlaryny goşmak

Supabase Dashboard → SQL Editor bölüminde şu tertipde işlediň:

```text
supabase/schema.sql
supabase/storage.sql
```

`schema.sql`:

- `applications` tablisasyny döredýär;
- kandidat we iş beriji görnüşlerini çäklendirýär;
- `submitter_id` arkaly kandidat arzasyny anonymous Auth ulanyjysy bilen baglanyşdyrýar;
- statuslaryň dogry sanawyny belleýär;
- Row Level Security açýar;
- iş beriji public sargydyna CV-siz INSERT rugsadyny berýär;
- kandidat arzasyna diňe öz UUID bukjasyna ýüklenen CV metadata-sy bilen INSERT rugsadyny berýär;
- diňe `admin` ýa-da `hr` roluna SELECT/UPDATE/DELETE rugsadyny berýär.

`storage.sql`:

- `candidate-cvs` private bucket döredýär;
- ölçegi 5 MB bilen çäklendirýär;
- PDF, DOC we DOCX MIME görnüşlerine rugsat berýär;
- anonymous kandidata diňe öz bukjasyna upload/read/delete rugsadyny berýär;
- `admin` we `hr` roluna ähli CV-leri okamak we pozmak rugsadyny berýär.

## 4. Frontend açarlary

Supabase Dashboard → Project Settings → API Keys bölüminden alyň:

- Project URL;
- Publishable key (`sb_publishable_...`).

Lokal iş üçin `.env.example` faýly `.env` diýip göçüriň:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
VITE_ENABLE_LOCAL_ADMIN_MIRROR=false
```

`service_role` ýa-da secret key-ni hiç wagt `VITE_*` üýtgeýjisine, GitHub repository-a ýa-da GitHub Pages build-ine goýmaň.

Publishable key public API çagyryşlarynda `apikey` header-de ulanylýar. Anonymous kandidat ýa-da admin login edeninden soň `Authorization` header-de degişli Supabase Auth JWT tokeni iberilýär.

## 5. GitHub Pages secret-lary

Repository → Settings → Secrets and variables → Actions → New repository secret:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Bahalary Supabase proýektinden alyň. Soň `main` branch-a täze commit edilende GitHub Pages Supabase režiminde build bolar.

`VITE_ENABLE_LOCAL_ADMIN_MIRROR` hökmany secret däl. Test gerek bolsa Actions Variables bölüminde `true` goýup bolýar; production-da `false` saklaň.

## 6. Admin ulanyjysyny we roluny sazlamak

Doly görkezme:

```text
docs/ADMIN_AUTH_SETUP.md
```

Gysgaça:

1. Supabase Dashboard → Authentication → Users bölüminde admin ulanyjysyny dörediň.
2. `supabase/assign_admin_role.sql` faýlyndaky e-poçtany we roly üýtgediň.
3. SQL-ni Dashboard → SQL Editor bölüminde işlediň.
4. Ulanyjy çykyp, täzeden giriş etsin.

## 7. CV Storage sazlamasy

Doly görkezme:

```text
docs/CV_STORAGE_SETUP.md
```

Kandidat akymy:

1. Anonymous sessiýa döredilýär ýa-da refresh edilýär.
2. CV `candidate-cvs/anonymous/<user-id>/<random-id>.<ext>` ýoluna ýüklenýär.
3. Storage ýoly `applications.cv_metadata` içine ýazylýar.
4. Arza ýazgysy şowsuz bolsa, faýl yzyna pozulýar.
5. HR/admin CV-ni private authenticated endpoint arkaly ýükläp alýar.
6. Arza admin tarapyndan pozulsa, degişli CV hem pozulýar.

## 8. Režimler

### Supabase sazlanmadyk bolsa

- arza `localStorage`-da saklanýar;
- `#/admin` demo panelinde görünýär;
- başga enjamda görünmeýär;
- CV-niň diňe ady, ölçegi we MIME metadata-sy saklanýar;
- login talap edilmeýär, sebäbi bu diňe lokal demo maglumatydyr.

### Supabase sazlanan bolsa

- iş beriji sargydy `applications` tablisasyna iberilýär;
- kandidat CV private Storage-a ýüklenýär we arza bilen baglanyşdyrylýar;
- açyk ulanyjy kandidat maglumatlaryny SELECT edip bilmeýär;
- `#/admin` Supabase Auth login sahypasyny açýar;
- diňe `admin` ýa-da `hr` roly remote maglumatlary we CV-leri görýär;
- status üýtgetmek, CV almak we pozmak RLS arkaly barlanýar.

## 9. Lokal admin mirror

Diňe test üçin:

```env
VITE_ENABLE_LOCAL_ADMIN_MIRROR=true
```

Bu Supabase-a üstünlikli iberilen arzanyň nusgasyny şol brauzeriň localStorage bölümine hem ýazýar. Production-da `false` saklamak maslahat berilýär.

## 10. Barlaýyş

1. Saýty açyň.
2. Kandidat formasyny PDF, DOC ýa-da DOCX CV bilen dolduryň.
3. Storage → `candidate-cvs` private bucket-de faýly barlaň.
4. Table Editor → `applications` içinde `submitter_id` we `cv_metadata.storagePath` maglumatlaryny barlaň.
5. Iş beriji formasyny dolduryp, CV metadata-synyň null bolandygyny barlaň.
6. `#/admin` salgysynda admin hasaby bilen giriň.
7. CV-ni ýükläp almagy, status üýtgetmegi we arza pozmagy barlaň.
8. Arza pozulandan soň CV-niň bucket-den hem ýok bolandygyny barlaň.
9. Roly ýok ulanyjynyň remote maglumatlary we CV-leri okap bilmeýändigini barlaň.
