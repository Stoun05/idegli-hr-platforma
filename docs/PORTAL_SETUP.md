# IDEGLI kandidat we iş beriji şahsy kabinetleri

Şahsy kabinet:

```text
https://stoun05.github.io/idegli-hr-platforma/#/portal
```

Kabinet `candidate` we `employer` hasap görnüşlerini goldaýar.

## 1. SQL migration

Supabase SQL Editor-de esasy schema-dan soň işlediň:

```text
supabase/portal_accounts.sql
```

Faýl:

- `portal_profiles` tablisany döredýär;
- `applications.owner_id` sütünini goşýar;
- täze Auth ulanyjysy üçin profil trigger-i döredýär;
- diňe öz profilini we öz arzalaryny görkezýän RLS goşýar;
- `account_type` sütünini frontend tarapyndan üýtgedip bolmaýan edýär;
- `admin` we `hr` rollaryna profilleri okamak rugsadyny saklaýar.

## 2. Supabase Auth URL sazlamasy

Authentication → URL Configuration:

```text
Site URL:
https://stoun05.github.io/idegli-hr-platforma/

Redirect URLs:
https://stoun05.github.io/idegli-hr-platforma/**
http://localhost:5173/**
```

Email/password provider açyk bolmaly.

Platforma şu callback akymlaryny ulanýar:

```text
?portal=callback   — registrasiýa we email üýtgetme tassyklamasy
?portal=recovery   — parol dikeltme salgysy
#/portal           — giriş we dashboard
```

Auth callback access token-i URL fragmentinden alyp, Supabase `/user` endpoint-i arkaly täzeden barlaýar. Token nädogry ýa-da möhleti geçen bolsa kabinet açylmaýar.

## 3. Registrasiýa

Registrasiýada Auth `user_metadata` içine diňe başlangyç maglumat geçirilýär:

```json
{
  "full_name": "Ulanyjynyň ady",
  "account_type": "candidate",
  "company": ""
}
```

Database trigger şol maglumatlardan `portal_profiles` ýazgysyny döredýär. Hakyky rugsat barlagy metadata boýunça däl, `portal_profiles.account_type` we PostgreSQL RLS boýunça geçirilýär.

E-poçta tassyklamasy açyk bolsa, ulanyjy gelen salgyny açýar. Callback sessiýany tassyklaýar we `#/portal` sahypasyna geçirýär.

## 4. Portal sessiýasy

Frontend session key:

```text
idegli_supabase_portal_session_v1
```

Admin sessiýasy bilen portal sessiýasy aýratyn saklanýar.

Kabinet:

- access token möhletini barlaýar;
- refresh token arkaly sessiýany täzeleýär;
- profil we arza maglumatlaryny JWT bilen soraýar;
- logout wagty Supabase Auth sessiýasyny ýapýar;
- profil, email ýa-da parol täzelenende öňki sessiýanyň expiry maglumatyny ýitirmeýär.

## 5. Paroly dikeltmek

Giriş sahypasyndaky **Paroly ýatdan çykardyňyzmy?** düwmesi:

1. `/auth/v1/recover` endpoint-ine e-poçtany iberýär.
2. Redirect hökmünde `?portal=recovery` ulanýar.
3. Recovery salgysy access token bilen saýt açýar.
4. Frontend token-i `/auth/v1/user` arkaly barlaýar.
5. Ulanyjy täze paroly iki gezek ýazýar.
6. Parol `/auth/v1/user` arkaly täzelenýär.
7. Recovery sessiýasy localStorage-dan aýrylýar we täze parol bilen täzeden giriş talap edilýär.

UI hasabyň bardygyny ýa-da ýokdugyny aýratyn açyp görkezmeýär. Bu e-poçta enumeration töwekgelçiligini azaldýar.

## 6. Girişli ulanyjynyň parolyny üýtgetmek

Kabinetiň **Hasap howpsuzlygy** bölüminde:

- häzirki parol;
- täze parol;
- täze paroly gaýtalamak;
- islege görä 6 belgili reauthentication nonce

ulanylýar.

Frontend `current_password` maglumatyny Auth update request-a geçirýär.

Supabase Dashboard-da **Secure password change** açyk we sessiýa ýeterlik täze däl bolsa:

1. Ulanyjy **Howpsuzlyk koduny ibermek** düwmesine basýar.
2. `/auth/v1/reauthenticate` ulanyjynyň e-poçtasyna nonce iberýär.
3. Ulanyjy 6 belgili kody forma girizýär.
4. Täze parol `nonce` bilen tassyklanýar.

## 7. E-poçtany üýtgetmek

E-poçta üýtgetme akymy:

1. Täze e-poçta girizilýär.
2. Ulanyjy häzirki paroly bilen täzeden login edilip barlanýar.
3. Auth `/user` endpoint-ine täze e-poçta iberilýär.
4. Tassyklama redirect-i `?portal=callback` bolýar.
5. Callback täze sessiýany barlap, kabineti açýar.

Supabase-daky **Secure email change** açyk bolsa, köne we täze e-poçta salgylarynyň ikisini hem tassyklamak gerek bolup biler.

## 8. SMTP we e-poçta goragy

Production-da Authentication → SMTP Settings bölüminde öz SMTP hyzmatyňyzy sazlamak maslahat berilýär.

Gerekli e-poçta şablonlary:

- Confirm sign up;
- Reset password;
- Change email address;
- Reauthentication;
- Password changed notification;
- Email address changed notification.

Security notification e-poçtalary Auth sazlamasynda aýratyn açylýar.

## 9. Arzany kabinete baglamak

Ulanyjy kabinetde giriş eden ýagdaýynda public formany iberse:

1. Frontend portal JWT-sini `submit-application` Edge Function-a geçirýär.
2. Edge Function JWT-ni Supabase Auth arkaly täzeden barlaýar.
3. `portal_profiles.account_type` forma görnüşi bilen deňeşdirilýär.
4. Kandidat hasaby diňe kandidat formasyny, iş beriji hasaby diňe iş beriji formasyny baglap biler.
5. Dogry bolsa `applications.owner_id` Auth UUID bilen ýazylýar.
6. Arza kabinetde görünýär.

Guest arza `owner_id = null` bolýar. Öňki guest arzalar awtomatik täze hasaba geçirilmeýär.

## 10. Profil we arzalar

Kandidat profilinde:

- ady we familiýasy;
- telefon;
- şäher;
- e-poçta diňe okamak üçin.

Iş beriji profilinde goşmaça kompaniýa ady bar.

Kabinetde:

- ähli arzalaryň sany;
- aktiw prosesleriň sany;
- status;
- iberilen wagty;
- soňky täzelenme;
- forma maglumatlary;
- CV faýlynyň ady

görkezilýär.

Ulanyjy statusy özi üýtgedip ýa-da arzany pozup bilmeýär.

## 11. Edge Function deployment

Portal JWT-ni baglamak üçin `submit-application` täzeden deploy edilmeli:

```bash
supabase functions deploy submit-application --project-ref YOUR_PROJECT_REF
```

## 12. Barlaýyş

1. `portal_accounts.sql` işlediň.
2. Site URL we Redirect URLs sazlaň.
3. Email/password provider-i açyň.
4. `submit-application` function-y deploy ediň.
5. Kandidat hasaby dörediň we e-poçtany tassyklaň.
6. Recovery hatyny iberip paroly täzeläň.
7. Girişli kabinetde häzirki parol bilen täze parol belläň.
8. Secure password change açyk bolsa reauthentication nonce-i barlaň.
9. E-poçtany üýtgedip callback akymyny barlaň.
10. Kandidat formasyny sessiýa açyk wagty iberiň we `owner_id` maglumatyny barlaň.
11. Başga portal ulanyjysynyň şol arzany REST API arkaly okap bilmeýändigini barlaň.
12. Security notification e-poçtalarynyň gelýändigini barlaň.
