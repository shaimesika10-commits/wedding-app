// ============================================================
//  GrandInvite â Wedding Invitation Page (Server Component)
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
  const { wedding_slug } = await params
  const wedding = await getWeddingBySlug(wedding_slug)
  if (!wedding) return { title: 'Invitation | GrandInvite' }
  return {
    title: `${wedding.bride_name} & ${wedding.groom_name} | GrandInvite`,
    description: wedding.welcome_message ?? 'Join us to celebrate our wedding!',
    openGraph: { images: wedding.cover_image_url ? [wedding.cover_image_url] : [] },
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

      {/* Floating AI assistant â visible to guests who want help */}
      {/* Note: this is a lightweight helper for guests, not for building the invitation */}
    </>
  )
}
