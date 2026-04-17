'use client'
// ============================================================
//  GrandInvite — Admin Weddings Page
//  src/app/admin/weddings/page.tsx
// ============================================================

import { useEffect, useState } from 'react'

interface Wedding {
  id: string; user_id: string; slug: string; bride_name: string; groom_name: string
  wedding_date: string; venue_name: string | null; venue_city: string | null
  venue_country: string; locale: string; plan: string; is_active: boolean
  banned_at: string | null; banned_reason: string | null; created_at: string
  guests: { count: number }[]
}

interface EditForm {
  bride_name: string; groom_name: string; wedding_date: string
  slug: string; venue_name: string; venue_city: string; venue_country: string
  locale: string; plan: string; is_active: boolean
}

export default function AdminWeddingsPage() {
  const [weddings, setWeddings] = useState<Wedding[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [editing, setEditing]   = useState<Wedding | null>(null)
  const [form, setForm]         = useState<EditForm | null>(null)
  const [saving, setSaving]     = useState(false)
  const [saveError, setSaveError] = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/admin/weddings').then(r => r.json()).then(d => setWeddings(d.weddings ?? [])).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openEdit = (w: Wedding) => {
    setEditing(w)
    setForm({
      bride_name: w.bride_name, groom_name: w.groom_name,
      wedding_date: w.wedding_date, slug: w.slug,
      venue_name: w.venue_name ?? '', venue_city: w.venue_city ?? '',
      venue_country: w.venue_country, locale: w.locale,
      plan: w.plan, is_active: w.is_active,
    })
    setSaveError('')
  }

  const saveEdit = async () => {
    if (!editing || !form) return
    setSaving(true); setSaveError('')
    const res = await fetch('/api/admin/weddings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editing.id, updates: form }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setSaveError(data.error ?? 'Save failed'); return }
    setEditing(null); setForm(null); load()
  }

  const filtered = weddings.filter(w =>
    `${w.bride_name} ${w.groom_name} ${w.slug} ${w.venue_city}`
      .toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Weddings</h1>
          <p className="text-sm text-gray-500">{weddings.length} total</p>
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search…"
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
                <th className="text-left px-4 py-3">Couple</th>
                <th className="text-left px-4 py-3">Slug</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Guests</th>
                <th className="text-left px-4 py-3">Plan</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(w => {
                const guestCount = w.guests?.[0]?.count ?? 0
                const banned = !!w.banned_at
                return (
                  <tr key={w.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">
                      {w.bride_name} &amp; {w.groom_name}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/fr/${w.slug}`}
                        target="_blank"
                        className="text-amber-400 hover:underline font-mono text-xs"
                      >
                        {w.slug}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(w.wedding_date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{guestCount}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        w.plan === 'premium' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-700 text-gray-400'
                      }`}>
                        {w.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        banned ? 'bg-red-500/10 text-red-400' :
                        w.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700 text-gray-400'
                      }`}>
                        {banned ? 'Banned' : w.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(w)}
                        className="text-xs px-3 py-1 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-600">No weddings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editing && form && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">
              Edit: {editing.bride_name} &amp; {editing.groom_name}
            </h2>

            {[
              { key: 'bride_name',    label: 'Bride Name' },
              { key: 'groom_name',    label: 'Groom Name' },
              { key: 'wedding_date',  label: 'Wedding Date', type: 'date' },
              { key: 'slug',          label: 'URL Slug' },
              { key: 'venue_name',    label: 'Venue Name' },
              { key: 'venue_city',    label: 'City' },
              { key: 'venue_country', label: 'Country' },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <input
                  type={type ?? 'text'}
                  value={(form as Record<string, string>)[key] ?? ''}
                  onChange={e => setForm(f => f ? { ...f, [key]: e.target.value } : f)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            ))}

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setForm(f => f ? { ...f, is_active: e.target.checked } : f)}
                  className="accent-amber-500"
                />
                Active (visible to guests)
              </label>
            </div>

            {saveError && <p className="text-sm text-red-400">{saveError}</p>}

            <div className="flex gap-3 pt-2">
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold py-2 rounded-lg disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                onClick={() => { setEditing(null); setForm(null) }}
                className="flex-1 bg-gray-800 text-gray-300 hover:bg-gray-700 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
