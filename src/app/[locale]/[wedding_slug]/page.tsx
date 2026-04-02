import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getWeddingBySlug, getGalleryPhotosByWeddingId } from '@/lib/supabase'
import { t, isRTL } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
import RSVPForm from '@/components/RSVPForm'
import EventScheduleSection from '@/components/EventScheduleSection'
import GallerySection from '@/components/GallerySection'
import type { GalleryPhoto } from '@/types'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; wedding_slug: string }> }): Promise<Metadata> {
  const { wedding_slug } = await params
  const wedding = await getWeddingBySlug(wedding_slug)
  if (!wedding) return { title: 'Invitation | GrandInvite' }
  return { title: `${wedding.bride_name} & ${wedding.groom_name} | GrandInvite`, description: wedding.welcome_message ?? 'Join us to celebrate our wedding!' }
}

export default async function WeddingPage({ params }: { params: Promise<{ locale: Locale; wedding_slug: string }> }) {
  const { locale, wedding_slug } = await params
  const wedding = await getWeddingBySlug(wedding_slug)
  if (!wedding) notFound()
  const tr = t(locale)
  const rtl = isRTL(locale)
  const galleryPhotos = await getGalleryPhotosByWeddingId(wedding.id)
  const schedule = (wedding.event_schedule ?? []).sort((a, b) => a.sort_order - b.sort_order)
  const dateStr = new Date(wedding.wedding_date).toLocaleDateString(
    locale === 'he' ? 'he-IL' : locale === 'fr' ? 'fr-FR' : 'en-GB',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  )

  return (
    <main dir={rtl ? 'rtl' : 'ltr'} className="min-h-screen bg-[#faf8f5]">
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {wedding.cover_image_url ? (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${wedding.cover_image_url})` }}>
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-stone-800 to-stone-900" />
        )}
        <div className="relative z-10 text-center text-white px-6 fade-in">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-[#c9a84c]" />
            <span className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase font-light">{tr.wedding.saveDate}</span>
            <div className="h-px w-16 bg-[#c9a84c]" />
          </div>
          <h1 className="font-cormorant font-light leading-none mb-6">
            <span className="block text-5xl md:text-7xl lg:text-8xl">{wedding.bride_name}</span>
            <span className="block text-[#c9a84c] text-2xl md:text-3xl my-4 font-light tracking-widest">&amp;</span>
            <span className="block text-5xl md:text-7xl lg:text-8xl">{wedding.groom_name}</span>
          </h1>
          <p className="text-stone-200 text-lg font-light tracking-widest uppercase mt-6">{dateStr}</p>
          {wedding.venue_name && <p className="text-stone-300 text-base mt-2 font-light">{wedding.venue_name}{wedding.venue_city ? ` · ${wedding.venue_city}` : ''}</p>}
        </div>
      </section>

      {wedding.welcome_message && (
        <section className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="ornament-line"><span className="text-[#c9a84c] text-lg">✦</span></div>
          <p className="font-cormorant text-xl md:text-2xl text-stone-600 font-light leading-relaxed italic">{wedding.welcome_message}</p>
          <div className="ornament-line"><span className="text-[#c9a84c] text-lg">✦</span></div>
        </section>
      )}

      {schedule.length > 0 && (
        <section className="bg-white py-20">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="section-title text-center mb-12">{tr.wedding.schedule}</h2>
            <EventScheduleSection schedule={schedule} locale={locale} t={tr.wedding} />
          </div>
        </section>
      )}

      {(wedding.venue_name || wedding.google_maps_url || wedding.waze_url) && (
        <section className="py-20 px-6 bg-stone-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="section-title mb-4">{tr.wedding.venue}</h2>
            {wedding.venue_name && <p className="text-stone-600 text-lg mb-2">{wedding.venue_name}</p>}
            {wedding.venue_address && <p className="text-stone-400 text-sm mb-8">{wedding.venue_address}</p>}
            <div className="flex flex-wrap justify-center gap-4">
              {wedding.google_maps_url && <a href={wedding.google_maps_url} target="_blank" rel="noopener noreferrer" className="btn-gold">{tr.wedding.googleMaps}</a>}
              {wedding.waze_url && <a href={wedding.waze_url} target="_blank" rel="noopener noreferrer" className="btn-outline">{tr.wedding.waze}</a>}
            </div>
          </div>
        </section>
      )}

      <section className="bg-[#faf8f5]">
        <GallerySection weddingId={wedding.id} locale={locale} initialPhotos={galleryPhotos as GalleryPhoto[]} />
      </section>

      <section id="rsvp" className="py-24 px-6 bg-white">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <div className="ornament-line"><span className="text-[#c9a84c] text-lg">✦</span></div>
            <h2 className="section-title mb-3">{tr.rsvp.title}</h2>
            <p className="text-stone-500 font-light">{tr.rsvp.subtitle}</p>
            <div className="ornament-line"><span className="text-[#c9a84c] text-lg">✦</span></div>
          </div>
          <RSVPForm weddingId={wedding.id} locale={locale} t={tr.rsvp} maxGuests={wedding.max_guests} />
        </div>
      </section>

      <footer className="py-10 text-center bg-stone-900 text-stone-400">
        <p className="font-cormorant text-2xl text-white mb-2">{wedding.bride_name} &amp; {wedding.groom_name}</p>
        <p className="text-xs tracking-widest uppercase text-[#c9a84c]">{dateStr}</p>
        <p className="text-xs mt-6 text-stone-600">Powered by <span className="text-[#c9a84c]">GrandInvite</span></p>
      </footer>
    </main>
  )
}
