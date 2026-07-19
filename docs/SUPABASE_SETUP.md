# IDEGLI Supabase sazlamasy

Bu görkezme public arza formalaryny Supabase/PostgreSQL bazasyna ibermek we goralan remote admin panelini açmak üçin niýetlenendir.

## 1. Supabase proýektini döretmek

Supabase Dashboard-da täze proýekt dörediň. Database parolyny ygtybarly ýerde saklaň.

## 2. Maglumat bazasynyň gurluşyny goşmak

Supabase Dashboard → SQL Editor bölüminde repository-daky şu faýly işlediň:

```text
supabase/schema.sql
```

Faýl:

- `applications` tablisasyny döredýär;
- kandidat we iş beriji görnüşlerini çäklendirýär;
- statuslaryň dogry sanawyny belleýär;
- Row Level Security açýar;
- public ulanyja diňe täze arza goşmaga rugsat berýär;
- diňe `admin` ýa-da `hr` roly bolan authenticated ulanyja okamak, üýtgetmek we pozmak rugsadyny berýär.

## 3. Frontend açarlary

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

Publishable key public Data API çagyryşlarynda diňe `apikey` header-de ulanylýar. Admin girişden soň `Authorization` header-de publishable key däl-de, ulanyjynyň Supabase Auth JWT tokeni iberilýär.

## 4. GitHub Pages secret-lary

Repository → Settings → Secrets and variables → Actions → New repository secret:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Bahalary Supabase proýektinden alyň. Soň `main` branch-a täze commit edilende GitHub Pages Supabase režiminde build bolar.

`VITE_ENABLE_LOCAL_ADMIN_MIRROR` hökmany secret däl. Test gerek bolsa Actions Variables bölüminde `true` goýup bolýar; production-da `false` saklaň.

## 5. Admin ulanyjysyny we roluny sazlamak

Doly görkezme:

```text
docs/ADMIN_AUTH_SETUP.md
```

Gysgaça:

1. Supabase Dashboard → Authentication → Users bölüminde admin ulanyjysyny dörediň.
2. `supabase/assign_admin_role.sql` faýlyndaky e-poçtany we roly üýtgediň.
3. SQL-ni Dashboard → SQL Editor bölüminde işlediň.
4. Ulanyjy çykyp, täzeden giriş etsin.

## 6. Režimler

### Supabase sazlanmadyk bolsa

- arza `localStorage`-da saklanýar;
- `#/admin` demo panelinde görünýär;
- başga enjamda görünmeýär;
- login talap edilmeýär, sebäbi bu diňe lokal demo maglumatydyr.

### Supabase sazlanan bolsa

- public arza `applications` tablisasyna iberilýär;
- açyk ulanyjy şol maglumatlary SELECT edip bilmeýär;
- `#/admin` Supabase Auth login sahypasyny açýar;
- diňe `admin` ýa-da `hr` roly bolan ulanyjy remote maglumatlary görýär;
- status üýtgetmek we pozmak RLS arkaly täzeden barlanýar.

## 7. Lokal admin mirror

Diňe test üçin:

```env
VITE_ENABLE_LOCAL_ADMIN_MIRROR=true
```

Bu Supabase-a üstünlikli iberilen arzanyň nusgasyny şol brauzeriň localStorage bölümine hem ýazýar. Production-da `false` saklamak maslahat berilýär.

## 8. Barlaýyş

1. Saýty açyň.
2. Kandidat ýa-da iş beriji formasyny dolduryň.
3. Supabase Dashboard → Table Editor → `applications` tablisany açyň.
4. Täze ýazgynyň gelendigini barlaň.
5. `#/admin` salgysynda admin hasaby bilen giriň.
6. Arzanyň remote panelde görünýändigini barlaň.
7. Statusy üýtgedip, sahypany täzeläň.
8. Roly ýok adaty ulanyjynyň admin maglumatlaryny okap bilmeýändigini barlaň.
