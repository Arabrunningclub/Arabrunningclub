"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, LoaderCircle, RefreshCw, UsersRound } from "lucide-react";

type EventOption = {
  eventId: string;
  title: string;
  sessions: Array<{ sessionId: string; sessionName: string }>;
};

type Attendee = {
  rsvpId: string;
  sessionId: string;
  fullName: string;
  checkedIn: boolean;
  checkedInAt: string;
  paymentStatus: string;
  paymentMethod: string;
};

type ListResult = {
  totalConfirmed: number;
  checkedIn: number;
  attendees: Attendee[];
};

export default function CheckinAdminClient({ events }: { events: EventOption[] }) {
  const [adminKey, setAdminKey] = useState("");
  const [eventId, setEventId] = useState(events[0]?.eventId || "");
  const [sessionId, setSessionId] = useState("");
  const [result, setResult] = useState<ListResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const sessions = useMemo(
    () => events.find((event) => event.eventId === eventId)?.sessions || [],
    [eventId, events]
  );

  useEffect(() => {
    setAdminKey(window.sessionStorage.getItem("arc-checkin-admin-key") || "");
  }, []);

  async function loadAttendees(background = false) {
    if (!adminKey || !eventId) return;
    if (!background) setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/check-in/attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminKey, eventId, sessionId }),
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || "Unable to load attendees");
      window.sessionStorage.setItem("arc-checkin-admin-key", adminKey);
      setResult(data);
    } catch (caught) {
      if (!background) {
        setError(caught instanceof Error ? caught.message : "Unable to load attendees");
      }
    } finally {
      if (!background) setLoading(false);
    }
  }

  useEffect(() => {
    if (!result) return;
    const timer = window.setInterval(() => loadAttendees(true), 15_000);
    return () => window.clearInterval(timer);
  });

  const here = result?.attendees.filter((attendee) => attendee.checkedIn) || [];
  const expected = result?.attendees.filter((attendee) => !attendee.checkedIn) || [];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-[#10264a] p-6 text-white shadow-xl sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">Staff check-in</p>
        <h1 className="mt-2 text-3xl font-black">Who’s here</h1>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <input
            type="password"
            value={adminKey}
            onChange={(event) => setAdminKey(event.target.value)}
            placeholder="Staff access key"
            className="rounded-xl border border-white/15 bg-black/20 px-4 py-3 outline-none placeholder:text-white/40 focus:border-emerald-400"
          />
          <select
            value={eventId}
            onChange={(event) => {
              setEventId(event.target.value);
              setSessionId("");
              setResult(null);
            }}
            className="rounded-xl border border-white/15 bg-[#0a1c38] px-4 py-3"
          >
            {events.map((event) => (
              <option key={event.eventId} value={event.eventId}>{event.title}</option>
            ))}
          </select>
          <select
            value={sessionId}
            onChange={(event) => {
              setSessionId(event.target.value);
              setResult(null);
            }}
            className="rounded-xl border border-white/15 bg-[#0a1c38] px-4 py-3"
          >
            <option value="">All sessions</option>
            {sessions.map((session) => (
              <option key={session.sessionId} value={session.sessionId}>{session.sessionName}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => loadAttendees()}
          disabled={loading || !adminKey || !eventId}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-black text-[#07162f] disabled:opacity-50 sm:w-auto"
        >
          {loading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
          {loading ? "Loading…" : "Open live list"}
        </button>
        {error && <p className="mt-4 rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-100">{error}</p>}
      </div>

      {result && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Here now" value={result.checkedIn} accent />
            <Stat label="Confirmed" value={result.totalConfirmed} />
          </div>
          <AttendeeSection title="Who’s here" attendees={here} empty="No one has checked in yet." />
          <AttendeeSection title="Still expected" attendees={expected} empty="Everyone is here." />
        </>
      )}
    </div>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? "border-emerald-400/40 bg-emerald-400/10" : "border-white/10 bg-white/5"}`}>
      <p className="text-sm text-white/60">{label}</p>
      <p className="mt-1 text-4xl font-black text-white">{value}</p>
    </div>
  );
}

function AttendeeSection({
  title,
  attendees,
  empty,
}: {
  title: string;
  attendees: Attendee[];
  empty: string;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
      <div className="flex items-center gap-2 border-b border-white/10 px-6 py-4">
        <UsersRound className="h-5 w-5 text-emerald-400" />
        <h2 className="font-black text-white">{title}</h2>
        <span className="ml-auto rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-white/70">
          {attendees.length}
        </span>
      </div>
      {attendees.length ? (
        <ul className="divide-y divide-white/10">
          {attendees.map((attendee) => (
            <li key={attendee.rsvpId} className="flex items-center gap-3 px-6 py-4 text-white">
              <CheckCircle2 className={`h-5 w-5 ${attendee.checkedIn ? "text-emerald-400" : "text-white/20"}`} />
              <div>
                <p className="font-bold">{attendee.fullName}</p>
                <p className="text-xs text-white/50">
                  {attendee.checkedInAt
                    ? `Arrived ${new Date(attendee.checkedInAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
                    : `${attendee.paymentMethod} · ${attendee.paymentStatus}`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-6 py-8 text-sm text-white/50">{empty}</p>
      )}
    </section>
  );
}
