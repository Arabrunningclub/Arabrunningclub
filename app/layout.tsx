import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Arab Running Club™',
  description: 'Uniting Arabs through fitness, health, and charity',
  generator: 'None',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
