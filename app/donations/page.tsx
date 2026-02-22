// app/donations/page.tsx
'use client';
import Layout from "@/components/layout";
import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';



function formatUSD(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

const PRESETS = [5, 10, 20, 50, 100];

// Background map (flags) you requested
const ARAB_WORLD_FLAGS_SVG =
  'https://upload.wikimedia.org/wikipedia/commons/f/f3/A_map_of_the_Arab_World_with_flags.svg';

// Use the SAME images as Gallery (no labels, no clicks)
const DONATION_PHOTOS: string[] = [
  '/images/pilates-1.jpg',
  '/images/pilates-2.jpg',
  '/images/pilates-3.jpg',
  '/images/pilates-4.jpg',
  '/images/pilates-5.JPG',
  '/images/pilates-6.JPG',
  '/images/pilates-7.JPG',
  '/images/pilates-8.JPG',
  '/images/iceskating.jpg',
  '/images/iceskating1.JPG',
  '/images/iceskating3.jpg',
  '/images/iceskating4.jpg',
];

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

function PhotoGrid({ photos }: { photos: string[] }) {
  return (
    <motion.div
      className="grid grid-cols-2 gap-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {photos.map((src, i) => (
        <div
          key={`${src}-${i}`}
          className={classNames(
            'group relative overflow-hidden rounded-2xl border',
            'border-black/10 dark:border-white/10',
            'bg-white/55 dark:bg-white/5 backdrop-blur',
            'shadow-sm hover:shadow-lg transition',
            'cursor-default select-none'
          )}
          aria-hidden="true"
        >
          <div className="aspect-square overflow-hidden">
            <img
              src={src}
              alt=""
              loading="lazy"
              draggable={false}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
            />
          </div>

          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300">
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/0" />
            <div className="absolute inset-0 ring-1 ring-white/10" />
          </div>
        </div>
      ))}
    </motion.div>
  );
}

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

  const mid = Math.ceil(DONATION_PHOTOS.length / 2);
  const leftPhotos = DONATION_PHOTOS.slice(0, mid);
  const rightPhotos = DONATION_PHOTOS.slice(mid);

  async function startCheckout() {
    setErr(null);
    if (!isValid) {
      setErr('Enter an amount between $1 and $50,000.');
      return;
    }
    try {
      setBusy(true);
      const res = await fetch('/api/donations/checkout', {
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
    <main className="relative min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors overflow-hidden">
      {/* Background (flags map) + soft vignette */}
      {/* Background (flags map) + soft vignette */}
<div className="pointer-events-none absolute inset-0">
  <img
    src={ARAB_WORLD_FLAGS_SVG}
    alt=""
    className="absolute left-1/2 top-[96px] md:top-[110px] w-[1200px] max-w-none -translate-x-1/2 opacity-[0.10] dark:opacity-[0.12] blur-[1.2px]"
    draggable={false}
  />

  <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/10 dark:to-black/40" />
  <div className="absolute inset-0 [background:radial-gradient(70%_55%_at_50%_35%,transparent_0%,rgba(0,0,0,0.08)_55%,rgba(0,0,0,0.18)_100%)] dark:[background:radial-gradient(70%_55%_at_50%_35%,transparent_0%,rgba(0,0,0,0.35)_55%,rgba(0,0,0,0.75)_100%)]" />
</div>

      {/* Header (pushed down so navbar doesn’t cut it) */}
      <section className="relative pt-28 md:pt-32 pb-10 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold">Support Our Mission</h1>
          <p className="mt-4 text-lg md:text-2xl opacity-90 max-w-4xl mx-auto">
            Your contributions help us organize community events, support charitable causes, and keep ARC growing.
          </p>
        </div>
      </section>

      {/* Main layout: left photos / form / right photos */}
      <section className="relative pb-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),minmax(0,520px),minmax(0,1fr)] items-start">
            {/* Left grid */}
            <div className="hidden lg:block lg:sticky lg:top-28">
              <PhotoGrid photos={leftPhotos} />
            </div>

                        {/* Center column: donation panel + placeholders */}
            <div className="flex flex-col gap-4">
              {/* Donation panel */}
              <motion.div
                className={classNames(
                  'rounded-2xl border',
                  'border-black/10 dark:border-white/10',
                  'bg-white/70 dark:bg-white/5 backdrop-blur',
                  'shadow-lg',
                  'p-6 md:p-7 text-center'
                )}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                <AnimatePresence>
                  {status === 'success' && (
                    <motion.div
                      className="mb-4 rounded-2xl border border-green-600/30 bg-green-600/10 px-4 py-3 text-sm"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                    >
                      Thank you! Your donation was received.
                    </motion.div>
                  )}
                  {status === 'cancel' && (
                    <motion.div
                      className="mb-4 rounded-2xl border border-yellow-600/30 bg-yellow-600/10 px-4 py-3 text-sm"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                    >
                      Checkout canceled. You can try again below.
                    </motion.div>
                  )}
                  {err && (
                    <motion.div
                      className="mb-4 rounded-2xl border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                    >
                      {err}
                    </motion.div>
                  )}
                </AnimatePresence>

                <h2 className="text-2xl font-bold mb-3">Make a Donation</h2>
                <p className="opacity-80 mb-6">
                  Every dollar helps us create events and initiatives that strengthen our community and support positive
                  impact locally and abroad.
                </p>

                <div className="mb-4 flex flex-wrap justify-center gap-2">
                  {PRESETS.map((p) => {
                    const active = amount === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setAmount(p)}
                        className={classNames(
                          'rounded-full px-4 py-2 text-sm font-semibold transition',
                          'border border-black/10 dark:border-white/10',
                          'backdrop-blur',
                          active
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : 'bg-white/60 dark:bg-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
                        )}
                        aria-pressed={active}
                      >
                        {formatUSD(p)}
                      </button>
                    );
                  })}
                </div>

                <label className="block text-sm mb-2 font-medium opacity-90">Custom amount</label>
                <div className="mb-6 flex items-center justify-center">
                  <span className="rounded-l-md border border-black/10 dark:border-white/10 px-3 py-2 select-none bg-white/50 dark:bg-white/5 backdrop-blur">
                    $
                  </span>
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
                    className={classNames(
                      'w-36 rounded-r-md px-3 py-2 text-center outline-none',
                      'border border-black/10 dark:border-white/10',
                      'bg-white/50 dark:bg-white/5 backdrop-blur',
                      'focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20'
                    )}
                    placeholder="Amount"
                  />
                </div>

                <button
                  type="button"
                  onClick={startCheckout}
                  disabled={busy || !isValid}
                  className={classNames(
                    'w-full rounded-full px-6 py-3 font-semibold transition',
                    'border border-black/10 dark:border-white/10',
                    busy || !isValid
                      ? 'opacity-50 cursor-not-allowed bg-white/40 dark:bg-white/5'
                      : 'bg-white/70 dark:bg-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
                  )}
                >
                  {busy ? 'Starting Checkout…' : `Donate ${isValid ? formatUSD(amount) : ''}`}
                </button>

                <p className="mt-6 text-xs opacity-70">
                  Payments are processed securely by Stripe. Apple Pay / Google Pay may appear if available.
                </p>
              </motion.div>

              {/* iOS glass placeholders (NOT clickable, hover only) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: 'Where your money goes', subtitle: 'Supplies • permits • water • logistics' },
                  { title: 'Donation Based Non-profit', subtitle: 'Community • charity • local + overseas' },
                ].map((x, i) => (
                  <div
  key={i}
  className="group relative overflow-hidden rounded-3xl border border-white/40 dark:border-white/20 bg-white/25 dark:bg-white/5 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.65)] min-h-[190px] transition-all duration-500 hover:shadow-[0_30px_90px_rgba(0,0,0,0.25)] cursor-default select-none"
  aria-hidden="true"
>
  {/* glass inner gradient */}
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute -top-32 left-[-30%] h-64 w-[160%] rotate-[-8deg] bg-white/50 blur-3xl opacity-60" />
    <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/10 to-white/5 dark:from-white/10 dark:via-white/5 dark:to-transparent" />
  </div>

  {/* subtle noise texture */}
  <div className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:5px_5px]" />

  {/* content */}
  <div className="relative h-full p-6 flex flex-col justify-end text-left">
    <h3 className="text-lg font-semibold tracking-tight">{x.title}</h3>
    <p className="text-sm opacity-80 mt-2 leading-relaxed">{x.subtitle}</p>
  </div>

  {/* hover polish */}
  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500">
    <div className="absolute inset-0 ring-1 ring-white/50 dark:ring-white/25 rounded-3xl" />
  </div>
</div>
                ))}
              </div>
            </div>

            {/* Right grid */}
            <div className="hidden lg:block lg:sticky lg:top-28">
              <PhotoGrid photos={rightPhotos.length ? rightPhotos : leftPhotos} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function DonationsPage() {
  return (
    <Layout>
      <Suspense>
        <DonationsClient />
      </Suspense>
    </Layout>
  );
}