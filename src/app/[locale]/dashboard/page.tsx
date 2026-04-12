// ============================================================
//  GrandInvite â Dashboard Page (Server Component)
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

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const tr = t(locale)
  const supabase = await createServerSupabaseClient()

  // ââ ××××§×ª ×××ª× ×××§×¦×× ââ
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  // ââ ××¢×× ×ª ××ª×× × ×©× ×××©×ª××© (×××× ××"×) ââ
  const { data: wedding } = await supabase
    .from('weddings')
    .select('*, event_schedule(*)')
    .eq('user_id', user.id)
    .single() as { data: Wedding | null }

  if (!wedding) redirect(`/${locale}/onboarding`)

  // ââ ××¢×× ×ª ×××¨××× ââ
  const guests = await getGuestsByWeddingId(wedding.id) as Guest[]

  // ââ ×××©×× ×¡××××¡×××§××ª ââ
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
      {/* ââ Header ââ */}
      <header className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center min-w-0">
            <span className="font-cormorant text-xl md:text-2xl text-stone-800 flex-shrink-0">
              GrandInvite
            </span>
            <span className="text-stone-300 mx-2 md:mx-3 flex-shrink-0">Â·</span>
            <span className="text-stone-500 text-sm truncate">
              {wedding.bride_name} &amp; {wedding.groom_name}
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
            {/* ××××¨ ×©×¤× */}
            <LanguageSwitcher currentLocale={locale} variant="inline" />

            {/* ××¤×ª××¨ ×©××ª××£ */}
            <ShareButton
              url={`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/${locale}/${wedding.slug}`}
              coupleName={`${wedding.bride_name} & ${wedding.groom_name}`}
              locale={locale}
            />

            {/* ×§××©××¨ ××¢××× ××××× × */}
            <a
              href={`/${locale}/${wedding.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#c9a84c] hover:underline tracking-wide"
            >
              {locale === 'he' ? '×××× × â' : locale === 'fr' ? 'Invitation â' : 'Invitation â'}
            </a>

            {/* ×××××× */}
            <form action={`/api/auth/signout`} method="POST">
              <button
                type="submit"
                className="text-sm text-stone-400 hover:text-stone-700 transition-colors"
              >
                {locale === 'he' ? '××ª× ×ª×§' : locale === 'fr' ? 'DÃ©connexion' : 'Sign out'}
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">

        {/* ââ ×××ª×¨×ª ââ */}
        <div className="mb-6 md:mb-10">
          <h1 className="section-title">{tr.dashboard.title}</h1>
          <p className="text-stone-400 text-sm mt-2">
            {new Date(wedding.wedding_date).toLocaleDateString(
              locale === 'he' ? 'he-IL' : locale === 'fr' ? 'fr-FR' : 'en-GB',
              { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
            )}
            {wedding.venue_city && ` Â· ${wedding.venue_city}`}
          </p>
        </div>

        {/* ââ ××¨×××¡× ×¡××××¡×××§××ª ââ */}
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

        {/* ×××××ª Freemium */}
        {wedding.plan === 'free' && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 flex items-center justify-between flex-wrap gap-3">
            <p className="text-amber-700 text-sm flex-shrink-0">
              {stats.confirmed.length} / {wedding.max_guests}{' '}
              {tr.dashboard.totalGuests}
            </p>
            <div className="flex-1 min-w-[80px] mx-0 md:mx-6 bg-amber-200 rounded-full h-1.5">
              <div
                className="bg-[#c9a84c] h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min(100, (stats.confirmed.length / wedding.max_guests) * 100)}%` }}
              />
            </div>
            {stats.confirmed.length >= wedding.max_guests * 0.9 && (
              <span className="text-xs text-amber-700 font-medium">
                Upgrade to Premium â
              </span>
            )}
          </div>
        )}

        {/* ââ ××××ª ×××¨××× + ×¢×¨××× (Client Component) ââ */}
        <DashboardClient
          guests={guests}
          wedding={wedding}
          locale={locale}
          t={tr.dashboard}
        />
      </div>

      {/* ââ AI Invitation Builder (floating widget) ââ */}
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

// ââ StatCard Component ââ
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
