'use client'
// ============================================================
//  GrandInvite â First Visit Language Picker Modal
//  Shown once on first visit â lets the user choose their
//  preferred language. Also serves as cookie consent.
//  Sets: NEXT_LOCALE (language) + gi_lp + gi_cookie (consent)
//  src/components/FirstVisitModal.tsx
// ============================================================

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Locale } from '@/lib/i18n'

// ââ Cookies ââââââââââââââââââââââââââââââââââââââââââââââââââ
const LP_COOKIE     = 'gi_lp'      // language picker was shown
const COOKIE_OK     = 'gi_cookie'  // cookie consent given
const LOCALE_COOKIE = 'NEXT_LOCALE'

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

function setCookie(name: string, value: string, days = 365) {
  const maxAge = days * 24 * 60 * 60
  const secure = location.protocol === 'https:' ? ';Secure' : ''
  document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax${secure}`
}

// ââ Copy âââââââââââââââââââââââââââââââââââââââââââââââââââââ
const COPY = {
  welcome: { fr: 'Bienvenue', he: '××¨×××× ×××××', en: 'Welcome' },
  tagline: {
    fr: 'Choisissez votre langue pour continuer',
    he: '×××¨× ××ª ×©×¤×ª×× ××××©×',
    en: 'Choose your language to continue',
  },
  continue: { fr: 'Continuer', he: '×××©×', en: 'Continue' },
  cookie: {
    fr: "En continuant, vous acceptez l'utilisation de cookies fonctionnels pour mÃ©moriser vos prÃ©fÃ©rences.",
    he: '×××××¦× ×¢× ×××©×, ××ª× ××¡××××× ××©××××© ××¢×××××ª ×¤×× ×§×¦××× ××××ª ××©×××¨×ª ×××¢××¤××ª ×©×××.',
    en: 'By continuing, you agree to the use of functional cookies to remember your preferences.',
  },
}

const LANG_OPTIONS: { locale: Locale; label: string; name: string }[] = [
  { locale: 'fr', label: 'FR', name: 'FranÃ§ais' },
  { locale: 'he', label: 'HE', name: '×¢××¨××ª' },
  { locale: 'en', label: 'EN', name: 'English' },
]

// ââ Component âââââââââââââââââââââââââââââââââââââââââââââââââ
interface Props {
  /** Locale auto-detected by middleware â pre-selected in the UI */
  detectedLocale: Locale
}

export default function FirstVisitModal({ detectedLocale }: Props) {
  const [visible,  setVisible]  = useState(false)
  const [selected, setSelected] = useState<Locale>(detectedLocale)
  const [leaving,  setLeaving]  = useState(false)
  const router = useRouter()

  // Show only on first visit
  useEffect(() => {
    if (!getCookie(LP_COOKIE)) {
      // slight delay so the page paints first
      const t = setTimeout(() => setVisible(true), 300)
      return () => clearTimeout(t)
    }
  }, [])

  const handleContinue = () => {
    // Persist cookies
    setCookie(LOCALE_COOKIE, selected)
    setCookie(LP_COOKIE, '1')
    setCookie(COOKIE_OK, '1')

    // Animate out
    setLeaving(true)
    setTimeout(() => {
      setVisible(false)

      // Navigate to chosen locale
      const segs = window.location.pathname.split('/')
      if (segs[1] && ['fr', 'he', 'en'].includes(segs[1])) {
        segs[1] = selected
      } else {
        segs.splice(1, 0, selected)
      }
      router.push(segs.join('/') || '/')
    }, 350)
  }

  if (!visible) return null

  const t   = (key: keyof typeof COPY) => COPY[key][selected]
  const dir = selected === 'he' ? 'rtl' : 'ltr'

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        background:     'rgba(28,24,20,0.75)',
        backdropFilter: 'blur(10px)',
        opacity:        leaving ? 0 : 1,
        transition:     'opacity 0.35s ease',
      }}
    >
      <div
        dir={dir}
        className="relative w-full mx-4 rounded-2xl overflow-hidden"
        style={{
          maxWidth:   380,
          background: '#faf9f7',
          boxShadow:  '0 32px 80px rgba(0,0,0,0.30)',
          transform:  leaving ? 'scale(0.96)' : 'scale(1)',
          transition: 'transform 0.35s ease',
        }}
      >
        {/* Gold accent bar */}
        <div style={{ height: 3, background: 'linear-gradient(90deg,#c9a84c,#e8d08a 50%,#c9a84c)' }} />

        <div className="px-8 pt-9 pb-8 text-center flex flex-col items-center gap-0">
          {/* Brand */}
          <p
            className="text-[10px] tracking-[0.3em] uppercase mb-2"
            style={{ color: '#c9a84c' }}
          >
            GrandInvite
          </p>

          {/* Welcome */}
          <h2
            className="text-[28px] font-light mb-1"
            style={{ color: '#1c1814', fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            {t('welcome')}
          </h2>
          <p className="text-[13px] mb-7" style={{ color: '#a8a29e' }}>
            {t('tagline')}
          </p>

          {/* Language options */}
          <div className="flex gap-3 mb-7">
            {LANG_OPTIONS.map(({ locale, label, name }) => {
              const active = selected === locale
              return (
                <button
                  key={locale}
                  onClick={() => setSelected(locale)}
                  aria-pressed={active}
                  className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all duration-200"
                  style={{
                    minWidth:   76,
                    background: active ? '#c9a84c' : '#f0ece6',
                    color:      active ? '#fff'     : '#78716c',
                    transform:  active ? 'scale(1.06)' : 'scale(1)',
                    boxShadow:  active ? '0 6px 20px rgba(201,168,76,0.38)' : 'none',
                  }}
                >
                  <span className="text-sm font-bold tracking-wider">{label}</span>
                  <span className="text-[11px] opacity-90">{name}</span>
                </button>
              )
            })}
          </div>

          {/* Continue */}
          <button
            onClick={handleContinue}
            className="w-full py-3 rounded-xl text-sm font-medium tracking-widest uppercase transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{ background: '#1c1814', color: '#e8d08a', letterSpacing: '0.15em' }}
          >
            {t('continue')}
          </button>

          {/* Cookie notice */}
          <p
            className="mt-5 text-[11px] leading-relaxed"
            style={{ color: '#c0bab4', maxWidth: 280 }}
          >
            {t('cookie')}
          </p>
        </div>
      </div>
    </div>
  )
}
