'use client'
// ============================================================
//  GrandInvite — Admin Guests Page
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

const STATUS_COLOR: Record<string, string> = {
  confirmed: 'bg-emerald-500/10 text-emerald-400',
  declined:  'bg-red-500/10 text-red-400',
  pending:   'bg-gray-700 text-gray-400',
}

export default function AdminGuestsPage() {
  const [guests, setGuests]   = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editing, setEditing] = useState<Guest | null>(null)
  const [editForm, setEditForm] = useState<Partial<Guest>>({})
  const [saving, setSaving]   = useState(false)

  const load = () => {
    setLoading(true)
    fetch('/api/admin/guests').then(r => r.json()).then(d => setGuests(d.guests ?? [])).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const saveGuest = async () => {
    if (!editing) return
    setSaving(true)
    await fetch('/api/admin/guests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestId: editing.id, updates: editForm }),
    })
    setSaving(false)
    setEditing(null)
    load()
  }

  const filtered = guests
    .filter(g => statusFilter === 'all' || g.rsvp_status === statusFilter)
    .filter(g =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      `${g.weddings?.bride_name} ${g.weddings?.groom_name}`.toLowerCase().includes(search.toLowerCase())
    )

  const confirmed = guests.filter(g => g.rsvp_status === 'confirmed').length
  const declined  = guests.filter(g => g.rsvp_status === 'declined').length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Guests</h1>
          <p className="text-sm text-gray-500">
            {guests.length} total · {confirmed} confirmed · {declined} declined
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/api/admin/guests?export=csv"
            className="text-sm px-4 py-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded-lg border border-amber-500/20 transition-colors"
          >
            ↓ Export CSV
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or couple…"
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white w-72 focus:outline-none focus:border-amber-500"
        />
        {['all', 'confirmed', 'declined', 'pending'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`text-sm px-3 py-1.5 rounded-lg capitalize transition-colors ${
              statusFilter === s ? 'bg-amber-500 text-black font-semibold' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}>
            {s}
          </button>
        ))}
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
                <th className="text-left px-4 py-3">Guest</th>
                <th className="text-left px-4 py-3">Wedding</th>
                <th className="text-left px-4 py-3">Adults</th>
                <th className="text-left px-4 py-3">Children</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Notes</th>
                <th className="text-right px-4 py-3">Edit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(g => (
                <tr key={g.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{g.name}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {g.weddings ? `${g.weddings.bride_name} & ${g.weddings.groom_name}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{g.adults_count}</td>
                  <td className="px-4 py-3 text-gray-400">{g.children_count}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[g.rsvp_status] ?? STATUS_COLOR.pending}`}>
                      {g.rsvp_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                    {[g.dietary_notes, g.notes].filter(Boolean).join(' · ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => { setEditing(g); setEditForm({ name: g.name, adults_count: g.adults_count, children_count: g.children_count, rsvp_status: g.rsvp_status, dietary_notes: g.dietary_notes ?? '', notes: g.notes ?? '' }) }}
                      className="text-xs px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-600">No guests found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Edit Guest: {editing.name}</h2>
            {[
              { key: 'name', label: 'Name', type: 'text' },
              { key: 'adults_count', label: 'Adults', type: 'number' },
              { key: 'children_count', label: 'Children', type: 'number' },
              { key: 'dietary_notes', label: 'Dietary Notes', type: 'text' },
              { key: 'notes', label: 'Additional Notes', type: 'text' },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <input type={type}
                  value={String((editForm as Record<string, unknown>)[key] ?? '')}
                  onChange={e => setEditForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs text-gray-500 mb-1">RSVP Status</label>
              <select
                value={editForm.rsvp_status ?? 'pending'}
                onChange={e => setEditForm(f => ({ ...f, rsvp_status: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="declined">Declined</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={saveGuest} disabled={saving}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold py-2 rounded-lg disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => setEditing(null)}
                className="flex-1 bg-gray-800 text-gray-300 hover:bg-gray-700 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
