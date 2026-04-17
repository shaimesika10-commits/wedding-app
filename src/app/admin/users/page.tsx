'use client'
// ============================================================
//  GrandInvite — Admin Users Page
//  src/app/admin/users/page.tsx
// ============================================================

import { useEffect, useState } from 'react'

interface Wedding { id: string; slug: string; bride_name: string; groom_name: string; banned_at: string | null }
interface User {
  id: string
  email: string
  created_at: string
  last_sign_in: string | null
  banned_until: string | null
  weddings: Wedding[]
}

export default function AdminUsersPage() {
  const [users, setUsers]     = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [acting, setActing]   = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users ?? [])).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const doAction = async (userId: string, action: string, reason?: string) => {
    setActing(userId)
    await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, reason }),
    })
    setActing(null)
    load()
  }

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.weddings.some(w => `${w.bride_name} ${w.groom_name}`.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-sm text-gray-500">{users.length} registered users</p>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by email or name…"
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white w-72 focus:outline-none focus:border-amber-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800 text-gray-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Wedding</th>
                <th className="text-left px-4 py-3">Joined</th>
                <th className="text-left px-4 py-3">Last Login</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const banned = !!u.banned_until && u.banned_until !== '1970-01-01T00:00:00Z'
                const w = u.weddings[0]
                return (
                  <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{u.email}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {w ? (
                        <a href={`/admin/weddings`} className="hover:text-amber-400 transition-colors">
                          {w.bride_name} &amp; {w.groom_name}
                        </a>
                      ) : <span className="text-gray-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(u.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        banned ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {banned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {banned ? (
                          <button
                            onClick={() => doAction(u.id, 'unban')}
                            disabled={acting === u.id}
                            className="text-xs px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const reason = prompt('Reason for ban (optional):') ?? undefined
                              doAction(u.id, 'ban', reason)
                            }}
                            disabled={acting === u.id || u.email === 'shaimesika10@gmail.com'}
                            className="text-xs px-3 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-30"
                          >
                            Ban
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-600">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
