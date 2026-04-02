import { redirect } from 'next/navigation'
import { createServerSupabaseClient, getGuestsByWeddingId } from '@/lib/supabase'
import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
import type { Guest, Wedding } from '@/types'
import DashboardClient from '@/components/DashboardClient'

export default async function DashboardPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const tr = t(locale)
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)
  const { data: wedding } = await supabase.from('weddings').select('*').eq('user_id', user.id).single() as { data: Wedding | null }
  if (!wedding) redirect(`/${locale}/onboarding`)
  const guests = await getGuestsByWeddingId(wedding.id) as Guest[]
  const confirmed = guests.filter(g => g.rsvp_status === 'confirmed')
  const stats = {
    confirmed, declined: guests.filter(g => g.rsvp_status === 'declined'),
    pending: guests.filter(g => g.rsvp_status === 'pending'),
    totalAdults: confirmed.reduce((s, g) => s + g.adults_count, 0),
    totalChildren: confirmed.reduce((s, g) => s + g.children_count, 0),
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <span className="font-cormorant text-2xl text-stone-800">GrandInvite</span>
            <span className="text-stone-300 mx-3">·</span>
            <span className="text-stone-500 text-sm">{wedding.bride_name} &amp; {wedding.groom_name}</span>
          </div>
          <div className="flex items-center gap-4">
            <a href={`/${locale}/${wedding.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm text-[#c9a84c] hover:underline">View Invitation ↗</a>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="text-sm text-stone-400 hover:text-stone-700">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="section-title">{tr.dashboard.title}</h1>
          <p className="text-stone-400 text-sm mt-2">
            {new Date(wedding.wedding_date).toLocaleDateString(locale === 'he' ? 'he-IL' : locale === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {wedding.venue_city && ` · ${wedding.venue_city}`}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {[{label: tr.dashboard.confirmed, val: stats.confirmed.length, c: 'text-emerald-600', bg: 'bg-emerald-50'},
            {label: tr.dashboard.declined, val: stats.declined.length, c: 'text-red-500', bg: 'bg-red-50'},
            {label: tr.dashboard.pending, val: stats.pending.length, c: 'text-amber-600', bg: 'bg-amber-50'},
            {label: tr.dashboard.adults, val: stats.totalAdults, c: 'text-stone-700', bg: 'bg-stone-100'},
            {label: tr.dashboard.children, val: stats.totalChildren, c: 'text-stone-500', bg: 'bg-stone-50'},
          ].map(s => (
            <div key={s.label} className={`${s.bg} p-5 text-center`}>
              <p className={`font-cormorant text-4xl font-light ${s.c}`}>{s.val}</p>
              <p className="text-xs text-stone-400 tracking-widest uppercase mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        {wedding.plan === 'free' && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 flex items-center justify-between">
            <p className="text-amber-700 text-sm">{stats.confirmed.length} / {wedding.max_guests} {tr.dashboard.totalGuests}</p>
            <div className="flex-1 mx-6 bg-amber-200 rounded-full h-1.5">
              <div className="bg-[#c9a84c] h-1.5 rounded-full" style={{ width: `${Math.min(100,(stats.confirmed.length/wedding.max_guests)*100)}%` }} />
            </div>
          </div>
        )}
        <DashboardClient guests={guests} weddingId={wedding.id} locale={locale} t={tr.dashboard} />
      </div>
    </main>
  )
}
