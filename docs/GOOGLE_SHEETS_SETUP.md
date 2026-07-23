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
CHECKIN_ADMIN_KEY=choose_a_private_staff_access_key
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
- Use `Off Waitlist` to notify the next person after the automation promotes them into an available spot.
- Set `Enabled` to `No` while editing or testing a message.
- Successful and failed sends appear in `Email Log - Private`; a sent Message ID is never sent twice to the same RSVP.

Supported subject/body placeholders:

```text
{{name}} {{first_name}} {{email}}
{{event_title}} {{session_name}}
{{event_date}} {{event_time}} {{slot}}
{{location}} {{payment_line}} {{amount_due}}
{{contact_email}} {{event_url}} {{calendar_url}} {{checkin_url}}
{{from_name}} {{reply_to}}
{{previous_event_date}} {{previous_event_time}} {{previous_location}}
```

After replacing and saving `Code.gs`, run `setupEventMessaging` once from the Apps Script editor and approve the requested email permission. This installs one 5-minute trigger and runs an immediate catch-up. The trigger sends confirmations and due reminders and expires unpaid card holds; it does not send reschedule notices. The deployment and trigger should both be owned by the Google account that should send the messages.

### Add the reschedule button

In Google Sheets:

1. Open the spreadsheet.
2. Go to **Insert → Drawing**.
3. Create a button labeled **Send Reschedule Update**.
4. Save and place it on the sheet.
5. Click the button's three-dot menu and choose **Assign script**.
6. Enter `sendRescheduleUpdates`.

Do not include parentheses. Clicking the button compares the current session schedule and event location with the last published baseline, sends enabled `Reschedule` messages, and stores the current values as the new official baseline.

### Waitlist promotion

When an event has `Waitlist Enabled` set to `Yes`, a registration made after its session fills is saved as `Waitlisted` with the next `Waitlist Position`. Payment preferences are saved, but waitlisted card registrations are not sent to Stripe or given a payment deadline.

The five-minute `runEventMessaging` automation:

1. Expires unpaid confirmed card holds.
2. Counts only active `Confirmed` RSVPs against session capacity.
3. Promotes the lowest waitlist position when a spot is available.
4. Reorders the remaining waitlist positions.
5. Sends the matching enabled `Off Waitlist` message once.

Promotion requires a matching enabled `Off Waitlist` row, preventing a spot from being assigned without a notification. For card payment, the 30-minute hold begins after that email is sent successfully. The `{{event_url}}` placeholder opens the existing RSVP on the registration card, where the attendee can continue to secure checkout. It does not create a duplicate registration. Template placeholder names are case-insensitive, although lowercase names are preferred.

Example `Event Messages` row:

```text
pickleball-waitlist-reminder | pickleball-august-2026 | pickleball-august-main | Yes | Off Waitlist | [blank] | You've come off the waitlist for {{event_title}} | [email body containing {{event_url}}] | Arab Recreational Club | arabrunningclub@gmail.com
```

### Event check-in

Add `{{checkin_url}}` to the three-hour `Reminder` message. The link is signed for one RSVP and expires 12 hours after that session ends. Attendees open it on arrival and press **I'm here — check me in**; the Apps Script records `Checked In = Yes` and automatically adds `Checked In At` if needed.

Staff can open `/check-in/admin`, enter the private `CHECKIN_ADMIN_KEY`, and select an event or session. The page shows checked-in and still-expected attendees and refreshes every 15 seconds. Do not put `CHECKIN_ADMIN_KEY` in the spreadsheet.

## Change an event schedule from your phone

`Event Sessions` is the schedule source of truth. Change only `Start At` and `End At` for the relevant Session ID.

1. The public website and both calendar buttons read the session schedule; new page loads see the edit after the short Apps Script cache refresh.
2. The 5-minute automation copies the earliest session start and latest session end into `Events`, keeping cards, event pages, lifecycle state, and registration checks aligned.
3. Existing registration-open and registration-close values shift by the same amount as the event start.
4. Due reminders are recalculated from the new session start. A reminder already sent for an older schedule may send once again for the new schedule.
5. When the edits are ready, click **Send Reschedule Update**. Enabled `Reschedule` rows notify confirmed attendees and show the previous and new schedule/location.
6. Every attempted delivery is recorded in `Email Log - Private`; successful deliveries are not duplicated, while failed deliveries retry.
7. Unpaid card holds are also expired by this automation if a Stripe expiration webhook is delayed.

Changing the event location in `Events` is also detected the next time **Send Reschedule Update** is clicked. Google Calendar links always contain the latest sheet values when clicked. A calendar event someone already saved belongs to that attendee and cannot be silently edited by the website, so the reschedule email includes `{{calendar_url}}` for updating it.

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
