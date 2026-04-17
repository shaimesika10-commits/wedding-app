'use client'
// ============================================================
//  GrandInvite — Admin Weddings Page (Redesigned)
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
  const [toast, setToast]       = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const load = () => {
    setLoading(true)
    fetch('/api/admin/weddings').then(r => r.json()).then(d => setWeddings(d.weddings ?? [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openEdit = (w: Wedding) => {
    setEditing(w); setSaveError('')
    setForm({
      bride_name: w.bride_name, groom_name: w.groom_name,
      wedding_date: w.wedding_date?.slice(0, 10) ?? '',
      slug: w.slug, venue_name: w.venue_name ?? '', venue_city: w.venue_city ?? '',
      venue_country: w.venue_country ?? 'France', locale: w.locale ?? 'fr',
      plan: w.plan ?? 'free', is_active: w.is_active ?? true,
    })
  }

  const save = async () => {
    if (!editing || !form) return
    setSaving(true); setSaveError('')
    const r = await fetch('/api/admin/weddings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weddingId: editing.id, ...form }),
    })
    setSaving(false)
    if (r.ok) { setEditing(null); showToast('Wedding updated.'); load() }
    else { const d = await r.json(); setSaveError(d.error ?? 'Failed.') }
  }

  const filtered = weddings.filter(w =>
    `${w.bride_name} ${w.groom_name} ${w.slug}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">

      {toast && <div className="fixed top-4 right-4 z-50 bg-stone-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">{toast}</div>}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Weddings</h1>
          <p className="text-sm text-stone-400 mt-0.5">{weddings.length} weddings total</p>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or slug…"
            className="border border-stone-200 rounded-lg pl-9 pr-4 py-2 text-sm text-stone-800 bg-white w-72 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c]" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                {['Couple', 'Slug', 'Date', 'Guests', 'Plan', 'Status', ''].map(h => (
                  <th key={h} className={`px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider ${h === '' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map(w => {
                const banned = !!w.banned_at
                const guestCount = w.guests?.[0]?.count ?? 0
                return (
                  <tr key={w.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-stone-800">{w.bride_name} &amp; {w.groom_name}</td>
                    <td className="px-5 py-3.5">
                      <a href={`/fr/${w.slug}`} target="_blank" rel="noopener noreferrer" className="text-[#c9a84c] hover:underline font-mono text-xs">{w.slug} ↗</a>
                    </td>
                    <td className="px-5 py-3.5 text-stone-500 text-xs">{w.wedding_date ? new Date(w.wedding_date).toLocaleDateString('fr-FR') : '—'}</td>
                    <td className="px-5 py-3.5 text-stone-600 tabular-nums">{guestCount}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${w.plan === 'pro' ? 'bg-[#c9a84c]/10 text-[#c9a84c] border-[#c9a84c]/20' : 'bg-stone-50 text-stone-500 border-stone-200'}`}>{w.plan ?? 'free'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {banned ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100"><span className="w-1.5 h-1.5 rounded-full bg-red-500"/>Banned</span>
                      ) : w.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>Active</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-500 border border-stone-200"><span className="w-1.5 h-1.5 rounded-full bg-stone-400"/>Inactive</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => openEdit(w)} className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-colors">Edit</button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-stone-400 text-sm">No weddings found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editing && form && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-stone-900 text-lg">Edit Wedding</h2>
              <button onClick={() => setEditing(null)} className="text-stone-400 hover:text-stone-600 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {([['Bride Name','bride_name'],['Groom Name','groom_name'],['Wedding Date','wedding_date','date'],['Slug','slug'],['Venue Name','venue_name'],['City','venue_city']] as [string,string,string?][]).map(([label,key,type]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-stone-500 mb-1">{label}</label>
                  <input type={type ?? 'text'} value={(form as Record<string,string>)[key] ?? ''}
                    onChange={e => setForm(f => f ? { ...f, [key]: e.target.value } : f)}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c]" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {[['Locale','locale',[['fr','Français'],['he','עברית'],['en','English']]],['Plan','plan',[['free','Free'],['pro','Pro']]]] as [string,string,[string,string][]][]).map(([label,key,opts]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-stone-500 mb-1">{label}</label>
                    <select value={(form as Record<string,string>)[key]} onChange={e => setForm(f => f ? { ...f, [key]: e.target.value } : f)}
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none">
                      {opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => f ? { ...f, is_active: e.target.checked } : f)} className="w-4 h-4 accent-[#c9a84c]" />
                <span className="text-sm text-stone-700">Active (visible to guests)</span>
              </label>
            </div>
            {saveError && <p className="text-xs text-red-500 mt-3">{saveError}</p>}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="flex-1 px-4 py-2 rounded-lg border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition-colors">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 px-4 py-2 rounded-lg bg-[#c9a84c] text-white text-sm font-medium hover:bg-[#b8973a] disabled:opacity-50 transition-colors">{saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
