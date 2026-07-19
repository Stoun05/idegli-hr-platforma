# IDEGLI private CV Storage sazlamasy

Bu bölüm kandidat CV faýllaryny public URL däl-de, private Supabase Storage bucket-de saklaýar.

## 1. Anonymous Sign-Ins açmak

Supabase Dashboard → Authentication → Providers → Anonymous Sign-Ins bölüminde anonymous girişleri işjeňleşdiriň.

Kandidat forma iberende brauzer e-poçtasyz anonymous sessiýa alýar. Şol sessiýanyň UUID-si CV üçin aýratyn private bukja bolýar:

```text
candidate-cvs/anonymous/<user-id>/<random-id>.pdf
```

## 2. SQL faýllaryny işletmek

Supabase Dashboard → SQL Editor bölüminde şu tertipde işlediň:

```text
supabase/schema.sql
supabase/storage.sql
```

`storage.sql`:

- `candidate-cvs` atly private bucket döredýär;
- faýl ölçegini 5 MB bilen çäklendirýär;
- diňe PDF, DOC we DOCX MIME görnüşlerine rugsat berýär;
- anonymous kandidata diňe öz UUID bukjasyna upload/read/delete rugsadyny berýär;
- `admin` we `hr` roluna ähli CV-leri okamak we pozmak rugsadyny berýär.

## 3. GitHub secrets

Repository → Settings → Secrets and variables → Actions bölüminde:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

bolmaly. `service_role` ýa-da secret key frontend-e goşulmaýar.

## 4. Iş akymy

Kandidat formany iberende:

1. Faýl görnüşi we 5 MB çägi frontendde barlanýar.
2. Anonymous Supabase sessiýasy döredilýär ýa-da öňki sessiýa täzelenýär.
3. CV private bucket-e täze, gaýtalanmaýan ýol bilen ýüklenýär.
4. `applications.cv_metadata` içine bucket, storage ýol, ady, ölçegi we MIME görnüşi ýazylýar.
5. Arza ýazgysy başa barmasa, ýüklenen faýl yzyna pozulýar.

Admin panelde `admin` ýa-da `hr` ulanyjy:

- private CV-ni JWT arkaly ýükläp alýar;
- arza pozulanda degişli CV hem Storage-dan pozulýar.

## 5. Howpsuzlyk

Bucket private bolany üçin açyk public URL ýok. Faýl diňe:

- anonymous eýesiniň öz JWT-si;
- `admin` ýa-da `hr` rolunyň JWT-si

bilen açylýar.

Anonymous Sign-Ins public ulanylyşda abuse-a sezewar bolup biler. Production açylyşdan öň Supabase Authentication bölüminde Cloudflare Turnstile ýa-da CAPTCHA goşmak maslahat berilýär.

## 6. Anonymous ulanyjylary arassalamak

Bir brauzer üçin bir anonymous sessiýa gaýtadan ulanylýar. Köne anonymous ulanyjylary döwürleýin arassalamak üçin aýratyn administratiw SQL/job taýýarlamaly. CV we arza ýazgylary saklanýan wagty ulanyjyny awtomatik pozmaň; ilki saklama möhletini we maglumat gorag düzgünini kesgitläň.

## 7. Barlaýyş

1. Supabase we GitHub secret-laryny sazlaň.
2. GitHub Pages deployment tamamlanandan soň kandidat formasyny dolduryň.
3. Supabase Storage → `candidate-cvs` bucket-de private faýly barlaň.
4. Table Editor → `applications` içinde `cv_metadata.storagePath` maglumatyny barlaň.
5. `#/admin` arkaly HR hasaby bilen girip `CV-ni ýüklemek` düwmesini barlaň.
6. Arzany pozup, faýlyň bucket-den hem ýok bolandygyny barlaň.
