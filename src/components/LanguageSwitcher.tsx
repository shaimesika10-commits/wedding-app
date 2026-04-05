'use client'
import { useRouter, usePathname } from 'next/navigation'
import type { Locale } from '@/lib/i18n'

interface Props {
  currentLocale: Locale
  variant?: 'inline' | 'dropdown'
}

const LABELS: Record<Locale, string> = { fr: 'FR', he: 'HE', en: 'EN' }

export default function LanguageSwitcher({ currentLocale, variant = 'inline' }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: Locale) => {
    const segments = pathname.split('/')
    // segments: ['', locale, ...rest]
    if (segments.length > 1) segments[1] = newLocale
    router.push(segments.join('/') || '/')
  }

  const locales: Locale[] = ['fr', 'he', 'en']

  if (variant === 'dropdown') {
    return (
      <select
        value={currentLocale}
        onChange={e => switchLocale(e.target.value as Locale)}
        className="text-xs text-stone-500 bg-transparent border border-stone-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-yellow-400/30 cursor-pointer"
      >
        {locales.map(loc => (
          <option key={loc} value={loc}>{LABELS[loc]}</option>
        ))}
      </select>
    )
  }

  return (
    <div className="flex gap-1 items-center">
      {locales.map((loc, i) => (
        <span key={loc} className="flex items-center gap-1">
          <button
            onClick={() => switchLocale(loc)}
            className="text-xs font-medium transition-colors px-1"
            style={{
              color: currentLocale === loc ? '#c9a84c' : '#a8a29e',
              borderBottom: currentLocale === loc ? '1px solid #c9a84c' : '1px solid transparent',
              paddingBottom: '1px',
            }}
          >
            {LABELS[loc]}
          </button>
          {i < locales.length - 1 && (
            <span className="text-stone-200 text-xs">|</span>
          )}
        </span>
      ))}
    </div>
  )
}
