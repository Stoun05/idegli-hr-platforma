# IDEGLI Supabase sazlamasy

Bu tapgyr public arza formalaryny Supabase/PostgreSQL bazasyna ibermäge taýýarlaýar. Admin panel üçin autentifikasiýa indiki tapgyrda goşular.

## 1. Supabase proýektini döretmek

Supabase dashboard-da täze proýekt dörediň. Database parolyny ygtybarly ýerde saklaň.

## 2. Maglumat bazasynyň gurluşyny goşmak

Supabase Dashboard → SQL Editor bölüminde repository-daky şu faýly işlediň:

```text
supabase/schema.sql
```

Faýl:

- `applications` tablisany döredýär;
- kandidat we iş beriji görnüşlerini çäklendirýär;
- statuslaryň dogry sanawyny belleýär;
- Row Level Security açýar;
- public ulanyja diňe täze arza goşmaga rugsat berýär;
- diňe `admin` ýa-da `hr` roly bolan authenticated ulanyja okamak, üýtgetmek we pozmak rugsadyny berýär.

## 3. Frontend açarlary

Supabase Dashboard → Project Settings → API bölüminden alyň:

- Project URL
- Publishable key

Lokal iş üçin `.env.example` faýly `.env` diýip göçüriň:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
VITE_ENABLE_LOCAL_ADMIN_MIRROR=false
```

`service_role` açaryny hiç wagt `VITE_*` üýtgeýjisine, GitHub repository-a ýa-da GitHub Pages build-ine goýmaň.

## 4. GitHub Pages secrets

Repository → Settings → Secrets and variables → Actions → New repository secret:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Bahalary Supabase proýektinden alyň. Soň `main` branch-a täze commit edilende GitHub Pages Supabase režiminde build bolar.

## 5. Režimler

### Supabase sazlanmadyk bolsa

- arza `localStorage`-da saklanýar;
- `#/admin` demo panelinde görünýär;
- başga enjamda görünmeýär.

### Supabase sazlanan bolsa

- arza `applications` tablisyna iberilýär;
- açyk ulanyjy şol maglumatlary okap bilmeýär;
- häzirki demo admin remote maglumatlary entek okamaýar;
- remote admin üçin Supabase Auth we `admin`/`hr` rollary indiki tapgyrda goşulýar.

## 6. Lokal admin mirror

Diňe test üçin:

```env
VITE_ENABLE_LOCAL_ADMIN_MIRROR=true
```

Bu Supabase-a üstünlikli iberilen arzanyň nusgasyny şol brauzeriň localStorage bölümine hem ýazýar. Production-da `false` saklamak maslahat berilýär.

## 7. Barlaýyş

1. Saýty açyň.
2. Kandidat ýa-da iş beriji formasyny dolduryň.
3. Supabase Dashboard → Table Editor → `applications` tablisany açyň.
4. Täze ýazgynyň gelendigini barlaň.
5. Açyk anon ulanyjynyň tablisa maglumatlaryny SELECT edip bilmeýändigini RLS bilen barlaň.
