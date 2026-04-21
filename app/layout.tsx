import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'JobBot · Manu Shukla',
  description: 'Automated job discovery & application engine',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg antialiased">{children}</body>
    </html>
  )
}
