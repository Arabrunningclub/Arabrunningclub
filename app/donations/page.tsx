'use client';

import { motion } from "framer-motion";
import Layout from "@/components/layout";
import Link from "next/link";
import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function formatUSD(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

const PRESETS = [5, 10, 20, 50, 100];


function DonationsClient() {
  const params = useSearchParams();
  const status = params.get('status'); // "success" | "cancel" | null

  const [amount, setAmount] = useState<number>(20);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isValid = useMemo(
    () => Number.isFinite(amount) && amount >= 1 && amount <= 50000,
    [amount]
  );

  async function startCheckout() {
    setErr(null);
    if (!isValid) {
      setErr('Enter an amount between $1 and $50,000.');
      return;
    }
    try {
      setBusy(true);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data?.url) throw new Error(data?.error || 'Unable to start checkout');
      window.location.href = data.url!;
    } catch (e: any) {
      setErr(e?.message ?? 'Network error starting checkout');
      setBusy(false);
    }
  }

  return (
    <>
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Support Our Mission</h1>
          <p className="text-xl md:text-2xl mb-8">
            Your contributions help us organize community events, support charitable causes, and keep our club growing.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto rounded-lg shadow-lg p-6 bg-white dark:bg-black text-center border border-black/10 dark:border-white/10">
            {status === 'success' && (
              <div className="mb-4 rounded-lg border border-green-600/30 bg-green-600/10 px-4 py-3 text-sm">
                Thank you! Your donation was received.
              </div>
            )}
            {status === 'cancel' && (
              <div className="mb-4 rounded-lg border border-yellow-600/30 bg-yellow-600/10 px-4 py-3 text-sm">
                Checkout canceled. You can try again below.
              </div>
            )}
            {err && (
              <div className="mb-4 rounded-lg border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm">
                {err}
              </div>
            )}

            <h2 className="text-2xl font-bold mb-3">Make a Donation</h2>
            <p className="opacity-80 mb-6">
              Every dollar helps us create events and initiatives that strengthen our community and support positive impact locally and abroad.
            </p>

            <div className="mb-4 flex flex-wrap justify-center gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(p)}
                  className={`rounded-full border px-4 py-2 text-sm transition
                    ${
                      amount === p
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                        : 'bg-white text-black border-black hover:bg-black hover:text-white dark:bg-black dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-black'
                    }`}
                  aria-pressed={amount === p}
                >
                  {formatUSD(p)}
                </button>
              ))}
            </div>

            <label className="block text-sm mb-2 font-medium">Custom amount</label>
            <div className="mb-6 flex items-center justify-center">
              <span className="rounded-l-md border px-3 py-2 select-none">$</span>
              <input
                type="number"
                inputMode="decimal"
                min={1}
                max={50000}
                step="1"
                value={Number.isFinite(amount) ? amount : ''}
                onChange={(e) => {
                  const v = e.currentTarget.value;
                  setAmount(v === '' ? NaN : Number(v));
                }}
                className="w-32 rounded-r-md border px-3 py-2 bg-transparent text-center outline-none focus:ring-2"
                placeholder="Amount"
              />
            </div>

            <button
              type="button"
              onClick={startCheckout}
              disabled={busy || !isValid}
              className={`w-full rounded-full px-6 py-3 font-semibold transition
                ${
                  busy || !isValid
                    ? 'opacity-50 cursor-not-allowed border'
                    : 'bg-white text-black border border-black hover:bg-black hover:text-white dark:bg-black dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-black'
                }`}
            >
              {busy ? 'Starting Checkout…' : `Donate ${isValid ? formatUSD(amount) : ''}`}
            </button>

            <p className="mt-6 text-xs opacity-70">
              Payments are processed securely by Stripe. Apple Pay / Google Pay may appear if available.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default function DonationsPage() {
  return (
    <Layout>
      <div className="bg-white text-black dark:bg-black dark:text-white transition-colors min-h-screen">
        <main>
          <Suspense>
            <DonationsClient />
          </Suspense>
        </main>
      </div>
    </Layout>
  );
}