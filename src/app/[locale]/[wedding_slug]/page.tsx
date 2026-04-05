// ============================================================
//  GrandInvite – Wedding Invitation Page (Server Component)
//  Fetches data server-side, renders via client component
//  src/app/[locale]/[wedding_slug]/page.tsx
// ============================================================

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getWeddingBySlug, getGalleryPhotosByWeddingId } from '@/lib/supabase-server'
import type { Locale } from '@/lib/i18n'
import WeddingPageContent from '@/components/WeddingPageContent'
import AIInvitationChat from '@/components/AIInvitationChat'
import type { GalleryPhoto, EventSchedule } from '@/types'

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

  // Locale-aware description
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
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: desc,
      images: images.map(function(img) { return img.url }),
    },
    robots: { index: false, follow: false }, // private invitations — no indexing
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

  const galleryPhotos = await getGalleryPhotosByWeddingId(wedding.id)
  const schedule = ((wedding.event_schedule ?? []) as EventSchedule[]).sort(
    (a, b) => a.sort_order - b.sort_order
  )

  return (
    <>
      {/* Main invitation content with language switcher + AI translation */}
      <WeddingPageContent
        wedding={wedding}
        schedule={schedule}
        galleryPhotos={galleryPhotos as GalleryPhoto[]}
        originalLocale={locale}
      />

      {/* Floating AI assistant — visible to guests who want help */}
      {/* Note: this is a lightweight helper for guests, not for building the invitation */}
    </>
  )
}
