'use client'
// ============================================================
//  GrandInvite — Admin Management Page (NEW)
//  src/app/admin/admins/page.tsx
// ============================================================

import { useEffect, useState } from 'react'

interface AdminUser {
  id: string
  email: string
  is_primary: boolean
  added_by: string
  created_at: string
}

const PRIMARY_EMAIL = 'shaimesika10@gmail.com'

export default function AdminAdminsPage() {
  const [admins, setAdmins]   = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState('')
  const [adding, setAdding]   = useState(false)
  const [addError, setAddError] = useState('')
  const [toast, setToast]     = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500) }

  const load = () => {
    setLoading(true)
    fetch('/api/admin/admins').then(r => r.json()).then(d => setAdmins(d.admins ?? [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const addAdmin = async () => {
    if (!newEmail.trim()) return
    setAdding(true); setAddError('')
    const r = await fetch('/api/admin/admins', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail.trim() }),
    })
    setAdding(false)
    if (r.ok) { setNewEmail(''); showToast(`${newEmail.trim()} added as admin.`); load() }
    else { const d = await r.json(); setAddError(d.error ?? 'Failed to add admin.') }
  }

  const removeAdmin = async (email: string) => {
    if (!confirm(`Remove ${email} as admin?`)) return
    setRemoving(email)
    const r = await fetch(`/api/admin/admins?email=${encodeURIComponent(email)}`, { method: 'DELETE' })
    setRemoving(null)
    if (r.ok) { showToast(`${email} removed.`); load() }
    else showToast('Failed to remove admin.')
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">

      {toast && <div className="fixed top-4 right-4 z-50 bg-stone-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">{toast}</div>}

      <div className="mb-8">
        <h1 className="text-xl font-bold text-stone-900">Admins</h1>
        <p className="text-sm text-stone-400 mt-0.5">Manage who has access to this admin panel.</p>
      </div>

      {/* Add Admin */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 mb-6">
        <h2 className="text-sm font-semibold text-stone-700 mb-4">Add New Admin</h2>
        <div className="flex gap-3">
          <input
            type="email"
            value={newEmail}
            onChange={e => { setNewEmail(e.target.value); setAddError('') }}
            onKeyDown={e => e.key === 'Enter' && addAdmin()}
            placeholder="admin@example.com"
            className="flex-1 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c]"
          />
          <button
            onClick={addAdmin}
            disabled={adding || !newEmail.trim()}
            className="px-5 py-2.5 bg-[#c9a84c] text-white rounded-lg text-sm font-medium hover:bg-[#b8973a] disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {adding ? 'Adding…' : 'Add Admin'}
          </button>
        </div>
        {addError && <p className="text-xs text-red-500 mt-2">{addError}</p>}
        <p className="text-xs text-stone-400 mt-3">
          The user must already have an account on GrandInvite. They will get full admin access immediately.
        </p>
      </div>

      {/* Admins List */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h2 className="text-sm font-semibold text-stone-700">Current Admins ({admins.length})</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ul className="divide-y divide-stone-50">
            {admins.map(a => (
              <li key={a.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#c9a84c] text-sm font-bold">{a.email.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-stone-800 truncate">{a.email}</p>
                      {a.is_primary && (
                        <span className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20 uppercase tracking-wider">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400">
                      Added {new Date(a.created_at).toLocaleDateString('en-GB')}
                      {!a.is_primary && ` · by ${a.added_by.split('@')[0]}`}
                    </p>
                  </div>
                </div>

                {a.email !== PRIMARY_EMAIL && (
                  <button
                    onClick={() => removeAdmin(a.email)}
                    disabled={removing === a.email}
                    className="ml-4 flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 disabled:opacity-40 transition-colors"
                  >
                    {removing === a.email ? 'Removing…' : 'Remove'}
                  </button>
                )}
              </li>
            ))}
            {admins.length === 0 && (
              <li className="px-6 py-8 text-center text-stone-400 text-sm">No admins found.</li>
            )}
          </ul>
        )}
      </div>

      {/* Info box */}
      <div className="mt-5 flex gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p className="text-xs text-amber-700">
          Admins have full access to all features in this panel. The primary admin (<strong>{PRIMARY_EMAIL}</strong>) cannot be removed.
        </p>
      </div>
    </div>
  )
}
