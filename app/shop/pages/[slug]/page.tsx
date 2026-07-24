import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/arc-shop/Footer";
import { Header } from "@/components/arc-shop/Header";

const pages = {
  "size-guide": {
    eyebrow: "Fit system / Unisex",
    title: "Size guide",
    intro:
      "ARC pieces use an easy unisex system. Choose your usual size for the intended relaxed fit, or size down for a closer line.",
    type: "sizes",
  },
  "shipping-returns": {
    eyebrow: "Orders / Help",
    title: "Shipping + returns",
    intro:
      "We keep shipping clear, packaging considered, and returns uncomplicated.",
    sections: [
      ["U.S. shipping", "Free standard shipping on orders over $100. Orders under $100 ship for a flat $8. Most orders leave within two business days."],
      ["Returns", "Unworn, unwashed pieces with original tags may be returned within 30 days of delivery. Final-sale pieces are marked before checkout."],
      ["Exchanges", "The fastest exchange is a return followed by a new order. This keeps the size you need from waiting in transit."],
    ],
  },
  contact: {
    eyebrow: "ARC / Direct line",
    title: "Talk to us",
    intro:
      "Questions about fit, an order, or the next drop? We read every note.",
    sections: [
      ["Shop support", "arabrunningclub@gmail.com"],
      ["Response time", "Monday–Friday, typically within one business day."],
      ["Order help", "Include your order number so we can move quickly."],
    ],
  },
  privacy: {
    eyebrow: "Legal / Clear language",
    title: "Privacy",
    intro:
      "We collect only what is needed to operate the shop, fulfill orders, and improve the ARC experience.",
    sections: [
      ["What we collect", "Contact, shipping, order, and limited device information needed to process transactions and operate the site."],
      ["Payments", "Payment card data is handled securely by Stripe and is not stored in the ARC Shop database."],
      ["Your choices", "You may request access, correction, or deletion by emailing arabrunningclub@gmail.com."],
    ],
  },
  terms: {
    eyebrow: "Legal / Shop terms",
    title: "Terms",
    intro:
      "By using ARC Shop, you agree to these practical terms for orders, content, and access.",
    sections: [
      ["Orders", "An order is accepted after payment confirmation. We may cancel and refund orders affected by inventory or pricing errors."],
      ["Product information", "We work to present color and fit accurately; screens and garment production can create small differences."],
      ["Use", "ARC names, photography, copy, and designs may not be reproduced commercially without permission."],
    ],
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = pages[slug as keyof typeof pages];
  return page ? { title: page.title, description: page.intro } : {};
}

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export default async function EditorialPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = pages[slug as keyof typeof pages];
  if (!page) notFound();

  return (
    <>
      <Header />
      <main className="editorial-page">
        <section className="editorial-intro">
          <span className="section-label">{page.eyebrow}</span>
          <h1>{page.title}</h1>
          <p>{page.intro}</p>
        </section>
        {"type" in page && page.type === "sizes" ? (
          <section className="size-table" aria-label="ARC size chart">
            <div>
              <strong>Size</strong>
              <strong>Chest</strong>
              <strong>Waist</strong>
              <strong>Hip</strong>
            </div>
            {[
              ["XS", '32–34"', '26–28"', '33–35"'],
              ["S", '35–37"', '29–31"', '36–38"'],
              ["M", '38–40"', '32–34"', '39–41"'],
              ["L", '41–43"', '35–37"', '42–44"'],
              ["XL", '44–47"', '38–41"', '45–48"'],
              ["2XL", '48–51"', '42–45"', '49–52"'],
            ].map((row) => (
              <div key={row[0]}>
                {row.map((cell) => (
                  <span key={cell}>{cell}</span>
                ))}
              </div>
            ))}
            <p>
              Between sizes? Choose the larger size for movement layers and the
              smaller size for a closer daily fit.
            </p>
          </section>
        ) : (
          <section className="editorial-sections">
            {"sections" in page &&
              page.sections?.map(([title, body], index) => (
                <article key={title} data-reveal>
                  <span>0{index + 1}</span>
                  <h2>{title}</h2>
                  {body.includes("@") ? (
                    <a href={`mailto:${body}`}>{body}</a>
                  ) : (
                    <p>{body}</p>
                  )}
                </article>
              ))}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
