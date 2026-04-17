'use client'
// ============================================================
//  GrandInvite â Admin Guests Page (Redesigned)
//  src/app/admin/guests/page.tsx
// ============================================================

import { useEffect, useState } from 'react'

interface Guest {
  id: string; wedding_id: string; name: string
  adults_count: number; children_count: number
  rsvp_status: string; dietary_notes: string | null; notes: string | null
  created_at: string
  weddings: { bride_name: string; groom_name: string; slug: string } | null
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  declined:  'bg-red-50 text-red-600 border-red-100',
  pending:   'bg-amber-50 text-amber-600 border-amber-100',
}

export default function AdminGuestsPage() {
  const [guests, setGuests]   = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editing, setEditing] = useState<Guest | null>(null)
  const [editForm, setEditForm] = useState<Partial<Guest>>({})
  const [saving, setSaving]   = useState(false)
  const [toast, setToast]     = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const load = () => {
    setLoading(true)
    fetch('/api/admin/guests').then(r => r.json()).then(d => setGuests(d.guests ?? [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openEdit = (g: Guest) => {
    setEditing(g)
    setEditForm({ name: g.name, adults_count: g.adults_count, children_count: g.children_count, rsvp_status: g.rsvp_status, dietary_notes: g.dietary_notes ?? '', notes: g.notes ?? '' })
  }

  const save = async () => {
    if (!editing) return
    setSaving(true)
    const r = await fetch('/api/admin/guests', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestId: editing.id, ...editForm }),
    })
    setSaving(false)
    if (r.ok) { setEditing(null); showToast('Guest updated.'); load() }
    else showToast('Failed to update guest.')
  }

  const filtered = guests.filter(g => {
    const matchStatus = statusFilter === 'all' || g.rsvp_status === statusFilter
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.weddings && `${g.weddings.bride_name} ${g.weddings.groom_name}`.toLowerCase().includes(search.toLowerCase()))
    return matchStatus && matchSearch
  })

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">

      {toast && <div className="fixed top-4 right-4 z-50 bg-stone-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">{toast}</div>}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Guests</h1>
          <p className="text-sm text-stone-400 mt-0.5">{guests.length} guests across all weddings</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Status filter */}
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30">
            <option value="all">All statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="declined">Declined</option>
            <option value="pending">Pending</option>
          </select>
          {/* Export CSV */}
          <a href="/api/admin/guests?export=csv"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export CSV
          </a>
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guest or weddingâ¦"
              className="border border-stone-200 rounded-lg pl-9 pr-4 py-2 text-sm text-stone-800 bg-white w-56 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c]" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                {['Name','Wedding','Adults','Children','Status','Notes','Date',''].map(h => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider ${h === '' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map(g => (
                <tr key={g.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-stone-800">{g.name}</td>
                  <td className="px-4 py-3.5 text-stone-500 text-xs">
                    {g.weddings ? `${g.weddings.bride_name} & ${g.weddings.groom_name}` : 'â'}
                  </td>
                  <td className="px-4 py-3.5 text-stone-600 tabular-nums">{g.adults_count}</td>
                  <td className="px-4 py-3.5 text-stone-600 tabular-nums">{g.children_count}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[g.rsvp_status] ?? 'bg-stone-50 text-stone-500 border-stone-200'}`}>
                      {g.rsvp_status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-stone-400 text-xs max-w-32 truncate">{g.dietary_notes || g.notes || 'â'}</td>
                  <td className="px-4 py-3.5 text-xs text-stone-400">{new Date(g.created_at).toLocaleDateString('en-GB')}</td>
                  <td className="px-4 py-3.5 text-right">
                    <button onClick={() => openEdit(g)} className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-colors">Edit</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-stone-400 text-sm">No guests found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-stone-900 text-lg">Edit Guest</h2>
              <button onClick={() => setEditing(null)} className="text-stone-400 hover:text-stone-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Name</label>
                <input value={editForm.name ?? ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c]" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Adults</label>
                  <input type="number" min="0" value={editForm.adults_count ?? 0} onChange={e => setEditForm(f => ({ ...f, adults_count: Number(e.target.value) }))}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Children</label>
                  <input type="number" min="0" value={editForm.children_count ?? 0} onChange={e => setEditForm(f => ({ ...f, children_count: Number(e.target.value) }))}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Status</label>
                  <select value={editForm.rsvp_status ?? 'pending'} onChange={e => setEditForm(f => ({ ...f, rsvp_status: e.target.value }))}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none">
                    <option value="confirmed">Confirmed</option>
                    <option value="declined">Declined</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Dietary Notes</label>
                <input value={editForm.dietary_notes ?? ''} onChange={e => setEditForm(f => ({ ...f, dietary_notes: e.target.value }))}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Notes</label>
                <textarea rows={2} value={editForm.notes ?? ''} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="flex-1 px-4 py-2 rounded-lg border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition-colors">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 px-4 py-2 rounded-lg bg-[#c9a84c] text-white text-sm font-medium hover:bg-[#b8973a] disabled:opacity-50 transition-colors">{saving ? 'Savingâ¦' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
