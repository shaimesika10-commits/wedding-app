'use client'
// ============================================================
//  GrandInvite — Admin Dashboard (Redesigned)
//  src/app/admin/page.tsx
// ============================================================

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Stats {
  total_weddings:   number
  total_guests:     number
  total_photos:     number
  new_weddings_7d:  number
  confirmed_guests: number
  banned_weddings:  number
  total_users:      number
  total_admins:     number
  recent_actions:   { action: string; created_at: string; admin_email: string; target_table?: string }[]
}

function StatCard({
  label, value, sub, color, href,
}: { label: string; value: number | string; sub?: string; color: string; href?: string }) {
  const colorMap: Record<string, string> = {
    gold:    'text-[#c9a84c] bg-[#c9a84c]/8 border-[#c9a84c]/20',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    blue:    'text-blue-600 bg-blue-50 border-blue-100',
    rose:    'text-rose-600 bg-rose-50 border-rose-100',
    violet:  'text-violet-600 bg-violet-50 border-violet-100',
    stone:   'text-stone-600 bg-stone-100 border-stone-200',
    amber:   'text-amber-600 bg-amber-50 border-amber-100',
    sky:     'text-sky-600 bg-sky-50 border-sky-100',
  }

  const Wrapper = href
    ? ({ children }: { children: React.ReactNode }) => <Link href={href}>{children}</Link>
    : ({ children }: { children: React.ReactNode }) => <div>{children}</div>

  return (
    <Wrapper>
      <div className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-1 transition-shadow hover:shadow-md ${href ? 'cursor-pointer' : ''}`}>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full self-start border ${colorMap[color]}`}>
          {label}
        </span>
        <p className="text-3xl font-bold text-stone-900 mt-2 tabular-nums">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        {sub && <p className="text-xs text-stone-400">{sub}</p>}
      </div>
    </Wrapper>
  )
}

function ActionBadge({ action }: { action: string }) {
  const map: Record<string, string> = {
    BAN_USER:       'bg-red-50 text-red-600 border-red-100',
    UNBAN_USER:     'bg-emerald-50 text-emerald-600 border-emerald-100',
    DELETE_USER:    'bg-red-100 text-red-700 border-red-200',
    EDIT_WEDDING:   'bg-blue-50 text-blue-600 border-blue-100',
    EDIT_GUEST:     'bg-violet-50 text-violet-600 border-violet-100',
    IMPERSONATE_USER: 'bg-amber-50 text-amber-600 border-amber-100',
    ADD_ADMIN:      'bg-[#c9a84c]/10 text-[#c9a84c] border-[#c9a84c]/20',
    REMOVE_ADMIN:   'bg-rose-50 text-rose-600 border-rose-100',
  }
  const cls = map[action] ?? 'bg-stone-50 text-stone-500 border-stone-200'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {action.replace(/_/g, ' ')}
    </span>
  )
}

const QUICK_LINKS = [
  { href: '/admin/users',    label: 'Manage Users',    desc: 'Ban, unban, impersonate' },
  { href: '/admin/weddings', label: 'Manage Weddings', desc: 'Edit, activate, deactivate' },
  { href: '/admin/guests',   label: 'Export Guests',   desc: 'Download full CSV' },
  { href: '/admin/admins',   label: 'Manage Admins',   desc: 'Add or remove admins' },
  { href: '/admin/settings', label: 'Site Settings',   desc: 'Limits, features, flags' },
  { href: '/admin/audit',    label: 'Audit Log',       desc: 'Full action history' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!stats) return (
    <div className="p-8 text-rose-500 text-sm">Failed to load stats.</div>
  )

  const rsvpRate = stats.total_guests > 0
    ? Math.round((stats.confirmed_guests / stats.total_guests) * 100)
    : 0

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Control Center</h1>
        <p className="text-stone-400 text-sm mt-1">Welcome back. Here's everything that's happening on GrandInvite.</p>
      </div>

      {/* Stat Grid — Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatCard label="Total Users"     value={stats.total_users}      color="gold"    href="/admin/users" />
        <StatCard label="Total Weddings"  value={stats.total_weddings}   color="emerald" href="/admin/weddings" sub={`${stats.new_weddings_7d} new this week`} />
        <StatCard label="Total Guests"    value={stats.total_guests}     color="blue"    href="/admin/guests" />
        <StatCard label="RSVP Rate"       value={`${rsvpRate}%`}         color="violet"  sub={`${stats.confirmed_guests} confirmed`} />
      </div>

      {/* Stat Grid — Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Gallery Photos"  value={stats.total_photos}     color="sky"     />
        <StatCard label="Banned Weddings" value={stats.banned_weddings}  color="rose"    href="/admin/weddings" />
        <StatCard label="Active Admins"   value={stats.total_admins}     color="amber"   href="/admin/admins" />
        <StatCard label="New Weddings"    value={stats.new_weddings_7d}  color="stone"   sub="Last 7 days" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="text-sm font-semibold text-stone-700">Quick Actions</h2>
          </div>
          <div className="divide-y divide-stone-50">
            {QUICK_LINKS.map(({ href, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-stone-50 transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-stone-800 group-hover:text-[#c9a84c] transition-colors">{label}</p>
                  <p className="text-xs text-stone-400">{desc}</p>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="w-4 h-4 text-stone-300 group-hover:text-[#c9a84c] transition-colors">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-700">Recent Admin Activity</h2>
            <Link href="/admin/audit" className="text-xs text-[#c9a84c] hover:underline">View all →</Link>
          </div>
          {stats.recent_actions.length === 0 ? (
            <div className="px-6 py-8 text-center text-stone-400 text-sm">No actions logged yet.</div>
          ) : (
            <ul className="divide-y divide-stone-50">
              {stats.recent_actions.map((a, i) => (
                <li key={i} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <ActionBadge action={a.action} />
                    <span className="text-xs text-stone-400 truncate">{a.admin_email.split('@')[0]}</span>
                  </div>
                  <span className="text-xs text-stone-300 flex-shrink-0 ml-2">
                    {new Date(a.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  )
}
