"use client";

import { useState } from "react";
import { CheckCircle2, LoaderCircle, MapPin } from "lucide-react";

export default function CheckInClient({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function checkIn() {
    setState("loading");
    setMessage("");
    try {
      const response = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = await response.json();
      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || "Unable to check in");
      }
      setMessage(
        result.alreadyCheckedIn
          ? `You’re already checked in${result.name ? `, ${result.name.split(" ")[0]}` : ""}.`
          : `You’re checked in${result.name ? `, ${result.name.split(" ")[0]}` : ""}!`
      );
      setState("success");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to check in");
      setState("error");
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-[#10264a] p-7 text-white shadow-2xl sm:p-10">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-400">
        {state === "success" ? <CheckCircle2 className="h-8 w-8" /> : <MapPin className="h-8 w-8" />}
      </div>
      <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
        Event arrival
      </p>
      <h1 className="mt-2 text-3xl font-black sm:text-4xl">
        {state === "success" ? "You’re here!" : "Ready to check in?"}
      </h1>
      <p className="mt-3 max-w-lg text-base leading-7 text-white/70">
        {message || "Only tap the button once you’ve arrived at the event."}
      </p>

      {state !== "success" && (
        <button
          type="button"
          onClick={checkIn}
          disabled={state === "loading" || !token}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 py-4 text-lg font-black text-[#07162f] transition hover:-translate-y-0.5 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state === "loading" && <LoaderCircle className="h-5 w-5 animate-spin" />}
          {state === "loading" ? "Checking you in…" : "I’m here — check me in"}
        </button>
      )}
    </div>
  );
}
