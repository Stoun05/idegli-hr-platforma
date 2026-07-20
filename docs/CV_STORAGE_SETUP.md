# IDEGLI private CV Storage sazlamasy

Kandidat CV faýllary public URL däl-de, private `candidate-cvs` Supabase Storage bucket-de saklanýar. Brauzer Storage-a göni upload etmeýär; production upload, copy, replace we delete hereketleri Edge Function service role arkaly ýerine ýetirilýär.

## 1. SQL faýllary

Supabase SQL Editor-de:

```text
supabase/schema.sql
supabase/storage.sql
supabase/portal_accounts.sql
supabase/abuse_protection.sql
```

`storage.sql`:

- `candidate-cvs` private bucket döredýär;
- iň köp 5 MB çäk goýýar;
- diňe PDF, DOC we DOCX MIME görnüşlerine rugsat berýär;
- public/anonymous upload syýasatlaryny aýyrýar;
- diňe `admin` we `hr` roluna private application CV-ni okamak we pozmak rugsadyny berýär.

`portal_accounts.sql` kandidat profiliniň CV metadata-syny `portal_profiles.candidate_cv_metadata` sütüninde saklaýar.

## 2. Storage ýollary

Kabinetde gaýtadan ulanylýan esasy CV:

```text
candidate-cvs/profiles/<auth-user-id>/<random-id>.<ext>
```

Aýratyn arza CV-si:

```text
candidate-cvs/applications/<application-id>/<random-id>.<ext>
```

Storage ýolunda original faýl ady ulanylmaýar. Original at diňe private JSON metadata hökmünde saklanýar.

## 3. Kandidat profil CV akymy

`portal-profile` Edge Function:

1. Portal JWT-ni Supabase Auth arkaly barlaýar.
2. `portal_profiles.account_type = candidate` bolmagyny talap edýär.
3. Faýlyň görnüşini we 5 MB çägini serverde barlaýar.
4. Täze CV-ni `profiles/<user-id>/...` ýoluna upload edýär.
5. Database update şowsuz bolsa täze faýly pozýar.
6. Update üstünlikli bolsa öňki profil CV-sini pozýar.
7. Kandidat CV-ni aýyrsa metadata arassalanýar we degişli private faýl pozulýar.

Public ulanyjy Storage API arkaly bu ýola göni upload edip bilmeýär.

## 4. Profil CV bilen arza ibermek

Girişli kandidat public formany açanda kabinetdäki CV-ni saýlap biler.

`submit-application` Edge Function:

1. Portal JWT we account type maglumatyny barlaýar.
2. `candidate_cv_metadata.storagePath` ýolunyň şol ulanyja degişli `profiles/<user-id>/` prefiksi bilen başlanýandygyny barlaýar.
3. Profil CV-sini `applications/<application-id>/...` ýoluna private server-side copy edýär.
4. Täze application metadata-syna `source = portal-profile-copy` ýazýar.
5. Application INSERT şowsuz bolsa nusgalanan faýly pozýar.

Application öz aýratyn CV nusgasyny alýar. Şonuň üçin kandidat soň kabinetdäki esasy CV-ni çalşanda ýa-da pozanda öňki arzalaryň CV faýllary üýtgemeýär.

## 5. Täze faýl bilen arza ibermek

Kandidat forma üçin başga CV saýlasa:

1. Frontend extension we 5 MB çägini barlaýar.
2. Turnstile we rate-limit geçirilýär.
3. Edge Function faýly göni `applications/<application-id>/...` ýoluna upload edýär.
4. `applications.cv_metadata.source = selected-file` bolýar.
5. DB INSERT şowsuz bolsa upload yzyna pozulýar.

## 6. Edge Functions

```text
portal-profile
submit-application
```

Deployment:

```bash
supabase functions deploy portal-profile --project-ref YOUR_PROJECT_REF
supabase functions deploy submit-application --project-ref YOUR_PROJECT_REF
```

Iki function hem `ALLOWED_SITE_ORIGINS` secret-i ulanýar. `submit-application` goşmaça Turnstile we rate-limit secret-laryny talap edýär.

## 7. Admin akymy

`admin` ýa-da `hr`:

- application CV-ni Supabase Auth JWT bilen download edýär;
- arza pozulanda degişli `applications/...` CV nusgasyny hem pozýar.

Profil CV-si kandidat tarapyndan replace/delete edilýär. Ol application CV nusgalaryndan aýratyn saklanýar.

## 8. Howpsuzlyk

- Public REST arkaly Storage upload rugsady ýok.
- Kandidat profil CV update-i diňe authenticated Edge Function arkaly işleýär.
- `service_role` diňe Supabase server gurşawynda bolýar.
- Profil CV başga ulanyjynyň ýolundan nusgalanyp bilinmeýär.
- Bucket private; açyk public URL ýok.
- Faýl görnüşi we ölçegi frontendde hem, Edge Function-da hem barlanýar.
- Application CV we profile CV lifecycle-lary aýratyn.

## 9. Barlaýyş

1. `schema.sql`, `storage.sql`, `portal_accounts.sql`, `abuse_protection.sql` işlediň.
2. `portal-profile` we `submit-application` function-laryny deploy ediň.
3. Kandidat kabinetinde PDF/DOC/DOCX CV goşuň.
4. Storage-da `candidate-cvs/profiles/<user-id>/...` ýoluny barlaň.
5. `portal_profiles.candidate_cv_metadata` maglumatyny barlaň.
6. Täze arzada kabinetdäki CV-ni saýlaň.
7. Storage-da täze `candidate-cvs/applications/<application-id>/...` nusgasyny barlaň.
8. Profil CV-ni çalşyryp, öňki application CV nusgasynyň saklanýandygyny barlaň.
9. Public publishable key bilen göni Storage upload synanyşygynyň ret edilýändigini barlaň.
10. HR admin panelinde application CV-ni download etmegi barlaň.
