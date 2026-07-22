/** ARC website control web app.
 * Script properties:
 *   SPREADSHEET_ID = 1WxbdRor0kU6Q8zxtkhyG_bG3oR0GXFauDd5heyx-Cz8
 *   WRITE_SECRET   = a long random secret
 */
const TABS = Object.freeze({
  events: "Events", sessions: "Event Sessions", fields: "Registration Fields",
  rsvps: "RSVPs - Private", media: "Event Media", themes: "Event Card Themes", content: "Site Content",
  navigation: "Navigation", campaigns: "Charity & Campaigns", settings: "Settings",
  messages: "Event Messages", emailLog: "Email Log - Private",
});

const CARD_PAYMENT_TIMEOUT_MS = 30 * 60 * 1000;
const EVENT_MESSAGE_TRIGGER = Object.freeze({
  confirmation: "Confirmation", reminder: "Reminder", reschedule: "Reschedule",
});
const MAX_EMAILS_PER_RUN = 50;

function doGet(e) {
  try {
    const action = String(e?.parameter?.action || "site_data").trim();
    if (action === "site_data") return json_(getSiteData_());
    if (action === "availability") {
      return json_(getAvailability_(String(e?.parameter?.eventId || "").trim()));
    }
    return json_({ ok: false, error: "Unknown action" });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: safeMessage_(error) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e?.postData?.contents || "{}");
    requireSecret_(body.secret);
    if (body.action === "rsvp") return json_(createRsvp_(body));
    if (body.action === "payment_update") return json_(updatePayment_(body));
    return json_({ ok: false, error: "Unknown action" });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: safeMessage_(error) });
  }
}

function getSiteData_() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get("site_data_v2");
  if (cached) return JSON.parse(cached);

  const eventRows = rows_(TABS.events)
    .filter((row) => row["Publish Status"] === "Published");
  const eventIds = new Set(eventRows.map((event) => text_(event["Event ID"])));
  const sessionRows = rows_(TABS.sessions)
    .filter((row) => eventIds.has(text_(row["Event ID"])));
  const events = eventRows
    .map((row) => publicEvent_(row, sessionRows.filter((session) =>
      text_(session["Event ID"]) === text_(row["Event ID"]))))
    .sort((a, b) => a.sortPriority - b.sortPriority || a.startAt.localeCompare(b.startAt));
  const sessions = sessionRows
    .map(publicSession_).sort((a, b) => a.displayOrder - b.displayOrder);

  const media = rows_(TABS.media)
    .filter((row) => eventIds.has(text_(row["Event ID"])) && row.Visible === "Yes")
    .map((row) => ({
      mediaId: text_(row["Media ID"]), eventId: text_(row["Event ID"]),
      imageUrl: text_(row["Image URL"]), caption: text_(row.Caption),
      altText: text_(row["Alt Text"]), photographer: text_(row.Photographer),
      featured: row.Featured === "Yes", sortOrder: number_(row["Sort Order"]),
    })).sort((a, b) => a.sortOrder - b.sortOrder);

  const eventThemes = rows_(TABS.themes)
    .filter((row) => eventIds.has(text_(row["Event ID"])))
    .map(publicEventTheme_);

  const registrationFields = rows_(TABS.fields)
    .filter((row) => row.Enabled === "Yes")
    .map((row) => ({
      fieldId: text_(row["Field ID"]), eventId: text_(row["Event ID"]),
      label: text_(row.Label), fieldType: text_(row["Field Type"]),
      required: row.Required === "Yes",
      options: text_(row["Options (pipe separated)"]).split("|").filter(Boolean),
      helpText: text_(row["Help Text"]), displayOrder: number_(row["Display Order"]),
    })).sort((a, b) => a.displayOrder - b.displayOrder);

  const content = {};
  rows_(TABS.content).filter((row) => row.Published === "Yes").forEach((row) => {
    content[text_(row["Content Key"])] = { value: text_(row.Content), linkUrl: text_(row["Link URL"]) };
  });

  const navigation = rows_(TABS.navigation).filter((row) => row.Visible === "Yes")
    .map((row) => ({
      id: text_(row["Nav ID"]), label: text_(row.Label), url: text_(row.URL),
      external: row.External === "Yes", displayOrder: number_(row["Display Order"]),
    })).sort((a, b) => a.displayOrder - b.displayOrder);

  const campaigns = rows_(TABS.campaigns)
    .filter((row) => ["Active", "Completed"].includes(text_(row.Status)))
    .map((row) => ({
      campaignId: text_(row["Campaign ID"]), type: text_(row.Type), status: text_(row.Status),
      title: text_(row.Title), shortDescription: text_(row["Short Description"]),
      fullDescription: text_(row["Full Description"]), goalAmount: nullableNumber_(row["Goal Amount"]),
      amountRaised: nullableNumber_(row["Amount Raised Override"]), startDate: iso_(row["Start Date"]),
      endDate: iso_(row["End Date"]), partner: text_(row.Partner),
      buttonText: text_(row["Button Text"]), buttonUrl: text_(row["Button URL"]),
      featuredImageUrl: text_(row["Featured Image URL"]), displayOrder: number_(row["Display Order"]),
    })).sort((a, b) => a.displayOrder - b.displayOrder);

  const settings = {};
  rows_(TABS.settings).filter((row) => row.Public === "Yes").forEach((row) => {
    settings[text_(row["Setting Key"])] = typedSetting_(row.Value, row["Value Type"]);
  });

  const payload = { ok: true, generatedAt: new Date().toISOString(), events, eventThemes, sessions, media,
    registrationFields, content, navigation, campaigns, settings };
  cache.put("site_data_v2", JSON.stringify(payload), 15);
  return payload;
}

function getAvailability_(eventId) {
  if (!eventId) throw new Error("Missing eventId");
  const rsvps = rows_(TABS.rsvps).filter((row) =>
    text_(row["Event ID"]) === eventId && isActiveRsvp_(row));
  const sessions = rows_(TABS.sessions).filter((row) => text_(row["Event ID"]) === eventId).map((row) => {
    const sessionId = text_(row["Session ID"]);
    const capacity = number_(row.Capacity);
    const registered = rsvps.filter((rsvp) => text_(rsvp["Session ID"]) === sessionId).length;
    return { sessionId, capacity, registered, left: capacity > 0 ? Math.max(0, capacity - registered) : null,
      full: capacity > 0 && registered >= capacity, registrationStatus: text_(row["Registration Status"]) };
  });
  return { ok: true, eventId, sessions };
}

function createRsvp_(body) {
  const eventId = requiredText_(body.eventId, "eventId");
  const sessionId = requiredText_(body.sessionId, "sessionId");
  const fullName = requiredText_(body.fullName, "fullName");
  const email = requiredText_(body.email, "email").toLowerCase();
  const phone = text_(body.phone);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const event = rows_(TABS.events).find((row) =>
      text_(row["Event ID"]) === eventId && row["Publish Status"] === "Published");
    if (!event) throw new Error("Event not found or unpublished");
    if (event["Registration Enabled"] !== "Yes") throw new Error("Registration is closed");
    const closes = date_(event["Registration Closes"]);
    if (closes && closes.getTime() < Date.now()) throw new Error("Registration is closed");

    const session = rows_(TABS.sessions).find((row) =>
      text_(row["Event ID"]) === eventId && text_(row["Session ID"]) === sessionId);
    if (!session) throw new Error("Session not found");
    if (!["Open", "Waitlist"].includes(text_(session["Registration Status"]))) {
      throw new Error("This session is not accepting registrations");
    }

    const existing = rows_(TABS.rsvps).filter((row) =>
      text_(row["Event ID"]) === eventId && text_(row["Session ID"]) === sessionId &&
      isActiveRsvp_(row));
    const capacity = number_(session.Capacity);
    const isFull = capacity > 0 && existing.length >= capacity;
    if (isFull && event["Waitlist Enabled"] !== "Yes") throw new Error("This session is full");

    const registrationStatus = isFull ? "Waitlisted" : "Confirmed";
    const paymentMethod = text_(body.paymentMethod || "None");
    const amountDue = paymentMethod === "Card" ? number_(session["Card Price"]) : number_(session["Pay Later Price"]);
    const paymentStatus = amountDue > 0 ? "Pending" : "Not Required";
    const rsvpId = Utilities.getUuid();
    const waitlistPosition = isFull
      ? existing.filter((row) => text_(row["Registration Status"]) === "Waitlisted").length + 1 : "";

    const rsvpSheet = sheet_(TABS.rsvps);
    rsvpSheet.appendRow([rsvpId, eventId, sessionId, new Date(), fullName, email, phone,
      registrationStatus, paymentStatus, paymentMethod, amountDue, 0, "", "No", "", waitlistPosition,
      "No", "No", text_(body.adminNotes)]);
    let paymentExpiresAt = "";
    if (paymentMethod === "Card" && amountDue > 0) {
      const headers = rsvpSheet.getRange(1, 1, 1, rsvpSheet.getLastColumn()).getValues()[0].map(text_);
      ensureHeader_(rsvpSheet, headers, "Payment Deadline");
      const deadline = new Date(Date.now() + CARD_PAYMENT_TIMEOUT_MS);
      setByHeader_(rsvpSheet, headers, rsvpSheet.getLastRow(), "Payment Deadline", deadline);
      paymentExpiresAt = deadline.toISOString();
    }
    trySendConfirmation_(rsvpId);
    return { ok: true, rsvpId, registrationStatus, paymentStatus, amountDue, waitlistPosition, paymentExpiresAt };
  } finally {
    lock.releaseLock();
  }
}

function updatePayment_(body) {
  const rsvpId = requiredText_(body.rsvpId, "rsvpId");
  const sheet = sheet_(TABS.rsvps);
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(text_);
  const idCol = headers.indexOf("RSVP ID");
  const rowIndex = values.findIndex((row, index) => index > 0 && text_(row[idCol]) === rsvpId);
  if (rowIndex < 0) throw new Error("RSVP not found");
  const incomingStripeSessionId = text_(body.stripeSessionId);
  const stripeSessionCol = headers.indexOf("Stripe Session ID");
  const currentStripeSessionId = stripeSessionCol >= 0 ? text_(values[rowIndex][stripeSessionCol]) : "";
  if (body.onlyIfCurrentStripeSession === true &&
      incomingStripeSessionId !== currentStripeSessionId) {
    return { ok: true, rsvpId, ignored: true, reason: "Superseded Stripe session" };
  }
  setByHeader_(sheet, headers, rowIndex + 1, "Payment Status", text_(body.paymentStatus || "Paid"));
  setByHeader_(sheet, headers, rowIndex + 1, "Stripe Session ID", incomingStripeSessionId);
  if (body.paymentMethod) {
    setByHeader_(sheet, headers, rowIndex + 1, "Payment Method", text_(body.paymentMethod));
  }
  if (body.amountDue !== undefined) {
    setByHeader_(sheet, headers, rowIndex + 1, "Amount Due", number_(body.amountDue));
  }
  if (body.registrationStatus) {
    setByHeader_(sheet, headers, rowIndex + 1, "Registration Status", text_(body.registrationStatus));
  }
  if (body.paymentDeadline) {
    ensureHeader_(sheet, headers, "Payment Deadline");
    setByHeader_(sheet, headers, rowIndex + 1, "Payment Deadline", date_(body.paymentDeadline));
  }
  if (body.clearPaymentDeadline === true && headers.indexOf("Payment Deadline") >= 0) {
    setByHeader_(sheet, headers, rowIndex + 1, "Payment Deadline", "");
  }
  if (body.amountPaid !== undefined) setByHeader_(sheet, headers, rowIndex + 1, "Amount Paid", number_(body.amountPaid));
  if (text_(body.paymentStatus) === "Paid") trySendConfirmation_(rsvpId);
  return {
    ok: true,
    rsvpId,
    paymentMethod: body.paymentMethod ? text_(body.paymentMethod) : undefined,
    amountDue: body.amountDue !== undefined ? number_(body.amountDue) : undefined,
  };
}

function isActiveRsvp_(row) {
  if (["Canceled", "Sample"].includes(text_(row["Registration Status"]))) return false;
  if (text_(row["Payment Method"]) !== "Card" || text_(row["Payment Status"]) !== "Pending") return true;
  const deadline = date_(row["Payment Deadline"]);
  const createdAt = date_(row["Submitted At"] || row["Created At"]);
  const expiresAt = deadline || (createdAt ? new Date(createdAt.getTime() + CARD_PAYMENT_TIMEOUT_MS) : null);
  return !expiresAt || expiresAt.getTime() > Date.now();
}

/** Run this once from the Apps Script editor after deploying this version. */
function setupEventMessaging() {
  ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === "runEventMessaging")
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger));
  ScriptApp.newTrigger("runEventMessaging").timeBased().everyMinutes(5).create();
  runEventMessaging();
}

/** Trigger handler: catches up confirmations and sends every due reminder row. */
function runEventMessaging() {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    expireUnpaidCardHolds_();
    const messages = rows_(TABS.messages).filter((row) => text_(row.Enabled) === "Yes");
    const events = rows_(TABS.events);
    const sessions = rows_(TABS.sessions);
    const rsvps = rows_(TABS.rsvps);
    let sent = processScheduleChanges_(messages, events, sessions, rsvps);
    syncEventScheduleRows_(events, sessions);

    for (const rsvp of rsvps) {
      if (sent >= MAX_EMAILS_PER_RUN || MailApp.getRemainingDailyQuota() <= 0) break;
      if (!isEmailEligibleRsvp_(rsvp)) continue;
      const event = events.find((row) => text_(row["Event ID"]) === text_(rsvp["Event ID"]));
      const session = sessions.find((row) => text_(row["Session ID"]) === text_(rsvp["Session ID"]));
      if (!event || !session) continue;

      for (const message of messagesForRsvp_(messages, rsvp)) {
        if (sent >= MAX_EMAILS_PER_RUN || MailApp.getRemainingDailyQuota() <= 0) break;
        const type = text_(message["Message Type"]);
        if (![EVENT_MESSAGE_TRIGGER.confirmation, EVENT_MESSAGE_TRIGGER.reminder].includes(type)) continue;
        if (type === EVENT_MESSAGE_TRIGGER.confirmation && !isConfirmationReady_(rsvp)) continue;
        if (type === EVENT_MESSAGE_TRIGGER.reminder &&
            (!isConfirmationReady_(rsvp) || !isReminderDue_(message, session))) continue;
        try {
          const deliveryKey = type === EVENT_MESSAGE_TRIGGER.reminder
            ? `${text_(message["Message ID"])}|${iso_(session["Start At"])}|${iso_(session["End At"])}`
            : text_(message["Message ID"]);
          if (sendEventMessage_(message, rsvp, event, session, deliveryKey)) sent += 1;
        } catch (error) {
          console.error(`Email failed for RSVP ${text_(rsvp["RSVP ID"])}: ${safeMessage_(error)}`);
        }
      }
    }
  } finally {
    lock.releaseLock();
  }
}

function expireUnpaidCardHolds_() {
  const rsvpSheet = sheet_(TABS.rsvps);
  const values = rsvpSheet.getDataRange().getValues();
  if (values.length < 2) return 0;
  const headers = values[0].map(text_);
  const methodCol = headers.indexOf("Payment Method");
  const paymentCol = headers.indexOf("Payment Status");
  const registrationCol = headers.indexOf("Registration Status");
  const deadlineCol = headers.indexOf("Payment Deadline");
  const canceledCol = headers.indexOf("Canceled At");
  const submittedCol = headers.indexOf("Submitted At");
  let expired = 0;

  for (let rowIndex = 1; rowIndex < values.length; rowIndex += 1) {
    if (text_(values[rowIndex][methodCol]) !== "Card" || text_(values[rowIndex][paymentCol]) !== "Pending") continue;
    const submittedAt = submittedCol >= 0 ? date_(values[rowIndex][submittedCol]) : null;
    const deadline = deadlineCol >= 0 ? date_(values[rowIndex][deadlineCol]) : null;
    const expiresAt = deadline || (submittedAt ? new Date(submittedAt.getTime() + CARD_PAYMENT_TIMEOUT_MS) : null);
    if (!expiresAt || expiresAt.getTime() > Date.now()) continue;
    rsvpSheet.getRange(rowIndex + 1, paymentCol + 1).setValue("Expired");
    rsvpSheet.getRange(rowIndex + 1, registrationCol + 1).setValue("Canceled");
    if (canceledCol >= 0) rsvpSheet.getRange(rowIndex + 1, canceledCol + 1).setValue(new Date());
    expired += 1;
  }
  return expired;
}

function processScheduleChanges_(messages, events, sessions, rsvps) {
  const properties = PropertiesService.getScriptProperties();
  let sent = 0;
  for (const session of sessions) {
    if (sent >= MAX_EMAILS_PER_RUN || MailApp.getRemainingDailyQuota() <= 0) break;
    const sessionId = text_(session["Session ID"]);
    if (!sessionId) continue;
    const event = events.find((row) => text_(row["Event ID"]) === text_(session["Event ID"]));
    const location = event
      ? [text_(event.Venue), text_(event["Street Address"]), text_(event["City/State"])].filter(Boolean).join(" · ")
      : "";
    const propertyKey = `SESSION_SCHEDULE_${sessionId}`;
    const current = {
      startAt: iso_(session["Start At"]),
      endAt: iso_(session["End At"]),
      location,
    };
    const currentJson = JSON.stringify(current);
    const previousJson = properties.getProperty(propertyKey);
    if (!previousJson) {
      properties.setProperty(propertyKey, currentJson);
      continue;
    }
    if (previousJson === currentJson) continue;

    let previous;
    try {
      previous = JSON.parse(previousJson);
    } catch (_) {
      previous = {};
    }
    const rescheduleMessages = messages
      .filter((message) => text_(message["Message Type"]) === EVENT_MESSAGE_TRIGGER.reschedule)
      .filter((message) => text_(message["Event ID"]) === text_(session["Event ID"]))
      .filter((message) => !text_(message["Session ID"]) || text_(message["Session ID"]) === sessionId);
    const recipients = rsvps.filter((rsvp) =>
      text_(rsvp["Session ID"]) === sessionId && isEmailEligibleRsvp_(rsvp) && isConfirmationReady_(rsvp));
    let failed = false;

    if (event) {
      for (const rsvp of recipients) {
        for (const message of rescheduleMessages) {
          if (sent >= MAX_EMAILS_PER_RUN || MailApp.getRemainingDailyQuota() <= 0) {
            failed = true;
            break;
          }
          const deliveryKey = `${text_(message["Message ID"])}|${current.startAt}|${current.endAt}`;
          try {
            if (sendEventMessage_(message, rsvp, event, session, deliveryKey, previous)) sent += 1;
          } catch (error) {
            failed = true;
            console.error(`Reschedule email failed for RSVP ${text_(rsvp["RSVP ID"])}: ${safeMessage_(error)}`);
          }
        }
      }
    }
    if (!failed) properties.setProperty(propertyKey, currentJson);
  }
  return sent;
}

function syncEventScheduleRows_(events, sessions) {
  const eventSheet = sheet_(TABS.events);
  const values = eventSheet.getDataRange().getValues();
  const headers = values[0].map(text_);
  const eventIdCol = headers.indexOf("Event ID");
  const startCol = headers.indexOf("Start At");
  const endCol = headers.indexOf("End At");
  const opensCol = headers.indexOf("Registration Opens");
  const closesCol = headers.indexOf("Registration Closes");
  const updatedCol = headers.indexOf("Last Updated");
  let changed = false;

  for (let rowIndex = 1; rowIndex < values.length; rowIndex += 1) {
    const eventId = text_(values[rowIndex][eventIdCol]);
    const eventSessions = sessions.filter((session) => text_(session["Event ID"]) === eventId);
    const starts = eventSessions.map((session) => date_(session["Start At"])).filter(Boolean);
    const ends = eventSessions.map((session) => date_(session["End At"])).filter(Boolean);
    if (!starts.length || !ends.length) continue;
    const nextStart = new Date(Math.min.apply(null, starts.map((date) => date.getTime())));
    const nextEnd = new Date(Math.max.apply(null, ends.map((date) => date.getTime())));
    const previousStart = date_(values[rowIndex][startCol]);
    const previousEnd = date_(values[rowIndex][endCol]);
    if (previousStart && previousEnd && previousStart.getTime() === nextStart.getTime() &&
        previousEnd.getTime() === nextEnd.getTime()) continue;

    const shiftMs = previousStart ? nextStart.getTime() - previousStart.getTime() : 0;
    eventSheet.getRange(rowIndex + 1, startCol + 1).setValue(nextStart);
    eventSheet.getRange(rowIndex + 1, endCol + 1).setValue(nextEnd);
    if (opensCol >= 0 && values[rowIndex][opensCol]) {
      eventSheet.getRange(rowIndex + 1, opensCol + 1).setValue(shiftDate_(values[rowIndex][opensCol], shiftMs));
    }
    if (closesCol >= 0 && values[rowIndex][closesCol]) {
      eventSheet.getRange(rowIndex + 1, closesCol + 1).setValue(shiftDate_(values[rowIndex][closesCol], shiftMs));
    }
    if (updatedCol >= 0) eventSheet.getRange(rowIndex + 1, updatedCol + 1).setValue(new Date());
    changed = true;
  }
  if (changed) CacheService.getScriptCache().remove("site_data_v2");
}

function trySendConfirmation_(rsvpId) {
  try {
    const rsvp = rows_(TABS.rsvps).find((row) => text_(row["RSVP ID"]) === text_(rsvpId));
    if (!rsvp || !isEmailEligibleRsvp_(rsvp) || !isConfirmationReady_(rsvp)) return;
    const event = rows_(TABS.events).find((row) => text_(row["Event ID"]) === text_(rsvp["Event ID"]));
    const session = rows_(TABS.sessions).find((row) => text_(row["Session ID"]) === text_(rsvp["Session ID"]));
    if (!event || !session) return;
    rows_(TABS.messages)
      .filter((message) => text_(message.Enabled) === "Yes")
      .filter((message) => text_(message["Message Type"]) === EVENT_MESSAGE_TRIGGER.confirmation)
      .filter((message) => messageMatchesRsvp_(message, rsvp))
      .forEach((message) => sendEventMessage_(message, rsvp, event, session));
  } catch (error) {
    console.error(`Confirmation email failed for RSVP ${rsvpId}: ${safeMessage_(error)}`);
  }
}

function messagesForRsvp_(messages, rsvp) {
  return messages.filter((message) => messageMatchesRsvp_(message, rsvp));
}

function messageMatchesRsvp_(message, rsvp) {
  const eventMatches = text_(message["Event ID"]) === text_(rsvp["Event ID"]);
  const targetSession = text_(message["Session ID"]);
  return eventMatches && (!targetSession || targetSession === text_(rsvp["Session ID"]));
}

function isEmailEligibleRsvp_(rsvp) {
  return Boolean(text_(rsvp.Email)) && text_(rsvp["Registration Status"]) === "Confirmed" && isActiveRsvp_(rsvp);
}

function isConfirmationReady_(rsvp) {
  const paymentStatus = text_(rsvp["Payment Status"]);
  const paymentMethod = text_(rsvp["Payment Method"]);
  const amountDue = number_(rsvp["Amount Due"]);
  return paymentStatus === "Paid" || paymentStatus === "Not Required" || amountDue <= 0 ||
    paymentMethod === "In person" || paymentMethod === "Cash";
}

function isReminderDue_(message, session) {
  const startsAt = date_(session["Start At"]);
  if (!startsAt) return false;
  const hoursBefore = Math.max(0, number_(message["Hours Before Event"]));
  const sendAt = new Date(startsAt.getTime() - hoursBefore * 60 * 60 * 1000);
  const now = new Date();
  return now.getTime() >= sendAt.getTime() && now.getTime() <= startsAt.getTime();
}

function sendEventMessage_(message, rsvp, event, session, deliveryKey, previousSchedule) {
  const messageId = requiredText_(message["Message ID"], "Message ID");
  const uniqueDeliveryKey = text_(deliveryKey || messageId);
  const rsvpId = requiredText_(rsvp["RSVP ID"], "RSVP ID");
  if (wasEventMessageSent_(uniqueDeliveryKey, rsvpId)) return false;

  const recipient = requiredText_(rsvp.Email, "recipient email");
  const context = emailContext_(message, rsvp, event, session, previousSchedule);
  const subject = renderTemplate_(requiredText_(message.Subject, "email subject"), context);
  const body = renderTemplate_(requiredText_(message.Body, "email body"), context);
  const options = {
    to: recipient,
    subject,
    body,
    name: context.from_name,
  };
  if (context.reply_to) options.replyTo = context.reply_to;

  try {
    MailApp.sendEmail(options);
    logEventMessage_(messageId, uniqueDeliveryKey, rsvpId, text_(rsvp["Event ID"]), recipient, "Sent", "");
    markRsvpEmailSent_(rsvpId, text_(message["Message Type"]));
    return true;
  } catch (error) {
    logEventMessage_(messageId, uniqueDeliveryKey, rsvpId, text_(rsvp["Event ID"]), recipient, "Failed", safeMessage_(error));
    throw error;
  }
}

function emailContext_(message, rsvp, event, session, previousSchedule) {
  const timeZone = text_(event["Time Zone"] || "America/Detroit");
  const startsAt = date_(session["Start At"] || event["Start At"]);
  const endsAt = date_(session["End At"] || event["End At"]);
  const fullName = text_(rsvp["Full Name"]).trim();
  const amountDue = number_(rsvp["Amount Due"]);
  const paymentMethod = text_(rsvp["Payment Method"]);
  const paymentStatus = text_(rsvp["Payment Status"]);
  const fromName = text_(message["From Name"] || "Arab Recreational Club");
  const replyTo = text_(message["Reply-To Email"] || event["Contact Email"]);
  const location = [text_(event.Venue), text_(event["City/State"])].filter(Boolean).join(" · ");
  const siteUrl = text_(PropertiesService.getScriptProperties().getProperty("PUBLIC_SITE_URL")).replace(/\/$/, "");
  const previousStartsAt = date_(previousSchedule && previousSchedule.startAt);
  const previousEndsAt = date_(previousSchedule && previousSchedule.endAt);
  let paymentLine = "Payment: no payment required.";
  if (paymentStatus === "Paid") paymentLine = "Payment: confirmed by card ✅";
  else if (["In person", "Cash"].includes(paymentMethod) && amountDue > 0) {
    paymentLine = `Payment: bring ${currency_(amountDue)} in person.`;
  } else if (amountDue > 0) paymentLine = `Payment still due: ${currency_(amountDue)}.`;

  return {
    name: fullName || "there",
    first_name: fullName.split(/\s+/)[0] || "there",
    email: text_(rsvp.Email),
    event_title: text_(event.Title),
    session_name: text_(session["Session Name"]),
    event_date: startsAt ? Utilities.formatDate(startsAt, timeZone, "EEEE, MMMM d, yyyy") : "Date coming soon",
    event_time: startsAt ? `${Utilities.formatDate(startsAt, timeZone, "h:mm a")} – ${endsAt ? Utilities.formatDate(endsAt, timeZone, "h:mm a z") : ""}`.trim() : "Time coming soon",
    slot: startsAt ? `${Utilities.formatDate(startsAt, timeZone, "h:mm a")} – ${endsAt ? Utilities.formatDate(endsAt, timeZone, "h:mm a z") : ""}`.trim() : "Time coming soon",
    location: location || "Location coming soon",
    payment_line: paymentLine,
    amount_due: currency_(amountDue),
    contact_email: text_(event["Contact Email"]),
    event_url: siteUrl && event.Slug ? `${siteUrl}/events/${text_(event.Slug)}` : "",
    calendar_url: siteUrl
      ? `${siteUrl}/api/calendar?eventId=${encodeURIComponent(text_(event["Event ID"]))}&sessionId=${encodeURIComponent(text_(session["Session ID"]))}`
      : "",
    from_name: fromName,
    reply_to: replyTo,
    previous_event_date: previousStartsAt
      ? Utilities.formatDate(previousStartsAt, timeZone, "EEEE, MMMM d, yyyy") : "the previous date",
    previous_event_time: previousStartsAt
      ? `${Utilities.formatDate(previousStartsAt, timeZone, "h:mm a")} – ${previousEndsAt ? Utilities.formatDate(previousEndsAt, timeZone, "h:mm a z") : ""}`.trim()
      : "the previous time",
    previous_location: text_(previousSchedule && previousSchedule.location) || "the previous location",
  };
}

function renderTemplate_(template, context) {
  let rendered = text_(template);
  Object.keys(context).forEach((key) => {
    rendered = rendered.split(`{{${key}}}`).join(text_(context[key]));
  });
  return rendered;
}

function wasEventMessageSent_(deliveryKey, rsvpId) {
  return rows_(TABS.emailLog).some((row) =>
    text_(row["Delivery Key"] || row["Message ID"]) === deliveryKey &&
    text_(row["RSVP ID"]) === rsvpId && text_(row.Status) === "Sent");
}

function logEventMessage_(messageId, deliveryKey, rsvpId, eventId, recipient, status, error) {
  sheet_(TABS.emailLog).appendRow([new Date(), messageId, deliveryKey, rsvpId, eventId, recipient, status, error]);
}

function markRsvpEmailSent_(rsvpId, messageType) {
  const sheet = sheet_(TABS.rsvps);
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(text_);
  const idCol = headers.indexOf("RSVP ID");
  const rowIndex = values.findIndex((row, index) => index > 0 && text_(row[idCol]) === rsvpId);
  if (rowIndex < 0) return;
  if (messageType === EVENT_MESSAGE_TRIGGER.confirmation) {
    setByHeader_(sheet, headers, rowIndex + 1, "Confirmation Sent", "Yes");
  } else if (messageType === EVENT_MESSAGE_TRIGGER.reminder) {
    setByHeader_(sheet, headers, rowIndex + 1, "Reminder Sent", "Yes");
  }
}

function currency_(value) {
  return `$${number_(value).toFixed(2).replace(/\.00$/, "")}`;
}

function publicEvent_(row, sessionRows) {
  const starts = (sessionRows || []).map((session) => date_(session["Start At"])).filter(Boolean);
  const ends = (sessionRows || []).map((session) => date_(session["End At"])).filter(Boolean);
  const startAt = starts.length ? new Date(Math.min.apply(null, starts.map((date) => date.getTime()))) : date_(row["Start At"]);
  const endAt = ends.length ? new Date(Math.max.apply(null, ends.map((date) => date.getTime()))) : date_(row["End At"]);
  const storedStartAt = date_(row["Start At"]);
  const scheduleShiftMs = startAt && storedStartAt ? startAt.getTime() - storedStartAt.getTime() : 0;
  const registrationOpens = shiftDate_(row["Registration Opens"], scheduleShiftMs);
  const registrationCloses = shiftDate_(row["Registration Closes"], scheduleShiftMs);
  return {
    eventId: text_(row["Event ID"]), slug: text_(row.Slug), featured: row.Featured === "Yes",
    category: text_(row.Category), title: text_(row.Title), shortTitle: text_(row["Short Title"]),
    cardDescription: text_(row["Card Description"]), fullDescription: text_(row["Full Description"]),
    startAt: iso_(startAt), endAt: iso_(endAt),
    timeZone: text_(row["Time Zone"] || "America/Detroit"), registrationOpens: iso_(registrationOpens),
    registrationCloses: iso_(registrationCloses), venue: text_(row.Venue),
    streetAddress: text_(row["Street Address"]), cityState: text_(row["City/State"]), mapUrl: text_(row["Map URL"]),
    displayCost: text_(row["Display Cost"]), capacity: number_(row.Capacity),
    waitlistEnabled: row["Waitlist Enabled"] === "Yes", ageRequirement: text_(row["Age Requirement"]),
    skillLevel: text_(row["Skill Level"]), whatToBring: text_(row["What to Bring"]),
    accessibility: text_(row.Accessibility), contactEmail: text_(row["Contact Email"]),
    buttonText: text_(row["Button Text"]), registrationEnabled: row["Registration Enabled"] === "Yes",
    cancellationStatus: text_(row["Cancellation Status"]), statusMessage: text_(row["Status Message"]),
    heroImageUrl: text_(row["Hero Image URL"]), socialImageUrl: text_(row["Social Image URL"]),
    galleryId: text_(row["Gallery ID"]), sortPriority: number_(row["Sort Priority"]),
    announcement: text_(row.Announcement), lifecycle: text_(row["Lifecycle (Auto)"]),
    lastUpdated: iso_(row["Last Updated"]),
  };
}

function publicEventTheme_(row) {
  return {
    eventId: text_(row["Event ID"]),
    heroGradientStart: text_(row["Hero Gradient Start"]),
    heroGradientEnd: text_(row["Hero Gradient End"]),
    heroText: text_(row["Hero Text"]),
    lightCardBackground: text_(row["Light Card Background"]),
    lightCardText: text_(row["Light Card Text"]),
    lightCardBorder: text_(row["Light Card Border"]),
    darkCardBackground: text_(row["Dark Card Background"]),
    darkCardText: text_(row["Dark Card Text"]),
    darkCardBorder: text_(row["Dark Card Border"]),
    lightPreviewBackground: text_(row["Light Preview Background"]),
    lightPreviewText: text_(row["Light Preview Text"]),
    darkPreviewBackground: text_(row["Dark Preview Background"]),
    darkPreviewText: text_(row["Dark Preview Text"]),
    lightRegistrationBackground: text_(row["Light Registration Background"]),
    lightRegistrationText: text_(row["Light Registration Text"]),
    darkRegistrationBackground: text_(row["Dark Registration Background"]),
    darkRegistrationText: text_(row["Dark Registration Text"]),
    accentColor: text_(row["Accent Color"]),
    buttonBackground: text_(row["Button Background"]),
    buttonText: text_(row["Button Text"]),
  };
}

function publicSession_(row) {
  return { sessionId: text_(row["Session ID"]), eventId: text_(row["Event ID"]),
    sessionName: text_(row["Session Name"]), startAt: iso_(row["Start At"]), endAt: iso_(row["End At"]),
    capacity: number_(row.Capacity), registrationStatus: text_(row["Registration Status"]),
    cardPrice: number_(row["Card Price"]), payLaterPrice: number_(row["Pay Later Price"]),
    paymentMethods: text_(row["Payment Methods"]).split(",").map((item) => item.trim()).filter(Boolean),
    displayOrder: number_(row["Display Order"]) };
}

function rows_(tabName) {
  const values = sheet_(tabName).getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(text_);
  return values.slice(1).filter((row) => row.some((cell) => cell !== "")).map((row) => {
    const object = {}; headers.forEach((header, index) => { object[header] = row[index]; }); return object;
  });
}

function sheet_(name) {
  const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!id) throw new Error("Missing SPREADSHEET_ID script property");
  const sheet = SpreadsheetApp.openById(id).getSheetByName(name);
  if (!sheet) throw new Error(`Missing sheet: ${name}`);
  return sheet;
}

function requireSecret_(provided) {
  const expected = PropertiesService.getScriptProperties().getProperty("WRITE_SECRET");
  if (!expected) throw new Error("Missing WRITE_SECRET script property");
  if (!provided || String(provided) !== expected) throw new Error("Unauthorized");
}

function setByHeader_(sheet, headers, row, header, value) {
  const col = headers.indexOf(header); if (col < 0) throw new Error(`Missing column: ${header}`);
  sheet.getRange(row, col + 1).setValue(value);
}

function ensureHeader_(sheet, headers, header) {
  if (headers.indexOf(header) >= 0) return;
  const col = headers.length + 1;
  sheet.getRange(1, col).setValue(header);
  headers.push(header);
}

function typedSetting_(value, type) {
  if (type === "Number" || type === "Currency") return number_(value);
  if (type === "Yes/No") return text_(value) === "Yes";
  if (type === "List") return text_(value).split("|").filter(Boolean);
  if (type === "Date" || type === "Date Time") return iso_(value);
  return text_(value);
}

function json_(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
function safeMessage_(error) { return (error instanceof Error ? error.message : String(error || "Unknown error")).slice(0, 240); }
function requiredText_(value, name) { const result = text_(value).trim(); if (!result) throw new Error(`Missing ${name}`); return result; }
function text_(value) { return value === null || value === undefined ? "" : String(value); }
function number_(value) { const result = Number(value); return Number.isFinite(result) ? result : 0; }
function nullableNumber_(value) { return value === "" || value === null || value === undefined ? null : number_(value); }
function date_(value) { if (!value) return null; const result = value instanceof Date ? value : new Date(value); return Number.isFinite(result.getTime()) ? result : null; }
function shiftDate_(value, shiftMs) { const result = date_(value); return result ? new Date(result.getTime() + number_(shiftMs)) : null; }
function iso_(value) { const result = date_(value); return result ? result.toISOString() : ""; }
