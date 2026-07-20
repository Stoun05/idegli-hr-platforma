# IDEGLI kandidat we iş beriji şahsy kabinetleri

Şahsy kabinet şu salgyda açylýar:

```text
https://stoun05.github.io/idegli-hr-platforma/#/portal
```

Kabinet iki hasap görnüşini goldaýar:

- `candidate` — kandidat;
- `employer` — iş beriji.

## 1. SQL migration

Supabase SQL Editor-de esasy schema-dan soň işlediň:

```text
supabase/portal_accounts.sql
```

Faýl:

- `portal_profiles` tablisany döredýär;
- `applications.owner_id` sütünini goşýar;
- täze Auth ulanyjysy üçin profil döredýän trigger goşýar;
- kandidata ýa-da iş berijä diňe öz profilini görmäge we redaktirlemäge rugsat berýär;
- ulanyja diňe `owner_id = auth.uid()` bolan arzalary görkezýär;
- `account_type` sütünini frontend tarapyndan üýtgedip bolmaýan edýär;
- `admin` we `hr` rollaryna profilleri okamak rugsadyny saklaýar.

## 2. Supabase Auth sazlamasy

Supabase Dashboard → Authentication → URL Configuration:

```text
Site URL:
https://stoun05.github.io/idegli-hr-platforma/

Redirect URLs:
https://stoun05.github.io/idegli-hr-platforma/**
http://localhost:5173/**
```

Email/password provider açyk bolmaly. Hosted Supabase proýektlerinde e-poçta tassyklamasy adatça açyk bolýar.

Registrasiýadan soň sessiýa berilmese kabinet ulanyja e-poçtasyny tassyklamagy aýdýar. Ulanyjy tassyklama salgysyny açandan soň `#/portal` sahypasyna dolanyp giriş edýär.

Production-da Supabase default e-poçta hyzmatynyň ýerine öz SMTP hyzmatyňyzy sazlamak maslahat berilýär:

```text
Authentication → SMTP Settings
```

## 3. Registrasiýa maglumatlary

Registrasiýada Auth `user_metadata` içine diňe başlangyç maglumat geçirilýär:

```json
{
  "full_name": "Ulanyjynyň ady",
  "account_type": "candidate",
  "company": ""
}
```

Database trigger şol maglumatlardan `portal_profiles` ýazgysyny döredýär. Soň rugsat barlagy user metadata boýunça däl, `portal_profiles.account_type` we PostgreSQL RLS boýunça geçirilýär.

## 4. Portal sessiýasy

Frontend aýratyn session key ulanýar:

```text
idegli_supabase_portal_session_v1
```

Admin sessiýasy bilen portal sessiýasy biri-birinden aýratyn saklanýar.

Kabinet:

- access token möhletini barlaýar;
- möhleti gutarmanka refresh token bilen sessiýany täzeleýär;
- logout wagty Supabase Auth sessiýasyny ýapýar;
- profil we arza maglumatlaryny JWT bilen soraýar.

## 5. Arzany kabinete baglamak

Ulanyjy kabinetde giriş eden ýagdaýynda public formany iberse:

1. Frontend portal JWT-sini `submit-application` Edge Function-a geçirýär.
2. Edge Function JWT-ni Supabase Auth arkaly täzeden barlaýar.
3. `portal_profiles.account_type` forma görnüşi bilen deňeşdirilýär.
4. Kandidat hasaby diňe kandidat formasyny, iş beriji hasaby diňe iş beriji formasyny baglap biler.
5. Dogry bolsa `applications.owner_id` ulanyjynyň Auth UUID-si bilen ýazylýar.
6. Arza kabinetde görünýär.

Giriş edilmedik guest arza öňküsi ýaly kabul edilýär, emma `owner_id = null` bolýar we şahsy kabinetde görünmeýär.

Öňden bar bolan guest arzalar awtomatik täze hasaba geçirilmeýär. Olary baglamak üçin admin tarapyndan aýratyn tassyklanan migration zerur.

## 6. Profil mümkinçilikleri

Kandidat:

- ady we familiýasy;
- telefon;
- şäher;
- e-poçta diňe okamak üçin.

Iş beriji:

- ady we familiýasy;
- kompaniýa;
- telefon;
- şäher;
- e-poçta diňe okamak üçin.

Ulanyjy `account_type` ýa-da Auth user ID-ni üýtgedip bilmeýär.

## 7. Arzalar sanawy

Kabinetde:

- ähli öz arzalarynyň sany;
- aktiw prosesleriň sany;
- status;
- iberilen wagty;
- soňky täzelenme;
- forma maglumatlary;
- CV faýlynyň ady

görkezilýär.

Kandidat ýa-da iş beriji statusy özi üýtgedip ýa-da arzany pozup bilmeýär. Bu hereketler diňe IDEGLI HR admin panelinde ýerine ýetirilýär.

## 8. Edge Function deployment

`submit-application` täzeden deploy edilmeli:

```bash
supabase functions deploy submit-application --project-ref YOUR_PROJECT_REF
```

Ýa-da GitHub → Actions → `Deploy Supabase Functions` workflow-y işlediň.

## 9. Barlaýyş

1. `portal_accounts.sql` işlediň.
2. Auth Site URL we Redirect URLs sazlaň.
3. `submit-application` function-y täzeden deploy ediň.
4. `#/portal` arkaly kandidat hasaby dörediň.
5. E-poçta tassyklamasyny tamamlaň we giriş ediň.
6. Kandidat formasyny kabinet sessiýasy açyk wagty iberiň.
7. `applications.owner_id` maglumatyny barlaň.
8. Arzanyň diňe şol kandidat kabinetinde görünýändigini barlaň.
9. Iş beriji hasaby bilen iş beriji sargydyny gaýtalaň.
10. Kandidat hasabyndan iş beriji formasyny ibermäge synanyşyp, serweriň ret edýändigini barlaň.
11. Başga portal ulanyjysynyň şol arzany REST API arkaly okap bilmeýändigini barlaň.
