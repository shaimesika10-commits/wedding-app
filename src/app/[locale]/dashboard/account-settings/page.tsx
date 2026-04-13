// ============================================================
//  GrandInvite – Account Settings Page (Server Component)
//  src/app/[locale]/dashboard/account-settings/page.tsx
// ============================================================

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Locale } from '@/lib/i18n'
import AccountSettingsClient from '@/components/AccountSettingsClient'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import Link from 'next/link'

export default async function AccountSettingsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const supabase = await createServerSupabaseClient()

  // ── Auth check ──
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  // ── Get wedding data ──
  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, bride_name, groom_name, co_owner_email')
    .eq('user_id', user.id)
    .single()

  if (!wedding) redirect(`/${locale}/onboarding`)

  const title = locale === 'he' ? 'ניהול חשבון' : locale === 'fr' ? 'Gestion du compte' : 'Account Settings'
  const backLabel = locale === 'he' ? '← לוח הבקרה' : locale === 'fr' ? '← Tableau de bord' : '← Dashboard'

  return (
    <main className="min-h-screen bg-stone-50">
      {/* ── Header ── */}
      <header className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center min-w-0 gap-3">
            <span className="font-cormorant text-xl md:text-2xl text-stone-800 flex-shrink-0">
              GrandInvite
            </span>
            <span className="text-stone-300 flex-shrink-0">·</span>
            <span className="text-stone-500 text-sm truncate">
              {wedding.bride_name} &amp; {wedding.groom_name}
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
            <LanguageSwitcher currentLocale={locale} variant="inline" />

            {/* Back to dashboard */}
            <Link
              href={`/${locale}/dashboard`}
              className="text-sm text-stone-400 hover:text-stone-700 transition-colors"
            >
              {backLabel}
            </Link>

            {/* Sign out */}
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
        {/* Page title */}
        <div className="mb-8">
          <h1 className="section-title">{title}</h1>
        </div>

        {/* Account settings form */}
        <AccountSettingsClient
          locale={locale}
          userEmail={user.email ?? ''}
          initialCoOwnerEmail={(wedding as { co_owner_email?: string | null }).co_owner_email ?? null}
          weddingId={wedding.id}
        />
      </div>
    </main>
  )
}
