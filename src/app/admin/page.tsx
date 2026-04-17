'use client'
// ============================================================
//  GrandInvite — Admin Dashboard (Stats Overview)
//  src/app/admin/page.tsx
// ============================================================

import { useEffect, useState } from 'react'

interface Stats {
  total_weddings:   number
  total_guests:     number
  total_photos:     number
  new_weddings_7d:  number
  confirmed_guests: number
  banned_weddings:  number
  recent_actions:   { action: string; created_at: string; admin_email: string }[]
}

const STATE_CARDS = (s: Stats) => [
  { label: 'Total Weddings',     value: s.total_weddings,   icon: '💍', color: 'amber'  },
  { label: 'New (7 days)',        value: s.new_weddings_7d,  icon: '🆕', color: 'green'  },
  { label: 'Total Guests',       value: s.total_guests,     icon: '🪑', color: 'blue'   },
  { label: 'Confirmed RSVPs',    value: s.confirmed_guests, icon: '✅', color: 'emerald' },
  { label: 'Gallery Photos',     value: s.total_photos,     icon: '🖏️', color: 'purple' },
  { label: 'Banned Weddings',    value: s.banned_weddings,  icon: '🚫', color: 'red'    },
]

const COLOR: Record<string, string> = {
  amber:    'border-amber-500/30 bg-amber-500/5 text-amber-400',
  green:    'border-green-500/30 bg-green-500/5 text-green-400',
  blue:     'border-blue-500/30 bg-blue-500/5 text-blue-400',
  emerald:  'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
  purple:   'border-purple-500/30 bg-purple-500/5 text-purple-400',
  red:      'border-red-500/30 bg-red-500/5 text-red-400',
}

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
      <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!stats) return (
    <div className="p-8 text-red-400">Failed to load stats.</div>
  )

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold text-white mb-1">Control Center</h1>
      <p className="text-sm text-gray-500 mb-8">Welcome back, admin. Here's what's happening.</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {STATE_CARDS(stats).map(({ label, value, icon, color }) => (
          <div key={label} className={`rounded-xl border p-5 ${COLOR[color]}`}>
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-3xl font-bold text-white">{value.toLocaleString()}</div>
            <div className="text-sm mt-0.5 opacity-80">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent Audit Activity */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Recent Admin Activity</h2>
        {stats.recent_actions.length === 0 ? (
          <p className="text-sm text-gray-600">No actions logged yet.</p>
        ) : (
          <ul className="space-y-2">
            {stats.recent_actions.map((a, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-white font-medium">{a.action}</span>
                <span className="text-gray-500 text-xs">
                  {new Date(a.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
