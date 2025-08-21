// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";

const siteUrl = "https://www.arab-runningclub.com";
const ogImage = `${siteUrl}/og-image.jpg`; // <-- put this file in /public (we'll do that next)

export const metadata: Metadata = {
  title: {
    default: "Arab Running Club",
    template: "%s | Arab Running Club",
  },
  description: "Uniting Arabs through fitness, health, and charity",

  openGraph: {
    title: "Arab Running Club",
    description: "Uniting Arabs through fitness, health, and charity",
    url: siteUrl,
    siteName: "Arab Running Club",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Arab Running Club" }],
    type: "website",
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "Arab Running Club",
    description: "Uniting Arabs through fitness, health, and charity",
    images: [ogImage],
  },

  // (Optional but nice)
  metadataBase: new URL(siteUrl),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="arc-theme"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
