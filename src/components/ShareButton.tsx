'use client'
// ============================================================
//  GrandInvite â Share Button
//  Allows sharing the invitation URL via WhatsApp or email
//  src/components/ShareButton.tsx
// ============================================================

import { useState, useRef, useEffect } from 'react'
import type { Locale } from '@/lib/i18n'

interface Props {
  url: string
  coupleName: string
  locale: Locale
}

const L = {
  he: {
    share: '×©××ª××£',
    whatsapp: 'WhatsApp',
    email: '××××××',
    copyLink: '××¢×ª×§ ×§××©××¨',
    copied: '×××¢×ª×§!',
    msgText: (couple: string) => `××××× ×ª ×××ª×× ×ª ${couple} ð\n××××©××¨ ×××¢× ××¤×¨×× ××××¨××¢:`,
    emailSubject: (couple: string) => `×××× × ×××ª×× ×ª ${couple}`,
    emailBody: (couple: string, url: string) =>
      `×©×××,\n\n××××× ×ª ×××ª×× ×ª ${couple}.\n\n××××©××¨ ×××¢× ××¤×¨××× × ××¡×¤××:\n${url}`,
  },
  fr: {
    share: 'Partager',
    whatsapp: 'WhatsApp',
    email: 'E-mail',
    copyLink: 'Copier le lien',
    copied: 'CopiÃ© !',
    msgText: (couple: string) => `Vous Ãªtes invitÃ©(e) au mariage de ${couple} ð\nPour confirmer votre prÃ©sence :`,
    emailSubject: (couple: string) => `Invitation â Mariage de ${couple}`,
    emailBody: (couple: string, url: string) =>
      `Bonjour,\n\nVous Ãªtes cordialement invitÃ©(e) au mariage de ${couple}.\n\nPour confirmer votre prÃ©sence et consulter les dÃ©tails :\n${url}`,
  },
  en: {
    share: 'Share',
    whatsapp: 'WhatsApp',
    email: 'Email',
    copyLink: 'Copy link',
    copied: 'Copied!',
    msgText: (couple: string) => `You're invited to ${couple}'s wedding ð\nTo RSVP and view event details:`,
    emailSubject: (couple: string) => `Invitation â ${couple}'s Wedding`,
    emailBody: (couple: string, url: string) =>
      `Hello,\n\nYou are cordially invited to ${couple}'s wedding.\n\nTo RSVP and view details:\n${url}`,
  },
} as const

export default function ShareButton({ url, coupleName, locale }: Props) {
  const l = L[locale] ?? L.fr
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${l.msgText(coupleName)}\n${url}`)}`
  const emailUrl = `mailto:?subject=${encodeURIComponent(l.emailSubject(coupleName))}&body=${encodeURIComponent(l.emailBody(coupleName, url))}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    setOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-stone-100"
        aria-label={l.share}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
        <span className="hidden sm:inline">{l.share}</span>
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 w-44 bg-white rounded-xl shadow-lg border border-stone-100 py-1.5 z-50"
          style={{ direction: locale === 'he' ? 'rtl' : 'ltr' }}>

          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <span className="flex-shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#25D366' }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </span>
            {l.whatsapp}
          </a>

          {/* Email */}
          <a
            href={emailUrl}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <span className="flex-shrink-0">
              <svg className="w-4 h-4 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </span>
            {l.email}
          </a>

          <div className="h-px bg-stone-100 mx-3 my-1" />

          {/* Copy link */}
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors text-left"
          >
            <span className="flex-shrink-0">
              {copied ? (
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              ) : (
                <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
              )}
            </span>
            {copied ? l.copied : l.copyLink}
          </button>
        </div>
      )}
    </div>
  )
}
