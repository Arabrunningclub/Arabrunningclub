# ARC Google Sheets and Apps Script setup

Use this native Google Sheet for the website:

https://docs.google.com/spreadsheets/d/1WxbdRor0kU6Q8zxtkhyG_bG3oR0GXFauDd5heyx-Cz8/edit

The previously supplied Drive URL is an Office-format workbook. Apps Script and the Google Sheets API should use the native workbook above.

## Create the Apps Script project

1. Open the native workbook.
2. Choose **Extensions → Apps Script**.
3. Replace the default `Code.gs` with `docs/apps-script/Code.gs` from this repository.
4. Open **Project Settings → Script properties**.
5. Add `SPREADSHEET_ID` with value `1WxbdRor0kU6Q8zxtkhyG_bG3oR0GXFauDd5heyx-Cz8`.
6. Add `WRITE_SECRET` with a random value of at least 32 characters.
7. Add `PUBLIC_SITE_URL` with the production website origin, such as `https://www.arab-runningclub.com`.
8. Never put `WRITE_SECRET`, Stripe keys, or webhook secrets in workbook cells.

Generate a secret in PowerShell:

```powershell
[Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

## Deploy the Apps Script web app

1. Choose **Deploy → New deployment**.
2. Select **Web app**.
3. Set **Execute as** to **Me**.
4. Set **Who has access** to **Anyone**.
5. Deploy and authorize access to the workbook.
6. Copy the production URL ending in `/exec`; do not use the `/dev` URL.

The deployment is public so the website can read published content. All writes require `WRITE_SECRET`. The public response excludes `RSVPs - Private` and every admin-notes field.

Test the deployment in a browser:

```text
YOUR_APPS_SCRIPT_EXEC_URL?action=site_data
```

The response should contain `"ok":true`.

## Website environment variables

Add these to `.env.local` and the production host:

```text
APPS_SCRIPT_WEB_APP_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
APPS_SCRIPT_WRITE_SECRET=the_same_value_as_WRITE_SECRET
APPS_SCRIPT_MARKPAID_SECRET=the_same_value_as_WRITE_SECRET
NEXT_PUBLIC_SITE_URL=https://www.arab-runningclub.com
```

`APPS_SCRIPT_WRITE_SECRET` is server-only. Never rename it with a `NEXT_PUBLIC_` prefix and never include it in browser code.

The legacy variables can remain during migration:

```text
APPS_SCRIPT_WEB_APP_URL_PILATES=...
APPS_SCRIPT_WEB_APP_URL_PICKLEBALL=...
```

Remove those two URLs only after Pilates and pickleball use the unified RSVP route.

## Stripe webhook

Stripe should send events to the existing verified server route, not directly to Apps Script:

```text
https://www.arab-runningclub.com/api/stripe-webhook
```

1. In Stripe, open **Developers → Webhooks**.
2. Add the endpoint URL above.
3. Subscribe to both `checkout.session.completed` and `checkout.session.expired`.
4. Copy the endpoint signing secret beginning with `whsec_`.
5. Store it in production as `STRIPE_WEBHOOK_SECRET`.
6. Keep `STRIPE_SECRET_KEY` in the server environment.

The Next.js webhook verifies Stripe's signature before forwarding a secret-protected `payment_update` to Apps Script. Card reservations have a 30-minute payment deadline. Expired Checkout Sessions are marked `Expired`, their RSVP is canceled, and their capacity is released. The script automatically adds a `Payment Deadline` column to `RSVPs - Private` when the first card RSVP is saved.

## Confirmation emails and reminders

Email copy is controlled by the `Event Messages` tab. Add one row for every message you want to send; no code change is needed for additional events, reminders, or reschedule notices.

- Give every row a permanent, unique `Message ID`.
- Set `Event ID` and, optionally, a `Session ID`. A blank Session ID applies to every session for that event.
- Use `Confirmation` to send after an in-person RSVP is saved or after Stripe confirms a card payment.
- Use `Reminder` and set `Hours Before Event`. Multiple reminder rows can use different lead times, such as `24`, `3`, and `1`.
- Use `Reschedule` to notify every confirmed attendee when the session date/time or event location changes.
- Set `Enabled` to `No` while editing or testing a message.
- Successful and failed sends appear in `Email Log - Private`; a sent Message ID is never sent twice to the same RSVP.

Supported subject/body placeholders:

```text
{{name}} {{first_name}} {{email}}
{{event_title}} {{session_name}}
{{event_date}} {{event_time}} {{slot}}
{{location}} {{payment_line}} {{amount_due}}
{{contact_email}} {{event_url}} {{calendar_url}}
{{from_name}} {{reply_to}}
{{previous_event_date}} {{previous_event_time}} {{previous_location}}
```

After replacing and saving `Code.gs`, run `setupEventMessaging` once from the Apps Script editor and approve the requested email permission. This installs one 5-minute trigger and runs an immediate catch-up. The deployment and trigger should both be owned by the Google account that should send the messages.

## Change an event schedule from your phone

`Event Sessions` is the schedule source of truth. Change only `Start At` and `End At` for the relevant Session ID.

1. The public website and both calendar buttons read the session schedule; new page loads see the edit after the short Apps Script cache refresh.
2. The 5-minute automation copies the earliest session start and latest session end into `Events`, keeping cards, event pages, lifecycle state, and registration checks aligned.
3. Existing registration-open and registration-close values shift by the same amount as the event start.
4. Due reminders are recalculated from the new session start. A reminder already sent for an older schedule may send once again for the new schedule.
5. Enabled `Reschedule` rows notify confirmed attendees and show the previous and new schedule/location.
6. Every attempted delivery is recorded in `Email Log - Private`; successful deliveries are not duplicated, while failed deliveries retry.
7. Unpaid card holds are also expired by this automation if a Stripe expiration webhook is delayed.

Changing the event location in `Events` also triggers the reschedule message. Google Calendar links always contain the latest sheet values when clicked. A calendar event someone already saved belongs to that attendee and cannot be silently edited by the website, so the reschedule email includes `{{calendar_url}}` for updating it.

## Implemented connection

The website now includes server-side routes for public content, availability, and RSVP writes. Navigation, homepage content, homepage event cards, the Events listing, donation controls, and `/events/[slug]` read from this workbook. Existing hard-coded content remains as a temporary fallback when the Apps Script endpoint is unavailable.

Remaining payment migration:

1. Configure Stripe in test mode.
2. Confirm checkout metadata contains the unified Event ID and RSVP ID.
3. Confirm `checkout.session.completed` changes the matching RSVP row to `Paid`.
4. Retire the legacy event-specific iframe pages and Apps Script deployments.

## Workbook rules

- Use permanent, unique Event IDs and Session IDs.
- Keep new events as `Draft` until ready, then select `Published`.
- Set Registration Enabled to `No` before modifying a live event's sessions.
- Keep `RSVPs - Private` restricted to trusted organizers.
- Do not rename table headers after the code is connected; Apps Script uses exact header names.
- Use website paths or public image URLs, not private Drive share links.
- Event card, preview, hero-overlay, registration-card, accent, and button colors live in the dedicated `Event Card Themes` tab. Each event has separate light- and dark-mode card values. Use hex colors such as `#FFFFFF`; hero gradients also accept eight-digit hex colors such as `#5B2447E6` for transparency.
- The page canvas is intentionally fixed to white in light mode and black in dark mode. Spreadsheet colors only style the contained cards and hero overlay, so theme switching stays readable and consistent.
- Redeploy the Apps Script web app after changing `Code.gs`.
