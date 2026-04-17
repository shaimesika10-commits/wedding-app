'use client'
// ============================================================
//  GrandInvite — Admin Management Page
//  src/app/admin/admins/page.tsx
// ============================================================

import { useEffect, useState } from 'react'

interface AdminUser {
  id: string
  email: string
  added_by: string
  is_primary: boolean
  created_at: string
}

const PRIMARY_ADMIN = 'shaimesika10@gmail.com'

export default function AdminAdminsPage() {
  const [admins, setAdmins]     = useState<AdminUser[]>([])
  const [loading, setLoading]   = useState(true)
  const [newEmail, setNewEmail] = useState('')
  const [adding, setAdding]     = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const load = () => {
    setLoading(true)
    fetch('/api/admin/admins').then(r => r.json())
      .then(d => setAdmins(d.admins ?? []))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const addAdmin = async () => {
    if (!newEmail.trim()) return
    setAdding(true)
    const r = await fetch('/api/admin/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail.trim() }),
    })
    const d = await r.json()
    setAdding(false)
    if (r.ok) { setNewEmail(''); showToast('Admin added successfully.', true); load() }
    else showToast(d.error ?? 'Failed to add admin.', false)
  }

  const removeAdmin = async (email: string) => {
    if (!confirm('Remove ' + email + ' as admin?')) return
    setRemoving(email)
    const r = await fetch('/api/admin/admins?email=' + encodeURIComponent(email), { method: 'DELETE' })
    const d = await r.json()
    setRemoving(null)
    if (r.ok) { showToast('Admin removed.', true); load() }
    else showToast(d.error ?? 'Failed to remove.', false)
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      {toast && (
        <div className={'fixed top-5 right-5 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg ' + (toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white')}>
          {toast.msg}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-xl font-bold text-stone-900">Admin Management</h1>
        <p className="text-sm text-stone-400 mt-0.5">Add or remove admins who have access to this panel.</p>
      </div>

      <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p className="text-xs text-amber-700">
          Admins have full access to the super admin panel. The primary admin (<strong>{PRIMARY_ADMIN}</strong>) cannot be removed.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 mb-6">
        <h2 className="text-sm font-semibold text-stone-800 mb-4">Add New Admin</h2>
        <div className="flex gap-3">
          <input
            type="email"
            placeholder="admin@example.com"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addAdmin()}
            className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c]"
          />
          <button
            onClick={addAdmin}
            disabled={adding || !newEmail.trim()}
            className="px-4 py-2 bg-[#c9a84c] text-white text-sm font-medium rounded-lg hover:bg-[#b8973a] disabled:opacity-40 transition-colors"
          >
            {adding ? '…' : 'Add Admin'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h2 className="text-sm font-semibold text-stone-800">Current Admins</h2>
          <p className="text-xs text-stone-400 mt-0.5">{admins.length} admin{admins.length !== 1 ? 's' : ''} total</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : admins.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-stone-400">No admins found.</div>
        ) : (
          <div className="divide-y divide-stone-50">
            {admins.map(a => (
              <div key={a.id} className="px-6 py-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#c9a84c]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#c9a84c] text-xs font-bold uppercase">{a.email[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-stone-800 truncate">{a.email}</p>
                    {a.is_primary && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] tracking-wide uppercase flex-shrink-0">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Added {new Date(a.created_at).toLocaleDateString('en-GB')}
                    {a.added_by && a.added_by !== a.email ? ' · by ' + a.added_by : ''}
                  </p>
                </div>
                <button
                  onClick={() => removeAdmin(a.email)}
                  disabled={a.is_primary || removing === a.email}
                  className="text-xs text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1 flex-shrink-0"
                >
                  {removing === a.email ? '…' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}