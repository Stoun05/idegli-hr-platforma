# IDEGLI HR Platforma

IDEGLI üçin işgär saýlap-seçiş, Executive Search we karýera konsultasiýasy hyzmatlaryny bir ýerde jemleýän web-platformanyň başlangyç wersiýasy.

## Häzirki wersiýada

- Türkmen we rus dilleri
- Premium, mobil enjamlara uýgunlaşýan baş sahypa
- Recruitment, Executive Search we karýera konsultasiýasy bölümleri
- Gözleg we üç görnüşli filtr bilen wakansiýalar katalogy
- Her wakansiýa üçin giňişleýin maglumat paneli
- Saýlanan wakansiýanyň arza formasyna awtomatik geçirilmegi
- Giňeldilen dalaşgär arza formasy
- PDF, DOC we DOCX CV saýlamak interfeýsi
- CV görnüşi we 5 MB ölçeg çägi boýunça frontend barlagy
- Şahsy maglumatlaryň işlenmegine razylyk barlagy
- Giňeldilen iş beriji işgär sargyt formasy
- Kompaniýa, wezipe, işgär sany, tejribe, iş formaty, aýlyk we möhlet maglumatlary
- Gizlin wakansiýa sargydy üçin aýratyn saýlaw
- Checkbox we razylyk bloklarynyň responsive layout düzedişi
- IDEGLI barada professional tanyşdyryş bölümi
- Maksatly gözleg, gizlinlik we netijä çenli goldaw ýörelgeleri
- Telefon, e-poçta we Aşgabat maglumatlary bilen kontakt bölümi
- Arzalary şol brauzeriň localStorage bölüminde saklaýan demo maglumat gatlagy
- Kandidat we iş beriji ýazgylaryny görkezýän demo admin paneli
- Admin panelde gözleg, görnüş/status filtri we status üýtgetmek
- Ýazgylary pozmak, hemmesini arassalamak we CSV çykarmak
- Düşnükli 4 tapgyrly recruitment prosesi
- Accessibility we reduced-motion sazlamalary
- GitHub Pages arkaly awtomatik ýerleşdiriş

## Demo admin paneli

GitHub Pages saýtynda admin demo şu hash-salgy arkaly açylýar:

```text
https://stoun05.github.io/idegli-hr-platforma/#/admin
```

Saýtyň footer bölümindäki `Admin demo` salgylanmasy hem şol panela geçirýär.

### Möhüm çäklendirme

Bu admin panel hakyky backend däl:

- maglumatlar diňe arza doldurylan brauzerde saklanýar;
- başga enjamda ýa-da başga brauzerde görünmeýär;
- brauzer maglumatlary arassalansa arzalar pozulýar;
- CV faýlynyň özi saklanmaýar, diňe faýlyň ady, görnüşi we ölçegi saklanýar;
- admin panelde entek giriş/parol goragy ýok.

## Işletmek

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Tehnologiýalar

- React
- Vite
- Arassa CSS
- Browser localStorage
- GitHub Actions
- GitHub Pages

## Tamamlanan tapgyrlar

1. Başlangyç premium baş sahypa
2. Kod gurluşyny aýratyn komponentlere bölmek
3. Wakansiýalar katalogy, gözleg, filtrler we giňişleýin maglumat paneli
4. Giňeldilen dalaşgär formasy we CV ýüklemek interfeýsi
5. Giňeldilen iş beriji işgär sargyt formasy
6. Checkbox layout düzedişi, “Biz barada” we professional kontakt bölümleri
7. Brauzer demo maglumat gatlagy we HR admin paneli

## Indiki tapgyrlar

1. IDEGLI-niň hakyky logo we resmi brend reňklerini ýerleşdirmek
2. Supabase/PostgreSQL maglumat bazasyny birikdirmek
3. CV faýllaryny hakyky bulut ammarynda saklamak
4. Admin panel üçin ygtybarly giriş we rollar
5. Telegram/email habarnamalary
6. Iş beriji we dalaşgär şahsy kabinetleri
7. SEO, analitika we hakyky domen

## Bellik

Häzirki wakansiýalar demo maglumatlarydyr. Formalar submit edilende maglumatlar diňe şol brauzeriň localStorage bölümine ýazylýar. Production ulanylyşy üçin backend, maglumat bazasy, faýl ammary, autentifikasiýa we hukuk goragy hökmanydyr.
