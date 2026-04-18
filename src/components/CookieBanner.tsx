'use client'
// ============================================================
//  GrandInvite – Cookie Consent Banner
//  Shown as a subtle bottom strip for users who already have
//  a language set (e.g. returning visitors pre-modal) but
//  haven't explicitly accepted cookies yet.
//  Checks the gi_cookie cookie; hides once user dismisses.
//  src/components/CookieBanner.tsx
// ============================================================

import { useState, useEffect } from 'react'
import type { Locale } from '@/lib/i18n'

const COOKIE_OK = 'gi_cookie'
const LP_COOKIE = 'gi_lp'

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

// ── Copy ─────────────────────────────────────────────────────
const TEXT: Record<Locale, { msg: string; btn: string; link: string }> = {
  fr: {
    msg:  'Nous utilisons des cookies fonctionnels pour mémoriser votre langue et améliorer votre expérience.',
    btn:  'Compris',
    link: 'En savoir plus',
  },
  he: {
    msg:  'אנו משתמשים בעוגיות פונקציונליות לזכירת שפתכם ושיפור חוויית השימוש באתר.',
    btn:  'הבנתי',
    link: 'מידע נוסף',
  },
  en: {
    msg:  'We use functional cookies to remember your language preference and improve your experience.',
    btn:  'Got it',
    link: 'Learn more',
  },
}

// ── Component ─────────────────────────────────────────────────
export default function CookieBanner({ locale }: { locale: Locale }) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const t = TEXT[locale]
  const isRtl = locale === 'he'

  useEffect(() => {
    // Show only if:
    //  • cookie consent not yet given (gi_cookie missing)
    //  • AND the language picker modal already ran (gi_lp set)
    //    → avoids showing both at the same time on first visit
    if (!getCookie(COOKIE_OK) && getCookie(LP_COOKIE)) {
      const timer = setTimeout(() => setVisible(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const dismiss = () => {
    setCookie(COOKIE_OK, '1')
    setLeaving(true)
    setTimeout(() => setVisible(false), 400)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9998] px-4 pb-4"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        opacity:    leaving ? 0 : 1,
        transform:  leaving ? 'translateY(16px)' : 'translateY(0)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
    >
      <div
        className="max-w-2xl mx-auto rounded-xl px-5 py-4 flex items-center gap-4"
        style={{
          background: '#1c1814',
          boxShadow:  '0 -2px 40px rgba(0,0,0,0.18), 0 4px 20px rgba(0,0,0,0.20)',
        }}
      >
        {/* Icon */}
        <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}></span>

        {/* Message */}
        <p
          className="flex-1 text-[12px] leading-relaxed"
          style={{ color: '#a8a29e' }}
        >
          {t.msg}
        </p>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="flex-shrink-0 px-4 py-2 rounded-lg text-[12px] font-semibold tracking-wide transition-all hover:opacity-90 active:scale-95"
          style={{ background: '#c9a84c', color: '#1c1814' }}
        >
          {t.btn}
        </button>
      </div>
    </div>
  )
}
