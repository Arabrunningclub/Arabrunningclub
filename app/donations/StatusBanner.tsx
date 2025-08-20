"use client";
import { useSearchParams } from "next/navigation";

export default function StatusBanner() {
  const sp = useSearchParams();
  const status = sp.get("status");

  if (status === "success") {
    return (
      <div className="mb-4 rounded-lg border border-green-600/40 bg-green-600/10 p-3 text-green-200">
        Thank you — your donation was successful!
      </div>
    );
  }

  if (status === "cancel") {
    return (
      <div className="mb-4 rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-yellow-100">
        Donation canceled. You were not charged.
      </div>
    );
  }

  return null;
}
