'use client'

import { useState, useEffect } from 'react'
import type { Locale } from '@/lib/i18n'
import type { GalleryPhoto } from '@/types'
import RSVPForm from '@/components/RSVPForm'
import GallerySection from '@/components/GallerySection'
import EventScheduleSection from '@/components/EventScheduleSection'

interface EventItem {
  id: string
  event_name: string | null
  event_date: string | null
  start_time: string | null
  end_time: string | null
  sort_order?: number | null
}

interface Wedding {
  id: string
  bride_name: string
  groom_name: string
  wedding_date: string | null
  venue_name: string | null
  venue_address: string | null
  venue_city: string | null
  welcome_message: string | null
  locale: string
  rsvp_deadline: string | null
  cover_image_url: string | null
  slug: string
  google_maps_url: string | null
  waze_url: string | null
  event_schedule?: EventItem[]
}

interface Props {
  wedding: Wedding
  photos: GalleryPhoto[]
  locale: Locale
  couplePhotoUrl?: string | null
}

const langLabels = {
  fr: { fr: 'FR', he: 'HE', en: 'EN', rsvp: 'Confirmer ma présence', welcome: 'Bienvenue', date: 'Date', venue: 'Lieu', googleMaps: 'Google Maps', waze: 'Waze', brunchTitle: 'Brunch le lendemain', brunchVenue: 'Lieu du brunch' },
  he: { fr: 'FR', he: 'HE', en: 'EN', rsvp: 'אישור הגעה', welcome: 'ברוכים הבאים', date: 'תאריך', venue: 'מיקום', googleMaps: 'Google Maps', waze: 'Waze', brunchTitle: 'בראנץ׳ למחרת', brunchVenue: 'מקום הבראנץ׳' },
  en: { fr: 'FR', he: 'HE', en: 'EN', rsvp: 'RSVP', welcome: 'Welcome', date: 'Date', venue: 'Venue', googleMaps: 'Google Maps', waze: 'Waze', brunchTitle: 'Next Day Brunch', brunchVenue: 'Brunch venue' },
}

function formatDate(dateStr: string | null, locale: Locale) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString(
      locale === 'fr' ? 'fr-FR' : locale === 'he' ? 'he-IL' : 'en-US',
      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    )
  } catch { return dateStr }
}

function formatTime(dateStr: string | null, locale: Locale) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleTimeString(
      locale === 'fr' ? 'fr-FR' : locale === 'he' ? 'he-IL' : 'en-US',
      { hour: '2-digit', minute: '2-digit' }
    )
  } catch { return '' }
}

export default function WeddingPageContent({ wedding, photos, locale, couplePhotoUrl }: Props) {
  const [currentLocale, setCurrentLocale] = useState<Locale>(locale)
  const [translatedMessage, setTranslatedMessage] = useState<string | null>(null)
  const [translating, setTranslating] = useState(false)
  const l = langLabels[currentLocale] || langLabels.fr
  const isRtl = currentLocale === 'he'

  // Auto-translate welcome_message when locale differs from wedding.locale
  useEffect(() => {
    if (!wedding.welcome_message) return
    if (currentLocale === wedding.locale) {
      setTranslatedMessage(null)
      return
    }
    setTranslating(true)
    fetch('/api/ai/invitation-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: `Translate this wedding invitation text to ${currentLocale === 'fr' ? 'French' : currentLocale === 'he' ? 'Hebrew' : 'English'}. Return ONLY the translated text, nothing else: "${wedding.welcome_message}"`
        }],
        locale: currentLocale,
        translateOnly: true,
      })
    })
      .then(r => r.json())
      .then(data => {
        if (data.content) setTranslatedMessage(data.content)
      })
      .catch(() => {})
      .finally(() => setTranslating(false))
  }, [currentLocale, wedding.locale, wedding.welcome_message])

  const displayMessage = translatedMessage || wedding.welcome_message

  const mapsUrl = wedding.google_maps_url ||
    (wedding.venue_address ? `https://www.google.com/maps/search/${encodeURIComponent(wedding.venue_address)}` : null)
  const wazeUrl = wedding.waze_url ||
    (wedding.venue_address ? `https://waze.com/ul?q=${encodeURIComponent(wedding.venue_address)}` : null)
  const brunchEvent = wedding.event_schedule?.find(e =>
    e.event_name?.toLowerCase().includes('brunch') || e.event_name?.includes('בראנץ')
  )
  const hasBrunch = !!brunchEvent

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-stone-50">

      {/* Language switcher */}
      <div className="fixed top-4 right-4 z-40 flex gap-1">
        {(['fr', 'he', 'en'] as Locale[]).map(loc => (
          <button
            key={loc}
            onClick={() => setCurrentLocale(loc)}
            className={`px-2 py-1 text-xs font-montserrat rounded ${currentLocale === loc ? 'bg-stone-800 text-white' : 'bg-white/80 text-stone-600 border border-stone-200 hover:bg-white'}`}
          >{l[loc]}</button>
        ))}
      </div>

      {/* Hero with couple photo or gradient */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20">
        {couplePhotoUrl ? (
          <>
            <img src={couplePhotoUrl} alt="couple" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-stone-100 to-stone-200" />
        )}
        <div className="relative z-10">
          <p className={couplePhotoUrl ? 'text-white/70 tracking-[0.3em] text-sm font-montserrat uppercase mb-6' : 'text-stone-400 tracking-[0.3em] text-sm font-montserrat uppercase mb-6'}>
            GrandInvite
          </p>
          <h1 className={`text-5xl md:text-7xl font-cormorant mb-6 ${couplePhotoUrl ? 'text-white' : 'text-stone-800'}`}>
            {wedding.bride_name} & {wedding.groom_name}
          </h1>
          {wedding.wedding_date && (
            <p className={`text-lg font-montserrat tracking-wide ${couplePhotoUrl ? 'text-white/80' : 'text-stone-500'}`}>
              {formatDate(wedding.wedding_date, currentLocale)} · {formatTime(wedding.wedding_date, currentLocale)}
            </p>
          )}
        </div>
      </section>

      {/* Welcome message */}
      {displayMessage && (
        <section className="py-16 px-4 max-w-2xl mx-auto text-center">
          {translating ? (
            <div className="text-stone-300 text-sm animate-pulse">...</div>
          ) : (
            <p className="text-stone-600 font-cormorant text-xl leading-relaxed whitespace-pre-wrap">{displayMessage}</p>
          )}
        </section>
      )}

      {/* Date & Venue */}
      {(wedding.wedding_date || wedding.venue_name) && (
        <section className="py-12 px-4 bg-white">
          <div className="max-w-2xl mx-auto grid md:grid-cols-2 gap-8 text-center">
            {wedding.wedding_date && (
              <div>
                <p className="text-xs tracking-widest uppercase text-stone-400 font-montserrat mb-2">{l.date}</p>
                <p className="text-stone-700 font-cormorant text-lg">{formatDate(wedding.wedding_date, currentLocale)}</p>
                <p className="text-stone-500 text-sm mt-1">{formatTime(wedding.wedding_date, currentLocale)}</p>
              </div>
            )}
            {wedding.venue_name && (
              <div>
                <p className="text-xs tracking-widest uppercase text-stone-400 font-montserrat mb-2">{l.venue}</p>
                <p className="text-stone-700 font-cormorant text-lg">{wedding.venue_name}</p>
                {wedding.venue_address && <p className="text-stone-400 text-sm mt-1">{wedding.venue_address}</p>}
                {(mapsUrl || wazeUrl) && (
                  <div className="flex justify-center gap-3 mt-3">
                    {mapsUrl && <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-stone-500 underline">{l.googleMaps}</a>}
                    {wazeUrl && <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-stone-500 underline">{l.waze}</a>}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Brunch section */}
      {hasBrunch && wedding.brunch_date && (
        <section className="py-12 px-4 bg-stone-50">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-cormorant text-stone-800 mb-4">{l.brunchTitle}</h2>
            <p className="text-stone-600 font-montserrat text-sm">{formatDate(wedding.brunch_date, currentLocale)} · {formatTime(wedding.brunch_date, currentLocale)}</p>
            {wedding.brunch_venue && <p className="text-stone-500 text-sm mt-1">{l.brunchVenue}: {wedding.brunch_venue}</p>}
          </div>
        </section>
      )}

      {/* Schedule */}
      {wedding.event_schedule && wedding.event_schedule.length > 0 && (
        <EventScheduleSection schedule={wedding.event_schedule} locale={currentLocale} />
      )}

      {/* Gallery */}
      {(photos.length > 0 || couplePhotoUrl) && (
        <GallerySection photos={photos} locale={currentLocale} couplePhotoUrl={couplePhotoUrl} />
      )}

      {/* RSVP */}
      <RSVPForm weddingId={wedding.id} locale={currentLocale} hasBrunch={hasBrunch} rsvpDeadline={wedding.rsvp_deadline} />
    </div>
  )
}
