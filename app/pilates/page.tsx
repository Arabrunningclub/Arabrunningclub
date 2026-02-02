"use client";

import Layout from "@/components/layout";

export default function PilatesPage() {
  return (
    <Layout>
      {/* Match your site page wrapper */}
    <div className="relative min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors pilates-page">
      <style>{`
        .pilates-page h1, .pilates-page h2 { color: #e16479; }
        /* Hard-set header and footer text/icons to #e16479, keep backgrounds transparent */
        .pilates-page header,
        .pilates-page footer {
          color: #e16479 !important;
          background-color: transparent !important;
        }
        .pilates-page header a,
        .pilates-page header button,
        .pilates-page footer a,
        .pilates-page footer button {
          color: #e16479 !important;
        }
        .pilates-page header svg,
        .pilates-page footer svg {
          fill: #e16479 !important;
          stroke: #e16479 !important;
        }
      `}</style>
      {/* pink band under fixed header (visible if the header is transparent) */}
      <div className="absolute inset-x-0 top-0 h-24 bg-pink-500 dark:bg-transparent pointer-events-none z-0" />
        {/* Push content below your fixed header */}
        <div className="pt-24">
          <iframe
            src="/pilates-embed.html"
            title="Galentine's Pilates RSVP"
            style={{
              width: "100%",
              height: "calc(100vh - 96px)", // matches pt-24
              border: "none",
              display: "block",
            }}
          />
        </div>
      </div>
    </Layout>
  );
}
