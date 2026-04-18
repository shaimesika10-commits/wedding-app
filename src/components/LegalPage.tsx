// ============================================================
//  GrandInvite – Shared Legal Page Layout (Server Component)
//  Used by /terms, /privacy, /refund
//  src/components/LegalPage.tsx
// ============================================================

import Link from 'next/link'
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import type { Locale } from '@/lib/i18n'

type DocType = 'tos' | 'privacy' | 'refund'

interface LegalDoc {
  title: string
  content: string
  version: string
  effective_date: string
  updated_at: string
}

const BACK = {
  fr: '← Retour à l\'accueil',
  he: '→ חזרה לדף הבית',
  en: '← Back to home',
}

const UPDATED = {
  fr: 'Dernière mise à jour',
  he: 'עדכון אחרון',
  en: 'Last updated',
}

const VERSION = {
  fr: 'Version',
  he: 'גרסה',
  en: 'Version',
}

const NOT_FOUND = {
  fr: 'Document non disponible.',
  he: 'המסמך אינו זמין.',
  en: 'Document not available.',
}

async function fetchDoc(type: DocType, locale: Locale): Promise<LegalDoc | null> {
  try {
    const sb = createAdminSupabaseClient()
    const { data } = await sb
      .from('legal_documents')
      .select('title, content, version, effective_date, updated_at')
      .eq('doc_type', type)
      .eq('locale', locale)
      .maybeSingle()
    return data ?? null
  } catch {
    return null
  }
}

function formatDate(dateStr: string, locale: Locale): string {
  try {
    const date = new Date(dateStr)
    const localeCode = locale === 'he' ? 'he-IL' : locale === 'fr' ? 'fr-FR' : 'en-US'
    return date.toLocaleDateString(localeCode, { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export default async function LegalPage({
  type,
  locale,
}: {
  type: DocType
  locale: Locale
}) {
  const doc = await fetchDoc(type, locale)
  const isRTL = locale === 'he'

  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen"
      style={{ background: '#faf8f5' }}
    >
      {/* ── Header bar ─────────────────────────────────────── */}
      <div
        style={{
          background:  '#1c1814',
          borderBottom: '1px solid rgba(201,168,76,0.2)',
        }}
      >
        {/* Gold accent */}
        <div style={{ height: 2, background: 'linear-gradient(90deg,#c9a84c,#e8d08a 50%,#c9a84c)' }} />

        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href={`/${locale}`}
            className="text-[12px] tracking-wide transition-colors duration-150"
            style={{ color: '#78716c' }}
          >
            {BACK[locale]}
          </Link>
          <p
            className="text-[10px] tracking-[0.3em] uppercase font-medium"
            style={{ color: '#c9a84c' }}
          >
            GrandInvite
          </p>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        {doc ? (
          <>
            {/* Meta */}
            <div className="mb-8 flex flex-wrap items-center gap-4 text-[12px]" style={{ color: '#a8a29e' }}>
              <span>
                {UPDATED[locale]}: {formatDate(doc.updated_at || doc.effective_date, locale)}
              </span>
              <span style={{ color: 'rgba(201,168,76,0.6)' }}>•</span>
              <span>{VERSION[locale]} {doc.version}</span>
            </div>

            {/* Legal content — rendered HTML */}
            <div
              className="legal-content"
              style={{
                color: '#292524',
                lineHeight: 1.8,
              }}
              dangerouslySetInnerHTML={{ __html: doc.content }}
            />
          </>
        ) : (
          <p className="text-stone-400 text-sm">{NOT_FOUND[locale]}</p>
        )}
      </div>

      {/* ── Inline styles for legal content typography ─────── */}
      <style>{`
        .legal-content h2 {
          font-size: 1.6rem;
          font-weight: 300;
          color: #1c1814;
          margin-bottom: 0.5rem;
          font-family: 'Cormorant Garamond', Georgia, serif;
          letter-spacing: 0.02em;
        }
        .legal-content h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1c1814;
          margin-top: 2rem;
          margin-bottom: 0.5rem;
          padding-bottom: 0.25rem;
          border-bottom: 1px solid rgba(201,168,76,0.2);
        }
        .legal-content h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #44403c;
          margin-top: 1.25rem;
          margin-bottom: 0.25rem;
        }
        .legal-content p {
          font-size: 0.9rem;
          color: #44403c;
          margin-bottom: 0.75rem;
        }
        .legal-content ul {
          list-style: none;
          padding: 0;
          margin: 0.5rem 0 1rem;
        }
        .legal-content ul li {
          font-size: 0.875rem;
          color: #57534e;
          padding: 0.25rem 0;
          padding-inline-start: 1.25rem;
          position: relative;
        }
        .legal-content ul li::before {
          content: '✦';
          position: absolute;
          inset-inline-start: 0;
          color: #c9a84c;
          font-size: 0.5rem;
          top: 0.45rem;
        }
        .legal-content strong {
          color: #1c1814;
          font-weight: 600;
        }
        .legal-content a {
          color: #c9a84c;
          text-decoration: underline;
        }
      `}</style>
    </main>
  )
}
