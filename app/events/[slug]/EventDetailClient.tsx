"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  CircleCheckBig,
  CircleX,
  Clock3,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  UserRound,
  WalletCards,
} from "lucide-react";
import {
  formatDisplayCost,
  resolveEventTheme,
  type ArcEvent,
  type ArcEventTheme,
  type ArcMedia,
  type ArcRegistrationField,
  type ArcSession,
} from "@/lib/site-data";

type Availability = {
  sessionId: string;
  capacity: number;
  registered: number;
  left: number | null;
  full: boolean;
  registrationStatus: string;
};

type RegistrationMessage = {
  kind: "success" | "error";
  text: string;
  amountDue?: number;
  paymentMethod?: string;
  paymentStatus?: "pending" | "paid";
  rsvpId?: string;
  checkoutError?: string;
};

function formatDate(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone,
  }).format(new Date(value));
}

function formatTime(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(new Date(value));
}

function paymentOptions(session?: ArcSession) {
  return session?.paymentMethods || [];
}

function paymentLabel(method: string) {
  if (method === "Card") return "Pay online with card";
  if (method === "In person") return "Pay in person";
  if (method === "None") return "No payment required";
  return method;
}

export default function EventDetailClient({
  event,
  theme: eventTheme,
  sessions,
  media,
  fields,
}: {
  event: ArcEvent;
  theme: ArcEventTheme | null;
  sessions: ArcSession[];
  media: ArcMedia[];
  fields: ArcRegistrationField[];
}) {
  const timeZone = event.timeZone || "America/Detroit";
  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => a.displayOrder - b.displayOrder),
    [sessions]
  );
  const sortedMedia = useMemo(
    () => [...media].sort((a, b) => a.sortOrder - b.sortOrder),
    [media]
  );
  const fieldSettings = useMemo(
    () => new Map(fields.map((field) => [field.fieldId, field])),
    [fields]
  );
  const [sessionId, setSessionId] = useState(sortedSessions[0]?.sessionId || "");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [availabilityError, setAvailabilityError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checkoutOpening, setCheckoutOpening] = useState(false);
  const [message, setMessage] = useState<RegistrationMessage | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [beforeOpen, setBeforeOpen] = useState(false);
  const [registrationVisible, setRegistrationVisible] = useState(false);

  const selectedSession = sortedSessions.find((session) => session.sessionId === sessionId);
  const selectedAvailability = availability.find((item) => item.sessionId === sessionId);
  const methods = paymentOptions(selectedSession);
  const now = Date.now();
  const ended = new Date(event.endAt).getTime() < now;
  const opensAt = event.registrationOpens ? new Date(event.registrationOpens).getTime() : null;
  const closesAt = event.registrationCloses ? new Date(event.registrationCloses).getTime() : null;
  const registrationStarted = !opensAt || opensAt <= now;
  const registrationClosed = Boolean(closesAt && closesAt < now);
  const registrationOpen =
    event.registrationEnabled &&
    registrationStarted &&
    !registrationClosed &&
    !ended &&
    ["Open", "Waitlist"].includes(selectedSession?.registrationStatus || "");
  const featuredImage =
    sortedMedia.find((item) => item.featured)?.imageUrl ||
    sortedMedia[0]?.imageUrl ||
    event.heroImageUrl;
  const draftKey = `arc-rsvp-draft-${event.eventId}`;

  const fullNameField = fieldSettings.get("full-name");
  const emailField = fieldSettings.get("email");
  const phoneField = fieldSettings.get("phone");
  const theme = resolveEventTheme(eventTheme);
  const themeStyle = {
    "--event-hero-start": theme.heroGradientStart,
    "--event-hero-end": theme.heroGradientEnd,
    "--event-hero-text": theme.heroText,
    "--event-card-bg-light": theme.lightCardBackground,
    "--event-card-text-light": theme.lightCardText,
    "--event-card-border-light": theme.lightCardBorder,
    "--event-card-bg-dark": theme.darkCardBackground,
    "--event-card-text-dark": theme.darkCardText,
    "--event-card-border-dark": theme.darkCardBorder,
    "--event-registration-bg-light": theme.lightRegistrationBackground,
    "--event-registration-text-light": theme.lightRegistrationText,
    "--event-registration-bg-dark": theme.darkRegistrationBackground,
    "--event-registration-text-dark": theme.darkRegistrationText,
    "--event-accent": theme.accentColor,
    "--event-button-bg": theme.buttonBackground,
    "--event-button-text": theme.buttonText,
  } as CSSProperties;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(draftKey);
      if (!saved) return;
      const draft = JSON.parse(saved) as {
        fullName?: string;
        email?: string;
        phone?: string;
        sessionId?: string;
      };
      setFullName(draft.fullName || "");
      setEmail(draft.email || "");
      setPhone(draft.phone || "");
      if (draft.sessionId && sortedSessions.some((session) => session.sessionId === draft.sessionId)) {
        setSessionId(draft.sessionId);
      }
    } catch {
      window.localStorage.removeItem(draftKey);
    }
  }, [draftKey, sortedSessions]);

  useEffect(() => {
    if (!fullName && !email && !phone) return;
    window.localStorage.setItem(
      draftKey,
      JSON.stringify({ fullName, email, phone, sessionId })
    );
  }, [draftKey, email, fullName, phone, sessionId]);

  useEffect(() => {
    if (!event.eventId) return;

    let active = true;
    const loadAvailability = () => {
      fetch(`/api/availability?eventId=${encodeURIComponent(event.eventId)}`, {
        cache: "no-store",
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (!active) return;
          if (data?.ok && Array.isArray(data.sessions)) {
            setAvailability(data.sessions);
            setAvailabilityError(false);
          } else {
            setAvailabilityError(true);
          }
        })
        .catch(() => {
          if (active) setAvailabilityError(true);
        });
    };

    loadAvailability();
    const timer = window.setInterval(loadAvailability, 15_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [event.eventId]);

  useEffect(() => {
    setPaymentMethod(methods[0] || "None");
  }, [sessionId, methods.join("|")]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get("status");
    if (checkoutStatus !== "success" && checkoutStatus !== "cancel") return;

    const returnedSessionId = params.get("sessionId");
    const returnedSession = sortedSessions.find((session) => session.sessionId === returnedSessionId)
      || sortedSessions[0];
    if (returnedSession?.sessionId) setSessionId(returnedSession.sessionId);

    if (checkoutStatus === "success") {
      setMessage({
        kind: "success",
        text: "Your payment was completed. We’ll send event updates to the email used at checkout.",
        amountDue: Number(returnedSession?.cardPrice) || 0,
        paymentMethod: "Card",
        paymentStatus: "paid",
      });
    } else {
      const returnedRsvpId = params.get("rsvpId") || "";
      setMessage({
        kind: "success",
        text: returnedRsvpId
          ? "Your spot is temporarily held, but your registration is not confirmed until payment is complete."
          : "Your payment was not completed. Start registration again to reserve your spot.",
        amountDue: Number(returnedSession?.cardPrice) || 0,
        paymentMethod: "Card",
        paymentStatus: "pending",
        rsvpId: returnedRsvpId,
        checkoutError: returnedRsvpId
          ? "Checkout was canceled. Complete payment within 30 minutes or the temporary hold will expire."
          : "Checkout was canceled and no payment was made.",
      });
    }
    const scrollTimer = window.setTimeout(() => {
      document.getElementById("registration")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);

    window.history.replaceState({}, "", `${window.location.pathname}#registration`);
    return () => window.clearTimeout(scrollTimer);
  }, [sortedSessions]);

  useEffect(() => {
    const registration = document.getElementById("registration");
    if (!registration) return;
    const observer = new IntersectionObserver(
      ([entry]) => setRegistrationVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(registration);
    return () => observer.disconnect();
  }, []);

  const googleCalendarUrl = useMemo(() => {
    const compact = (value: string) =>
      new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const calendarStart = selectedSession?.startAt || event.startAt;
    const calendarEnd = selectedSession?.endAt || event.endAt;
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: selectedSession?.sessionName
        ? `${event.title} — ${selectedSession.sessionName}`
        : event.title,
      dates: `${compact(calendarStart)}/${compact(calendarEnd)}`,
      details: event.fullDescription || event.cardDescription,
      location: [event.venue, event.streetAddress, event.cityState].filter(Boolean).join(", "),
      ctz: timeZone,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }, [event, selectedSession, timeZone]);

  function scrollToRegistration() {
    document.getElementById("registration")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function createStripeCheckout(rsvpId: string) {
    setCheckoutOpening(true);
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rsvpId,
        eventId: event.eventId,
        sessionId,
        email,
        returnPath: `/events/${encodeURIComponent(event.slug || event.eventId)}`,
      }),
    });
    const checkout = await response.json();
    if (!response.ok || !checkout?.url) {
      throw new Error(checkout?.error || "Unable to open secure checkout");
    }
    window.location.assign(checkout.url);
  }

  async function retryStripeCheckout() {
    if (!message?.rsvpId) return;
    setBusy(true);
    setMessage((current) => current ? { ...current, checkoutError: undefined } : current);
    try {
      await createStripeCheckout(message.rsvpId);
    } catch (error) {
      setMessage((current) => current ? {
        ...current,
        checkoutError: error instanceof Error ? error.message : "Unable to open secure checkout",
      } : current);
      setCheckoutOpening(false);
      setBusy(false);
    }
  }

  async function switchPaymentMethod(method: string) {
    if (!message?.rsvpId || method === "Card") return;
    setBusy(true);
    try {
      const response = await fetch("/api/rsvp/payment-method", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rsvpId: message.rsvpId,
          eventId: event.eventId,
          sessionId,
          paymentMethod: method,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Unable to change the payment method");
      }

      setPaymentMethod(method);
      setMessage({
        kind: "success",
        text: method === "None"
          ? "Your registration is confirmed. No payment is required."
          : `Your registration is confirmed. You can ${paymentLabel(method).toLowerCase()} at the event.`,
        amountDue: Number(data.amountDue) || 0,
        paymentMethod: method,
        paymentStatus: "pending",
        rsvpId: message.rsvpId,
      });
    } catch (error) {
      setMessage((current) => current ? {
        ...current,
        checkoutError: error instanceof Error ? error.message : "Unable to change the payment method",
      } : current);
    } finally {
      setBusy(false);
    }
  }

  async function submitRsvp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.eventId,
          sessionId,
          fullName,
          email,
          phone,
          paymentMethod,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Registration failed");
      }
      const status =
        data.registrationStatus === "Waitlisted"
          ? "You’re on the waitlist."
          : "Your spot is reserved!";
      const amountDue = Number(data.amountDue) || 0;
      const confirmation: RegistrationMessage = {
        kind: "success",
        text: paymentMethod === "Card" && amountDue > 0
          ? `${status} Opening secure checkout for your payment.`
          : `${status} We’ll send event updates to ${email}.`,
        amountDue,
        paymentMethod,
        paymentStatus: paymentMethod === "Card" && amountDue > 0 ? "pending" : undefined,
        rsvpId: String(data.rsvpId || ""),
      };
      setMessage(confirmation);
      setAboutOpen(true);
      setBeforeOpen(true);
      window.localStorage.removeItem(draftKey);

      if (paymentMethod === "Card" && amountDue > 0) {
        try {
          await createStripeCheckout(confirmation.rsvpId || "");
          return;
        } catch (error) {
          setMessage({
            ...confirmation,
            text: "Your spot is temporarily held, but your registration is not confirmed until payment is complete.",
            checkoutError: error instanceof Error ? error.message : "Unable to open secure checkout",
          });
          setCheckoutOpening(false);
        }
      }
    } catch (error) {
      setMessage({
        kind: "error",
        text: error instanceof Error ? error.message : "Registration failed",
      });
    } finally {
      setBusy(false);
    }
  }

  const unavailableReason = ended
    ? "This event has ended."
    : registrationClosed
      ? "Registration has closed for this event."
      : !registrationStarted
        ? "Registration has not opened yet."
        : sortedSessions.length === 0
          ? "Registration details are still being prepared."
          : "Registration is not currently open.";

  return (
    <main
      className="min-h-screen bg-white pt-20 text-black transition-colors dark:bg-black dark:text-white"
      style={themeStyle}
      aria-busy={checkoutOpening}
    >
      {checkoutOpening && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/70 px-6 backdrop-blur-md"
          role="status"
          aria-live="assertive"
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-white/15 p-8 text-center shadow-2xl"
            style={{ backgroundColor: theme.darkRegistrationBackground, color: theme.darkRegistrationText }}
          >
            <LoaderCircle
              className="mx-auto h-12 w-12 animate-spin"
              style={{ color: theme.accentColor }}
              aria-hidden="true"
            />
            <h2 className="mt-5 text-2xl font-black">Opening checkout</h2>
            <p className="mt-2 text-sm opacity-75">Please wait while we connect you to secure Stripe checkout.</p>
          </div>
        </div>
      )}
      <section className="relative min-h-[62vh] overflow-hidden bg-[var(--event-hero-start)] text-[var(--event-hero-text)]">
        {featuredImage && (
          <img
            src={featuredImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-50"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${theme.heroGradientStart}, ${theme.heroGradientEnd})`,
          }}
        />
        <div className="container relative mx-auto flex min-h-[62vh] items-end px-4 py-14">
          <div className="max-w-4xl">
            <Link
              href="/events"
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 py-1.5 pl-1.5 pr-4 text-sm font-bold shadow-lg backdrop-blur-xl transition hover:bg-white/20"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full border border-white/30 bg-white/15 shadow-inner">
                <ChevronLeft className="h-5 w-5" />
              </span>
              All events
            </Link>
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-black/20 px-3 py-1 text-sm font-semibold">
                {event.category}
              </span>
              <span className="rounded-full bg-black/20 px-3 py-1 text-sm font-semibold">
                {ended ? "Past event" : event.cancellationStatus || "Scheduled"}
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-7xl">{event.title}</h1>
            <p className="mt-5 max-w-3xl text-lg opacity-80 md:text-2xl">
              {event.cardDescription}
            </p>
            <button
              type="button"
              onClick={scrollToRegistration}
              className="mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-black shadow-xl transition hover:-translate-y-0.5 hover:brightness-110"
              style={{ backgroundColor: theme.buttonBackground, color: theme.buttonText }}
            >
              Register
              <ArrowDown className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-10 px-4 py-14 lg:grid-cols-[minmax(0,1fr)_430px]">
        <div className="space-y-10">
          {event.announcement && (
            <div className="rounded-2xl border border-[var(--event-card-border-light)] bg-[var(--event-card-bg-light)] p-5 text-[var(--event-card-text-light)] dark:border-[var(--event-card-border-dark)] dark:bg-[var(--event-card-bg-dark)] dark:text-[var(--event-card-text-dark)]">
              {event.announcement}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard label="Date" value={formatDate(event.startAt, timeZone)} />
            <InfoCard
              label="Time"
              value={`${formatTime(event.startAt, timeZone)} – ${formatTime(event.endAt, timeZone)}`}
            />
            <InfoCard
              label="Location"
              value={[event.venue, event.cityState].filter(Boolean).join(" · ")}
            />
            <InfoCard
              label="Cost"
              value={formatDisplayCost(event.displayCost) || "See registration options"}
            />
          </div>

          <section>
            <button
              type="button"
              onClick={() => setAboutOpen((value) => !value)}
              className="flex w-full items-center justify-between gap-4 text-left"
              aria-expanded={aboutOpen}
              aria-controls="about-event-content"
            >
              <h2 className="text-3xl font-bold">About this event</h2>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-black/10 bg-black/[0.03] dark:border-white/15 dark:bg-white/10">
                <ChevronDown className={`h-5 w-5 transition-transform ${aboutOpen ? "rotate-180" : ""}`} />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {aboutOpen && (
                <motion.div
                  id="about-event-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="mt-4 whitespace-pre-line text-lg leading-8 opacity-80">
                    {event.fullDescription || event.cardDescription}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {(event.skillLevel || event.whatToBring || event.ageRequirement || event.accessibility) && (
            <section>
              <button
                type="button"
                onClick={() => setBeforeOpen((value) => !value)}
                className="flex w-full items-center justify-between gap-4 text-left"
                aria-expanded={beforeOpen}
                aria-controls="before-event-content"
              >
                <h2 className="text-3xl font-bold">Before you go</h2>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-black/10 bg-black/[0.03] dark:border-white/15 dark:bg-white/10">
                  <ChevronDown className={`h-5 w-5 transition-transform ${beforeOpen ? "rotate-180" : ""}`} />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {beforeOpen && (
                  <motion.div
                    id="before-event-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                      {event.skillLevel && <Detail label="Skill level" value={event.skillLevel} />}
                      {event.whatToBring && <Detail label="What to bring" value={event.whatToBring} />}
                      {event.ageRequirement && <Detail label="Age requirement" value={event.ageRequirement} />}
                      {event.accessibility && <Detail label="Accessibility" value={event.accessibility} />}
                    </dl>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          )}

          <div className="flex flex-wrap gap-3">
            {event.mapUrl && (
              <a
                href={event.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border px-5 py-3 font-semibold shadow-sm transition hover:-translate-y-0.5 hover:brightness-95"
                style={{
                  borderColor: theme.buttonBackground,
                  backgroundColor: theme.buttonBackground,
                  color: theme.buttonText,
                }}
              >
                Open map
              </a>
            )}
            <a
              href={googleCalendarUrl}
              data-testid="google-calendar-link"
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-bold shadow-sm transition hover:-translate-y-0.5 hover:brightness-95"
              style={{ backgroundColor: theme.buttonBackground, color: theme.buttonText }}
            >
              <CalendarDays className="h-4 w-4" />
              Add to Google Calendar
            </a>
            <a
              href={`/api/calendar?eventId=${encodeURIComponent(event.eventId)}${selectedSession?.sessionId ? `&sessionId=${encodeURIComponent(selectedSession.sessionId)}` : ""}`}
              className="rounded-full border px-5 py-3 font-semibold shadow-sm transition hover:-translate-y-0.5 hover:brightness-95"
              style={{
                borderColor: theme.buttonBackground,
                backgroundColor: theme.buttonBackground,
                color: theme.buttonText,
              }}
            >
              Download calendar file
            </a>
            {event.galleryId && (
              <Link
                href={`/gallery#${event.galleryId}`}
                className="rounded-full border px-5 py-3 font-semibold"
                style={{ borderColor: theme.accentColor, color: theme.accentColor }}
              >
                View gallery
              </Link>
            )}
          </div>

          {sortedMedia.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold">Event photos</h2>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
                {sortedMedia.slice(0, 9).map((item) => (
                  <img
                    key={item.mediaId}
                    src={item.imageUrl}
                    alt={item.altText || event.title}
                    className="aspect-square w-full rounded-2xl object-cover"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <aside id="registration" className="scroll-mt-28 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-black/10 bg-[var(--event-registration-bg-light)] p-6 text-[var(--event-registration-text-light)] shadow-sm dark:border-white/10 dark:bg-[var(--event-registration-bg-dark)] dark:text-[var(--event-registration-text-dark)] sm:p-7">
            <div className="border-b border-black/10 pb-5">
              <p
                className="text-xs font-bold uppercase tracking-[0.16em]"
                style={{ color: theme.accentColor }}
              >
                Registration
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                {registrationOpen ? "Reserve your spot" : "Event registration"}
              </h2>
              <p className="mt-2 text-sm leading-6 opacity-70">
                {registrationOpen
                  ? "Complete the form below to register for this event."
                  : "Registration information remains available with the event details."}
              </p>
            </div>

            <div className="my-5 grid gap-3 rounded-xl border border-black/10 p-4 text-sm">
              <RegistrationFact icon={<CalendarDays />}>
                {formatDate(event.startAt, timeZone)}
              </RegistrationFact>
              <RegistrationFact icon={<Clock3 />}>
                {formatTime(event.startAt, timeZone)} – {formatTime(event.endAt, timeZone)}
              </RegistrationFact>
              <RegistrationFact icon={<MapPin />}>
                {[event.venue, event.cityState].filter(Boolean).join(" · ") || "Location coming soon"}
              </RegistrationFact>
            </div>

            {event.statusMessage && !registrationOpen && (
              <p className="mb-4 rounded-xl border border-black/10 px-4 py-3 text-sm opacity-80">
                {event.statusMessage}
              </p>
            )}

            {message?.kind === "success" ? (
              <div className="rounded-xl border border-black/10 p-5">
                {message.checkoutError ? (
                  <CircleX className="h-8 w-8 text-red-500" />
                ) : (
                  <CircleCheckBig className="h-8 w-8" style={{ color: theme.accentColor }} />
                )}
                <h3 className="mt-4 text-xl font-bold">
                  {message.checkoutError
                    ? "Payment not completed"
                    : message.paymentMethod === "Card"
                      ? "Registration confirmed"
                      : "Registration complete"}
                </h3>
                <p className="mt-2 text-sm leading-6 opacity-75">{message.text}</p>
                {message.amountDue ? (
                  <div className="mt-4 rounded-xl border border-black/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider opacity-60">
                      {message.paymentMethod === "Card"
                        ? message.paymentStatus === "paid"
                          ? "Online payment"
                          : "Payment required"
                        : "Amount due at the event"}
                    </p>
                    <p className="mt-1 text-2xl font-bold">${message.amountDue.toFixed(2)}</p>
                    <p className="mt-1 text-xs opacity-65">
                      {message.paymentMethod === "Card"
                        ? message.paymentStatus === "paid"
                          ? "Payment was completed securely on Stripe."
                          : "Complete payment securely through Stripe when you’re ready."
                        : "Pay when you arrive at the event."}
                    </p>
                  </div>
                ) : null}
                {message.paymentMethod === "Card" && message.rsvpId && (
                  <button
                    type="button"
                    onClick={retryStripeCheckout}
                    disabled={busy}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold disabled:opacity-50"
                    style={{ backgroundColor: theme.buttonBackground, color: theme.buttonText }}
                  >
                    {busy ? "Opening checkout…" : "Continue to secure checkout"}
                    {!busy && <ArrowRight className="h-5 w-5" />}
                  </button>
                )}
                {message.checkoutError && (
                  <p role="alert" className="mt-3 rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-900">
                    {message.checkoutError}
                  </p>
                )}
                {message.checkoutError && message.rsvpId && methods.some((method) => method !== "Card") && (
                  <div className="mt-4 rounded-xl border border-black/10 p-4 dark:border-white/10">
                    <p className="text-sm font-bold">Prefer another payment method?</p>
                    <div className="mt-3 grid gap-2">
                      {methods.filter((method) => method !== "Card").map((method) => (
                        <button
                          key={method}
                          type="button"
                          disabled={busy}
                          onClick={() => switchPaymentMethod(method)}
                          className="flex w-full items-center justify-between rounded-xl border border-black/15 px-4 py-3 text-left font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 dark:border-white/15"
                        >
                          <span>{busy ? "Updating…" : paymentLabel(method)}</span>
                          <span>
                            {selectedSession?.payLaterPrice ? `$${selectedSession.payLaterPrice}` : "Free"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {(!message.checkoutError || !message.rsvpId) && (
                  <button
                    type="button"
                    onClick={() => {
                      setMessage(null);
                      setFullName("");
                      setEmail("");
                      setPhone("");
                    }}
                    className="mt-5 text-sm font-bold underline underline-offset-4"
                    style={{ color: theme.accentColor }}
                  >
                    {message.checkoutError ? "Start registration again" : "Register another person"}
                  </button>
                )}
              </div>
            ) : registrationOpen ? (
              <form onSubmit={submitRsvp} className="space-y-4">
                  {sortedSessions.length > 1 ? (
                    <fieldset>
                      <legend className="mb-2 text-sm font-bold">Choose your session</legend>
                      <div className="grid gap-2">
                        {sortedSessions.map((session) => {
                          const selected = session.sessionId === sessionId;
                          return (
                            <label
                              key={session.sessionId}
                              className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition ${
                                selected
                                  ? "font-semibold"
                                  : "border-black/15 hover:bg-black/[0.03]"
                              }`}
                              style={selected ? {
                                borderColor: theme.accentColor,
                                backgroundColor: theme.accentColor,
                                color: theme.buttonText,
                              } : undefined}
                            >
                              <input
                                type="radio"
                                name="session"
                                value={session.sessionId}
                                checked={selected}
                                onChange={() => setSessionId(session.sessionId)}
                                className="sr-only"
                              />
                              <span>
                                <span className="block font-black">{session.sessionName}</span>
                                <span className="text-xs opacity-70">
                                  {formatTime(session.startAt, timeZone)} – {formatTime(session.endAt, timeZone)}
                                </span>
                              </span>
                              {selected && <Check className="h-5 w-5" />}
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  ) : null}

                  <div
                    className="rounded-xl border px-4 py-3 text-sm"
                    style={{ borderColor: theme.accentColor }}
                  >
                    <strong>
                      {availabilityError
                        ? "Spots available — live count is refreshing"
                        : selectedAvailability?.left === null
                          ? "Spots available"
                          : selectedAvailability?.full
                            ? "Session full — join the waitlist"
                            : selectedAvailability
                              ? `${selectedAvailability.left} spots left`
                              : "Spots available"}
                    </strong>
                  </div>

                  <div className="grid gap-3">
                    <InviteField
                      icon={<UserRound />}
                      label={fullNameField?.label || "Full name"}
                      help={fullNameField?.helpText}
                      value={fullName}
                      onChange={setFullName}
                      autoComplete="name"
                      required={fullNameField?.required ?? true}
                    />
                    <InviteField
                      icon={<Mail />}
                      label={emailField?.label || "Email"}
                      help={emailField?.helpText}
                      type="email"
                      value={email}
                      onChange={setEmail}
                      autoComplete="email"
                      required={emailField?.required ?? true}
                    />
                    <InviteField
                      icon={<Phone />}
                      label={phoneField?.label || "Phone"}
                      help={phoneField?.helpText}
                      type="tel"
                      value={phone}
                      onChange={setPhone}
                      autoComplete="tel"
                      required={phoneField?.required ?? false}
                    />
                  </div>

                  {methods.length > 1 ? (
                    <fieldset>
                      <legend className="mb-2 text-sm font-bold">How would you like to pay?</legend>
                      <div className="grid gap-2">
                        {methods.map((method) => {
                          const selected = paymentMethod === method;
                          const price = method === "Card" ? selectedSession?.cardPrice : selectedSession?.payLaterPrice;
                          return (
                            <label
                              key={method}
                              className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-black/[0.04] focus-within:ring-2 focus-within:ring-[var(--event-accent)] focus-within:ring-offset-2 dark:hover:bg-black/15 ${
                                selected ? "border-transparent bg-black/[0.055] shadow-md dark:bg-black/20" : "border-black/15 dark:border-white/10"
                              }`}
                              style={selected ? { borderColor: theme.accentColor } : undefined}
                            >
                              <input
                                type="radio"
                                name="paymentMethod"
                                value={method}
                                checked={selected}
                                onChange={() => setPaymentMethod(method)}
                                className="sr-only"
                              />
                              <span className="flex items-center gap-3 font-bold">
                                <span
                                  className="grid h-5 w-5 place-items-center rounded-full border-2"
                                  style={{ borderColor: theme.accentColor }}
                                  aria-hidden="true"
                                >
                                  {selected && <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.accentColor }} />}
                                </span>
                                <WalletCards className="h-5 w-5" style={{ color: theme.accentColor }} />
                                {paymentLabel(method)}
                              </span>
                              <span className="font-black">{price ? `$${price}` : "Free"}</span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  ) : (
                    <div className="flex items-center justify-between rounded-xl border border-black/10 p-4">
                      <span className="flex items-center gap-3 text-sm font-bold">
                        <WalletCards className="h-5 w-5" style={{ color: theme.accentColor }} />
                        {paymentLabel(paymentMethod)}
                      </span>
                      <span className="text-xl font-black">
                        {(paymentMethod === "Card" ? selectedSession?.cardPrice : selectedSession?.payLaterPrice)
                          ? `$${paymentMethod === "Card" ? selectedSession?.cardPrice : selectedSession?.payLaterPrice}`
                          : "Free"}
                      </span>
                    </div>
                  )}

                  {selectedSession?.paymentMethods.includes("Card") && (
                    <p className="text-xs leading-5 opacity-65">
                      Choose card to reserve your spot, then complete payment securely through Stripe within 30 minutes.
                    </p>
                  )}

                  {message?.kind === "error" && (
                    <p role="alert" className="rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-900">
                      {message.text}
                    </p>
                  )}

                  <button
                    disabled={busy || !sessionId}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 px-6 py-4 text-base font-bold shadow-lg shadow-black/20 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:brightness-110 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--event-accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ backgroundColor: theme.buttonBackground, color: theme.buttonText }}
                  >
                    {busy ? "Saving your spot…" : selectedAvailability?.full ? "Join the waitlist" : "Save my spot"}
                    {!busy && <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />}
                  </button>
                  <p className="text-center text-[11px] leading-5 opacity-60">
                    Need to change your RSVP? Contact {event.contactEmail || "ARC"}.
                  </p>
                </form>
              ) : (
                <div className="rounded-xl border border-black/10 p-5 text-sm leading-6 opacity-75">
                  {unavailableReason}
                </div>
              )}
          </div>
        </aside>
      </section>

      <AnimatePresence>
        {!registrationVisible && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[80] md:hidden"
          >
            <button
              type="button"
              onClick={scrollToRegistration}
              className="flex w-full items-center justify-between rounded-full border border-white/25 px-6 py-4 text-base font-black shadow-[0_16px_45px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
              style={{ backgroundColor: theme.buttonBackground, color: theme.buttonText }}
            >
              <span>{registrationOpen ? "Register" : "Registration"}</span>
              <ArrowDown className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--event-card-border-light)] bg-[var(--event-card-bg-light)] p-5 text-[var(--event-card-text-light)] dark:border-[var(--event-card-border-dark)] dark:bg-[var(--event-card-bg-dark)] dark:text-[var(--event-card-text-dark)]">
      <p className="text-xs font-bold uppercase tracking-wider opacity-55">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--event-card-border-light)] bg-[var(--event-card-bg-light)] p-5 text-[var(--event-card-text-light)] dark:border-[var(--event-card-border-dark)] dark:bg-[var(--event-card-bg-dark)] dark:text-[var(--event-card-text-dark)]">
      <dt className="font-bold">{label}</dt>
      <dd className="mt-2 opacity-75">{value}</dd>
    </div>
  );
}

function RegistrationFact({ icon, children }: { icon: React.ReactElement; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 opacity-80">
      <span className="mt-0.5 text-[var(--event-accent)] [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

function InviteField({
  icon,
  label,
  help,
  value,
  onChange,
  type = "text",
  required = false,
  autoComplete,
}: {
  icon: React.ReactElement;
  label: string;
  help?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold opacity-80">
        {label}{required ? " *" : ""}
      </span>
      <span className="flex items-center gap-3 rounded-xl border border-black/15 bg-black/[0.035] px-4 shadow-inner shadow-black/10 transition focus-within:border-[var(--event-accent)] focus-within:bg-black/[0.055] dark:border-white/10 dark:bg-black/15 dark:focus-within:bg-black/20">
        <span className="text-[var(--event-accent)] [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          autoComplete={autoComplete}
          aria-describedby={help ? `${label.replace(/\s+/g, "-").toLowerCase()}-help` : undefined}
          className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-inherit outline-none placeholder:opacity-50"
          placeholder={help || label}
        />
      </span>
      {help && (
        <span id={`${label.replace(/\s+/g, "-").toLowerCase()}-help`} className="sr-only">
          {help}
        </span>
      )}
    </label>
  );
}
