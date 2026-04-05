'use client'
// ============================================================
//  GrandInvite – Language Switcher Component
//  משתמש ב-URL-based routing לשינוי שפה (locale)
//  src/components/LanguageSwitcher.tsx
// ============================================================

import { usePathname, useRouter } from 'next/navigation'
import type { Locale } from '@/lib/i18n'

interface Props {
  currentLocale: Locale
  /** style נוסף לבחירה: 'floating' (עיגול צף) | 'inline' (inline buttons) */
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

export default function LanguageSwitcher({ currentLocale, variant = 'inline' }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === currentLocale) return
    // מחליפים את ה-locale segment ב-URL
    // /fr/dashboard → /he/dashboard
    const segments = pathname.split('/')
    if (segments[1] && ['fr','he','en'].includes(segments[1])) {
      segments[1] = newLocale
    } else {
      segments.splice(1, 0, newLocale)
    }
    router.push(segments.join('/') || '/')
  }

  if (variant === 'floating') {
    return (
      <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1.5 shadow-lg border border-stone-100">
        {(['fr','he','en'] as Locale[]).map(lang => (
          <button
            key={lang}
            onClick={() => switchLocale(lang)}
            title={LANG_NAMES[lang]}
            className="w-9 h-9 rounded-full text-xs font-semibold tracking-wide transition-all"
            style={{
              background: currentLocale === lang ? '#c9a84c' : 'transparent',
              color: currentLocale === lang ? '#fff' : '#a8a29e',
              transform: currentLocale === lang ? 'scale(1.05)' : 'scale(1)',
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
      {(['fr','he','en'] as Locale[]).map(lang => (
        <button
          key={lang}
          onClick={() => switchLocale(lang)}
          title={LANG_NAMES[lang]}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: currentLocale === lang ? '#c9a84c' : 'transparent',
            color: currentLocale === lang ? '#fff' : '#a8a29e',
          }}
        >
          {LANG_LABELS[lang]}
        </button>
      ))}
    </div>
  )
}
