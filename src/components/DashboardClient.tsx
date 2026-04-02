'use client'
import { useState, useMemo } from 'react'
import type { Guest } from '@/types'
import type { Locale } from '@/lib/i18n'

interface Props { guests: Guest[]; weddingId: string; locale: Locale; t: Record<string, string> }

export default function DashboardClient({ guests: initialGuests, weddingId, locale, t }: Props) {
  const [guests, setGuests] = useState(initialGuests)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return guests.filter(g => {
      const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.email?.toLowerCase().includes(search.toLowerCase())
      const matchFilter = filter === 'all' || g.rsvp_status === filter
      return matchSearch && matchFilter
    })
  }, [guests, search, filter])

  function exportCSV() {
    const headers = ['Name', 'Status', 'Adults', 'Children', 'Email', 'Phone', 'Dietary', 'Allergies', 'Notes', 'Date']
    const rows = guests.map(g => [
      g.name, g.rsvp_status, g.adults_count, g.children_count,
      g.email ?? '', g.phone ?? '', g.dietary_preferences ?? '', g.allergies ?? '', g.notes ?? '',
      g.rsvp_submitted_at ? new Date(g.rsvp_submitted_at).toLocaleDateString() : ''
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'guests.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const statusBadge = (s: string) => {
    const cls = s === 'confirmed' ? 'badge-confirmed' : s === 'declined' ? 'badge-declined' : 'badge-pending'
    return <span className={cls}>{t[s as keyof typeof t] ?? s}</span>
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t.search} className="flex-1 px-4 py-2 border border-stone-200 bg-white text-sm focus:outline-none focus:border-[#c9a84c]" />
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="px-4 py-2 border border-stone-200 bg-white text-sm focus:outline-none">
          <option value="all">{t.allStatuses}</option>
          <option value="confirmed">{t.confirmed}</option>
          <option value="declined">{t.declined}</option>
          <option value="pending">{t.pending}</option>
        </select>
        <button onClick={exportCSV} className="btn-outline text-sm">{t.exportCSV}</button>
      </div>

      <div className="bg-white border border-stone-100">
        <div className="hidden md:grid grid-cols-5 gap-4 px-6 py-3 border-b border-stone-100 text-xs text-stone-400 tracking-widest uppercase">
          <span>{t.name}</span><span>{t.status}</span><span>{t.guests}</span><span>{t.dietary}</span><span>{t.submittedAt}</span>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-stone-400">
            <p className="font-cormorant text-xl">No guests found</p>
          </div>
        )}

        {filtered.map(guest => (
          <div key={guest.id} className="border-b border-stone-50 last:border-0">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-6 py-4 hover:bg-stone-50 cursor-pointer transition-colors"
              onClick={() => setExpandedId(expandedId === guest.id ? null : guest.id)}>
              <div><p className="font-medium text-stone-800 text-sm">{guest.name}</p></div>
              <div>{statusBadge(guest.rsvp_status)}</div>
              <div className="text-sm text-stone-600">
                {guest.adults_count > 0 && <span>{guest.adults_count} {t.adults}</span>}
                {guest.children_count > 0 && <span className="ml-2">{guest.children_count} {t.children}</span>}
              </div>
              <div className="text-sm text-stone-400 truncate">{guest.dietary_preferences || '—'}</div>
              <div className="text-xs text-stone-400">{guest.rsvp_submitted_at ? new Date(guest.rsvp_submitted_at).toLocaleDateString() : '—'}</div>
            </div>
            {expandedId === guest.id && (
              <div className="px-6 pb-4 bg-stone-50 border-t border-stone-100">
                <div className="grid md:grid-cols-3 gap-4 pt-4 text-sm">
                  {guest.email && <div><span className="text-xs text-stone-400 uppercase tracking-wide">Email</span><p className="text-stone-700 mt-1">{guest.email}</p></div>}
                  {guest.phone && <div><span className="text-xs text-stone-400 uppercase tracking-wide">Phone</span><p className="text-stone-700 mt-1">{guest.phone}</p></div>}
                  {guest.allergies && <div><span className="text-xs text-stone-400 uppercase tracking-wide">{t.dietary}</span><p className="text-stone-700 mt-1">{guest.allergies}</p></div>}
                  {guest.notes && <div className="md:col-span-3"><span className="text-xs text-stone-400 uppercase tracking-wide">{t.notes}</span><p className="text-stone-700 mt-1 whitespace-pre-wrap">{guest.notes}</p></div>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-stone-400 mt-3 text-right">{filtered.length} / {guests.length} guests</p>
    </div>
  )
}
