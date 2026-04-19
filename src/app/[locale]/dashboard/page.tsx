// ============================================================
//  GrandInvite – Dashboard Page (Server Component)
//  src/app/[locale]/dashboard/page.tsx
// ============================================================

import { redirect } from 'next/navigation'
import { createServerSupabaseClient, getGuestsByWeddingId } from '@/lib/supabase-server'
import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
import type { Guest, Wedding } from '@/types'
import DashboardClient from '@/components/DashboardClient'
import AIInvitationChat from '@/components/AIInvitationChat'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import ShareButton from '@/components/ShareButton'
import { isAdminDB } from '@/lib/admin'
import Link from 'next/link'

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const tr = t(locale)
  const supabase = await createServerSupabaseClient()

  // ── בדיקת אותנטיקציה ──
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  // ── טעינת חתונה של המשתמש (כולל לו"ז) ──
  const { data: wedding } = await supabase
    .from('weddings')
    .select('*, event_schedule(*)')
    .eq('user_id', user.id)
    .single() as { data: Wedding | null }

  if (!wedding) redirect(`/${locale}/onboarding`)

  // ── טעינת אורחים ──
  const guests = await getGuestsByWeddingId(wedding.id) as Guest[]

  // ── Admin check ──
  const isAdmin = await isAdminDB(user.email)

  // ── חישוב סטטיסטיקות ──
  const stats = {
    confirmed:  guests.filter(g => g.rsvp_status === 'confirmed'),
    declined:   guests.filter(g => g.rsvp_status === 'declined'),
    pending:    guests.filter(g => g.rsvp_status === 'pending'),
    totalAdults:   guests.filter(g => g.rsvp_status === 'confirmed')
                        .reduce((sum, g) => sum + g.adults_count, 0),
    totalChildren: guests.filter(g => g.rsvp_status === 'confirmed')
                        .reduce((sum, g) => sum + g.children_count, 0),
  }

  return (
    <main className="min-h-screen bg-stone-50">
      {/* ── Header ── */}
      <header className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center min-w-0">
            <span className="font-cormorant text-xl md:text-2xl text-stone-800 flex-shrink-0">
              GrandInvite
            </span>
            <span className="text-stone-300 mx-2 md:mx-3 flex-shrink-0">·</span>
            <span className="text-stone-500 text-sm truncate">
              {wedding.bride_name} &amp; {wedding.groom_name}
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
            {/* בוחר שפה */}
            <LanguageSwitcher currentLocale={locale} variant="inline" />

            {/* כפתור שיתוף */}
            <ShareButton
              url={`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/${locale}/${wedding.slug}`}
              coupleName={`${wedding.bride_name} & ${wedding.groom_name}`}
              locale={locale}
            />

            {/* קישור לעמוד ההזמנה */}
            <a
              href={`/${locale}/${wedding.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#c9a84c] hover:underline tracking-wide"
            >
              {locale === 'he' ? 'הזמנה ↗' : locale === 'fr' ? 'Invitation ↗' : 'Invitation ↗'}
            </a>

            {/* Admin Panel link — only for admins */}
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm font-medium text-[#c9a84c] border border-[#c9a84c]/30 px-3 py-1 rounded-lg hover:bg-[#c9a84c]/5 transition-colors tracking-wide"
              >
                ⚙ Admin
              </Link>
            )}

            {/* לוגאוט */}
            <form action={`/api/auth/signout`} method="POST">
              <button
                type="submit"
                className="text-sm text-stone-400 hover:text-stone-700 transition-colors"
              >
                {locale === 'he' ? 'התנתק' : locale === 'fr' ? 'Déconnexion' : 'Sign out'}
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">

        {/* ── כותרת ── */}
        <div className="mb-6 md:mb-10">
          <h1 className="section-title">{tr.dashboard.title}</h1>
          <p className="text-stone-400 text-sm mt-2">
            {new Date(wedding.wedding_date).toLocaleDateString(
              locale === 'he' ? 'he-IL' : locale === 'fr' ? 'fr-FR' : 'en-GB',
              { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
            )}
            {wedding.venue_city && ` · ${wedding.venue_city}`}
          </p>
        </div>

        {/* ── כרטיסי סטטיסטיקות ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-10">
          <StatCard
            label={tr.dashboard.confirmed}
            value={stats.confirmed.length}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            label={tr.dashboard.declined}
            value={stats.declined.length}
            color="text-red-500"
            bg="bg-red-50"
          />
          <StatCard
            label={tr.dashboard.pending}
            value={stats.pending.length}
            color="text-amber-600"
            bg="bg-amber-50"
          />
          <StatCard
            label={tr.dashboard.adults}
            value={stats.totalAdults}
            color="text-stone-700"
            bg="bg-stone-100"
          />
          <StatCard
            label={tr.dashboard.children}
            value={stats.totalChildren}
            color="text-stone-500"
            bg="bg-stone-50"
          />
        </div>

        {/* מגבלת Freemium + Upgrade banner */}
        {wedding.plan === 'free' && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            {/* Guest limit bar */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
              <p className="text-amber-700 text-sm flex-shrink-0">
                {locale === 'he'
                  ? `${stats.confirmed.length} / ${wedding.max_guests} מוזמנים מאושרים`
                  : locale === 'fr'
                  ? `${stats.confirmed.length} / ${wedding.max_guests} invités confirmés`
                  : `${stats.confirmed.length} / ${wedding.max_guests} confirmed guests`}
              </p>
              <div className="flex-1 min-w-[80px] mx-0 md:mx-6 bg-amber-200 rounded-full h-1.5">
                <div
                  className="bg-[#c9a84c] h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (stats.confirmed.length / wedding.max_guests) * 100)}%` }}
                />
              </div>
            </div>
            {/* Premium feature teaser */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-xs text-amber-700">
                {locale === 'he'
                  ? '🔒 תמונת זוג · התראות RSVP · מוזמנים ללא הגבלה · שותף/ה נוסף/ת — בפרמיום בלבד'
                  : locale === 'fr'
                  ? '🔒 Photo de couple · Notifications RSVP · Invités illimités · Co-organisateur · Premium uniquement'
                  : '🔒 Couple photo · RSVP notifications · Unlimited guests · Co-owner · Premium only'}
              </p>
              <a
                href={`mailto:contact@grandinvite.app?subject=${encodeURIComponent('Upgrade to Premium')}`}
                className="text-xs font-medium px-4 py-1.5 rounded-xl flex-shrink-0 transition-all"
                style={{ background: '#c9a84c', color: '#fff', boxShadow: '0 2px 8px rgba(201,168,76,0.3)' }}
              >
                {locale === 'he' ? 'שדרג לפרמיום ♛' : locale === 'fr' ? 'Passer Premium ♛' : 'Upgrade to Premium ♛'}
              </a>
            </div>
          </div>
        )}

        {/* ── טבלת אורחים + עריכה (Client Component) ── */}
        <DashboardClient
          guests={guests}
          wedding={wedding}
          locale={locale}
          t={tr.dashboard}
          userEmail={user.email ?? ''}
          coOwnerEmail={(wedding as { co_owner_email?: string | null }).co_owner_email ?? null}
        />
      </div>

      {/* ── AI Invitation Builder (floating widget) ── */}
      <AIInvitationChat
        locale={locale}
        weddingContext={{
          bride_name: wedding.bride_name,
          groom_name: wedding.groom_name,
          wedding_date: wedding.wedding_date,
          venue_name: wedding.venue_name ?? '',
          venue_city: wedding.venue_city ?? '',
        }}
      />
    </main>
  )
}

// ── StatCard Component ──
function StatCard({
  label,
  value,
  color,
  bg,
}: {
  label: string
  value: number
  color: string
  bg: string
}) {
  return (
    <div className={`${bg} p-5 text-center`}>
      <p className={`font-cormorant text-4xl font-light ${color}`}>{value}</p>
      <p className="text-xs text-stone-400 tracking-widest uppercase mt-1">{label}</p>
    </div>
  )
}
