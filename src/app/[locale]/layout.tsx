import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Montserrat } from 'next/font/google'
import { notFound } from 'next/navigation'
import type { Locale } from '@/lib/i18n'
import '../globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'], weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant', display: 'swap',
})
const montserrat = Montserrat({
  subsets: ['latin'], weight: ['300', '400', '500', '600'],
  variable: '--font-montserrat', display: 'swap',
})

const SUPPORTED_LOCALES: Locale[] = ['fr', 'he', 'en']
const RTL_LOCALES: Locale[] = ['he']

export const metadata: Metadata = {
  title: { default: 'GrandInvite – Invitations de mariage de luxe', template: '%s | GrandInvite' },
  description: 'Créez votre invitation de mariage numérique et gérez les RSVP avec élégance.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'GrandInvite' },
}

export const viewport: Viewport = {
  themeColor: '#1c1917', width: 'device-width', initialScale: 1, maximumScale: 1,
}

export default async function LocaleLayout({
  children, params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  if (!SUPPORTED_LOCALES.includes(locale)) { notFound() }
  const isRTL = RTL_LOCALES.includes(locale)

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} className={`${cormorant.variable} ${montserrat.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        {isRTL && (
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap" />
        )}
      </head>
      <body
        className={`min-h-screen bg-stone-50 text-stone-900 antialiased ${isRTL ? 'font-heebo' : 'font-sans'}`}
        style={{ fontFamily: isRTL ? "'Heebo', var(--font-montserrat), sans-serif" : 'var(--font-montserrat), sans-serif' }}
      >
        {children}
      </body>
    </html>
  )
}
