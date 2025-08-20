import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Arab Running Club",
  description: "Uniting Arabs through fitness, health, and charity",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="arc-theme"               // persist across pages/reloads
          disableTransitionOnChange            // no janky transitions on toggle
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
