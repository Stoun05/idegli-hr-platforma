# IDEGLI private CV Storage sazlamasy

Bu bölüm kandidat CV faýllaryny public URL däl-de, private Supabase Storage bucket-de saklaýar. Public brauzer Storage-a göni upload etmeýär; ähli production upload-lar `submit-application` Edge Function service role arkaly ýerine ýetirilýär.

## 1. SQL faýllaryny işletmek

Supabase Dashboard → SQL Editor bölüminde:

```text
supabase/schema.sql
supabase/storage.sql
supabase/abuse_protection.sql
```

`storage.sql`:

- `candidate-cvs` private bucket döredýär;
- faýl ölçegini 5 MB bilen çäklendirýär;
- diňe PDF, DOC we DOCX MIME görnüşlerine rugsat berýär;
- public/anonymous upload syýasatlaryny aýyrýar;
- diňe `admin` we `hr` roluna private CV-ni okamak we pozmak rugsadyny berýär.

Service role RLS-den geçip upload edýär, ýöne bu açar diňe Supabase Edge Function server gurşawynda bolýar.

## 2. Frontend we Edge Function sazlamasy

GitHub Pages frontend üçin:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_TURNSTILE_SITE_KEY
```

Edge Function secrets üçin:

```text
TURNSTILE_SECRET_KEY
RATE_LIMIT_PEPPER
ALLOWED_SITE_ORIGINS
TURNSTILE_ALLOWED_HOSTNAMES
```

`service_role`, Turnstile secret ýa-da beýleki private açar frontend-e goşulmaýar.

## 3. Kandidat iş akymy

Kandidat formany iberende:

1. Faýl görnüşi we 5 MB çägi frontendde barlanýar.
2. Cloudflare Turnstile tokeni Edge Function-da Siteverify arkaly tassyklanýar.
3. IP we kontakt boýunça hash rate-limit barlanýar.
4. Edge Function öňünden application UUID döredýär.
5. CV şu private ýola ýüklenýär:

```text
candidate-cvs/applications/<application-id>/<random-id>.pdf
```

6. `applications.cv_metadata` içine bucket, storage ýol, original at, ölçeg we MIME görnüşi ýazylýar.
7. Arza INSERT şowsuz bolsa, ýüklenen CV awtomatik pozulýar.

## 4. Admin akymy

`admin` ýa-da `hr` ulanyjy:

- Supabase Auth JWT bilen private CV-ni ýükläp alýar;
- arza pozulanda degişli CV-ni hem Storage-dan pozýar.

Bucket private bolany üçin açyk public URL ýok. Kandidat submit edenden soň faýly göni açyp bilmeýär; faýl diňe HR tarapyndan iş maksady bilen dolandyrylýar.

## 5. Howpsuzlyk

- Public REST arkaly Storage upload rugsady ýok.
- Public `applications` INSERT rugsady hem ýok.
- Turnstile secret diňe Edge Function secrets-de saklanýar.
- CV-niň original ady diňe metadata hökmünde saklanýar; storage ýol tötänleýin UUID-lardan durýar.
- Admin download we delete hereketleri Storage RLS tarapyndan `admin`/`hr` roly bilen barlanýar.

## 6. Barlaýyş

1. `schema.sql`, `storage.sql`, `abuse_protection.sql` işlediň.
2. `submit-application` Edge Function secret-laryny sazlaň we deploy ediň.
3. GitHub Pages-de Turnstile site key goşuň.
4. Kandidat formasyny CV bilen dolduryň.
5. Storage → `candidate-cvs/applications/...` içinde private faýly barlaň.
6. `applications.cv_metadata.storagePath` maglumatyny barlaň.
7. Public publishable key bilen göni Storage upload synanyşygynyň ret edilýändigini barlaň.
8. `#/admin` arkaly HR hasaby bilen CV-ni ýükläp almagy barlaň.
9. Arzany pozup, faýlyň bucket-den hem ýok bolandygyny barlaň.
