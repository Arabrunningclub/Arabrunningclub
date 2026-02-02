// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";

const siteUrl = "https://www.arab-runningclub.com";
const ogImage = `${siteUrl}/og-image.jpg`;

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

  metadataBase: new URL(siteUrl),
};

// ✅ This is the Next.js-native way to add: viewport-fit=cover
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* ✅ Force the document background to follow theme.
          This is what iOS uses for that top safe-area region. */}
      <body className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
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
