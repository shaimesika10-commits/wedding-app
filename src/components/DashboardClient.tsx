'use client'

import { useState, useEffect } from 'react'
import type { Locale } from '@/lib/i18n'

interface Guest {
  id: string
  name: string
  email: string | null
  phone: string | null
  adults_count: number
  children_count: number
  dietary_preferences: string | null
  allergies: string | null
  notes: string | null
  rsvp_status: 'confirmed' | 'declined' | 'pending'
  brunch_attending: boolean | null
  rsvp_submitted_at: string | null
}

interface Props {
  weddingId: string
  locale: Locale
  maxGuests: number
  hasBrunch?: boolean
}

const labels = {
  fr: {
    search: 'Rechercher un invité...', name: 'Nom', status: 'Statut', guests: 'Invités', diet: 'Régime',
    notes: 'Notes', brunch: 'Brunch', export: 'Exporter CSV',
    confirmed: 'Confirmé', declined: 'Décliné', pending: 'En attente',
    yes: 'Oui', no: 'Non', total: 'Invités totaux', adults: 'adultes', children: 'enfants',
    filter: 'Filtrer', all: 'Tous', loading: 'Chargement...',
  },
  he: {
    search: 'חפש אורח...', name: 'שם', status: 'סטטוס', guests: 'אורחים', diet: 'תזונה',
    notes: 'הערות', brunch: 'בראנץ׳', export: 'ייצוא CSV',
    confirmed: 'מאושר', declined: 'לא מגיע', pending: 'ממתין',
    yes: 'כן', no: 'לא', total: 'סה״כ אורחים', adults: 'מבוגרים', children: 'ילדים',
    filter: 'סנן', all: 'הכל', loading: 'טוען...',
  },
  en: {
    search: 'Search guest...', name: 'Name', status: 'Status', guests: 'Guests', diet: 'Diet',
    notes: 'Notes', brunch: 'Brunch', export: 'Export CSV',
    confirmed: 'Confirmed', declined: 'Declined', pending: 'Pending',
    yes: 'Yes', no: 'No', total: 'Total guests', adults: 'adults', children: 'children',
    filter: 'Filter', all: 'All', loading: 'Loading...',
  },
}

const statusColors = {
  confirmed: 'bg-green-50 text-green-700 border-green-200',
  declined: 'bg-red-50 text-red-600 border-red-200',
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
}

export default function DashboardClient({ weddingId, locale, maxGuests, hasBrunch }: Props) {
  const l = labels[locale] || labels.fr
  const isRtl = locale === 'he'
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'declined' | 'pending'>('all')

  useEffect(() => {
    fetch(`/api/guests?wedding_id=${weddingId}`)
      .then(r => r.json())
      .then(data => { setGuests(data.guests || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [weddingId])

  const filtered = guests.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.email || '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || g.rsvp_status === filter
    return matchSearch && matchFilter
  })

  const confirmed = guests.filter(g => g.rsvp_status === 'confirmed')
  const totalAdults = confirmed.reduce((s, g) => s + (g.adults_count || 0), 0)
  const totalChildren = confirmed.reduce((s, g) => s + (g.children_count || 0), 0)
  const totalGuests = totalAdults + totalChildren
  const brunchCount = hasBrunch ? confirmed.filter(g => g.brunch_attending).length : 0

  const exportCSV = () => {
    const headers = [l.name, 'Email', l.guests, l.diet, 'Allergies', l.notes, l.status, ...(hasBrunch ? [l.brunch] : [])]
    const rows = filtered.map(g => [
      g.name, g.email || '', `${g.adults_count}+${g.children_count}`,
      g.dietary_preferences || '', g.allergies || '', (g.notes || '').replace(/\n/g, ' '),
      g.rsvp_status,
      ...(hasBrunch ? [g.brunch_attending === true ? l.yes : g.brunch_attending === false ? l.no : ''] : [])
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'guests.csv'; a.click()
  }

  if (loading) return <div className="text-center text-stone-400 font-montserrat py-20">{l.loading}</div>

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: l.confirmed, val: confirmed.length, color: 'text-green-600' },
          { label: l.declined, val: guests.filter(g => g.rsvp_status === 'declined').length, color: 'text-red-500' },
          { label: l.pending, val: guests.filter(g => g.rsvp_status === 'pending').length, color: 'text-yellow-600' },
          { label: l.total + ' (' + l.adults + ')', val: `${totalAdults} + ${totalChildren}`, color: 'text-stone-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-stone-100 p-4 text-center">
            <div className={`text-2xl font-cormorant ${s.color}`}>{s.val}</div>
            <div className="text-xs text-stone-400 font-montserrat mt-1 uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>

      {hasBrunch && (
        <div className="bg-white rounded-lg border border-stone-100 p-3 mb-4 text-sm font-montserrat text-stone-600">
          🥐 {l.brunch}: <span className="font-medium text-stone-800">{brunchCount}</span> / {confirmed.length}
        </div>
      )}

      {/* Guest capacity bar */}
      <div className="bg-white rounded-lg border border-stone-100 p-4 mb-6">
        <div className="flex justify-between text-xs text-stone-500 font-montserrat mb-2">
          <span>{totalGuests} / {maxGuests} {l.total}</span>
          <span>{Math.round((totalGuests / maxGuests) * 100)}%</span>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div className="h-full bg-stone-800 rounded-full transition-all" style={{ width: `${Math.min((totalGuests / maxGuests) * 100, 100)}%` }} />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder={l.search}
          className="flex-1 min-w-48 border border-stone-200 rounded px-3 py-2 text-sm font-montserrat text-stone-600 focus:outline-none focus:border-stone-400"
        />
        <div className="flex gap-1">
          {(['all', 'confirmed', 'declined', 'pending'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs font-montserrat rounded transition ${filter === f ? 'bg-stone-800 text-white' : 'bg-white border border-stone-200 text-stone-500 hover:bg-stone-50'}`}>
              {f === 'all' ? l.all : l[f]}
            </button>
          ))}
        </div>
        <button onClick={exportCSV} className="px-4 py-2 text-xs font-montserrat bg-white border border-stone-200 text-stone-600 rounded hover:bg-stone-50 transition">
          ↓ {l.export}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-stone-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-stone-100">
            <tr className="text-xs text-stone-400 font-montserrat uppercase tracking-widest">
              <th className="text-start px-4 py-3">{l.name}</th>
              <th className="text-start px-4 py-3">{l.status}</th>
              <th className="text-start px-4 py-3">{l.guests}</th>
              <th className="text-start px-4 py-3">{l.diet}</th>
              {hasBrunch && <th className="text-start px-4 py-3">{l.brunch}</th>}
              <th className="text-start px-4 py-3">{l.notes}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={hasBrunch ? 6 : 5} className="text-center py-12 text-stone-300 font-montserrat">—</td></tr>
            ) : filtered.map(g => (
              <tr key={g.id} className="hover:bg-stone-50/50 transition">
                <td className="px-4 py-3">
                  <p className="font-montserrat text-stone-700 font-medium">{g.name}</p>
                  {g.email && <p className="text-xs text-stone-400 mt-0.5">{g.email}</p>}
                  {g.phone && <p className="text-xs text-stone-400">{g.phone}</p>}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded border text-xs font-montserrat ${statusColors[g.rsvp_status] || ''}`}>
                    {l[g.rsvp_status] || g.rsvp_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-600 font-montserrat text-xs">
                  {g.adults_count} {l.adults}<br />{g.children_count} {l.children}
                </td>
                <td className="px-4 py-3 text-stone-500 font-montserrat text-xs max-w-28 truncate">
                  {g.dietary_preferences || '—'}{g.allergies ? ` / ${g.allergies}` : ''}
                </td>
                {hasBrunch && (
                  <td className="px-4 py-3 text-xs font-montserrat">
                    {g.brunch_attending === true ? <span className="text-green-600">{l.yes}</span> :
                     g.brunch_attending === false ? <span className="text-stone-400">{l.no}</span> : '—'}
                  </td>
                )}
                <td className="px-4 py-3 text-stone-400 font-montserrat text-xs max-w-48">
                  <p className="truncate">{g.notes || '—'}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
