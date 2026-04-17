'use client'
// ============================================================
//  GrandInvite — Admin Users Page (Redesigned)
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

function Badge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
      active
        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
        : 'bg-red-50 text-red-600 border-red-100'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-red-500'}`} />
      {active ? 'Active' : 'Banned'}
    </span>
  )
}

const SELF_EMAIL = 'shaimesika10@gmail.com'

export default function AdminUsersPage() {
  const [users, setUsers]     = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [acting, setActing]   = useState<string | null>(null)
  const [toast, setToast]     = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const load = () => {
    setLoading(true)
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => setUsers(d.users ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const doAction = async (userId: string, action: string, reason?: string) => {
    setActing(userId)
    const r = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, reason }),
    })
    setActing(null)
    if (r.ok) {
      showToast(action === 'ban' ? 'User banned.' : action === 'unban' ? 'User unbanned.' : 'Done.')
      load()
    } else {
      showToast('Action failed.')
    }
  }

  const doImpersonate = async (userId: string) => {
    setActing(userId)
    const r = await fetch('/api/admin/impersonate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    setActing(null)
    if (r.ok) {
      const { url } = await r.json()
      if (url) window.open(url, '_blank')
    } else {
      showToast('Impersonation failed.')
    }
  }

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.weddings.some(w => `${w.bride_name} ${w.groom_name}`.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-stone-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Users</h1>
          <p className="text-sm text-stone-400 mt-0.5">{users.length} registered accounts</p>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by email or name…"
            className="border border-stone-200 rounded-lg pl-9 pr-4 py-2 text-sm text-stone-800 bg-white w-72 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Wedding</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Joined</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Last Login</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map(u => {
                const banned = !!u.banned_until && u.banned_until !== '1970-01-01T00:00:00Z'
                const isSelf = u.email === SELF_EMAIL
                const w = u.weddings[0]
                return (
                  <tr key={u.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w7 h-7 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-stone-500">
                            {u.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-stone-800">{u.email}</span>
                        {isSelf && <span className="text-xs bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20 px-1.5 py-0.5 rounded-full">You</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-stone-500">
                      {w ? `${w.bride_name} & ${w.groom_name}` : <span className="text-stone-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-stone-400">
                      {new Date(u.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-stone-400">
                      {u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge active={!banned} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        {/* Impersonate */}
                        <button
                          onClick={() => doImpersonate(u.id)}
                          disabled={acting === u.id || isSelf}
                          title="Login as this user"
                          className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300 disabled:opacity-30 transition-colors"
                        >
                          Login As
                        </button>
                        {/* Ban / Unban */}
                        {banned ? (
                          <button
                            onClick={() => doAction(u.id, 'unban')}
                            disabled={acting === u.id}
                            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const reason = prompt('Reason for ban (optional):') ?? undefined
                              doAction(u.id, 'ban', reason)
                            }}
                            disabled={acting === u.id || isSelf}
                            className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 disabled:opacity-30 transition-colors"
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
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-stone-400 text-sm">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
