'use client'
// ============================================================
//  GrandInvite – Language Switcher Component
//  When the user manually picks a language, persists it in a
//  cookie (NEXT_LOCALE) so the middleware honours their choice
//  on all future visits — even from a different device if they
//  clear cookies, the browser/IP detection kicks in as fallback.
//  src/components/LanguageSwitcher.tsx
// ============================================================

import { usePathname, useRouter } from 'next/navigation'
import type { Locale } from '@/lib/i18n'

interface Props {
  currentLocale: Locale
  /** style variant: 'floating' (pill) | 'inline' (buttons) */
  variant?: 'floating' | 'inline'
}

const LANG_LABELS: Record<Locale, string> = {
  fr: 'FR',
  he: 'HE',
  en: 'EN',
}

const LANG_NAMES: Record<Locale, string> = {
  fr: 'Français',
  he: 'עברית',
  en: 'English',
}

/** Persist the user's explicit language choice in a 1-year cookie.
 *  The middleware reads NEXT_LOCALE on every request and skips
 *  auto-detection when this cookie is present. */
function saveLocaleCookie(locale: Locale) {
  const maxAge = 60 * 60 * 24 * 365 // 1 year in seconds
  const secure = location.protocol === 'https:' ? ';Secure' : ''
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=${maxAge};SameSite=Lax${secure}`
}

export default function LanguageSwitcher({ currentLocale, variant = 'inline' }: Props) {
  const pathname = usePathname()
  const router   = useRouter()

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === currentLocale) return

    // 1. Persist explicit user choice so middleware won't override it
    saveLocaleCookie(newLocale)

    // 2. Navigate: replace the locale segment in the current URL
    //    /fr/dashboard/xyz → /he/dashboard/xyz
    const segments = pathname.split('/')
    if (segments[1] && ['fr', 'he', 'en'].includes(segments[1])) {
      segments[1] = newLocale
    } else {
      segments.splice(1, 0, newLocale)
    }
    router.push(segments.join('/') || '/')
  }

  if (variant === 'floating') {
    return (
      <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1.5 shadow-lg border border-stone-100">
        {(['fr', 'he', 'en'] as Locale[]).map(lang => (
          <button
            key={lang}
            onClick={() => switchLocale(lang)}
            title={LANG_NAMES[lang]}
            aria-label={`Switch to ${LANG_NAMES[lang]}`}
            className="w-9 h-9 rounded-full text-xs font-semibold tracking-wide transition-all"
            style={{
              background: currentLocale === lang ? '#c9a84c' : 'transparent',
              color:      currentLocale === lang ? '#fff'     : '#a8a29e',
              transform:  currentLocale === lang ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {LANG_LABELS[lang]}
          </button>
        ))}
      </div>
    )
  }

  // inline variant
  return (
    <div className="flex items-center gap-1">
      {(['fr', 'he', 'en'] as Locale[]).map(lang => (
        <button
          key={lang}
          onClick={() => switchLocale(lang)}
          title={LANG_NAMES[lang]}
          aria-label={`Switch to ${LANG_NAMES[lang]}`}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: currentLocale === lang ? '#c9a84c' : 'transparent',
            color:      currentLocale === lang ? '#fff'     : '#a8a29e',
          }}
        >
          {LANG_LABELS[lang]}
        </button>
      ))}
    </div>
  )
}
