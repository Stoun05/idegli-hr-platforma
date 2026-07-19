# IDEGLI HR bellikleri we kandidat taryhy

Bu tapgyr admin panelde içerki HR belliklerini we arza boýunça üýtgeşmeleriň üýtgedilip bilinmeýän audit taryhyny goşýar.

## 1. SQL faýly işletmek

Supabase Dashboard → SQL Editor bölüminde esasy schema-dan soň şu faýly işlediň:

```text
supabase/hr_activity.sql
```

Doly maslahat berilýän tertip:

```text
supabase/schema.sql
supabase/storage.sql
supabase/hr_activity.sql
supabase/assign_admin_role.sql
```

## 2. Döredilýän tablisalar

### `application_notes`

Her HR belliginde:

- degişli `application_id`;
- belligiň teksti;
- `created_by` Supabase Auth UUID;
- awtoryň e-poçtasy;
- `admin` ýa-da `hr` roly;
- döredilen we täzelenen wagt

saklanýar.

Bell **1–4000 nyşan** arasynda bolmaly.

### `application_events`

Audit taryhy şu wakalary saklaýar:

- `created` — arza döredildi;
- `status_changed` — status öňki ýagdaýdan täze ýagdaýa geçirildi;
- `note_added` — HR belligi goşuldy.

Her ýazgyda aktýoryň UUID-si, e-poçtasy, roly we wagt belgisi saklanýar.

## 3. Database triggerleri

`applications` tablisasynda:

- täze arza döredilende `created` wakasy;
- status üýtgände `status_changed` wakasy

automatiki döredilýär.

`application_notes` tablisasynda täze bellik goşulanda `note_added` wakasy döredilýär.

Frontend taryh ýazgysyny özi döretmeýär. Şonuň üçin ulanyjy brauzerde UI-ni üýtgetse-de, database audit triggeri hakyky üýtgeşmäni ýazga alýar.

## 4. Öňki arzalaryň taryhy

SQL faýly işledilende öňden bar bolan we `created` wakasy ýok arzalar üçin başlangyç taryh ýazgysy döredilýär.

Bu ýazgyda:

```json
{
  "backfilled": true
}
```

metadata bolýar.

## 5. RLS howpsuzlygy

Diňe JWT `app_metadata.role` içinde:

```text
admin
hr
```

bolan authenticated ulanyjy:

- bellikleri görüp biler;
- täze bellik goşup biler;
- belligi üýtgedip ýa-da pozup biler;
- audit taryhyny görüp biler.

Public kandidat, anonymous submitter ýa-da iş beriji bellikleri we audit taryhyny okap bilmeýär.

Audit taryhyna frontend ulanyjysy göni INSERT/UPDATE/DELETE edip bilmeýär. Ol diňe security-definer database triggerleri arkaly ýazylýar.

## 6. Admin paneldäki mümkinçilikler

Her arza kartynyň `Ähli maglumatlar` bölüminde:

- HR bellik ýazmak;
- 4000 nyşan çägi;
- awtor we wagt maglumatyny görmek;
- belligi pozmak;
- arza döredilen wagty görmek;
- ähli status üýtgeşmelerini görmek;
- statusyň öňki we täze ýagdaýyny görmek;
- üýtgeşmäni eden admin/HR ulanyjysyny görmek

mümkin.

## 7. Barlaýyş

1. `supabase/hr_activity.sql` faýly işlediň.
2. `#/admin` arkaly `admin` ýa-da `hr` hasaby bilen giriň.
3. Arzanyň statusyny `Täze arza`-dan `Seredilýär` ýagdaýyna geçiriň.
4. `Kandidat taryhy` bölüminde status üýtgeşmesini barlaň.
5. Täze HR belligi goşuň.
6. Belligiň awtoryny we wagtyny barlaň.
7. Adaty ýa-da anonymous ulanyjy bilen REST arkaly `application_notes` we `application_events` SELECT synanyşygynyň RLS tarapyndan ret edilýändigini barlaň.

## 8. Maglumat saklama düzgüni

HR bellikleri şahsy we içerki iş maglumatlaryny saklap biler. Production ulanmazdan öň:

- belliklerde saklanmaly maglumatlaryň çägini;
- maglumatlaryň saklanyş möhletini;
- kimiň bellik goşup ýa-da pozup biljekdigini;
- kandidat maglumatlaryny pozmak prosedurasyny

IDEGLI-niň içerki düzgünlerinde kesgitlemek maslahat berilýär.
