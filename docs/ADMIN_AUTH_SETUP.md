# IDEGLI admin giriş sazlamasy

Bu görkezme `#/admin` sahypasynda Supabase Auth arkaly giriş açmak we `admin`/`hr` rollary bilen remote arza bazasyny dolandyrmak üçin niýetlenendir.

## 1. Ilki Supabase backend-i sazlaň

Öňürti şu faýldaky ädimleri ýerine ýetiriň:

```text
docs/SUPABASE_SETUP.md
```

Şeýle hem SQL Editor-de:

```text
supabase/schema.sql
```

faýly işlediň.

## 2. Admin ulanyjysyny dörediň

Supabase Dashboard → Authentication → Users bölüminde täze ulanyjy dörediň:

- IDEGLI admin ýa-da HR işgäriniň e-poçtasy;
- güýçli, özboluşly parol;
- e-poçta tassyklamasyny degişli ýagdaýda tamamlamak.

Admin hasaplaryny public sign-up forma arkaly döretmäň.

## 3. `admin` ýa-da `hr` roly beriň

Repository-daky şu şablony açyň:

```text
supabase/assign_admin_role.sql
```

Faýlda:

```sql
target_email text := 'CHANGE_ME@example.com';
target_role text := 'admin';
```

setirlerini üýtgediň.

Rugsat berilýän rollar:

```text
admin
hr
```

Soň SQL-ni Supabase Dashboard → SQL Editor bölüminde işlediň.

Rol `raw_app_meta_data.role` içine ýazylýar. Ulanyjy bu maglumatlary özbaşdak üýtgedip bilmeýär.

## 4. Täze JWT alyň

Rol berlenden soň admin ulanyjy:

1. admin panelden çyksyn;
2. täzeden giriş etsin.

Sebäbi öňki sessiýa JWT-si täze `app_metadata.role` maglumatyny saklamazlygy mümkin.

## 5. Admin paneli açyň

```text
https://stoun05.github.io/idegli-hr-platforma/#/admin
```

Supabase environment secret-lary bar bolsa:

- login sahypasy açylýar;
- email we parol Supabase Auth-a iberilýär;
- diňe `admin` ýa-da `hr` roly bolan sessiýa dowam edýär;
- maglumatlar Supabase/PostgreSQL bazasyndan ýüklenýär.

Supabase sazlanmadyk bolsa şol salgy öňki localStorage demo admin panelini açýar.

## 6. Remote admin mümkinçilikleri

Girişden soň admin:

- ähli kandidat we iş beriji arzalaryny görýär;
- gözleg we filtr ulanýar;
- statusy üýtgedýär;
- ýazgyny pozýar;
- CSV çykaryp alýar;
- maglumatlary täzeläp bilýär;
- sessiýadan çykyp bilýär.

## 7. Howpsuzlyk modeli

Frontend-de diňe publishable key bolýar. Ol gizlin açar däl.

Admin maglumatlary üçin iki gorag bar:

1. frontend diňe `admin` ýa-da `hr` roly bolan sessiýany kabul edýär;
2. PostgreSQL Row Level Security hakyky JWT-däki `app_metadata.role` maglumatyny täzeden barlaýar.

Şonuň üçin brauzerdäki UI-ni üýtgetmek bilen maglumat bazasyna rugsatsyz girmek mümkin bolmaly däl.

## 8. Hiç wagt etmäň

- `service_role` ýa-da secret key-ni GitHub Pages-e goýmaň;
- secret key-ni `VITE_*` environment üýtgeýjisinde ulanmaň;
- admin parolyny repository-a ýazmaň;
- admin hasabyny umumy işgärler bilen paýlaşmaň;
- RLS syýasatlaryny aýyrmaň.

## 9. Test sanawy

1. Public forma arkaly täze arza iberiň.
2. Admin hasaby bilen `#/admin` sahypasyna giriň.
3. Arzanyň remote panelde görünýändigini barlaň.
4. Statusy `Seredilýär` edip üýtgediň.
5. Sahypany täzeläp, statusyň saklanandygyny barlaň.
6. Roly ýok adaty ulanyjy bilen giriş edip görüň — giriş ret edilmelidir.
7. Sessiyadan çykyp, paneliň gaýtadan login sorandygyny barlaň.
