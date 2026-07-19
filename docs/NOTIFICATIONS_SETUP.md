# IDEGLI Telegram we e-poçta habarnamalary

Bu tapgyr `application_events` audit wakalaryny Supabase Database Webhook arkaly `notify-hr` Edge Function-a iberýär. Function Telegram Bot API we Resend Email API arkaly HR toparyna habar berýär.

## Habarnama döredýän wakalar

- `created` — täze kandidat arzasy ýa-da iş beriji sargydy;
- `status_changed` — arza statusynyň üýtgemegi;
- `note_added` — täze HR belligi.

`note_added` habarnamasyny `NOTIFY_ON_NOTE_ADDED=false` bilen öçürip bolýar.

## 1. SQL faýllary

Supabase SQL Editor-de şu tertipde işlediň:

```text
supabase/schema.sql
supabase/storage.sql
supabase/hr_activity.sql
supabase/notifications.sql
supabase/assign_admin_role.sql
```

`notifications.sql`:

- `notification_deliveries` tablisany döredýär;
- Telegram we e-poçta synanyşyklaryny saklaýar;
- `processing`, `sent`, `failed`, `skipped` statuslaryny ulanýar;
- bir waka/kanal/alyjy kombinasiýasyny gaýtalamazlyk üçin unique çäk goýýar;
- diňe `admin` we `hr` rollaryna delivery taryhyny okatýar.

## 2. Telegram bot

1. Telegram-da `@BotFather` arkaly täze bot dörediň.
2. Bot tokenini alyň.
3. Bot-a habar ýazyň ýa-da ony HR toparynyň toparyna goşuň.
4. Brauzerde ýa-da terminalda şu Bot API usulyny ulanyp `chat.id` tapyň:

```text
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates
```

5. Forum topic ulanylýan bolsa degişli `message_thread_id`-ni hem alyň.

Edge Function secret-lary:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
TELEGRAM_MESSAGE_THREAD_ID   # hökmany däl
```

Telegram habary HTML formatda iberilýär, admin paneline link goşulýar we `protect_content=true` ulanylýar.

## 3. Resend e-poçta

1. Resend hasaby dörediň.
2. Iberiji domeni tassyklaň.
3. API key dörediň.
4. Iberiji we alyjy adreslerini belläň.

Edge Function secret-lary:

```text
RESEND_API_KEY
NOTIFICATION_EMAIL_FROM=IDEGLI HR <hr@your-domain.com>
NOTIFICATION_EMAIL_TO=hr@your-domain.com
```

Birnäçe alyjyny vergul ýa-da nokatly vergul bilen bölüp bolýar:

```text
NOTIFICATION_EMAIL_TO=hr@example.com,manager@example.com
```

E-poçta iberişinde `idegli/<event-id>/email` görnüşli Resend idempotency key ulanylýar. Webhook gaýtadan işlese-de şol waka üçin e-poçta gaýtalanmaz.

## 4. Edge Function secret-lary

Supabase Dashboard → Edge Functions → Secrets bölüminde ýa-da CLI arkaly goşuň:

```bash
supabase secrets set NOTIFICATION_WEBHOOK_SECRET="LONG_RANDOM_SECRET"
supabase secrets set TELEGRAM_BOT_TOKEN="123456:BOT_TOKEN"
supabase secrets set TELEGRAM_CHAT_ID="-1001234567890"
supabase secrets set RESEND_API_KEY="re_xxxxxxxxx"
supabase secrets set NOTIFICATION_EMAIL_FROM="IDEGLI HR <hr@your-domain.com>"
supabase secrets set NOTIFICATION_EMAIL_TO="hr@your-domain.com"
supabase secrets set ADMIN_PANEL_URL="https://stoun05.github.io/idegli-hr-platforma/#/admin"
supabase secrets set NOTIFY_ON_NOTE_ADDED="true"
```

`NOTIFICATION_WEBHOOK_SECRET` üçin uzyn, tötänleýin secret ulanyň. Ol GitHub repository-a ýa-da frontend environment-e goýulmaýar.

## 5. Edge Function deployment

CLI arkaly:

```bash
supabase functions deploy notify-hr --project-ref YOUR_PROJECT_REF
```

Repository-da manual GitHub Actions workflow hem bar:

```text
.github/workflows/deploy-supabase-functions.yml
```

GitHub repository secrets:

```text
SUPABASE_ACCESS_TOKEN
SUPABASE_PROJECT_ID
```

Soň GitHub → Actions → `Deploy Supabase Functions` → `Run workflow`.

## 6. Database Webhook

Supabase Dashboard → Database → Webhooks → Create webhook:

```text
Name: idegli-application-events-notify
Schema: public
Table: application_events
Events: INSERT
Method: POST
URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/notify-hr
```

Custom HTTP header:

```text
x-idegli-webhook-secret: LONG_RANDOM_SECRET
```

Header bahasy `NOTIFICATION_WEBHOOK_SECRET` bilen edil deň bolmaly.

Function `verify_jwt=false` režiminde işleýär, sebäbi Database Webhook ulanyjy JWT-sini ibermeýär. Şonuň üçin custom secret hökmany barlanýar.

## 7. Admin panel

Admin kartasynyň `Habarnamalar` bölüminde:

- Telegram ýa-da e-poçta kanaly;
- iberiş statusy;
- synanyşyk sany;
- iberilen wagty;
- şowsuzlygyň gysga sebäbi

görkezilýär.

Admin panel notification tablisasynyň SQL-i entek işledilmedik bolsa hem açylýar; diňe delivery sanawy boş görünýär.

## 8. Barlaýyş

1. `notifications.sql` işlediň.
2. Function secret-laryny goşuň.
3. `notify-hr` function-y deploy ediň.
4. `application_events` üçin INSERT webhook dörediň.
5. Täze kandidat ýa-da iş beriji formasyny iberiň.
6. Telegram we e-poçtanyň gelendigini barlaň.
7. Admin panelde `Habarnamalar` bölüminde `Iberildi` statusyny barlaň.
8. Arza statusyny üýtgedip ikinji habarnamany barlaň.
9. Webhook Logs we Edge Function Logs arkaly şowsuz synanyşyklary derňäň.

## Howpsuzlyk

- Telegram tokeni, Resend key we webhook secret diňe Supabase Edge Function secrets-de saklanýar.
- Frontend bu tokenleriň hiç birini almaýar.
- Function diňe custom secret gabat gelende webhook-y kabul edýär.
- Delivery log-a CV, HR belliginiň teksti ýa-da ähli forma payload-y ýazylmaýar; diňe sanitizirlenen gysga metadata saklanýar.
- `SUPABASE_SERVICE_ROLE_KEY` diňe Edge Function server gurşawynda ulanylýar.
