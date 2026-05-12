import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lim Events – Plan, Manage & Celebrate',
  description: 'From weddings to corporate events, everything you need in one place.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
