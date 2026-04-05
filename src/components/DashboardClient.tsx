'use client'
// ============================================================
//  GrandInvite – Dashboard Client Component
//  טאב 1: ניהול אורחים (חיפוש / פילטור / הוספה / מחיקה / CSV)
//  טאב 2: עריכת הזמנה (פרטים + לו"ז + בראנץ')
//  טאב 3: תצוגה מקדימה
//  src/components/DashboardClient.tsx
// ============================================================

import { useState, useMemo, Fragment, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Guest, Wedding, EventSchedule } from '@/types'
import type { Locale } from '@/lib/i18n'

type RSVPStatus = 'all' | 'confirmed' | 'declined' | 'pending'
type Tab = 'guests' | 'seating' | 'edit' | 'preview'

interface Props {
  guests: Guest[]
  wedding: Wedding
  locale: Locale
  t: Record<string, string>
}

const emptyNewGuest = {
  name: '',
  email: '',
  phone: '',
  adults_count: 1,
  children_count: 0,
  rsvp_status: 'confirmed' as 'confirmed' | 'declined' | 'pending',
  dietary_preferences: '',
  allergies: '',
  notes: '',
}

export default function DashboardClient({ guests, wedding, locale, t }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('guests')

  // ════════════════════════════════════════
  // TAB 1 — אורחים
  // ════════════════════════════════════════
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<RSVPStatus>('all')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newGuest, setNewGuest] = useState({ ...emptyNewGuest })
  const [savingGuest, setSavingGuest] = useState(false)
  const [guestModalError, setGuestModalError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ════════════════════════════════════════
  // TAB: SEATING
  // ════════════════════════════════════════
  const [tableInputs, setTableInputs] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {}
    guests.forEach(g => { if (g.table_number != null) m[g.id] = String(g.table_number) })
    return m
  })
  const [savingTable, setSavingTable] = useState<string | null>(null)

  const filteredGuests = useMemo(() => {
    return guests.filter(g => {
      const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.email?.toLowerCase().includes(search.toLowerCase()) ||
        g.notes?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || g.rsvp_status === statusFilter
      return matchSearch && matchStatus
    })
  }, [guests, search, statusFilter])

  const exportCSV = () => {
    const headers = ['Name','Email','Phone','Status','Adults','Children','Dietary','Allergies','Notes','Submitted At']
    const rows = filteredGuests.map(g => [
      g.name, g.email??'', g.phone??'', g.rsvp_status,
      g.adults_count, g.children_count,
      g.dietary_preferences??'', g.allergies??'', g.notes??'',
      g.rsvp_submitted_at ? new Date(g.rsvp_submitted_at).toLocaleDateString() : '',
    ])
    const csv = [headers,...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `guests_${wedding.id}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAddGuest = async () => {
    if (!newGuest.name.trim()) {
      setGuestModalError(locale==='he'?'שם הוא שדה חובה':locale==='fr'?'Le nom est requis':'Name is required')
      return
    }
    setGuestModalError('')
    setSavingGuest(true)
    try {
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newGuest, wedding_id: wedding.id }),
      })
      if (!res.ok) {
        const d = await res.json()
        setGuestModalError(d.error||'Error')
        return
      }
      setShowAddModal(false)
      setNewGuest({ ...emptyNewGuest })
      router.refresh()
    } catch {
      setGuestModalError(locale==='he'?'שגיאה בשמירה':'Save error')
    } finally {
      setSavingGuest(false)
    }
  }

  const handleAssignTable = async (guestId: string, tableNum: string) => {
    const trimmed = tableNum.trim()
    const num = trimmed === '' ? null : parseInt(trimmed)
    if (trimmed !== '' && (isNaN(num!) || num! < 1)) return
    setSavingTable(guestId)
    try {
      await fetch('/api/guests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: guestId, wedding_id: wedding.id, table_number: num }),
      })
      router.refresh()
    } finally {
      setSavingTable(null)
    }
  }

  const handleDeleteGuest = async (guestId: string) => {
    const msg = locale==='he'?'למחוק אורח זה?':locale==='fr'?'Supprimer cet invité ?':'Delete this guest?'
    if (!confirm(msg)) return
    setDeletingId(guestId)
    try {
      await fetch(`/api/guests?id=${guestId}&wedding_id=${wedding.id}`, { method:'DELETE' })
      router.refresh()
    } finally {
      setDeletingId(null)
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return <span className="badge-confirmed">✓ {t.confirmed}</span>
      case 'declined':  return <span className="badge-declined">✗ {t.declined}</span>
      default:          return <span className="badge-pending">‧ {t.pending}</span>
    }
  }e 'declined':  return <span className="badge-declined">✗ {t.declined}</span>
      default:          return <span className="badge-pending">… {t.pending}</span>
    }
  }

  // ════════════════════════════════════════
  // TAB 2 — עריכת הזמנה
  // ════════════════════════════════════════
  const [editForm, setEditForm] = useState({
    bride_name: wedding.bride_name,
    groom_name: wedding.groom_name,
    wedding_date: wedding.wedding_date,
    venue_name: wedding.venue_name ?? '',
    venue_city: wedding.venue_city ?? '',
    venue_address: wedding.venue_address ?? '',
    welcome_message: wedding.welcome_message ?? '',
    rsvp_deadline: wedding.rsvp_deadline ?? '',
    google_maps_url: wedding.google_maps_url ?? '',
    waze_url: wedding.waze_url ?? '',
    locale: wedding.locale,
  })
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState(false)

  // ── לו"ז / בראנץ' ──
  const schedule = (wedding.event_schedule ?? []) as EventSchedule[]
  const brunchEvent = schedule.find(e =>
    e.event_name?.toLowerCase().includes('brunch') ||
    e.event_name?.toLowerCase().includes('בראנץ')
  )
  // State נפרד מה-brunchEvent כדי לאפשר toggle מיידי (ללא תלות ב-router.refresh)
  const [brunchEnabled, setBrunchEnabled] = useState<boolean>(!!brunchEvent)
  const [brunchEventId, setBrunchEventId] = useState<string | undefined>(brunchEvent?.id)
  const [togglingBrunch, setTogglingBrunch] = useState(false)

  // סינכרון כשהדף מתרענן
  useEffect(() => {
    setBrunchEnabled(!!brunchEvent)
    setBrunchEventId(brunchEvent?.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding.event_schedule?.length])

  const handleSaveEdit = async () => {
    setSavingEdit(true)
    setEditError('')
    setEditSuccess(false)
    try {
      const res = await fetch('/api/weddings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: wedding.id, ...editForm }),
      })
      if (!res.ok) {
        const d = await res.json()
        setEditError(d.error || 'Error')
        return
      }
      setEditSuccess(true)
      router.refresh()
      setTimeout(() => setEditSuccess(false), 3000)
    } catch {
      setEditError(locale==='he'?'שגיאה בשמירה':'Save error')
    } finally {
      setSavingEdit(false)
    }
  }

  // ── Toggle בראנץ' (מתוקן: state אופטימיסטי + בלי double-click) ──
  const handleToggleBrunch = async () => {
    if (togglingBrunch) return  // מניעת double-click

    const nextEnabled = !brunchEnabled
    setBrunchEnabled(nextEnabled)   // עדכון מיידי ב-UI
    setTogglingBrunch(true)

    try {
      if (nextEnabled) {
        // הוספת אירוע בראנץ'
        // Parse date parts directly to avoid UTC/local timezone offset bugs
        const [by, bm, bd] = wedding.wedding_date.split('-').map(Number)
        const brunchDate = new Date(by, bm - 1, bd + 1)  // local time constructor
        const dateStr = `${brunchDate.getFullYear()}-${String(brunchDate.getMonth()+1).padStart(2,'0')}-${String(brunchDate.getDate()).padStart(2,'0')}`
        const name = locale==='he'?'בראנץ׳ למחרת':locale==='fr'?'Brunch du lendemain':'Morning-after Brunch'

        const res = await fetch('/api/weddings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wedding_id: wedding.id,
            event_name: name,
            event_date: dateStr,
            start_time: '11:00',
            end_time: '14:00',
            sort_order: 99,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          setBrunchEventId(data.event?.id)
          router.refresh()
        } else {
          setBrunchEnabled(false)  // rollback
        }
      } else {
        // מחיקת אירוע בראנץ'
        if (!brunchEventId) { setBrunchEnabled(false); return }
        const res = await fetch(
          `/api/weddings?event_id=${brunchEventId}&wedding_id=${wedding.id}`,
          { method: 'DELETE' }
        )
        if (res.ok) {
          setBrunchEventId(undefined)
          router.refresh()
        } else {
          setBrunchEnabled(true)  // rollback
        }
      }
    } catch {
      setBrunchEnabled(!nextEnabled)  // rollback on error
    } finally {
      setTogglingBrunch(false)
    }
  }

  const inputCls = 'w-full px-4 py-3 border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors rounded-xl'
  const labelCls = 'block text-xs text-stone-500 uppercase tracking-wider mb-1.5 font-medium'
  const isRTL = locale === 'he'

  return (
    <div>
      {/* ── Tab Bar ── */}
      <div className="flex border-b border-stone-200 mb-6 md:mb-8 gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden -mx-4 md:mx-0 px-4 md:px-0">
        {([
          { key:'guests',  label: locale==='he'?'אורחים':locale==='fr'?'Invités':'Guests' },
          { key:'seating', label: locale==='he'?'ישיבה':locale==='fr'?'Tables':'Seating' },
          { key:'edit',    label: locale==='he'?'עריכה':locale==='fr'?'Modifier':'Edit' },
          { key:'preview', label: locale==='he'?'תצוגה':locale==='fr'?'Aperçu':'Preview' },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-shrink-0 px-4 md:px-6 py-3 text-sm font-medium tracking-wide transition-all relative whitespace-nowrap"
            style={{ color: activeTab===tab.key ? '#c9a84c' : '#a8a29e' }}
          >
            {tab.label}
            {activeTab===tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c9a84c]" />
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          TAB: GUESTS
      ══════════════════════════════════════════════ */}
      {activeTab === 'guests' && (
        <div>
          {/* Toolbar */}
          <div className="flex flex-wrap gap-3 md:gap-4 items-center justify-between mb-6">
            <div className="relative w-full md:flex-1 md:min-w-[200px] md:max-w-sm">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t.search}
                className="w-full pl-10 pr-4 py-2 border border-stone-200 bg-white text-stone-700
                           text-sm focus:outline-none focus:border-[#c9a84c] transition-colors" />
            </div>
            <div className="flex gap-3 flex-wrap">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as RSVPStatus)}
                className="px-4 py-2 border border-stone-200 bg-white text-stone-600
                           text-sm focus:outline-none focus:border-[#c9a84c] transition-colors">
                <option value="all">{t.allStatuses}</option>
                <option value="confirmed">{t.confirmed}</option>
                <option value="declined">{t.declined}</option>
                <option value="pending">{t.pending}</option>
              </select>
              <button onClick={exportCSV} className="btn-gold flex items-center gap-2 text-xs">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
                </svg>
                {t.exportCSV}
              </button>
              <button
                onClick={() => { setShowAddModal(true); setGuestModalError(''); setNewGuest({...emptyNewGuest}) }}
                className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white
                           text-xs tracking-wide hover:bg-stone-700 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                </svg>
                {t.addGuest}
              </button>
            </div>
          </div>

          {/* Guest Table */}
          <div className="bg-white border border-stone-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    {[t.name, t.status, t.guests, t.dietary, t.notes, t.submittedAt, ''].map((h,i) => (
                      <th key={i} className="text-left px-4 py-3 text-xs tracking-widest uppercase text-stone-400 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-stone-300">
                        <div className="font-cormorant text-3xl mb-2">✦</div>
                        <p>No guests found</p>
                      </td>
                    </tr>
                  ) : filteredGuests.map(guest => (
                    <Fragment key={guest.id}>
                      <tr onClick={() => setExpandedRow(expandedRow===guest.id?null:guest.id)}
                        className="hover:bg-stone-50 cursor-pointer transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 text-xs font-medium flex-shrink-0">
                              {guest.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-stone-800">{guest.name}</p>
                              {guest.email && <p className="text-xs text-stone-400">{guest.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">{statusBadge(guest.rsvp_status)}</td>
                        <td className="px-4 py-4 text-stone-500">
                          {guest.adults_count > 0 && <span>{guest.adults_count} 👤</span>}
                          {guest.children_count > 0 && <span className="ml-2">{guest.children_count} 👶</span>}
                        </td>
                        <td className="px-4 py-4">
                          {guest.dietary_preferences
                            ? <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1">{guest.dietary_preferences}</span>
                            : <span className="text-stone-200">—</span>}
                        </td>
                        <td className="px-4 py-4 max-w-[200px]">
                          {guest.notes
                            ? <p className="text-xs text-stone-500 truncate" title={guest.notes}>{guest.notes}</p>
                            : <span className="text-stone-200">—</span>}
                        </td>
                        <td className="px-4 py-4 text-xs text-stone-400">
                          {guest.rsvp_submitted_at
                            ? new Date(guest.rsvp_submitted_at).toLocaleDateString(
                                locale==='he'?'he-IL':locale==='fr'?'fr-FR':'en-GB')
                            : '—'}
                        </td>
                        <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                          <button onClick={() => handleDeleteGuest(guest.id)}
                            disabled={deletingId===guest.id}
                            className="text-stone-300 hover:text-red-400 transition-colors p-1 disabled:opacity-40"
                            title={t.deleteGuest}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                      {expandedRow===guest.id && (
                        <tr key={`${guest.id}-exp`} className="bg-stone-50">
                          <td colSpan={7} className="px-6 py-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              {guest.phone && <div><p className="text-xs text-stone-400 uppercase tracking-wide mb-1">Phone</p><p className="text-stone-700">{guest.phone}</p></div>}
                              {guest.allergies && <div><p className="text-xs text-stone-400 uppercase tracking-wide mb-1">Allergies</p><p className="text-red-600">{guest.allergies}</p></div>}
                              {guest.notes && <div className="md:col-span-2"><p className="text-xs text-stone-400 uppercase tracking-wide mb-1">Notes / Other</p><p className="text-stone-700 bg-white p-3 border border-stone-100">{guest.notes}</p></div>}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-stone-50 border-t border-stone-100 text-xs text-stone-400 text-right">
              {filteredGuests.length} / {guests.length} guests
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: SEATING
      ══════════════════════════════════════════════ */}
      {activeTab === 'seating' && (
        <div dir={isRTL?'rtl':'ltr'}>
          {/* Header */}
          <div className="mb-6">
            <h3 className="font-cormorant text-2xl text-stone-700">
              {locale==='he'?'סידורי ישיבה':locale==='fr'?'Plan de table':'Seating Chart'}
            </h3>
            <p className="text-sm text-stone-400 mt-1">
              {locale==='he'?'הקצה מספר שולחן לכל אורח שאישר הגעה'
                :locale==='fr'?"Attribuez un numéro de table à chaque invité confirmé"
                :'Assign a table number to each confirmed guest'}
            </p>
          </div>

          {/* Assignment table — confirmed guests */}
          <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm mb-8">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50">
                    <th className="px-5 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider text-left">
                      {locale==='he'?'שם':locale==='fr'?'Nom':'Name'}
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider text-left">
                      {locale==='he'?'סטטוס':locale==='fr'?'Statut':'Status'}
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider text-left">
                      {locale==='he'?'סה״כ':locale==='fr'?'Total':'Total'}
                    </th>
                    <th className="px-5 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider text-left w-36">
                      {locale==='he'?'מספר שמוח':locale==='fr'?'N° de table':'Table #'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {guests.filter(g => g.rsvp_status === 'confirmed').map(g => (
                    <tr key={g.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-stone-800">{`.name}</td>
                      <td className="px-5 py-3">{statusBadge(g.rsvp_status)}</td>
                      <td className="px-5 py-3 text-stone-500">
                        {g.adults_count + g.children_count}
                      </td>
                      <td classNamS�'��R��2#��F�b6�74��S�&f�W��FV�2�6V�FW"v�"#�Ɩ�W@�G�S�&�V�&W" �֖�׳Т�6V���FW#�.(	B �f�VS׷F&�T��WG5�r�E����r�F&�U��V�&W"��V���7G&��r�r�F&�U��V�&W"��rr�Т��6��vS׶R��6WEF&�T��WG2�&Wb�������&Wb��r�EӢR�F&vWB�f�VRҒ�Т��&�W#׶R����F�T76�v�F&�R�r�B�R�F&vWB�f�VR�Т��W�F�v�׶R�����b�R�W����tV�FW"r���F�T76�v�F&�R�r�B��R�F&vWB2�D�Ė�WDV�V�V�B��f�VR���Т6�74��S�'r�#��2���R&�&FW"&�&FW"�7F��R�#&r�7F��R�SFW�B�6�FW�B�6V�FW"f�7W3��WFƖ�R����Rf�7W3�&�&FW"ղ63��F5�&�V�FVB��rG&�6�F����6���'2 �F�#�&�G" ����6f��uF&�R���r�Bbb���7fr6�74��S�'r�B��BFW�B�7F��R�3��FR�7��f�W��6�&���"f����&���R"f�Wt&���##B#B#��6�&6�R6�74��S�&�6�G��#R"7��#""7��#""#�#"7G&��S�&7W'&V�D6���""7G&��Uv�GF��#B"���F�6�74��S�&�6�G��sR"f����&7W'&V�D6���""C�$�B&���Ӈc��"����7fs��Т��F�c���FC���G#���Т��F&�G����F&�S���F�c��wVW7G2�f��FW"�r��r�'7g�7FGW2���v6��f�&�VBr���V�wF����bb���F�b6�74��S�'��R��"FW�B�6V�FW"FW�B�7F��R�CFW�B�6�#����6�S���v�Rs�}y
y�y�
y
y]z�y}y�y�
z�y
y�z�z�yR
yMy-z-yB
z-y=y�y�y�p����6�S���vg"s�$V7V���f�L:�6��f�&�:��W"�v��7F�B ��t��6��f�&�VBwVW7G2�WBwТ��F�c��Т�F�b6�74��S�'��R��2&r�7F��R�S&�&FW"�B&�&FW"�7F��R�FW�Bׇ2FW�B�7F��R�CFW�B�&�v�B#��wVW7G2�f��FW"�r��r�'7g�7FGW2���v6��f�&�VBrbbr�F&�U��V�&W"��V���V�wF�Т�r�wТ�wVW7G2�f��FW"�r��r�'7g�7FGW2���v6��f�&�VBr���V�wF�Т�rwТ���6�S���v�Rs�}yMy]z}zmyR
y�z�y]y�y}z
y]z�s���6�S���vg"s�v76�v�:�2:V�RF&�Rs�v76�v�VBF�F&�W2wТ��F�c���F�cࠢ��w&�WVB�'��F&�R�fW'f�Wr��Т��������6��7B6��f�&�VB�wVW7G2�f��FW"�r��r�'7g�7FGW2���v6��f�&�VBrbbr�F&�U��V�&W"��V���b�6��f�&�VB��V�wF�����&WGW&��V���6��7B'�F&�S�&V6�&C��V�&W"�wVW7E�����Т6��f�&�VB�f�$V6��r����6��7BD�V��r�F&�U��V�&W"��b�'�F&�U�D�V�Ғ'�F&�U�D�V����Т'�F&�U�D�V���W6��r��Ґ�6��7BF&�T�V�&W'2��&�V7B�W�2�'�F&�R�����V�&W"��6�'B���"����"��&WGW&����F�c�ƃ26�74��S�&f��B�6�&��&�BFW�B׆�FW�B�7F��R�s�"�B#����6�S���v�Rs�}z�zmy]y-yB
y�zMy�
z�y]y�y}y�s���6�S���vg"s�ugVR"F&�Rs�uf�Wr'�F&�RwТ���3��F�b6�74��S�&w&�Bw&�B�6��2�6Ӧw&�B�6��2�"�s�w&�B�6��2�2v�B#��F&�T�V�&W'2���F&�T�V�����6��7BF&�TwVW7G2�'�F&�U�F&�T�V�Т6��7BF�F��F&�TwVW7G2�&VGV6R��7V��r���7V��r�GV�G5�6�V�B�r�6���G&V��6�V�B���&WGW&����F�b�W�׷F&�T�V��6�74��S�&&r�v��FR&�&FW"&�&FW"�7F��R�&�V�FVB׆��B6�F�r�6�#��F�b6�74��S�&f�W��FV�2�6V�FW"�W7F�g��&WGvVV��"�2#��7�6�74��S�&f��B�6�&��&�BFW�B��rFW�B�7F��R�s#����6�S���v�Rs�}z�y]y�y}y�s���6�S���vg"s�uF&�Rs�uF&�Rw��F&�T�V�Т��7���7�6�74��S�'FW�Bׇ2FW�B�7F��R�C&r�7F��R�S��"��&�V�FVB�gV��#��F�F�����6�S���v�Rs�}y
y]z�y}y�y�s���6�S���vg"s�v��f�L:�2s�vwVW7G2wТ��7����F�c��V�6�74��S�'76Rג��R#��F&�TwVW7G2���r�����ƒ�W�׶r�G�6�74��S�'FW�B�6�FW�B�7F��R�cf�W��FV�2�6V�FW"v�"#��7�6�74��S�'r��R���R&�V�FVB�gV��&rղ63��F5�f�W��6�&���"���7�6�74��S�'G'V�6FR#�r���W���7����r�GV�G5�6�V�B�r�6���G&V��6�V�B��bb���7�6�74��S�'FW�Bׇ2FW�B�7F��R�Cf�W��6�&���#�9w�r�GV�G5�6�V�B�r�6���G&V��6�V�GТ��7���Т��Ɠ���Т��V����F�c���җТ��F�c���F�c���Ғ��Т��F�c��Р���)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y �D#�TD�@�)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y��Т�7F�fUF"���vVF�Brbb���F�bF�#׶�5%D��w'F�s�v�G"w�6�74��S�&���r�'��76Rגӂ#ࠢ�VF�DW'&�"bb�F�b6�74��S�&&r�&VB�S&�&FW"&�&FW"�&VB�FW�B�&VB�cFW�B�6���B��2&�V�FVB׆�#�VF�DW'&�'���F�c�Т�VF�E7V66W72bb���F�b6�74��S�&&r�V�W&�B�S&�&FW"&�&FW"�V�W&�B�FW�B�V�W&�B�sFW�B�6���B��2&�V�FVB׆�f�W��FV�2�6V�FW"v�"#��7fr6�74��S�'r�B��B"f����&���R"f�Wt&���##B#B"7G&��S�&7W'&V�D6���"#��F�7G&��TƖ�V6�'&�V�B"7G&��TƖ�V�����'&�V�B"7G&��Uv�GF�׳'�C�$�R6�BD��r"����7fs����6�S���v�Rs�}z
z�y�z�
yyMzmy�y}yBs���6�S���vg"s�tV�&Vv�7G,:�fV27V6<:�2s�u6fVB7V66W76gV�ǒwТ��F�c��Р���)H)H
yMymy]y")H)H��Т�F�c�ƃ26�74��S�&f��B�6�&��&�BFW�B׆�FW�B�7F��R�s�"�B"�"&�&FW"�"&�&FW"�7F��R�#����6�S���v�Rs�}yMymy]y"s���6�S���vg"s�t�W2�&�:�2s�uF�R6�W�RwТ���3��F�b6�74��S�&w&�Bw&�B�6��2�"v�B#��F�c���&V�6�74��S׶�&V�6�7����6�S���v�Rs�}z�y�
yMy�y�yBs���6�S���vg"s�%,:����FR��&�:�R#�$'&�FRw2��R'����&V��Ɩ�WBf�VS׶VF�Df�&��'&�FU���W���6��vS׶S��6WDVF�Df�&҇�⇲����'&�FU���S�R�F&vWB�f�VWҒ��6�74��S׶��WD6�7�����F�c��F�c���&V�6�74��S׶�&V�6�7����6�S���v�Rs�}z�y�
yMy}z�y�s���6�S���vg"s�%,:����GR�&�:�#�$w&���w2��R'����&V��Ɩ�WBf�VS׶VF�Df�&��w&������W���6��vS׶S��6WDVF�Df�&҇�⇲����w&������S�R�F&vWB�f�VWҒ��6�74��S׶��WD6�7�����F�c���F�c��F�b6�74��S�&�B�B#���&V�6�74��S׶�&V�6�7����6�S���v�Rs�}z�y
z�y�y�
yMy}z�y]z
yBs���6�S���vg"s�tFFRGR�&�vRs�uvVFF��rFFRw����&V��Ɩ�WBG�S�&FFR"f�VS׶VF�Df�&��vVFF��u�FFW���6��vS׶S��6WDVF�Df�&҇�⇲����vVFF��u�FFS�R�F&vWB�f�VWҒ��F�#�&�G""6�74��S׶��WD6�7�����F�c���F�cࠢ��)H)H
y�z}y]y�)H)H��Т�F�c�ƃ26�74��S�&f��B�6�&��&�BFW�B׆�FW�B�7F��R�s�"�B"�"&�&FW"�"&�&FW"�7F��R�#����6�S���v�Rs�}y�z}y]y�
yMy
y�z�y]z"s���6�S���vg"s�t�RƖWRs�ufV�VRwТ���3��F�b6�74��S�'76Rג�2#��F�c���&V�6�74��S׶�&V�6�7����6�S���v�Rs�}z�y�
yMy
y]y�y�s���6�S���vg"s�t���GRƖWRs�ufV�VR��Rw����&V��Ɩ�WBf�VS׶VF�Df�&��fV�VU���W���6��vS׶S��6WDVF�Df�&҇�⇲����fV�VU���S�R�F&vWB�f�VWҒ��6�74��S׶��WD6�7��6V���FW#׶��6�S���v�Rs�}y
y]y�y�
y
y�z�y]z-y�y�s�t6�:'FVRFR���w�����F�c��F�b6�74��S�&w&�Bw&�B�6��2�"v�2#��F�c���&V�6�74��S׶�&V�6�7����6�S���v�Rs�}z-y�z�s���6�S���vg"s�uf���Rs�t6�G�w����&V��Ɩ�WBf�VS׶VF�Df�&��fV�VU�6�G����6��vS׶S��6WDVF�Df�&҇�⇲����fV�VU�6�G��R�F&vWB�f�VWҒ��6�74��S׶��WD6�7�����F�c��F�c���&V�6�74��S׶�&V�6�7����6�S���v�Rs�}y�z�y]yz�s���6�S���vg"s�tG&W76Rs�tFG&W72w����&V��Ɩ�WBf�VS׶VF�Df�&��fV�VU�FG&W77���6��vS׶S��6WDVF�Df�&҇�⇲����fV�VU�FG&W73�R�F&vWB�f�VWҒ��6�74��S׶��WD6�7�����F�c���F�c��F�b6�74��S�&w&�Bw&�B�6��2�"v�2#��F�c���&V�6�74��S׶�&V�6�7��v��v�R�2U$����&V��Ɩ�WBf�VS׶VF�Df�&��v��v�U��5�W&����6��vS׶S��6WDVF�Df�&҇�⇲����v��v�U��5�W&æR�F&vWB�f�VWҒ��6�74��S׶��WD6�7�F�#�&�G""�6V���FW#�&�GG3����2�v��v�R�6������"����F�c��F�c���&V�6�74��S׶�&V�6�7��v�RU$����&V��Ɩ�WBf�VS׶VF�Df�&��v�U�W&����6��vS׶S��6WDVF�Df�&҇�⇲����v�U�W&æR�F&vWB�f�VWҒ��6�74��S׶��WD6�7�F�#�&�G""�6V���FW#�&�GG3���v�R�6������"����F�c���F�c���F�c���F�cࠢ��)H)H
yMy]y=z-yB
y]z�y
z�y�y�%5e)H)H��Т�F�c�ƃ26�74��S�&f��B�6�&��&�BFW�B׆�FW�B�7F��R�s�"�B"�"&�&FW"�"&�&FW"�7F��R�#����6�S���v�Rs�}z�y]y�y�
yMyMymy�z
yBs���6�S���vg"s�$6��FV�RFR�v��f�FF���#�t��f�FF���6��FV�BwТ���3��F�b6�74��S�'76Rג�2#��F�c���&V�6�74��S׶�&V�6�7����6�S���v�Rs�}z�zMyB
z�y
z�y�z�s���6�S���vg"s�t��wVR&��6��Rs�t�����wVvRw����&V���F�b6�74��S�&f�W�v�"#����vg"r�v�Rr�vV�u�26��7B������s�•�'WGF���W�׶��w�G�S�&'WGF�� ���6Ɩ6�ײ����6WDVF�Df�&҇�⇲������6�S���wҒ�Т6�74��S�&f�W����"�R&�V�FVB׆�FW�B�6�f��B��VF�V�&�&FW"G&�6�F������ �7G��S׷��&6�w&�V�C�VF�Df�&����6�S�����s�r63��F2s�r6fc�cRr��6���#�VF�Df�&����6�S�����s�r6ffbs�r3s�sf2r��&�&FW$6���#�VF�Df�&����6�S�����s�r63��F2s�r6SvSVSBr��������s���vg"s�tg&�:v�2s���s���v�Rs�}z-yz�y�z�s�tV�vƗ6�wТ��'WGF�����Т��F�c��6�74��S�'FW�Bׇ2FW�B�7F��R�C�B��R#�	�����6�S���v�Rs�}yMy
y]z�y}y�y�
y�z�y
yR
y
z�
yMyMymy�z
yB
yz�zMyB
z�y�yMy�
y
y]y�y]y�y�y�z�s���6�S���vg"s�$�W2��f�L:�2fW'&��B�v��f�FF���F�2�WW"&�&R��wVRWF��F�VV�V�B#�twVW7G2v���6VRF�R��f�FF�����F�V�"�v���wVvRWF��F�6�ǒwТ�����F�c��F�c���&V�6�74��S׶�&V�6�7����6�S���v�Rs�}yMy]y=z-z�
zMz�y�y}yBs���6�S���vg"s�t�W76vRFR&�V�fV�VRs�uvV�6��R�W76vRw����&V���FW�F&Vf�VS׶VF�Df�&��vV�6��U��W76vW���6��vS׶S��6WDVF�Df�&҇�⇲����vV�6��U��W76vS�R�F&vWB�f�VWҒ�Т&�w3׳G�6�74��S׶��WD6�2�r&W6��R����Rw�����F�c��F�c���&V�6�74��S׶�&V�6�7����6�S���v�Rs�}z�y
z�y�y�
y
y}z�y]y�
y�y
y�z�y]z�s���6�S���vg"s�tFFRƖ֗FR%5es�u%5eFVFƖ�Rw����&V��Ɩ�WBG�S�&FFR"f�VS׶VF�Df�&��'7g�FVFƖ�W���6��vS׶S��6WDVF�Df�&҇�⇲����'7g�FVFƖ�S�R�F&vWB�f�VWҒ��F�#�&�G""6�74��S׶��WD6�7�����F�c���F�c���F�cࠢ��)H)H
y�yR-yc�
y�zMz�y]z�
yz�y
z
zRr)H)H��Т�F�c�ƃ26�74��S�&f��B�6�&��&�BFW�B׆�FW�B�7F��R�s�"�B"�"&�&FW"�"&�&FW"�7F��R�#����6�S���v�Rs�-y�yU�-yb
yMy
y�z�y]z"#���6�S���vg"s�%&�w&��RFR�|:�l:��V�V�B#�tWfV�B66�VGV�RwТ���3��F�b6�74��S�&f�W��FV�2�6V�FW"�W7F�g��&WGvVV��B&r�7F��R�S&�V�FVB׆�&�&FW"&�&FW"�7F��R�#��F�c��6�74��S�'FW�B�6�f��B��VF�V�FW�B�7F��R�s#����6�S���v�Rs�}yz�y
z
z]{2
y�y�y}z�z�s���6�S���vg"s�t''V�6�GR�V�FV���s�t��&��r�gFW"''V�6�wТ����6�74��S�'FW�Bׇ2FW�B�7F��R�C�B��R#����6�S���v�Rs�}yMy]zz2
yz�y
z
z]{2
yy�y]y�
z�y
y}z�y�
yMy}z�y]z
yB��(	3C��p����6�S���vg"s�$��WFW"V�''V�6��R�V�FV���GR�&�vR��(	3F�� ��tFB''V�6�WfV�BF�RF�gFW"F�RvVFF��r��(	3'ҒwТ�����F�c���F�vv�R7v�F6���Т�'WGF��G�S�&'WGF�� ���6Ɩ6�׶��F�UF�vv�T''V�6�ТF�6&�VC׷F�vvƖ�t''V�6�Т&��&W76VC׶''V�6�V�&�VGТ6�74��S�'&V�F�fR��Ɩ�R�f�W���rr�"�FV�2�6V�FW"&�V�FVB�gV��G&�6�F����6���'2f�7W3��WFƖ�R����RF�6&�VC��6�G��cf�W��6�&��� �7G��S׷�&6�w&�V�C�''V�6�V�&�VB�r63��F2r�r6CFC6"r�Т��7�6�74��S�&��Ɩ�R�&��6���Rr�RG&�6f�&�&�V�FVB�gV��&r�v��FR6�F�r�6�G&�6�F����G&�6f�&�GW&F����# �7G��S׷�G&�6f�&Ӣ''V�6�V�&�VB�wG&�6�FU��#'��r�wG&�6�FU��'��r�Т����'WGF�����F�c���
z�z�y�y�z�
y
y�z�y]z-y�y�
z}y�y�y�y�y���Т�66�VGV�R��V�wF��bb���F�b6�74��S�&�B�276Rג�"#��66�VGV�R���Wb�����F�b�W�׶Wb�G�6�74��S�&f�W��FV�2�6V�FW"�W7F�g��&WGvVV���"��2&r�v��FR&�&FW"&�&FW"�7F��R�&�V�FVB��rFW�B�6�#��7�6�74��S�'FW�B�7F��R�s#�Wb�WfV�E���W���7���7�6�74��S�'FW�Bׇ2FW�B�7F��R�C#�Wb�7F'E�F��S��6Ɩ6R��R����7����F�c���Т��F�c��Т��F�cࠢ��)H)H
y�zMz�y]z�
z�y�y�z�yB)H)H��Т�F�b6�74��S�'B�"#��'WGF����6Ɩ6�׶��F�U6fTVF�G�F�6&�VC׷6f��tVF�GТ6�74��S�'�ӂ��2�RFW�B�v��FRFW�B�6�f��B��VF�V�G&6���r�v�FW"WW&66R&�V�FVB׆�G&�6�F������F�6&�VC��6�G��c �7G��S׷�&6�w&�V�C�6f��tVF�C�r6�#�Rs�r63��F2r�&��6�F�s�6f��tVF�C�v���Rs�sG�G�&v&�#�c��sb��#R�r����6f��tVF�@�����6�S���v�Rs�}z�y]y�z����s���6�S���vg"s�tV�&Vv�7G&V�V�B���s�u6f��r���r������6�S���v�Rs�}z�y�y]z�
z�y�z
y]y�y�y�s���6�S���vg"s�tV�&Vv�7G&W"�W2��F�f�6F���2s�u6fR6��vW2r�Т��'WGF�����F�c���F�c��Р���)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y �D#�$Ud�Up�)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y��Т�7F�fUF"���w&Wf�Wrrbb���F�b6�74��S�'FW�B�6V�FW"��"#��6�74��S�'FW�B�7F��R�CFW�B�6��"�b#����6�S���v�Rs�}y�zmzMy�y�yB
yyMymy�z
yB
y�zMy�
z�yMy
y]z�y}y�y�
z�y]y
y�y�
y
y]z�yBs���6�S���vg"s�%f��"�v��f�FF���FV��RVR�W2��f�L:�2�f��V�B#�u6VRF�R��f�FF���2wVW7G26VR�BwТ������&Vc׷vVFF��r�6�Vr��G���6�W��G�vVFF��r�6�Vw��r2wТF&vWC�%�&�� �&V��&���V�W"��&VfW'&W" �6�74��S�&��Ɩ�R�f�W��FV�2�6V�FW"v�"�ӂ��2�RFW�B�v��FRFW�B�6�f��B��VF�V�G&6���r�v�FW"WW&66R&�V�FVB׆� �7G��S׷�&6�w&�V�C�r63��F2r�&��6�F�s�sG�G�&v&�#�c��sb��#R�r�Т��7fr6�74��S�'r�B��B"f����&���R"f�Wt&���##B#B"7G&��S�&7W'&V�D6���"#��F�7G&��TƖ�V6�'&�V�B"7G&��TƖ�V�����'&�V�B"7G&��Uv�GF�׳'�C�$�d�f""�"'c"""&�"""�'b�D�BF�f�cf��d�B"����7fs����6�S���v�Rs�}zMz�yr
yMymy�z
yBs���6�S���vg"s�$�Wg&�"�v��f�FF���#�t�V���f�FF���w�(ip�����F�b6�74��S�&�B�b#��6�74��S�'FW�Bׇ2FW�B�7F��R�C�"�"#����6�S���v�Rs�}z}y�z�y]z�
yMyMymy�z
yBs���6�S���vg"s�$ƖV�FR�v��f�FF���#�t��f�FF���Ɩ�wТ����F�b6�74��S�&f�W��FV�2�6V�FW"v�"���r�6�ׂ�WF�#��6�FR6�74��S�&f�W��FW�Bׇ2&r�7F��R���2��"&�V�FVB��rFW�B�7F��R�cG'V�6FRF�"��G""F�#�&�G"#��G�V�bv��F�r��wV�FVf��VBs�v��F�r���6F�����&�v��rw�����6�W���vVFF��r�6�Vr��~(
bwТ��6�FS��'WGF����6Ɩ6�ײ����vVFF��r�6�Vrbb�f�vF�"�6Ɨ&�&C��w&�FUFW�B�G�v��F�r���6F�����&�v����G���6�W��G�vVFF��r�6�Vw��Т6�74��S�'�"&r�7F��R���fW#�&r�7F��R�#&�V�FVB��rG&�6�F����6���'2 �F�F�S�$6�� ���7fr6�74��S�'r�B��BFW�B�7F��R�S"f����&���R"f�Wt&���##B#B"7G&��S�&7W'&V�D6���"#��F�7G&��TƖ�V6�'&�V�B"7G&��TƖ�V�����'&�V�B"7G&��Uv�GF�׳'�C�$ӂT�f""�"'c&"""&�"""�'b�$ӂV"""&�&"""�$ӂV"""�&�&"""""����7fs���'WGF�����F�c���F�c���F�c��Р���)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y �
y�y]y=y
y�
yMy]zzMz�
y
y]z�yp�)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y)Y��Т�6��tFD��F�bb���F�b6�74��S�&f��VB��6WB���Sf�W��FV�2�6V�FW"�W7F�g��6V�FW"�B �7G��S׷�&6�w&�V�C�w&v&�����B�r�Т��6Ɩ6�׶R����b�R�F&vWC���R�7W'&V�EF&vWB�6WE6��tFD��Ff�6R�����F�bF�#׶�5%D��w'F�s�v�G"wТ6�74��S�&&r�v��FRr�gV�����r��r��ւճ�f���fW&f��rג�WF�6�F�r�'��#��F�b6�74��S�&f�W��FV�2�6V�FW"�W7F�g��&WGvVV���b��B&�&FW"�"&�&FW"�7F��R�#�ƃ"6�74��S�&f��B�6�&��&�BFW�B׆�FW�B�7F��RӃ#�B�FDwVW7EF�F�W����#��'WGF����6Ɩ6�ײ����6WE6��tFD��Ff�6R��6�74��S�'FW�B�7F��R�3��fW#�FW�B�7F��R�cG&�6�F����6���'2FW�B�'���VF��r����R#�9s��'WGF�����F�c��F�b6�74��S�'��b��R76Rג�B#��wVW7D��F�W'&�"bb�F�b6�74��S�&&r�&VB�S&�&FW"&�&FW"�&VB�FW�B�&VB�cFW�B�6���B��2&�V�FVB��r#�wVW7D��F�W'&�'���F�c�Т�F�c���&V�6�74��S׶�&V�6�7��B���W�����&V��Ɩ�WBf�VS׶�WtwVW7B���W���6��vS׶S��6WD�WtwVW7B��⇲������S�R�F&vWB�f�VWҒ�Т�6V���FW#׶��6�S���v�Rs�}y�z�z�y
y�
y�z�z�y
y�y�s�t�&�RGW��BwТ6�74��S׶��WD6�7�����F�c��F�b6�74��S�&w&�Bw&�B�6��2�"v�2#��F�c���&V�6�74��S׶�&V�6�7��B�V�������&V��Ɩ�WBG�S�&V���"f�VS׶�WtwVW7B�V������6��vS׶S��6WD�WtwVW7B��⇲����V��æR�F&vWB�f�VWҒ��6�74��S׶��WD6�7�F�#�&�G""����F�c��F�c���&V�6�74��S׶�&V�6�7��B����W����&V��Ɩ�WBG�S�'FV�"f�VS׶�WtwVW7B����W���6��vS׶S��6WD�WtwVW7B��⇲�������S�R�F&vWB�f�VWҒ��6�74��S׶��WD6�7�F�#�&�G""����F�c���F�c��F�b6�74��S�&w&�Bw&�B�6��2�"v�2#��F�c���&V�6�74��S׶�&V�6�7��B�GV�G7����&V��Ɩ�WBG�S�&�V�&W""֖�׳�f�VS׶�WtwVW7B�GV�G5�6�V�G���6��vS׶S��6WD�WtwVW7B��⇲����GV�G5�6�V�C�'6T��B�R�F&vWB�f�VR���Ғ��6�74��S׶��WD6�7�F�#�&�G""����F�c��F�c���&V�6�74��S׶�&V�6�7��B�6���G&V�����&V��Ɩ�WBG�S�&�V�&W""֖�׳�f�VS׶�WtwVW7B�6���G&V��6�V�G���6��vS׶S��6WD�WtwVW7B��⇲����6���G&V��6�V�C�'6T��B�R�F&vWB�f�VR���Ғ��6�74��S׶��WD6�7�F�#�&�G""����F�c���F�c��F�c���&V�6�74��S׶�&V�6�7��B�7FGW7����&V���F�b6�74��S�&f�W�v�"#����v6��f�&�VBr�wV�F��rr�vFV6Ɩ�VBu�26��7B����3�•�'WGF���W�׷7�G�S�&'WGF��"��6Ɩ6�ײ����6WD�WtwVW7B��⇲����'7g�7FGW3�7Ғ�Т6�74��S�&f�W����"FW�Bׇ2f��B��VF�V�&�&FW"G&�6�F������&�V�FVB��r �7G��S׷��&6�w&�V�C��WtwVW7B�'7g�7FGW3���3�3���v6��f�&�VBs�r6V6fFcRs�3���vFV6Ɩ�VBs�r6fVc&c"s�r6fff&V"r��r6ffc�r��6���#��WtwVW7B�'7g�7FGW3���3�3���v6��f�&�VBs�r3S�cc�s�3���vFV6Ɩ�VBs�r6VcCCCBs�r6C�ssbr��r6�#�Rr��&�&FW$6���#��WtwVW7B�'7g�7FGW3���3�3���v6��f�&�VBs�r3fVSv#rs�3���vFV6Ɩ�VBs�r6f6VRs�r6f6C3FBr��r6SvSVSBr������3���v6��f�&�VBs�B�6��f�&�VC�3���vFV6Ɩ�VBs�B�FV6Ɩ�VC�B�V�F��wТ��'WGF�����Т��F�c���F�c��F�c���&V�6�74��S׶�&V�6�7��B�F�WF'�����&V��Ɩ�WBf�VS׶�WtwVW7B�F�WF'��&VfW&V�6W7���6��vS׶S��6WD�WtwVW7B��⇲����F�WF'��&VfW&V�6W3�R�F&vWB�f�VWҒ�Т�6V���FW#׶��6�S���v�Rs�}zmy�y}y]z
y��
y�z�z����s�ul:�|:�F&�V��66�W"���w�6�74��S׶��WD6�7�����F�c��F�c���&V�6�74��S׶�&V�6�7��B���W&v�W7����&V��Ɩ�WBf�VS׶�WtwVW7B���W&v�W7���6��vS׶S��6WD�WtwVW7B��⇲������W&v�W3�R�F&vWB�f�VWҒ�Т�6V���FW#׶��6�S���v�Rs�}y
y-y]ymy�y��
y-y�y]y�y����s�t�����v�WFV����w�6�74��S׶��WD6�7�����F�c��F�c���&V�6�74��S׶�&V�6�7��B���FW7����&V���FW�F&Vf�VS׶�WtwVW7B���FW7���6��vS׶S��6WD�WtwVW7B��⇲������FW3�R�F&vWB�f�VWҒ��&�w3׳'�6�74��S׶��WD6�2�r&W6��R����Rw�����F�c���F�c��F�b6�74��S�&f�W�v�2��b��B&�&FW"�B&�&FW"�7F��R�&r�7F��R�S#��'WGF����6Ɩ6�ײ����6WE6��tFD��Ff�6R�Т6�74��S�&f�W����2&�&FW"&�&FW"�7F��R�#FW�B�7F��R�cFW�B�6�f��B��VF�V�G&6���r�v�FR��fW#�&r�7F��R�G&�6�F����6���'2#��B�6�6V�Т��'WGF����'WGF����6Ɩ6�׶��F�TFDwVW7G�F�6&�VC׷6f��twVW7GТ6�74��S�&f�W����2FW�B�v��FRFW�B�6�f��B��VF�V�G&6���r�v�FRG&�6�F����6���'2F�6&�VC��6�G��c �7G��S׷�&6�w&�V�C�6f��twVW7C�r6�#�Rs�r63��F2r����6f��twVW7B�B�6f��r�B�6fWТ
