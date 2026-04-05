'use client'
// ============================================================
//  GrandInvite Ã¢ÂÂ Wedding Page Content (Client Component)
//  Handles language switching + AI translation for guests
//  src/components/WeddingPageContent.tsx
// ============================================================

import { useState, useTransition } from 'react'
import RSVPForm from './RSVPForm'
import EventScheduleSection from './EventScheduleSection'
import GallerySection from './GallerySection'
import type { GalleryPhoto, EventSchedule } from '@/types'
import type { Locale } from '@/lib/i18n'
import { t } from '@/lib/i18n'

interface Wedding {
  id: string
  bride_name: string
  groom_name: string
  wedding_date: string
  venue_name: string | null
  venue_address: string | null
  venue_city: string | null
  welcome_message: string | null
  cover_image_url: string | null
  google_maps_url: string | null
  waze_url: string | null
  rsvp_deadline: string | null
  max_guests: number
  slug: string
}

interface WeddingPageContentProps {
  wedding: Wedding
  schedule: EventSchedule[]
  galleryPhotos: GalleryPhoto[]
  originalLocale: Locale
}

// Translation cache to avoid re-calling the API
const translationCache: Record<string, string> = {}

export default function WeddingPageContent({
  wedding,
  schedule,
  galleryPhotos,
  originalLocale,
}: WeddingPageContentProps) {
  const [locale, setLocale] = useState<Locale>(originalLocale)
  const [welcomeMsg, setWelcomeMsg] = useState(wedding.welcome_message)
  const [isPending, startTransition] = useTransition()

  const isRTL = locale === 'he'
  const tr = t(locale)

  const formatDate = (loc: Locale) =>
    new Date(wedding.wedding_date).toLocaleDateString(
      loc === 'he' ? 'he-IL' : loc === 'fr' ? 'fr-FR' : 'en-GB',
      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    )

  const [weddingDateFormatted, setWeddingDateFormatted] = useState(formatDate(originalLocale))

  const switchLanguage = async (newLocale: Locale) => {
    if (newLocale === locale) return
    setLocale(newLocale)
    setWeddingDateFormatted(formatDate(newLocale))

    if (newLocale === originalLocale) {
      setWelcomeMsg(wedding.welcome_message)
      return
    }

    if (!wedding.welcome_message) return

    startTransition(async () => {
      const cacheKey = `${wedding.id}-${newLocale}`
      if (translationCache[cacheKey]) {
        setWelcomeMsg(translationCache[cacheKey])
        return
      }

      try {
        const res = await fetch('/api/ai/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: wedding.welcome_message,
            targetLanguage: newLocale,
            context: `Wedding of ${wedding.bride_name} and ${wedding.groom_name} at ${wedding.venue_name ?? ''} on ${wedding.wedding_date}`,
          }),
        })
        const data = await res.json()
        const translated = data.translatedText ?? wedding.welcome_message
        translationCache[cacheKey] = translated
        setWelcomeMsg(translated)
      } catch {
        // keep original on error
      }
    })
  }

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-[#faf8f5]">

      {/* Ã¢ÂÂÃ¢ÂÂ Floating Language Switcher Ã¢ÂÂÃ¢ÂÂ */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1.5 shadow-lg border border-stone-100">
        {isPending && (
          <span className="text-xs text-stone-400 animate-pulse mx-1">
            {locale === 'he' ? 'ÃÂÃÂªÃÂ¨ÃÂÃÂ...' : locale === 'fr' ? '...' : '...'}
          </span>
        )}
        {(['fr', 'he', 'en'] as const).map(lang => (
          <button
            key={lang}
            onClick={() => switchLanguage(lang)}
            title={lang === 'fr' ? 'FranÃÂ§ais' : lang === 'he' ? 'ÃÂ¢ÃÂÃÂ¨ÃÂÃÂª' : 'English'}
            className="w-9 h-9 rounded-full text-xs font-semibold tracking-wide transition-all"
            style={{
              background: locale === lang ? '#c9a84c' : 'transparent',
              color: locale === lang ? '#fff' : '#a8a29e',
              transform: locale === lang ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Ã¢ÂÂÃ¢ÂÂ Hero Ã¢ÂÂÃ¢ÂÂ */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {wedding.cover_image_url ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${wedding.cover_image_url})` }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-stone-800 to-stone-900" />
        )}

        <div className="relative z-10 text-center text-white px-6">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-[#c9a84c]" />
            <span className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase font-light">
              {tr.wedding.saveDate}
            </span>
            <div className="h-px w-16 bg-[#c9a84c]" />
          </div>

          <h1 className="font-cormorant font-light leading-none mb-6">
            <span className="hero-name block text-5xl md:text-7xl lg:text-8xl">{wedding.bride_name}</span>
            <span className="block fade-in-delay text-[#c9a84c] text-2xl md:text-3xl my-4 font-light tracking-widest">&amp;</span>
            <span className="hero-name-delayed block text-5xl md:text-7xl lg:text-8xl">{wedding.groom_name}</span>
          </h1>

          <p className="fade-in-slow text-stone-200 text-lg md:text-xl font-light tracking-widest uppercase mt-6">
            {weddingDateFormatted}
          </p>

          {wedding.venue_name && (
            <p className="text-stone-300 text-base mt-2 font-light">
              {wedding.venue_name}
              {wedding.venue_city ? ` ÃÂ· ${wedding.venue_city}` : ''}
            </p>
          )}

          <div className="mt-12 scroll-pulse">
            <svg className="w-6 h-6 mx-auto text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </section>

      {/* Ã¢ÂÂÃ¢ÂÂ Welcome Message Ã¢ÂÂÃ¢ÂÂ */}
      {welcomeMsg && (
        <section className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="ornament-line"><span className="text-[#c9a84c] text-lg">Ã¢ÂÂ¦</span></div>
          <p
            className="font-cormorant text-xl md:text-2xl text-stone-600 font-light leading-relaxed italic transition-opacity duration-500"
            style={{ opacity: isPending ? 0.4 : 1 }}
          >
            {welcomeMsg}
          </p>
          <div className="ornament-line"><span className="text-[#c9a84c] text-lg">Ã¢ÂÂ¦</span></div>
        </section>
      )}

      {/* Ã¢ÂÂÃ¢ÂÂ Schedule Ã¢ÂÂÃ¢ÂÂ */}
      {schedule.length > 0 && (
        <section className="bg-white py-20">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="section-title text-center mb-12">{tr.wedding.schedule}</h2>
            <EventScheduleSection schedule={schedule} locale={locale} t={tr.wedding} />
          </div>
        </section>
      )}

      {/* Ã¢ÂÂÃ¢ÂÂ Venue Ã¢ÂÂÃ¢ÂÂ */}
      {(wedding.venue_name || wedding.google_maps_url || wedding.waze_url) && (
        <section className="py-20 px-6 bg-stone-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="section-title mb-4">{tr.wedding.venue}</h2>
            {wedding.venue_name && <p className="text-stone-600 text-lg mb-2">{wedding.venue_name}</p>}
            {wedding.venue_address && <p className="text-stone-400 text-sm mb-8">{wedding.venue_address}</p>}
            <div className="flex flex-wrap justify-center gap-4">
              {wedding.google_maps_url && (
                <a href={wedding.google_maps_url} target="_blank" rel="noopener noreferrer" className="btn-gold flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  {tr.wedding.googleMaps}
                </a>
              )}
              {wedding.waze_url && (
                <a href={wedding.waze_url} target="_blank" rel="noopener noreferrer" className="btn-outline flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.54 6.63C19.38 4.1 17.12 2.24 14.36 1.6c-4.61-1.06-9.28 1.88-10.34 6.49-.37 1.6-.22 3.22.38 4.67L2.5 18.5l6-1.73c.96.38 1.99.62 3.06.67 4.72.18 8.74-3.5 8.92-8.22.05-1.02-.1-2.03-.44-2.99l.5-.5zM12 17c-.78 0-1.55-.1-2.3-.31l-2.14.62.62-2.07C7.07 14.06 6.5 12.56 6.5 11c0-3.03 2.47-5.5 5.5-5.5S17.5 7.97 17.5 11 15.03 17 12 17z" />
                  </svg>
                  {tr.wedding.waze}
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Ã¢ÂÂÃ¢ÂÂ Gallery Ã¢ÂÂÃ¢ÂÂ */}
      <section className="bg-[#faf8f5]">
        <GallerySection weddingId={wedding.id} locale={locale} initialPhotos={galleryPhotos} />
      </section>

      {/* Ã¢ÂÂÃ¢ÂÂ RSVP Ã¢ÂÂÃ¢ÂÂ */}
      <section id="rsvp" className="py-24 px-6 bg-white">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <div className="ornament-line"><span className="text-[#c9a84c] text-lg">Ã¢ÂÂ¦</span></div>
            <h2 className="section-title mb-3">{tr.rsvp.title}</h2>
            <p className="text-stone-500 font-light">{tr.rsvp.subtitle}</p>
            {wedding.rsvp_deadline && (
              <p className="text-sm text-[#c9a84c] mt-3 tracking-wide">
                {tr.rsvp.deadline}{' '}
                {new Date(wedding.rsvp_deadline).toLocaleDateString(
                  locale === 'he' ? 'he-IL' : locale === 'fr' ? 'fr-FR' : 'en-GB',
                  { day: 'numeric', month: 'long', year: 'numeric' }
                )}
              </p>
            )}
            <div className="ornament-line"><span className="text-[#c9a84c] text-lg">Ã¢ÂÂ¦</span></div>
          </div>
          <RSVPForm weddingId={wedding.id} locale={locale} t={tr.rsvp} maxGuests={wedding.max_guests} />
        </div>
      </section>

      {/* Ã¢ÂÂÃ¢ÂÂ Footer Ã¢ÂÂÃ¢ÂÂ */}
      <footer className="py-10 text-center bg-stone-900 text-stone-400">
        <p className="font-cormorant text-2xl text-white mb-2">
          {wedding.bride_name} &amp; {wedding.groom_name}
        </p>
        <p className="text-xs tracking-widest uppercase text-[#c9a84c]">{weddingDateFormatted}</p>
        <p className="text-xs mt-6 text-stone-600">
          Powered by <span className="text-[#c9a84c]">GrandInvite</span>
        </p>
        {/* Host-only management link */}
        <a
          href={`/${locale}/login`}
          className="inline-block mt-4 text-[10px] tracking-widest text-stone-700 hover:text-[#c9a84c] transition-colors uppercase"
          title={locale === 'he' ? '×× ××¡×ª ×××¨×××' : locale === 'fr' ? 'AccÃ¨s organisateurs' : 'Host login'}
        >
          â {locale === 'he' ? '× ××××' : locale === 'fr' ? 'Gestion' : 'Manage'}
        </a>
      </footer>
    </main>
  )
}
