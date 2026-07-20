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
- kandidat üçin reusable anketa we CV metadata meýdanlaryny goşýar;
- kandidat anketa meýdanlaryna public REST update grant bermeýär;
- `admin` we `hr` rollaryna profilleri okamak rugsadyny saklaýar.

Kandidat meýdanlary:

```text
candidate_role
candidate_experience_key
candidate_languages
candidate_salary
candidate_message
candidate_cv_metadata
```

`candidate_experience_key` diňe `none`, `junior`, `mid`, `senior` bahalaryny kabul edýär. Şeýlelikde dil çalşylanda tejribe derejesi degişli TM/RU ýazgysyna öwrülýär.

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

```text
?portal=callback   — registrasiýa we email üýtgetme tassyklamasy
?portal=recovery   — parol dikeltme salgysy
#/portal           — giriş we dashboard
```

Auth callback access token-i URL fragmentinden alyp, Supabase `/user` endpoint-i arkaly täzeden barlaýar.

## 3. Registrasiýa

Registrasiýada Auth `user_metadata` içine diňe başlangyç maglumat geçirilýär:

```json
{
  "full_name": "Ulanyjynyň ady",
  "account_type": "candidate",
  "company": ""
}
```

Database trigger şol maglumatlardan `portal_profiles` ýazgysyny döredýär. Hakyky rugsat barlagy metadata boýunça däl, database profil we RLS boýunça geçirilýär.

## 4. Portal sessiýasy

Frontend session key:

```text
idegli_supabase_portal_session_v1
```

Admin sessiýasy bilen portal sessiýasy aýratyn saklanýar. Access token möhleti barlanýar, refresh token arkaly täzelenýär we logout wagty Supabase sessiýasy ýapylýar.

## 5. Kandidat anketasy

Kandidat kabinetindäki **Kandidat anketasy / AUTO-FILL** panelinde:

- islenýän wezipe;
- tejribe derejesi;
- bilýän dilleri;
- garaşýan aýlygy;
- özi barada gysgaça maglumat;
- esasy CV

saklanýar.

Panel anketanyň dolulygyny göterim görnüşinde görkezýär. CV diňe PDF, DOC ýa-da DOCX bolup, iň köp 5 MB bolup biler.

Kandidat anketa maglumatlary ordinary REST PATCH arkaly däl, `portal-profile` Edge Function arkaly ýazylýar. Function:

1. JWT-ni Supabase Auth arkaly barlaýar.
2. Hasabyň `candidate` görnüşindedigini tassyklaýar.
3. Meýdan uzynlyklaryny we tejribe key-ni barlaýar.
4. CV bolsa faýl görnüşini we ölçegini täzeden barlaýar.
5. Täze CV-ni private Storage-a upload edýär.
6. Database update şowsuz bolsa täze faýly pozýar.
7. Üstünlikli replace-den soň öňki profil CV-sini pozýar.

## 6. Täze arzany awtomatik doldurmak

Girişli kandidat public kandidat formasyny açanda:

- ady we familiýasy;
- telefon;
- Auth e-poçtasy;
- şäher;
- islenýän wezipe;
- tejribe;
- diller;
- garaşýan aýlygy;
- gysga maglumat

boş meýdanlara awtomatik doldurylýar.

Wakansiýa katalogyndan anyk wezipe saýlanan bolsa, şol wezipe kandidat profilindäki umumy wezipeden ileri tutulýar.

Forma kandidat tarapyndan el bilen üýtgedilen maglumatlary täzeden ýazmaýar; diňe boş meýdanlary doldurýar.

## 7. Kabinetdäki CV-ni arzada ulanmak

Kandidat iki ýol saýlap biler:

1. Kabinetdäki esasy CV-ni ulanmak.
2. Şol arza üçin başga CV saýlamak.

Kabinetdäki CV saýlananda frontend diňe `useProfileCv=true` iberýär. Storage ýoluny brauzer kesgitlemeýär.

`submit-application` Edge Function:

1. Portal JWT-ni we kandidat account type-y barlaýar.
2. Profil CV ýoluny database-den service role bilen okaýar.
3. Ýoluň `profiles/<auth-user-id>/` prefiksine degişlidigini tassyklaýar.
4. CV-ni `applications/<application-id>/...` ýoluna private copy edýär.
5. Application metadata-syna `source = portal-profile-copy` ýazýar.
6. Application INSERT şowsuz bolsa nusgalanan CV-ni pozýar.

Şeýlelikde kabinetdäki CV soň çalşyrylsa ýa-da aýrylsa, öňki application CV nusgalary saklanýar.

## 8. Paroly dikeltmek

**Paroly ýatdan çykardyňyzmy?** akymy `/auth/v1/recover` ulanýar. Recovery callback tokeni `/auth/v1/user` arkaly barlanýar, token URL-den aýrylýar we localStorage-da saklanmaýar. Parol täzelenenden soň täzeden giriş talap edilýär.

## 9. Parol we e-poçta howpsuzlygy

Kabinetiň **Hasap howpsuzlygy** bölüminde häzirki parol bilen password update, Secure password change üçin `/auth/v1/reauthenticate` nonce we email change callback-i bar.

Production-da custom SMTP we degişli Auth security notification şablonlaryny açmak maslahat berilýär.

## 10. Arzany kabinete baglamak

Ulanyjy kabinetde giriş eden ýagdaýynda:

1. Frontend portal JWT-sini `submit-application` function-a geçirýär.
2. Function JWT we account type-y serverde barlaýar.
3. `applications.owner_id` Auth UUID bilen ýazylýar.
4. Arza diňe şol ulanyjynyň kabinetinde görünýär.

Guest arza `owner_id = null` bolýar. Öňki guest arzalar awtomatik täze hasaba geçirilmeýär.

## 11. Profil we arzalar

Kandidat esasy profilinde ady, telefon, şäher we Auth e-poçtasy bar. Iş beriji profilinde goşmaça kompaniýa ady bar.

Kabinetde arza sany, aktiw prosesler, status, iberilen wagt, soňky täzelenme, forma maglumatlary we application CV ady görkezilýär. Ulanyjy statusy özi üýtgedip ýa-da arzany pozup bilmeýär.

## 12. Edge Function deployment

```text
portal-profile
submit-application
notify-hr
```

```bash
supabase functions deploy portal-profile --project-ref YOUR_PROJECT_REF
supabase functions deploy submit-application --project-ref YOUR_PROJECT_REF
supabase functions deploy notify-hr --project-ref YOUR_PROJECT_REF
```

Ýa-da GitHub Actions-daky `Deploy Supabase Functions` workflow-y üç function-y hem deploy edýär.

## 13. Barlaýyş

1. Täzelenen `portal_accounts.sql` işlediň.
2. Site URL we Redirect URLs sazlaň.
3. Üç Edge Function-y deploy ediň.
4. Kandidat hasaby dörediň we giriş ediň.
5. Kandidat anketasyny dolduryň we CV goşuň.
6. `portal_profiles` kandidat meýdanlaryny barlaň.
7. Storage-da `candidate-cvs/profiles/<user-id>/...` faýlyny barlaň.
8. Public kandidat formasyna geçip autofill maglumatlaryny barlaň.
9. Kabinetdäki CV-ni saýlap arza iberiň.
10. `candidate-cvs/applications/<application-id>/...` aýratyn nusgasyny barlaň.
11. Profil CV-ni çalşyryp, öňki application nusgasynyň saklanýandygyny barlaň.
12. Başga portal ulanyjysynyň profil ýa-da arza maglumatlaryny okap bilmeýändigini barlaň.
