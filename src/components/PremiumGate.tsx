'use client'
// ============================================================
//  GrandInvite – PremiumGate Component
//  Shows a premium-upgrade prompt when a free user tries to
//  access a premium-only feature.
//  src/components/PremiumGate.tsx
// ============================================================

import Link from 'next/link'
import type { Locale } from '@/lib/i18n'

interface Props {
  locale: Locale
  feature: 'image' | 'notifications' | 'unlimited_guests' | 'co_owner'
  /** If true, renders an inline banner instead of an overlay */
  inline?: boolean
}

const COPY = {
  fr: {
    crown: '♛',
    badge: 'PREMIUM',
    title: 'Fonctionnalité Premium',
    features: {
      image:              "Ajoutez une photo de couple à votre invitation.",
      notifications:      "Recevez un e-mail à chaque nouveau RSVP (confirmé ou refusé).",
      unlimited_guests:   "Gérez un nombre illimité d'invités (gratuit : 200 max).",
      co_owner:           "Ajoutez un(e) co-organisateur/trice pour recevoir les mises à jour RSVP.",
    },
    price:   '25 € · 27 $ · ₪99',
    period:  'accès à vie · paiement unique',
    cta:     'Passer à Premium',
    ctaHint: 'Le paiement en ligne n\'est pas encore activé. Pour activer votre compte Premium, contactez-nous directement.',
    contact: 'Contacter pour activer',
    ctaLink: '/fr/dashboard/account-settings',
  },
  he: {
    crown: '♛',
    badge: 'פרמיום',
    title: 'פיצ׳ר פרמיום',
    features: {
      image:              'הוסיפו תמונת זוג להזמנה שלכם.',
      notifications:      'קבלו אימייל על כל אישור הגעה חדש (מאושר / נדחה).',
      unlimited_guests:   'נהלו מוזמנים ללא הגבלה (חינמי: עד 200).',
      co_owner:           'הוסיפו שותף/ה שיקבל/תקבל את עדכוני ה-RSVP.',
    },
    price:   '₪99 · 25 € · 27 $',
    period:  'גישה לצמיתות · תשלום חד פעמי',
    cta:     'שדרג לפרמיום',
    ctaHint: 'תשלום מקוון טרם הופעל. לשדרוג החשבון לפרמיום, פנו אלינו ישירות.',
    contact: 'צרו קשר לשדרוג',
    ctaLink: '/he/dashboard/account-settings',
  },
  en: {
    crown: '♛',
    badge: 'PREMIUM',
    title: 'Premium Feature',
    features: {
      image:              'Add a couple photo to your invitation.',
      notifications:      'Receive an email for every new RSVP (confirmed or declined).',
      unlimited_guests:   'Manage unlimited guests (free plan: 200 max).',
      co_owner:           'Add a co-owner who receives all RSVP update emails.',
    },
    price:   '$27 · 25 € · ₪99',
    period:  'lifetime access · one-time payment',
    cta:     'Upgrade to Premium',
    ctaHint: 'Online payment is not yet active. To upgrade your account, please contact us directly.',
    contact: 'Contact to upgrade',
    ctaLink: '/en/dashboard/account-settings',
  },
}

export default function PremiumGate({ locale, feature, inline = false }: Props) {
  const l = COPY[locale] ?? COPY.en
  const isRTL = locale === 'he'

  const featureText = l.features[feature]

  if (inline) {
    return (
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        className="rounded-2xl border-2 p-5"
        style={{
          borderColor: 'rgba(201,168,76,0.35)',
          background: 'linear-gradient(135deg, #fdfbf4 0%, #faf6e8 100%)',
        }}
      >
        <div className="flex items-start gap-3">
          <span style={{ color: '#c9a84c', fontSize: '1.25rem', lineHeight: 1 }}>{l.crown}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[9px] font-bold tracking-[0.2em] px-2 py-0.5 rounded-full"
                style={{ background: '#c9a84c', color: '#fff' }}
              >
                {l.badge}
              </span>
            </div>
            <p className="text-sm font-medium text-stone-800 mb-0.5">{featureText}</p>
            <p className="text-xs text-stone-500 mb-3">
              <span style={{ color: '#c9a84c' }} className="font-semibold">{l.price}</span>
              {' · '}{l.period}
            </p>
            <p className="text-xs text-stone-400 italic mb-3">{l.ctaHint}</p>
            <a
              href={`mailto:contact@grandinvite.app?subject=Upgrade%20to%20Premium`}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-xl transition-all"
              style={{ background: '#c9a84c', color: '#fff', boxShadow: '0 2px 8px rgba(201,168,76,0.3)' }}
            >
              {l.contact} →
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Overlay variant — wraps the locked content
  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative rounded-2xl overflow-hidden"
      style={{ minHeight: '120px' }}
    >
      {/* Blurred content backdrop */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: 'rgba(250,248,245,0.85)',
          backdropFilter: 'blur(4px)',
          zIndex: 10,
        }}
      />

      {/* Gate card */}
      <div
        className="relative z-20 flex flex-col items-center justify-center p-6 text-center"
        style={{ minHeight: '120px' }}
      >
        <span style={{ color: '#c9a84c', fontSize: '1.75rem', lineHeight: 1, marginBottom: '0.5rem' }}>
          {l.crown}
        </span>
        <span
          className="text-[9px] font-bold tracking-[0.2em] px-2 py-0.5 rounded-full mb-2"
          style={{ background: '#c9a84c', color: '#fff' }}
        >
          {l.badge}
        </span>
        <p className="text-sm font-medium text-stone-700 mb-1 max-w-xs">{featureText}</p>
        <p className="text-xs text-stone-400 mb-3">
          <span style={{ color: '#c9a84c' }} className="font-semibold">{l.price}</span>
          {' · '}{l.period}
        </p>
        <p className="text-xs text-stone-400 italic mb-4 max-w-xs">{l.ctaHint}</p>
        <a
          href={`mailto:contact@grandinvite.app?subject=Upgrade%20to%20Premium`}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-5 py-2.5 rounded-xl transition-all"
          style={{ background: '#c9a84c', color: '#fff', boxShadow: '0 4px 14px rgba(201,168,76,0.35)' }}
        >
          {l.contact} →
        </a>
      </div>
    </div>
  )
}
