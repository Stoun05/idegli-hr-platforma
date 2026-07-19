# IDEGLI Supabase sazlamasy

Bu görkezme public arza formalaryny Supabase/PostgreSQL bazasyna ibermek, private CV Storage-i, HR audit taryhyny, Telegram/e-poçta habarnamalaryny we goralan remote admin panelini sazlamak üçin niýetlenendir.

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
supabase/hr_activity.sql
supabase/notifications.sql
supabase/assign_admin_role.sql
```

### `schema.sql`

- `applications` tablisasyny döredýär;
- kandidat we iş beriji görnüşlerini çäklendirýär;
- `submitter_id` arkaly kandidat arzasyny anonymous Auth ulanyjysy bilen baglanyşdyrýar;
- statuslaryň dogry sanawyny belleýär;
- public INSERT we HR-admin RLS düzgünlerini döredýär.

### `storage.sql`

- `candidate-cvs` private bucket döredýär;
- ölçegi 5 MB bilen çäklendirýär;
- PDF, DOC we DOCX MIME görnüşlerine rugsat berýär;
- anonymous kandidata diňe öz bukjasyna upload/read/delete rugsadyny berýär;
- `admin` we `hr` roluna ähli CV-leri okamak we pozmak rugsadyny berýär.

### `hr_activity.sql`

- içerki HR bellikleri üçin `application_notes` tablisasyny döredýär;
- üýtgedilip bilinmeýän taryh üçin `application_events` tablisasyny döredýär;
- arza döredilende, status üýtgände we bellik goşulanda trigger arkaly audit ýazgysyny döredýär;
- öňden bar bolan arzalar üçin başlangyç taryh ýazgysyny döredýär.

### `notifications.sql`

- `notification_deliveries` tablisany döredýär;
- Telegram/e-poçta synanyşyklaryny, statusyny we provider ID-sini saklaýar;
- bir waka/kanal/alyjy kombinasiýasynyň gaýtalanmagynyň öňüni alýar;
- delivery taryhyny diňe `admin`/`hr` roluna görkezýär;
- server-side Edge Function-a service-role arkaly log ýazmaga mümkinçilik berýär.

### `assign_admin_role.sql`

- öň döredilen Supabase Auth ulanyjysyna `admin` ýa-da `hr` roluny `app_metadata` içinde berýär.

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

Repository → Settings → Secrets and variables → Actions:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

`VITE_ENABLE_LOCAL_ADMIN_MIRROR` test üçin Actions Variable bolup biler; production-da `false` saklaň.

## 6. Admin ulanyjysyny we roluny sazlamak

Doly görkezme:

```text
docs/ADMIN_AUTH_SETUP.md
```

Gysgaça:

1. Authentication → Users bölüminde admin ulanyjysyny dörediň.
2. `supabase/assign_admin_role.sql` içindäki e-poçtany we roly üýtgediň.
3. SQL-ni işlediň.
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
6. Arza pozulsa, degişli CV hem pozulýar.

## 8. HR bellikleri we audit taryhy

Doly görkezme:

```text
docs/HR_ACTIVITY_SETUP.md
```

Remote admin panelde:

- içerki bellik ýazylýar;
- belligiň awtory, roly we wagty saklanýar;
- status üýtgeşmesi database trigger tarapyndan awtomatik ýazylýar;
- public ulanyjy bellikleri we taryhy okap bilmeýär.

## 9. Telegram we e-poçta habarnamalary

Doly görkezme:

```text
docs/NOTIFICATIONS_SETUP.md
```

Esasy akym:

```text
application_events INSERT
        ↓
Supabase Database Webhook
        ↓
notify-hr Edge Function
        ↓
Telegram Bot API + Resend Email API
        ↓
notification_deliveries audit log
```

Function secret-lary frontendden aýratyn Supabase Edge Function secrets bölüminde saklanýar.

Edge Function deployment:

```bash
supabase functions deploy notify-hr --project-ref YOUR_PROJECT_REF
```

Manual GitHub workflow üçin:

```text
SUPABASE_ACCESS_TOKEN
SUPABASE_PROJECT_ID
```

repository secrets gerek.

## 10. Režimler

### Supabase sazlanmadyk bolsa

- arza `localStorage`-da saklanýar;
- `#/admin` demo panelinde görünýär;
- CV-niň diňe metadata-sy saklanýar;
- HR bellikleri, audit taryhy we habarnamalar elýeterli däl.

### Supabase sazlanan bolsa

- formalar `applications` tablisasyna iberilýär;
- kandidat CV private Storage-a ýüklenýär;
- `#/admin` Supabase Auth login sahypasyny açýar;
- diňe `admin` ýa-da `hr` roly remote maglumatlary dolandyrýar;
- status, bellik we notification delivery taryhy admin panelde görünýär;
- täze waka Database Webhook arkaly Telegram/e-poçta iberişini başlaýar.

## 11. Lokal admin mirror

Diňe test üçin:

```env
VITE_ENABLE_LOCAL_ADMIN_MIRROR=true
```

Production-da `false` saklamak maslahat berilýär.

## 12. Barlaýyş

1. SQL faýllaryny görkezilen tertipde işlediň.
2. Frontend GitHub secret-laryny goşuň.
3. Anonymous Sign-Ins açyň.
4. Admin hasaby we `admin`/`hr` roly dörediň.
5. Edge Function secret-laryny goşuň.
6. `notify-hr` function-y deploy ediň.
7. `application_events` INSERT Database Webhook dörediň.
8. Kandidat formasyny CV bilen dolduryň.
9. Storage, `applications`, `application_events` we `notification_deliveries` tablisalaryny barlaň.
10. Telegram we e-poçta habarynyň gelendigini barlaň.
11. Admin panelde CV, HR bellikleri, taryh we notification delivery statusyny barlaň.
12. Statusy üýtgedip ikinji habarnamany barlaň.
13. Roly ýok ulanyjynyň goralan maglumatlary okap bilmeýändigini barlaň.
