// ============================================================
//  GrandInvite – Site Footer (Server Component)
//  Fetches contact/social settings directly from Supabase.
//  Renders legal links, contact info, social icons.
//  src/components/Footer.tsx
// ============================================================

import Link from 'next/link'
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import type { Locale } from '@/lib/i18n'

// ── i18n copy ─────────────────────────────────────────────────
const COPY = {
  legal:   { fr: 'Mentions légales',          he: 'מידע משפטי',          en: 'Legal'         },
  terms:   { fr: "Conditions d'utilisation",  he: 'תנאי שימוש',           en: 'Terms of Use'  },
  privacy: { fr: 'Politique de conf.',        he: 'מדיניות פרטיות',       en: 'Privacy Policy'},
  refund:  { fr: 'Remboursements',            he: 'מדיניות החזרים',       en: 'Refund Policy' },
  contact: { fr: 'Contact',                   he: 'צור קשר',              en: 'Contact'       },
  rights:  { fr: 'Tous droits réservés',      he: 'כל הזכויות שמורות',   en: 'All rights reserved'},
  tagline: {
    fr: 'Invitations de mariage numériques de luxe',
    he: 'הזמנות חתונה דיגיטליות יוקרתיות',
    en: 'Luxury digital wedding invitations',
  },
  contactSoon: {
    fr: 'Coordonnées à venir',
    he: 'פרטי קשר יתווספו בקרוב',
    en: 'Contact details coming soon',
  },
  love: {
    fr: 'Créé avec ♥ pour les couples élégants',
    he: 'נכנה באהבה ♥ עכור זוגות יוקרתיים',
    en: 'Built with ♥ for elegant couples',
  },
}

type Settings = Record<string, string>

async function getFooterSettings(): Promise<Settings> {
  try {
    const sb = createAdminSupabaseClient()
    const keys = [
      'contact_email', 'contact_phone', 'whatsapp_number',
      'instagram_url', 'facebook_url',
      'footer_tagline_he', 'footer_tagline_fr', 'footer_tagline_en',
    ]
    const { data } = await sb
      .from('site_settings')
      .select('key, value')
      .in('key', keys)

    const map: Settings = {}
    data?.forEach((s: { key: string; value: string }) => { map[s.key] = s.value })
    return map
  } catch {
    return {}
  }
}

// ── SVG Icons ──────────────────────────────────────────────────
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
         strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
         strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 flex-shrink-0">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  )
}

// ── Component ──────────────────────────────────────────────────
export default async function Footer({ locale }: { locale: Locale }) {
  const settings = await getFooterSettings()
  const isRTL = locale === 'he'

  const t = (key: keyof typeof COPY) =>
    (COPY[key] as Record<string, string>)[locale] ?? (COPY[key] as Record<string, string>)['en']

  const tagline =
    settings[`footer_tagline_${locale}`] || t('tagline')

  const hasContact = !!(settings.contact_email || settings.whatsapp_number || settings.contact_phone)
  const hasSocial  = !!(settings.instagram_url || settings.facebook_url)

  return (
    <footer
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        background:   '#1c1814',
        color:        '#a8a29e',
        borderTop:    '1px solid rgba(201,168,76,0.15)',
      }}
    >
      {/* Gold accent line at very top */}
      <div style={{ height: 2, background: 'linear-gradient(90deg,#c9a84c,#e8d08a 50%,#c9a84c)' }} />

      <div className="max-w-6xl mx-auto px-6 py-10 md:py-14">

        {/* ── Three columns ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* Brand + tagline + social */}
          <div>
            <p
              className="text-[10px] tracking-[0.35em] uppercase mb-2 font-medium"
              style={{ color: '#c9a84c', fontFamily: "var(--font-montserrat, sans-serif)" }}
            >
              GrandInvite
            </p>
            <p className="text-[13px] leading-relaxed mb-4" style={{ color: '#78716c' }}>
              {tagline}
            </p>

            {hasSocial && (
              <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                {settings.instagram_url && (
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#c9a84c' }}
                  >
                    <InstagramIcon />
                  </a>
                )}
                {settings.facebook_url && (
                  <a
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#c9a84c' }}
                  >
                    <FacebookIcon />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Legal links */}
          <div>
            <p
              className="text-[10px] tracking-[0.25em] uppercase mb-4 font-medium"
              style={{ color: '#c9a84c' }}
            >
              {t('legal')}
            </p>
            <ul className="space-y-2.5">
              {[
                { href: `/${locale}/terms`,   label: t('terms')   },
                { href: `/${locale}/privacy`, label: t('privacy') },
                { href: `/${locale}/refund`,  label: t('refund')  },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[13px] transition-colors duration-150"
                    style={{ color: '#78716c' }}
                    onMouseEnter={undefined}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p
              className="text-[10px] tracking-[0.25em] uppercase mb-4 font-medium"
              style={{ color: '#c9a84c' }}
            >
              {t('contact')}
            </p>

            {hasContact ? (
              <ul className="space-y-3">
                {settings.contact_email && (
                  <li>
                    <a
                      href={`mailto:${settings.contact_email}`}
                      className="text-[13px] flex items-center gap-2 transition-colors duration-150"
                      style={{ color: '#78716c' }}
                    >
                      <EmailIcon />
                      {settings.contact_email}
                    </a>
                  </li>
                )}
                {settings.whatsapp_number && (
                  <li>
                    <a
                      href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] flex items-center gap-2 transition-colors duration-150"
                      style={{ color: '#78716c' }}
                    >
                      <span style={{ color: '#25D366' }}><WhatsAppIcon /></span>
                      {settings.whatsapp_number}
                    </a>
                  </li>
                )}
                {settings.contact_phone && !settings.whatsapp_number && (
                  <li>
                    <a
                      href={`tel:${settings.contact_phone}`}
                      className="text-[13px] transition-colors duration-150"
                      style={{ color: '#78716c' }}
                    >
                      {settings.contact_phone}
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-[13px] italic" style={{ color: '#52504e' }}>
                {t('contactSoon')}
              </p>
            )}
          </div>
        </div>

        {/* ── Divider ───────────────────────────────────────── */}
        <div style={{ height: 1, background: 'rgba(201,168,76,0.1)' }} className="mb-6" />

        {/* ── Bottom row ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]" style={{ color: '#52504e' }}>
          <p>© {new Date().getFullYear()} GrandInvite — {t('rights')}</p>
          <p>{t('love')}</p>
        </div>

      </div>
    </footer>
  )
}
