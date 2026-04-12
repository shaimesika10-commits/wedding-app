'use client'
// ============================================================
//  GrandInvite – Wedding Page Content (Client Component)
//  Handles language switching + AI translation for guests
//  src/components/WeddingPageContent.tsx
// ============================================================

import React, { useState, useTransition } from 'react'
import RSVPForm from './RSVPForm'
import EventScheduleSection from './EventScheduleSection'
import type { EventSchedule } from '@/types'
import type { Locale } from '@/lib/i18n'
import { t } from '@/lib/i18n'

// ─── Color palettes ─────────────────────────────────────────────────────────
const PALETTES: Record<string, {
  bg: string; surface: string; accent: string; text: string
  subtext: string; border: string; hero: string; footer: string
}> = {
  ivory: {
    bg: '#faf8f5', surface: '#ffffff', accent: '#c9a84c', text: '#1c1917', subtext: '#78716c',
    border: '#e7e5e4', hero: 'linear-gradient(to bottom, #292524, #1c1917)', footer: '#1c1917',
  },
  blush: {
    bg: '#fff5f5', surface: '#fffafa', accent: '#d4a0a0', text: '#3d1515', subtext: '#7d5a5a',
    border: '#f0d8d8', hero: 'linear-gradient(to bottom, #3d1515, #5a2020)', footer: '#3d1515',
  },
  sage: {
    bg: '#f4f7f2', surface: '#f9fbf8', accent: '#7a9e7e', text: '#1a2e1c', subtext: '#4a6e4d',
    border: '#c8dcc9', hero: 'linear-gradient(to bottom, #1a2e1c, #253c28)', footer: '#1a2e1c',
  },
  midnight: {
    bg: '#0f172a', surface: '#1e293b', accent: '#c9a84c', text: '#f8f5ee', subtext: '#94a3b8',
    border: '#334155', hero: 'linear-gradient(to bottom, #020617, #0f172a)', footer: '#020617',
  },
}

// ─── Fonts ──────────────────────────────────────────────────────────────────
const FONTS: Record<string, string> = {
  cormorant: 'Georgia, "Times New Roman", serif',
  playfair: '"Playfair Display", Georgia, serif',
  modern: '"Helvetica Neue", Arial, sans-serif',
}

// ─── Simple markdown renderer (bold only) ──────────────────────────────────
function renderMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}


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
  font_style: string | null
  layout_style: string | null
  image_position: string | null
  cover_frame: string | null
  page_layout: string | null
  slug: string
}

interface WeddingPageContentProps {
  wedding: Wedding
  schedule: EventSchedule[]
  originalLocale: Locale
}

// Translation cache
const translationCache: Record<string, string> = {}

// ─── BG position map ───────────────────────────────────────────────────────
const BG_POSITION: Record<string, string> = {
  center: '50% 50%',
  top: '50% 20%',
  bottom: '50% 80%',
  left: '20% 50%',
  right: '80% 50%',
  'top-left': '20% 20%',
  'top-right': '80% 20%',
  'bottom-left': '20% 80%',
  'bottom-right': '80% 80%',
}

export default function WeddingPageContent({
  wedding,
  schedule,
  originalLocale,
}: WeddingPageContentProps) {
  const [locale, setLocale] = useState<Locale>(originalLocale)
  const [welcomeMsg, setWelcomeMsg] = useState(wedding.welcome_message)
  const [translatedSchedule, setTranslatedSchedule] = useState(schedule)
  const [isPending, startTransition] = useTransition()

  const isRTL = locale === 'he'
  const tr = t(locale)

  // Design tokens
  const palette = PALETTES[wedding.layout_style ?? 'ivory'] ?? PALETTES.ivory
  const fontFamily = FONTS[wedding.font_style ?? 'cormorant'] ?? FONTS.cormorant
  const pageLayout = wedding.page_layout ?? 'classic'
  const coverFrame = wedding.cover_frame ?? 'fullscreen'
  const bgPosition = BG_POSITION[wedding.image_position ?? 'center'] ?? '50% 50%'

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
      setTranslatedSchedule(schedule)
      return
    }

    startTransition(async () => {
      // Translate welcome message
      if (wedding.welcome_message) {
        const cacheKey = `${wedding.id}-welcome-${newLocale}`
        if (translationCache[cacheKey]) {
          setWelcomeMsg(translationCache[cacheKey])
        } else {
          try {
            const res = await fetch('/api/ai/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: wedding.welcome_message,
                targetLanguage: newLocale,
                context: `Wedding invitation of ${wedding.bride_name} and ${wedding.groom_name} at ${wedding.venue_name ?? ''} on ${wedding.wedding_date}. Keep proper names (people, venues, cities) unchanged. Do NOT translate: ${[wedding.venue_name, wedding.venue_city].filter(Boolean).join(', ')}`,
              }),
            })
            const data = await res.json()
            const translated = data.translatedText ?? wedding.welcome_message
            translationCache[cacheKey] = translated
            setWelcomeMsg(translated)
          } catch {
            // keep original on error
          }
        }
      }

      // Translate schedule event descriptions (not names or locations)
      if (schedule.length > 0) {
        const cacheKey = `${wedding.id}-schedule-${newLocale}`
        if (translationCache[cacheKey]) {
          setTranslatedSchedule(JSON.parse(translationCache[cacheKey]))
        } else {
          try {
            const textsToTranslate = schedule
              .filter(e => e.description)
              .map(e => e.description!)

            if (textsToTranslate.length > 0) {
              const res = await fetch('/api/ai/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  text: textsToTranslate.join('\n---\n'),
                  targetLanguage: newLocale,
                  context: `Wedding schedule event descriptions for ${wedding.bride_name} and ${wedding.groom_name}`,
                }),
              })
              const data = await res.json()
              const translatedTexts = (data.translatedText ?? '').split('\n---\n')
              let tIdx = 0
              const translated = schedule.map((event) => ({
                ...event,
                description: event.description ? (translatedTexts[tIdx++] ?? event.description) : event.description,
              }))
              translationCache[cacheKey] = JSON.stringify(translated)
              setTranslatedSchedule(translated)
            }
          } catch {
            // keep original on error
          }
        }
      }
    })
  }

  // ─── Share handler ────────────────────────────────────────────────────────
  const [shareCopied, setShareCopied] = useState(false)
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const title = `${wedding.bride_name} & ${wedding.groom_name}`
    const text = locale === 'he'
      ? `הזמנת לחתונת ${title} 🎉`
      : locale === 'fr'
      ? `Vous êtes invité(e) au mariage de ${title} 🎉`
      : `You're invited to ${title}'s wedding 🎉`
    if (typeof navigator window._p1 = "!== 'undefined' && navigator.share) {\n      navigator.share({ title, text, url }).catch(() => {})\n    } else {\n      await navigator.clipboard.writeText(url).catch(() => {})\n      setShareCopied(true)\n      setTimeout(() => setShareCopied(false), 2000)\n    }\n  }\n\n  // \u2500\u2500 Shared sections \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n  const LanguageSwitcher = (\n    <div className=\"fixed top-4 right-4 z-50 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1.5 shadow-lg border border-stone-100\">\n      {isPending && (\n        <span className=\"text-xs text-stone-400 animate-pulse mx-1\">\n          {locale === 'he' ? '\u05de\u05ea\u05e8\u05d2\u05dd...' : '...'}\n        </span>\n      )}\n      {(['fr', 'he', 'en'] as const).map(lang => (\n        <button\n          key={lang}\n          onClick={() => switchLanguage(lang)}\n          title={lang === 'fr' ? 'Fran\u00e7ais' : lang === 'he' ? '\u05e2\u05d1\u05e8\u05d9\u05ea' : 'English'}\n          className=\"w-9 h-9 rounded-full text-xs font-semibold tracking-wide transition-all\"\n          style={{\n            background: locale === lang ? palette.accent : 'transparent',\n            color: locale === lang ? '#fff' : '#a8a29e',\n            transform: locale === lang ? 'scale(1.05)' : 'scale(1)',\n          }}\n        >\n          {lang.toUpperCase()}\n        </button>\n      ))}\n    </div>\n  )\n\n  // Share button (fixed top-left on the invitation page)\n  const ShareBtn = (\n    <button\n      onClick={handleShare}\n      className=\"fixed top-4 left-4 z-50 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg border border-stone-100 text-xs font-medium transition-all hover:bg-white\"\n      style={{ color: shareCopied ? '#059669' : '#78716c' }}\n      title={locale === 'he' ? '\u05e9\u05d9\u05ea\u05d5\u05e3' : locale === 'fr' ? 'Partager' : 'Share'}\n    >\n      {shareCopied ? (\n        <>\n          <svg className=\"w-3.5 h-3.5 text-emerald-500\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" strokeWidth={2.5}>\n            <path strokeLinecap=\"round\" strokeLinejoin=\"round\" d=\"M5 13l4 4L19 7\"/>\n          </svg>\n          <span>{locale === 'he' ? '\u05d4\u05d5\u05e2\u05ea\u05e7!' : locale === 'fr' ? 'Copi\u00e9!' : 'Copied!'}</span>\n        </>\n      ) : (\n        <>\n          <svg className=\"w-3.5 h-3.5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" strokeWidth={2}>\n            <path strokeLinecap=\"round\" strokeLinejoin=\"round\" d=\"M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0 a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 10.367 2.684 3 3 0 00-5.367-2.684\"/>\n          </svg>\n          <span className=\"hidden sm:inline\">{locale === 'he' ? '\u05e9\u05d9\u05ea\u05d5\u05e3' : locale === 'fr' ? 'Partager' : 'Share'}</span>\n        </>\n      )}\n    </button>\n  )\n\n  const VenueSection = (\n    (wedding.venue_name || wedding.google_maps_url || wedding.waze_url) ? (\n      <section className=\"py-20 px-6\" style={{ background: palette.bg }}>\n        <div className=\"max-w-4xl mx-auto text-center\">\n          <h2 className=\"section-title mb-4\" style={{ fontFamily }}>{tr.wedding.venue}</h2>\n          {wedding.venue_name && <p className=\"text-lg mb-2\" style={{ color: palette.subtext }}>{wedding.venue_name}</p>}\n          {wedding.venue_address && <p className=\"text-sm mb-8\" style={{ color: palette.subtext, opacity: 0.7 }}>{wedding.venue_address}</p>}\n          <div className=\"flex flex-wrap justify-center gap-4\">\n            {wedding.google_maps_url && (\n              <a href={wedding.google_maps_url} target=\"_blank\" rel=\"noopener noreferrer\"\n                className=\"btn-gold flex items-center gap-2\"\n                style={{ background: palette.accent, color: '#fff', padding: '0.6rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem' }}>\n                <svg className=\"w-4 h-4\" fill=\"currentColor\" viewBox=\"0 0 24 24\">\n                  <path d=\"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z\" />\n                </svg>\n                {tr.wedding.googleMaps}\n              </a>\n            )}\n            {wedding.waze_url && (\n              <a href={wedding.waze_url} target=\"_blank\" rel=\"noopener noreferrer\"\n                className=\"btn-outline flex items-center gap-2\"\n                style={{ border: `1px solid ${palette.border}`, color: palette.text, padding: '0.6rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem' }}>\n                <svg className=\"w-4 h-4\" fill=\"currentColor\" viewBox=\"0 0 24 24\">\n                  <path d=\"M20.54 6.63C19.38 4.1 17.12 2.24 14.36 1.6c-4.61-1.06-9.28 1.88-10.34 6.49-.37 1.6-.22 3.22.38 4.67L2.5 18.5l6-1.73c.96.38 1.99.62 3.06.67 4.72.18 8.74-3.5 8.92-8.22.05-1.02-.1-2.03-.44-2.99l.5-.5zM12 17c-.78 0-1.55-.1-2.3-.31l-2.14.62.62-2.07C7.07 14.06 6.5 12.56 6.5 11c0-3.03 2.47-5.5 5.5-5.5S17.5 7.97 17.5 11 15.03 17 12 17z\" />\n                </svg>\n                {tr.wedding.waze}\n              </a>\n            )}\n          </div>\n        </div>\n      </section>\n    ) : null\n  )\n\n  const RSVPBlock = (\n    <section id=\"rsvp\" className=\"py-24 px-6\" style={{ background: palette.surface }}>\n      <div className=\"max-w-xl mx-auto\">\n        <div className=\"text-center mb-12\">\n          <div className=\"ornament-line\"><span className=\"text-lg\" style={{ color: palette.accent }}>\u2726</span></div>\n          <h2 className=\"section-title mb-3\" style={{ fontFamily }}>{tr.rsvp.title}</h2>\n          <p className=\"font-light\" style={{ color: palette.subtext }}>{tr.rsvp.subtitle}</p>\n          {wedding.rsvp_deadline && (\n            <p className=\"text-sm mt-3 tracking-wide\" style={{ color: palette.accent }}>\n              {tr.rsvp.deadline}{' '}\n              {new Date(wedding.rsvp_deadline).toLocaleDateString(\n                locale === 'he' ? 'he-IL' : locale === 'fr' ? 'fr-FR' : 'en-GB',\n                { day: 'numeric', month: 'long', year: 'numeric' }\n              )}\n            </p>\n          )}\n          <div className=\"ornament-line\"><span className=\"text-lg\" style={{ color: palette.accent }}>\u2726</span></div>\n        </div>\n        <RSVPForm weddingId={wedding.id} locale={locale} t={tr.rsvp} maxGuests={wedding.max_guests} />\n      </div>\n    </section>\n  )\n\n  const FooterBlock = (\n    <footer className=\"py-16 text-center\" style={{ background: palette.footer, color: palette.subtext }}>\n      <p className=\"text-2xl text-white mb-2\" style={{ fontFamily, fontWeight: 300 }}>\n        {wedding.bride_name} &amp; {wedding.groom_name}\n      </p>\n      <p className=\"text-xs tracking-widest uppercase\" style={{ color: palette.accent }}>{weddingDateFormatted}</p>\n      <div className=\"flex flex-col sm:flex-row gap-4 justify-center mt-8 mb-8\">\n        <a href={`/${locale}/login?tab=register`}\n          style={{ padding: '0.75rem 1.5rem', border: `1px solid ${palette.accent}`, color: palette.accent, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 300, borderRadius: '6px', textDecoration: 'none' }}>\n          {locale === 'he' ? '\u05e8\u05d5\u05e6\u05d4 \u05d4\u05d6\u05de\u05e0\u05d4 \u05db\u05de\u05d5 \u05d6\u05d5?' : locale === 'fr' ? 'Cr\u00e9er votre invitation' : 'Create your invitation'}\n        </a>\n        <a href={`/${locale}/login`}\n          style={{ padding: '0.75rem 1.5rem', border: `1px solid ${palette.accent}`, color: palette.accent, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 300, borderRadius: '6px', textDecoration: 'none' }}>\n          {locale === 'he' ? '\u05e0\u05d9\u05d4\u05d5\u05dc \u05d4\u05d4\u05d6\u05de\u05e0\u05d4' : locale === 'fr' ? 'G\u00e9rer mon invitation' : 'Manage invitation'}\n        </a>\n      </div>\n      <p className=\"text-xs mt-6\" style={{ color: palette.subtext, opacity: 0.6 }}>\n        Powered by <span style={{ color: palette.accent }}>GrandInvite</span>\n      </p>\n    </footer>\n  )\n\n  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n  // LAYOUT 1: CLASSIC (original design, fullscreen hero)\n  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n  i"window._p2 = "f (pageLayout === 'classic') {\n    const heroStyle: React.CSSProperties =\n      coverFrame === 'fullscreen'\n        ? { height: '100vh' }\n        : coverFrame === 'arch'\n        ? { height: '85vh', clipPath: 'ellipse(100% 90% at 50% 0%)' }\n        : coverFrame === 'contained'\n        ? { height: '70vh', maxWidth: '60rem', margin: '2rem auto', borderRadius: '2rem', overflow: 'hidden' }\n        : { height: '100vh' }\n\n    const needsWrapper = coverFrame === 'contained'\n\n    return (\n      <main dir={isRTL ? 'rtl' : 'ltr'} className=\"min-h-screen\" style={{ background: palette.bg, fontFamily, color: palette.text }}>\n        {LanguageSwitcher}\n        {ShareBtn}\n\n        {/* \u2500\u2500 Hero \u2500\u2500 */}\n        <section className=\"relative flex items-center justify-center overflow-hidden\" style={needsWrapper ? { paddingTop: '2rem', paddingBottom: '0', background: palette.bg } : { position: 'relative' }}>\n          <div className=\"relative flex items-center justify-center overflow-hidden\" style={heroStyle}>\n            {wedding.cover_image_url ? (\n              <div\n                className=\"absolute inset-0 bg-cover\"\n                style={{ backgroundImage: `url(${wedding.cover_image_url})`, backgroundPosition: bgPosition }}\n              >\n                <div className=\"absolute inset-0\" style={{ background: coverFrame === 'contained' ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.40)' }} />\n              </div>\n            ) : (\n              <div className=\"absolute inset-0\" style={{ background: palette.hero }} />\n            )}\n\n            <div className=\"relative z-10 text-center text-white px-6\">\n              <div className=\"fade-in flex items-center justify-center gap-4 mb-8\">\n                <div className=\"h-px w-16 shimmer\" style={{ background: palette.accent }} />\n                <span className=\"text-xs tracking-[0.4em] uppercase font-light\" style={{ color: palette.accent }}>\n                  {tr.wedding.saveDate}\n                </span>\n                <div className=\"h-px w-16 shimmer\" style={{ background: palette.accent }} />\n              </div>\n              <h1 className=\"font-light leading-none mb-6\" style={{ fontFamily }}>\n                <span className=\"hero-name block text-5xl md:text-7xl lg:text-8xl\">{wedding.bride_name}</span>\n                <span className=\"fade-in-delay block text-2xl md:text-3xl my-4 font-light tracking-widest\" style={{ color: palette.accent }}>&amp;</span>\n                <span className=\"hero-name-delayed block text-5xl md:text-7xl lg:text-8xl\">{wedding.groom_name}</span>\n              </h1>\n              <p className=\"fade-in-slow text-lg md:text-xl font-light tracking-widest uppercase mt-6 text-white/80\">\n                {weddingDateFormatted}\n              </p>\n              {wedding.venue_name && (\n                <p className=\"fade-in-slow text-base mt-2 font-light text-white/70\">\n                  {wedding.venue_name}{wedding.venue_city ? ` \u00b7 ${wedding.venue_city}` : ''}\n                </p>\n              )}\n              <div className=\"mt-12 scroll-pulse\">\n                <svg className=\"w-6 h-6 mx-auto\" style={{ color: palette.accent }} fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">\n                  <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={1.5} d=\"M19 9l-7 7-7-7\" />\n                </svg>\n              </div>\n            </div>\n          </div>\n        </section>\n\n        {/* \u2500\u2500 Cover frame: OVAL \u2500\u2500 */}\n        {coverFrame === 'oval' && wedding.cover_image_url && (\n          <section className=\"flex justify-center py-12\" style={{ background: palette.bg }}>\n            <div style={{\n              width: 'min(440px, 90vw)', height: 'min(540px, 70vw)',\n              borderRadius: '50%', overflow: 'hidden',\n              boxShadow: `0 24px 64px rgba(0,0,0,0.18), 0 0 0 8px ${palette.accent}22`,\n            }}>\n              <img src={wedding.cover_image_url} alt=\"Wedding\" className=\"w-full h-full object-cover\" style={{ objectPosition: bgPosition }} />\n            </div>\n          </section>\n        )}\n\n        {»/* Welcome Message \u2500\u2500 */}\n        {welcomeMsg && (\n          <section className=\"max-w-2xl mx-auto px-6 py-20 text-center\">\n            <div className=\"ornament-line\"><span className=\"text-lg\" style={{ color: palette.accent }}>\u2726</span></div>\n            <p className=\"text-xl md:text-2xl font-light leading-relaxed italic transition-opacity duration-500\"\n              style={{ fontFamily, color: palette.subtext, opacity: isPending ? 0.4 : 1 }}>\n              {renderMarkdown(welcomeMsg)}\n            </p>\n            <div className=\"ornament-line\"><span className=\"text-lg\" style={{ color: palette.accent }}>\u2726</span></div>\n          </section>\n        )}\n\n        {/* \u2500\u2500 Schedule \u2500\u2500 */}\n        {translatedSchedule.length > 0 && (\n          <section className=\"py-20\" style={{ background: palette.surface }}>\n            <div className=\"max-w-4xl mx-auto px-6\">\n              <h2 className=\"section-title text-center mb-12\" style={{ fontFamily }}>{tr.wedding.schedule}</h2>\n              <EventScheduleSection schedule={translatedSchedule} locale={locale} t={tr.wedding} accentColor={palette.accent} />\n            </div>\n          </section>\n        )}\n\n        {VenueSection}\n        {RSVPBlock}\n        {FooterBlock}\n      </main>\n    )\n  }\n\n  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n  // LAYOUT 2: ROMANTIC (split hero + editorial sections)\n  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n  if (pageLayout === 'romantic') {\n    return (\n      <main dir={isRTL ? 'rtl' : 'ltr'} className=\"min-h-screen\" style={{ background: palette.bg, fontFamily, color: palette.text }}>\n        {LanguageSwitcher}\n        {ShareBtn}\n\n        {/* \u2500\u2500 Romantic Hero: 60vh with arch frame \u2500\u2500 */}\n        <section className=\"relative overflow-hidden\" style={{ height: '70vh' }}>\n          {wedding.cover_image_url ? (\n            <div className=\"absolute inset-0 bg-cover\" style={{\n              backgroundImage: `url(${wedding.cover_image_url})`,\n              backgroundPosition: bgPosition,\n              clipPath: 'ellipse(100% 88% at 50% 0%)',\n            }}>\n              <div className=\"absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60\" />\n            </div>\n          ) : (\n            <div className=\"absolute inset-0\" style={{ background: palette.hero }} />\n          )}\n\n          <div className=\"absolute inset-0 flex items-end justify-center pb-12 text-center text-white px-6\">\n            <div>\n              <div className=\"flex items-center justify-center gap-4 mb-4\">\n                <div className=\"h-px w-12\" style={{ background: palette.accent }} />\n                <span className=\"text-xs tracking-[0.4em] uppercase font-light\" style={{ color: palette.accent }}>\n                  {tr.wedding.saveDate}\n                </span>\n                <div className=\"h-px w-12\" style={{ background: palette.accent }} />\n              </div>\n              <h1 className=\"font-light leading-none\" style={{ fontFamily }}>\n                <span className=\"block text-4xl md:text-6xl\">{wedding.bride_name}</span>\n                <span className=\"block text-xl md:text-2xl my-3 font-light tracking-widest\" style={{ color: palette.accent }}>&amp;</span>\n                <span className=\"block text-4xl md:text-6xl\">{wedding.groom_name}</span>\n              </h1>\n              <p className=\"text-sm md:text-base font-light tracking-widest uppercase mt-4 text-white/80\">\n                {weddingDateFormatted}\n              </p>\n            </div>\n          </div>\n        </section>\n\n        {/* \u2500\u2500 Romantic: Date & Venue card \u2500\u2500 */}\n        <section className=\"relative z-10 -mt-8 mb-8\">\n          <div className=\"max-w-xl mx-auto mx-4 px-6 py-6 rounded-2xl shadow-xl text-center\" style={{ background: palette.surface, border: `1px solid ${palette.border}` }}>\n            <p className=\"text-sm font-medium mb-1\" style={{ color: palette.text }}>{weddingDateFormatted}</p>\n            {wedding.v"window._p3 = "enue_name && (\n              <p className=\"text-xs\" style={{ color: palette.subtext }}>\n                {wedding.venue_name}{wedding.venue_city ? ` \u00b7 ${wedding.venue_city}` : ''}\n              </p>\n            )}\n            {(wedding.google_maps_url || wedding.waze_url) && (\n              <div className=\"flex justify-center gap-3 mt-3\">\n                {wedding.google_maps_url && (\n                  <a href={wedding.google_maps_url} target=\"_blank\" rel=\"noopener noreferrer\"\n                    className=\"text-xs px-3 py-1 rounded-full\"\n                    style={{ background: palette.accent + '20', color: palette.accent }}>\n                    Google Maps \u2197\n                  </a>\n                )}\n                {wedding.waze_url && (\n                  <a href={wedding.waze_url} target=\"_blank\" rel=\"noopener noreferrer\"\n                    className=\"text-xs px-3 py-1 rounded-full\"\n                    style={{ background: palette.border, color: palette.subtext }}>\n                    Waze \u2197\n                  </a>\n                )}\n              </div>\n            )}\n          </div>\n        </section>\n\n        {»/* Welcome Message \u2500\u2500 */}\n        {welcomeMsg && (\n          <section className=\"max-w-2xl mx-auto px-6 py-12 text-center\">\n            <div className=\"ornament-line\"><span className=\"text-lg\" style={{ color: palette.accent }}>\u2726</span></div>\n            <p className=\"text-xl md:text-2xl font-light leading-relaxed italic\"\n              style={{ fontFamily, color: palette.subtext, opacity: isPending ? 0.4 : 1 }}>\n              {renderMarkdown(welcomeMsg)}\n            </p>\n            <div className=\"ornament-line\"><span className=\"text-lg\" style={{ color: palette.accent }}>\u2726</span></div>\n          </section>\n        )}\n\n        {/* \u2500\u2500 Schedule in a warm card \u2500\u2500 */}\n        {translatedSchedule.length > 0 && (\n          <section className=\"py-16\" style={{ background: palette.surface }}>\n            <div className=\"max-w-2xl mx-auto px-6\">\n              <h2 className=\"section-title text-center mb-10\" style={{ fontFamily }}>{tr.wedding.schedule}</h2>\n              <EventScheduleSection schedule={translatedSchedule} locale={locale} t={tr.wedding} accentColor={palette.accent} />\n            </div>\n          </section>\n        )}\n\n        {RSVPBlock}\n        {FooterBlock}\n      </main>\n    )\n  }\n\n  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n  // LAYOUT 3: MINIMAL (editorial, text-focused)\n  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n  return (\n    <main dir={isRTL ? 'rtl' : 'ltr'} className=\"min-h-screen\" style={{ background: palette.bg, fontFamily, color: palette.text }}>\n      {LanguageSwitcher}\n        {ShareBtn}\n\n      {/* \u2500\u2500 Minimal: Elegant text header \u2500\u2500 */}\n      <section className=\"py-24 px-6 text-center\" style={{ background: palette.surface }}>\n        <div className=\"max-w-xl mx-auto\">\n          <div className=\"flex items-center justify-center gap-6 mb-8\">\n            <div className=\"h-px flex-1\" style={{ background: palette.accent, opacity: 0.4 }} />\n            <span className=\"text-xs tracking-[0.5em] uppercase font-light\" style={{ color: palette.accent }}>\n              {tr.wedding.saveDate}\n            </span>\n            <div className=\"h-px flex-1\" style={{ background: palette.accent, opacity: 0.4 }} />\n          </div>\n          <h1 className=\"font-light leading-tight mb-6\" style={{ fontFamily }}>\n            <span className=\"block text-5xl md:text-6xl\">{wedding.bride_name}</span>\n            <span className=\"block text-2xl my-4 font-light tracking-[0.3em]\" style={{ color: palette.accent }}>&amp;</span>\n            <span className=\"block text-5xl md:text-6xl\">{wedding.groom_name}</span>\n          </h1>\n          <p className=\"text-sm tracking-[0.3em] uppercase font-light mb-2\" style={{ color: palette.subtext }}>\n              {weddingDateFormatted}\n          </p>\n          {wedding.venue_name && (\n            <p className=\"text-base font-light\" style={{ color: palette.subtext }}>\n              {wedding.venue_name}{wedding.venue_city ? ` \u00b7 ${wedding.venue_city}` : ''}\n            </p>\n          )}\n        </div>\n        </section>\n\n      {/* \u2500\u2500 Minimal: Cover image (contained, not fullscreen) \u2500\u2500 */}\n      { wedding.cover_image_url && (\n        <section className=\"py-8 px-6\" style={{ background: palette.bg }}>\n          <div className=\"max-w-3xl mx-auto\" style={{\n            borderRadius: coverFrame === 'oval' ? '50%' : coverFrame === 'arch' ? '50% 50% 0 0 / 60% 60% 0 0` : '1rem',\n            overflow: 'hidden',\n            aspectRatio: coverFrame === 'oval' ? '1/1.2' : '16/7',\n          }}>\n            <img\n              src={wedding.cover_image_url}\n              alt=\"Wedding\"\n              className=\"w-full h-full object-cover\"\n              style={{ objectPosition: bgPosition }}\n            />\n          </div>\n        </section>\n      )}\n\n      {/* \u2500\u2500 Welcome Message \u2500\u2500 */}\n      {welcomeMsg && (\n        <section className=\"max-w-xl mx-auto px-6 py-16 text-center\">\n          <p className=\"text-lg md:text-xl font-light leading-relaxed\"\n            style={{ fontFamily, color: palette.subtext, opacity: isPending ? 0.4 : 1 }}>\n            {renderMarkdown(welcomeMsg)}\n          </p>\n        </section>\n      )}\n\n      {»/* \u2500\u2500 Schedule \u2500\u2500 */}\n      {translatedSchedule.length > 0 && (\n        <section className=\"py-16\" style={{ background: palette.surface }}>\n          <div className=\"max-w-2xl mx-auto px-8\">\n            <h2 className=\"text-center mb-10 text-2xl font-light tracking-widest uppercase\" style={{ fontFamily, color: palette.text }}>{tr.wedding.schedule}</h2>\n            <EventScheduleSection schedule={translatedSchedule} locale={locale} t={tr.wedding} accentColor={palette.accent} />\n          </div>\n        </section>\n      )}\n\n      {/* \u2500\u2500 Venue \u2500\u2500 */}\n      {(wedding.venue_name || wedding.google_maps_url || wedding.waze_url) && (\n        <section className=\"py-16 px-6 text-center\" style={{ background: palette.bg }}>\n          <div className=\"max-w-sm mx-auto\">\n            <div className=\"h-px mb-8\" style={{ background: palette.border }} />\n            {wedding.venue_name && <p className=\"text-base mb-1\" style={{ color: palette.text }}>{wedding.venue_name}</p>}\n            {wedding.venue_address && <p className=\"text-sm mb-6\" style={{ color: palette.subtext }}>{wedding.venue_address}</p>}\n            <div className=\"flex flex-wrap justify-center gap-3\">\n              {wedding.google_maps_url && (\n                <a href={wedding.google_maps_url} target=\"_blank\" rel=\"noopener noreferrer\"\n                  className=\"text-xs px-4 py-2 rounded-full border\"\n                  style={{ borderColor: palette.accent, color: palette.accent }}>\n                  Google Maps \u2197\n                </a>\n              )}\n              {wedding.waze_url && (\n                <a href={wedding.waze_url} target=\"_blank\" rel=\"noopener noreferrer\"\n                  className=\"text-xs px-4 py-2 rounded-full border\"\n                  style={{ borderColor: palette.border, color: palette.subtext }}>\n                  Waze \u2197\n                </a>\n              )}\n            </div>\n            <div className=\"h-px mt-8\" style={{ background: palette.border }} />\n          </div>\n        </section>\n      )}\n\n      {RSVPBlock}\n      {FooterBlock}\n    </main>\n  )\n}\n"
