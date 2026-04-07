// ============================================================
// GrandInvite – Wedding Invitation Page (Server Component)
// - Removes gallery (Task 7)
// - Shows styled "Invitation Unavailable" page when is_hidden (Task 6)
// src/app/[locale]/[wedding_slug]/page.tsx
// ============================================================
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getWeddingBySlug } from '@/lib/supabase-server'
import type { Locale } from '@/lib/i18n'
import WeddingPageContent from '@/components/WeddingPageContent'
import type { EventSchedule } from '@/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; wedding_slug: string }>
}): Promise<Metadata> {
  const { locale, wedding_slug } = await params
  const wedding = await getWeddingBySlug(wedding_slug)
  if (!wedding) return { title: 'Invitation | GrandInvite' }

  const coupleNames = `${wedding.bride_name} & ${wedding.groom_name}`
  const pageTitle = `${coupleNames} — Invitation`
  const desc =
    wedding.welcome_message ??
    (locale === 'fr'
      ? `Vous êtes invité(e) au mariage de ${coupleNames}. Confirmez votre présence.`
      : locale === 'he'
      ? `אתם מוזמנים לחתונה של ${coupleNames}. אשרו הגעה.`
      : `You're invited to celebrate the wedding of ${coupleNames}. Please RSVP.`)
  const images = wedding.cover_image_url
    ? [{ url: wedding.cover_image_url, width: 1200, height: 630, alt: coupleNames }]
    : [{ url: 'https://wedding-app-pearl-alpha.vercel.app/logo512.png', width: 512, height: 512, alt: 'GrandInvite' }]

  return {
    title: pageTitle,
    description: desc,
    openGraph: {
      title: pageTitle,
      description: desc,
      type: 'website',
      siteName: 'GrandInvite',
      locale: locale === 'he' ? 'he_IL' : locale === 'fr' ? 'fr_FR' : 'en_US',
      images,
    },
    twitter: { card: 'summary_large_image', title: pageTitle, description: desc, images: images.map(i => i.url) },
    robots: { index: false, follow: false },
  }
}

export default async function WeddingPage({
  params,
}: {
  params: Promise<{ locale: Locale; wedding_slug: string }>
}) {
  const { locale, wedding_slug } = await params
  const wedding = await getWeddingBySlug(wedding_slug)
  if (!wedding) notFound()

  // ── Hidden invitation ── show elegant "not available" page
  if (wedding.is_hidden) {
    const labels = {
      fr: {
        title: 'Invitation non disponible',
        subtitle: "Cette invitation n'est pas disponible pour le moment.",
        home: 'Retour à l’accueil',
        create: 'Créer votre invitation',
      },
      he: {
        title: 'הזמנה אינה זמינה',
        subtitle: 'ההזמנה אינה זמינה כרגע.',
        home: 'חזרה לדף הבית',
        create: 'יצירת הזמנה',
      },
      en: {
        title: 'Invitation Unavailable',
        subtitle: 'This invitation is not available at this time.',
        home: 'Back to home',
        create: 'Create your invitation',
      },
    }
    const l = labels[locale] ?? labels.fr
    const isRTL = locale === 'he'

    return (
      <main
        dir={isRTL ? 'rtl' : 'ltr'}
        className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-6"
      >
        <div className="max-w-md w-full text-center py-20">
          {/* Ornament */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-px w-16 bg-[#c9a84c]" />
            <span className="text-[#c9a84c] text-2xl">✦</span>
            <div className="h-px w-16 bg-[#c9a84c]" />
          </div>

          {/* Couple names */}
          <p className="font-cormorant text-stone-400 text-lg font-light tracking-widest mb-4">
            {wedding.bride_name} &amp; {wedding.groom_name}
          </p>

          {/* Main message */}
          <h1 className="font-cormorant text-3xl md:text-4xl text-stone-700 font-light mb-4">
            {l.title}
          </h1>
          <p className="text-stone-400 text-sm leading-relaxed mb-12 font-light">
            {l.subtitle}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/${locale}`}
              className="px-6 py-3 border border-stone-300 hover:border-[#c9a84c] text-stone-500 hover:text-[#c9a84c] text-xs tracking-widest uppercase transition-colors"
            >
              {l.home}
            </Link>
            <Link
              href={`/${locale}/login`}
              className="px-6 py-3 bg-[#c9a84c] hover:bg-[#9a7d35] text-white text-xs tracking-widest uppercase transition-colors"
            >
              {l.create}
            </Link>
          </div>

          {/* Bottom ornament */}
          <div className="flex items-center justify-center gap-4 mt-14">
            <div className="h-px w-16 bg-stone-200" />
            <span className="text-stone-300 text-sm font-cormorant">GrandInvite</span>
            <div className="h-px w-16 bg-stone-200" />
          </div>
        </div>
      </main>
    )
  }

  const schedule = ((wedding.event_schedule ?? []) as EventSchedule[]).sort(
    (a, b) => a.sort_order - b.sort_order
  )

  return (
    <WeddingPageContent
      wedding={wedding}
      schedule={schedule}
      originalLocale={locale}
    />
  )
}
