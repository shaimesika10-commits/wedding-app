// ============================================================
//  GrandInvite – Root Layout with RTL/LTR Support
//  src/app/[locale]/layout.tsx
// ============================================================

import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Montserrat } from 'next/font/google'
import { notFound } from 'next/navigation'
import type { Locale } from '@/lib/i18n'
import '../globals.css'

// ---- Fonts ----
// Cormorant Garamond: פונט serif יוקרתי לכותרות
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

// Montserrat: פונט sans-serif נקי לטקסט
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-montserrat',
  display: 'swap',
})

// ---- Supported Locales ----
const SUPPORTED_LOCALES: Locale[] = ['fr', 'he', 'en']
const RTL_LOCALES: Locale[] = ['he']

// ---- Metadata ----
export const metadata: Metadata = {
  title: {
    default: 'GrandInvite – Invitations de mariage de luxe',
    template: '%s | GrandInvite',
  },
  description: 'Créez votre invitation de mariage numérique et gérez les RSVP avec élégance.',
  keywords: ['mariage', 'invitation', 'RSVP', 'wedding', 'חתונה'],
  authors: [{ name: 'GrandInvite' }],
  // PWA
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GrandInvite',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#1c1917',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

// ---- Layout ----
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params

  // וידוא שפה תקינה
  if (!SUPPORTED_LOCALES.includes(locale)) {
    notFound()
  }

  const isRTL = RTL_LOCALES.includes(locale)

  return (
    <html
      lang={locale}
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`${cormorant.variable} ${montserrat.variable}`}
    >
      <head>
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* Hebrew font – נטען רק לשפה העברית */}
        {isRTL && (
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap"
          />
        )}
      </head>

      <body
        className={`
          min-h-screen bg-stone-50 text-stone-900 antialiased
          ${isRTL ? 'font-heebo' : 'font-sans'}
        `}
        style={{
          fontFamily: isRTL
            ? "'Heebo', var(--font-montserrat), sans-serif"
            : "var(--font-montserrat), sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  )
}
