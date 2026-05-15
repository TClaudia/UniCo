import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'UniCredit AI Coach',
  description: 'Coaching financiar personalizat cu inteligență artificială',
  manifest: '/manifest.json',
  themeColor: '#E2001A',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro" className="h-full">
      <head>
        <meta name="theme-color" content="#E2001A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="h-full antialiased">
        {children}
      </body>
    </html>
  )
}
