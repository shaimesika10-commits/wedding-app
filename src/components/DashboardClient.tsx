'use client'
// ============================================================
//  GrandInvite – Dashboard Client Component
//  טאב 1: ניהול אורחים | טאב 2: ישיבה | טאב 3: עריכה
//  טאב 4: תצוגה | טאב 5: הגדרות
//  src/components/DashboardClient.tsx
// ============================================================
import { useState, useMemo, Fragment, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Guest, Wedding, EventSchedule } from '@/types'
import type { Locale } from '@/lib/i18n'

type RSVPStatus = 'all' | 'confirmed' | 'declined' | 'pending'
type Tab = 'guests' | 'seating' | 'edit' | 'preview' | 'settings'

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
  const [copiedDashboard, setCopiedDashboard] = useState(false)

  // ════════════════════════════════════════
const handleDashboardShare = async () => {
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/${locale}/${wedding.slug ?? ''}`
      : `/${locale}/${wedding.slug ?? ''}`
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: wedding.bride_name + ' & ' + wedding.groom_name,
          url,
        })
      } catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setCopiedDashboard(true)
        setTimeout(() => setCopiedDashboard(false), 2000)
      } catch { /* fallback */ }
    }
  }

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
  const [mounted, setMounted] = useState(false)

  // ════════════════════════════════════════
  // TAB: SEATING
  // ════════════════════════════════════════
  const [tableInputs, setTableInputs] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {}
    guests.forEach(g => {
      if (g.table_number != null) m[g.id] = String(g.table_number)
    })
    return m
  })
  const [savingTable, setSavingTable] = useState<string | null>(null)

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
  const [brunchEnabled, setBrunchEnabled] = useState<boolean>(!!brunchEvent)
  const [brunchEventId, setBrunchEventId] = useState<string | undefined>(brunchEvent?.id)
  const [togglingBrunch, setTogglingBrunch] = useState(false)
  const [newEventName, setNewEventName] = useState('')
  const [newEventDate, setNewEventDate] = useState('')
  const [newEventTime, setNewEventTime] = useState('')
  const [addingEvent, setAddingEvent] = useState(false)

  useEffect(() => {
    setBrunchEnabled(!!brunchEvent)
    setBrunchEventId(brunchEvent?.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wedding.event_schedule?.length])

  useEffect(() => { setMounted(true) }, [])

  // ════════════════════════════════════════
  // TAB 5 — SETTINGS (הגדרות)
  // ════════════════════════════════════════
  const [isHidden, setIsHidden] = useState(wedding.is_hidden ?? false)
  const [savingVisibility, setSavingVisibility] = useState(false)

  const [pinInput, setPinInput] = useState((wedding as any).guest_pin ?? '')
  const [savingPin, setSavingPin] = useState(false)
  const [pinSuccess, setPinSuccess] = useState(false)

  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteConfirmUrl, setDeleteConfirmUrl] = useState('')

  const [fontStyle, setFontStyle] = useState((wedding as any).font_style ?? 'cormorant')
  const [layoutStyle, setLayoutStyle] = useState((wedding as any).layout_style ?? 'centered')
  const [savingDesign, setSavingDesign] = useState(false)
  const [designSuccess, setDesignSuccess] = useState(false)

  // ── visibility handler ──
  const handleToggleVisibility = async () => {
    if (savingVisibility) return
    const next = !isHidden
    setIsHidden(next)
    setSavingVisibility(true)
    try {
      await fetch('/api/wedding/visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_hidden: next }),
      })
      router.refresh()
    } catch {
      setIsHidden(!next)
    } finally {
      setSavingVisibility(false)
    }
  }

  // ── PIN handler ──
  const handleSavePin = async () => {
    if (savingPin) return
    setSavingPin(true)
    try {
      const pin = pinInput.trim() || null
      await fetch('/api/wedding/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      setPinSuccess(true)
      router.refresh()
      setTimeout(() => setPinSuccess(false), 3000)
    } finally {
      setSavingPin(false)
    }
  }

  // ── delete request handler ──
  const handleRequestDelete = async () => {
    const msg = locale === 'he'
      ? 'האם אתה בטוח? נשלח אימייל לאישור מחיקת החשבון.'
      : locale === 'fr'
      ? 'Ãtes-vous sÃ»r ? Un email de confirmation sera envoyé.'
      : 'Are you sure? A confirmation email will be sent.'
    if (!confirm(msg)) return
    setDeleteLoading(true)
    try {
      const res = await fetch('/api/wedding/delete-request', { method: 'POST' })
      const data = await res.json()
      if (data.confirmUrl) setDeleteConfirmUrl(data.confirmUrl)
    } finally {
      setDeleteLoading(false)
    }
  }

  // ── design handler ──
  const handleSaveDesign = async () => {
    if (savingDesign) return
    setSavingDesign(true)
    try {
      await fetch('/api/weddings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: wedding.id, font_style: fontStyle, layout_style: layoutStyle }),
      })
      setDesignSuccess(true)
      router.refresh()
      setTimeout(() => setDesignSuccess(false), 3000)
    } finally {
      setSavingDesign(false)
    }
  }

  // ════════════════════════════════════════
  // GUESTS helpers
  // ════════════════════════════════════════
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
    const csv = [headers,...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
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
      case 'declined': return <span className="badge-declined">✗ {t.declined}</span>
      default: return <span className="badge-pending">… {t.pending}</span>
    }
  }

  const handleSaveEdit = async () => {
    setSavingEdit(true)
    setEditError('')
    setEditSuccess(false)
    try {
      const res = await fetch('/api/weddings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: wedding.id, ...editForm, content_locale: locale }),
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

  const handleToggleBrunch = async () => {
    if (togglingBrunch) return
    const nextEnabled = !brunchEnabled
    setBrunchEnabled(nextEnabled)
    setTogglingBrunch(true)
    try {
      if (nextEnabled) {
        const [by, bm, bd] = wedding.wedding_date.split('-').map(Number)
        const brunchDate = new Date(by, bm - 1, bd + 1)
        const dateStr = `${brunchDate.getFullYear()}-${String(brunchDate.getMonth()+1).padStart(2,'0')}-${String(brunchDate.getDate()).padStart(2,'0')}`
        const name = locale==='he'?"בראנץ' למחרת":locale==='fr'?'Brunch du lendemain':'Morning-after Brunch'
        const res = await fetch('/api/weddings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wedding_id: wedding.id, event_name: name, event_date: dateStr, start_time: '11:00', end_time: '14:00', sort_order: 99 }),
        })
        if (res.ok) {
          const data = await res.json()
          setBrunchEventId(data.event?.id)
          router.refresh()
        } else {
          setBrunchEnabled(false)
        }
      } else {
        if (!brunchEventId) { setBrunchEnabled(false); return }
        const res = await fetch(`/api/weddings?event_id=${brunchEventId}&wedding_id=${wedding.id}`, { method: 'DELETE' })
        if (res.ok) {
          setBrunchEventId(undefined)
          router.refresh()
        } else {
          setBrunchEnabled(true)
        }
      }
    } catch {
      setBrunchEnabled(!nextEnabled)
    } finally {
      setTogglingBrunch(false)
    }
  }

  const handleAddScheduleEvent = async () => {
    if (!newEventName || !newEventDate || !newEventTime) return
    setAddingEvent(true)
    try {
      const res = await fetch('/api/weddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wedding_id: wedding.id,
          event_name: newEventName,
          event_date: newEventDate,
          start_time: newEventTime,
          sort_order: schedule.length + 1
        })
      })
      if (res.ok) {
        const data = await res.json()
        setSchedule(prev => [...prev, data.event])
        setNewEventName('')
        setNewEventDate('')
        setNewEventTime('')
      }
    } finally {
      setAddingEvent(false)
    }
  }

  const handleDeleteScheduleEvent = async (eventId: string) => {
    const url = `/api/weddings?` + 'event_id=' + eventId + '&' + 'wedding_id=' + wedding.id
    const res = await fetch(url, { method: 'DELETE' })
    if (res.ok) {
      setSchedule(prev => prev.filter(e => e.id !== eventId))
    }
  }

  const inputCls = 'w-full px-4 py-3 border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors rounded-xl'
  const labelCls = 'block text-xs text-stone-500 uppercase tracking-wider mb-1.5 font-medium'
  const isRTL = locale === 'he'

  const invitationUrl = mounted
    ? `${window.location.origin}/${locale}/${wedding.slug ?? ''}`
    : `/${locale}/${wedding.slug ?? ''}`

  const shareText = locale === 'he'
    ? `אנחנו שמחים להזמין אתכם לחתונה של ${wedding.bride_name} ו${wedding.groom_name}! ${invitationUrl}`
    : locale === 'fr'
    ? `Nous avons le plaisir de vous inviter au mariage de ${wedding.bride_name} & ${wedding.groom_name} ! ${invitationUrl}`
    : `We are delighted to invite you to the wedding of ${wedding.bride_name} & ${wedding.groom_name}! ${invitationUrl}`

  const emailSubject = locale === 'he'
    ? `הזמנה לחתונה - ${wedding.bride_name} ו${wedding.groom_name}`
    : locale === 'fr'
    ? `Invitation au mariage de ${wedding.bride_name} & ${wedding.groom_name}`
    : `Wedding invitation - ${wedding.bride_name} & ${wedding.groom_name}`

  return (
    <div>
      {/* ── Tab Bar ── */}
      <div className="flex border-b border-stone-200 mb-6 md:mb-8 gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden -mx-4 md:mx-0 px-4 md:px-0">
        {([
          { key:'guests', label: locale==='he'?'אורחים':locale==='fr'?'Invités':'Guests' },
          { key:'seating', label: locale==='he'?'ישיבה':locale==='fr'?'Tables':'Seating' },
          { key:'edit', label: locale==='he'?'עריכה':locale==='fr'?'Modifier':'Edit' },
          { key:'preview', label: locale==='he'?'תצוגה':locale==='fr'?'Aperçu':'Preview' },
          { key:'settings', label: locale==='he'?'הגדרות':locale==='fr'?'Paramètres':'Settings' },
        ] as const).map(tab => (
          <button key={tab.key}{/* ── Dashboard Header ── */}
      <div className="flex items-center justify-between mb-4">
        <p className="font-cormorant text-lg text-stone-600 tracking-wide">
          {wedding.bride_name} {'&'} {wedding.groom_name}
        </p>
        <button
          onClick={handleDashboardShare}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#c9a84c] text-[#c9a84c] text-xs tracking-widest uppercase font-light hover:bg-[#c9a84c] hover:text-white transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          {copiedDashboard
            ? (locale === 'fr' ? 'Copié !' : locale === 'he' ? 'הועתק!' : 'Copied!')
            : (locale === 'fr' ? "Partager" : locale === 'he' ? 'שתף' : 'Share')}
        </button>
      </div>
       onClick={() => setActiveTab(tab.key)}
            className="flex-shrink-0 px-4 md:px-6 py-3 text-sm font-medium tracking-wide transition-all relative whitespace-nowrap"
            style={{ color: activeTab===tab.key ? '#c9a84c' : '#a8a29e' }}
          >
            {tab.label}
            {activeTab===tab.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c9a84c]" />}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          TAB: GUESTS
          ══════════════════════════════════════════════ */}
      {activeTab === 'guests' && (
        <div>
          <div className="flex flex-wrap gap-3 md:gap-4 items-center justify-between mb-6">
            <div className="relative w-full md:flex-1 md:min-w-[200px] md:max-w-sm">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search}
                className="w-full pl-10 pr-4 py-2 border border-stone-200 bg-white text-stone-700 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors" />
            </div>
            <div className="flex gap-3 flex-wrap">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as RSVPStatus)}
                className="px-4 py-2 border border-stone-200 bg-white text-stone-600 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors">
                <option value="all">{t.allStatuses}</option>
                <option value="confirmed">{t.confirmed}</option>
                <option value="declined">{t.declined}</option>
                <option value="pending">{t.pending}</option>
              </select>
              <button onClick={exportCSV} className="btn-gold flex items-center gap-2 text-xs">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
                </svg>
                {t.exportCSV}
              </button>
              <button onClick={() => { setShowAddModal(true); setGuestModalError(''); setNewGuest({...emptyNewGuest}) }}
                className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white text-xs tracking-wide hover:bg-stone-700 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                </svg>
                {t.addGuest}
              </button>
            </div>
          </div>

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
                          {guest.adults_count > 0 && <span>{guest.adults_count} מב'</span>}
                          {guest.children_count > 0 && <span className="ml-2">{guest.children_count} יל'</span>}
                        </td>
                        <td className="px-4 py-4">
                          {guest.dietary_preferences
                            ? <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1">{guest.dietary_preferences}</span>
                            : <span className="text-stone-200">—</span>}
                        </td>
                        <td className="px-4 py-4 max-wl[200px]">
                          {guest.notes
                            ? <p className="text-xs text-stone-500 truncate" title={guest.notes}>{guest.notes}</p>
                            : <span className="text-stone-200">—</span>}
                        </td>
                        <td className="px-4 py-4 text-xs text-stone-400">
                          {guest.rsvp_submitted_at
                            ? new Date(guest.rsvp_submitted_at).toLocaleDateString(locale==='he'?'he-IL':locale==='fr'?'fr-FR':'en-GB')
                            : '—'}
                        </td>
                        <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                          <button onClick={() => handleDeleteGuest(guest.id)} disabled={deletingId===guest.id}
                            className="text-stone-300 hover:text-red-400 transition-colors p-1 disabled:opacity-40" title={t.deleteGuest}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
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
          <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm mb-8">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50">
                    <th className="px-5 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider text-left">{locale==='he'?'שם':locale==='fr'?'Nom':'Name'}</th>
                    <th className="px-5 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider text-left">{locale==='he'?'סטטוס':locale==='fr'?'Statut':'Status'}</th>
                    <th className="px-5 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider text-left">{locale==='he'?'סה״כ':locale==='fr'?'Total':'Total'}</th>
                    <th className="px-5 py-3 text-xs font-medium text-stone-400 uppercase tracking-wider text-left w-36">{locale==='he'?'מספר שולחן':locale==='fr'?'N° de table':'Table #'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {guests.filter(g => g.rsvp_status === 'confirmed').map(g => (
                    <tr key={g.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-stone-800">{g.name}</td>
                      <td className="px-5 py-3">{statusBadge(g.rsvp_status)}</td>
                      <td className="px-5 py-3 text-stone-500">{g.adults_count + g.children_count}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <input type="number" min={1} placeholder="—"
                            value={tableInputs[g.id] ?? (g.table_number != null ? String(g.table_number) : '')}
                            onChange={e => setTableInputs(prev => ({ ...prev, [g.id]: e.target.value }))}
                            onBlur={e => handleAssignTable(g.id, e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleAssignTable(g.id, (e.target as HTMLInputElement).value) }}
                            className="w-20 px-3 py-1.5 border border-stone-200 bg-stone-50 text-sm text-center focus:outline-none focus:border-[#c9a84c] rounded-lg transition-colors" dir="ltr" />
                          {savingTable === g.id && (
                            <svg className="w-4 h-4 text-stone-300 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {guests.filter(g => g.rsvp_status === 'confirmed').length === 0 && (
              <div className="px-5 py-12 text-center text-stone-400 text-sm">
                {locale==='he'?'אין אורחים שאישרו הגעה עדיין':locale==='fr'?"Aucun invité confirmé pour l'instant":'No confirmed guests yet'}
              </div>
            )}
            <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 text-xs text-stone-400 text-right">
              {guests.filter(g => g.rsvp_status === 'confirmed' && g.table_number != null).length}
              {' / '}
              {guests.filter(g => g.rsvp_status === 'confirmed').length}
              {' '}
              {locale==='he'?'הוקצו לשולחנות':locale==='fr'?'assignés à une table':'assigned to tables'}
            </div>
          </div>

          {/* Table overview */}
          {(() => {
            const confirmed = guests.filter(g => g.rsvp_status === 'confirmed' && g.table_number != null)
            if (confirmed.length === 0) return null
            const byTable: Record<number, Guest[]> = {}
            confirmed.forEach(g => {
              const tNum = g.table_number!
              if (!byTable[tNum]) byTable[tNum] = []
              byTable[tNum].push(g)
            })
            const tableNumbers = Object.keys(byTable).map(Number).sort((a, b) => a - b)
            return (
              <div>
                <h3 className="font-cormorant text-xl text-stone-700 mb-4">
                  {locale==='he'?'תצוגה לפי שולחן':locale==='fr'?'Vue par table':'View by Table'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tableNumbers.map(tableNum => {
                    const tableGuests = byTable[tableNum]
                    const total = tableGuests.reduce((sum, g) => sum + g.adults_count + g.children_count, 0)
                    return (
                      <div key={tableNum} className="bg-white border border-stone-100 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-cormorant text-lg text-stone-700">{locale==='he'?'שולחן':locale==='fr'?'Table':'Table'} {tableNum}</span>
                          <span className="text-xs text-stone-400 bg-stone-50 px-2 py-1 rounded-full">{total} {locale==='he'?'אורחים':locale==='fr'?'invités':'guests'}</span>
                        </div>
                        <ul className="space-y-1.5">
                          {tableGuests.map(g => (
                            <li key={g.id} className="text-sm text-stone-600 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] flex-shrink-0"/>
                              <span className="truncate">{g.name}</span>
                              {(g.adults_count + g.children_count) > 1 && (
                                <span className="text-xs text-stone-400 flex-shrink-0">{g.adults_count + g.children_count}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: EDIT
          ══════════════════════════════════════════════ */}
      {activeTab === 'edit' && (
        <div dir={isRTL?'rtl':'ltr'} className="max-w-2xl space-y-8">
          {editError && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{editError}</div>}
          {editSuccess && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
              </svg>
              {locale==='he'?'נשמר בהצלחה!':locale==='fr'?'Enregistré avec succès !':'Saved successfully!'}
            </div>
          )}
          <div>
            <h3 className="font-cormorant text-xl text-stone-700 mb-4 pb-2 border-b border-stone-100">
              {locale==='he'?'הזוג':locale==='fr'?'Les mariés':'The Couple'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{locale==='he'?'שם הכלה':locale==='fr'?"Prénom de la mariée":"Bride's name"}</label>
                <input value={editForm.bride_name} onChange={e=>setEditForm(p=>({...p,bride_name:e.target.value}))} className={inputCls}/>
              </div>
              <div>
                <label className={labelCls}>{locale==='he'?'שם החתן':locale==='fr'?"Prénom du marié":"Groom's name"}</label>
                <input value={editForm.groom_name} onChange={e=>setEditForm(p=>({...p,groom_name:e.target.value}))} className={inputCls}/>
              </div>
            </div>
            <div className="mt-4">
              <label className={labelCls}>{locale==='he'?'תאריך החתונה':locale==='fr'?'Date du mariage':'Wedding date'}</label>
              <input type="date" value={editForm.wedding_date} onChange={e=>setEditForm(p=>({...p,wedding_date:e.target.value}))} dir="ltr" className={inputCls}/>
            </div>
          </div>
          <div>
            <h3 className="font-cormorant text-xl text-stone-700 mb-4 pb-2 border-b border-stone-100">
              {locale==='he'?'מקום האירוע':locale==='fr'?'Le lieu':'Venue'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>{locale==='he'?'שם האולם':locale==='fr'?'Nom du lieu':'Venue name'}</label>
                <input value={editForm.venue_name} onChange={e=>setEditForm(p=>({...p,venue_name:e.target.value}))} className={inputCls} placeholder={locale==='he'?'אולם אירועים':'Château de...'}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{locale==='he'?'עיר':locale==='fr'?'Ville':'City'}</label>
                  <input value={editForm.venue_city} onChange={e=>setEditForm(p=>({...p,venue_city:e.target.value}))} className={inputCls}/>
                </div>
                <div>
                  <label className={labelCls}>{locale==='he'?'כתובת':locale==='fr'?'Adresse':'Address'}</label>
                  <input value={editForm.venue_address} onChange={e=>setEditForm(p=>({...p,venue_address:e.target.value}))} className={inputCls}/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Google Maps URL</label>
                  <input value={editForm.google_maps_url} onChange={e=>setEditForm(p=>({...p,google_maps_url:e.target.value}))} className={inputCls} dir="ltr" placeholder="https://maps.google.com/..."/>
                </div>
                <div>
                  <label className={labelCls}>Waze URL</label>
                  <input value={editForm.waze_url} onChange={e=>setEditForm(p=>({...p,waze_url:e.target.value}))} className={inputCls} dir="ltr" placeholder="https://waze.com/..."/>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-cormorant text-xl text-stone-700 mb-4 pb-2 border-b border-stone-100">
              {locale==='he'?'תוכן ההזמנה':locale==='fr'?"Contenu de l'invitation":'Invitation Content'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>{locale==='he'?'שפה ראשית':locale==='fr'?'Langue principale':'Main language'}</label>
                <div className="flex gap-2">
                  {(['fr','he','en'] as const).map(lang=>(
                    <button key={lang} type="button" onClick={()=>setEditForm(p=>({...p,locale:lang}))}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all"
                      style={{
                        background:editForm.locale===lang?'#c9a84c':'#faf8f5',
                        color:editForm.locale===lang?'#fff':'#78716c',
                        borderColor:editForm.locale===lang?'#c9a84c':'#e7e5e4',
                      }}>
                      {lang==='fr'?'Français':lang==='he'?'עברית':'English'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>{locale==='he'?'הודעת פתיחה':locale==='fr'?'Message de bienvenue':'Welcome message'}</label>
                <textarea value={editForm.welcome_message} onChange={e=>setEditForm(p=>({...p,welcome_message:e.target.value}))} rows={4} dir="auto" className={inputCls+' resize-none'}/>
              </div>
              <div>
                <label className={labelCls}>{locale==='he'?'תאריך אחרון לאישור':locale==='fr'?'Date limite RSVP':'RSVP deadline'}</label>
                <input type="date" value={editForm.rsvp_deadline} onChange={e=>setEditForm(p=>({...p,rsvp_deadline:e.target.value}))} dir="ltr" className={inputCls}/>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-cormorant text-xl text-stone-700 mb-4 pb-2 border-b border-stone-100">
              {locale==='he'?'לו"ז האירוע':locale==='fr'?"Programme de l'événement":'Event Schedule'}
            </h3>
            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
              <div>
                <p className="text-sm font-medium text-stone-700">
                  {locale==='he'?"בראנץ' למחרת":locale==='fr'?'Brunch du lendemain':'Morning-after Brunch'}
                </p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {locale==='he'?"הוסף בראנץ' ביום שאחרי החתונה (11:00–14:00)"
                    :locale==='fr'?"Ajouter un brunch le lendemain du mariage (11h–14h)"
                    :'Add a brunch event the day after the wedding (11am–2pm)'}
                </p>
              </div>
              <button type="button" onClick={handleToggleBrunch} disabled={togglingBrunch}
                aria-pressed={brunchEnabled}
                className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none disabled:opacity-60 flex-shrink-0"
                style={{ background: brunchEnabled ? '#c9a84c' : '#d4d0cb' }}
              >
                <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200"
                  style={{ transform: brunchEnabled ? 'translateX(22px)' : 'translateX(2px)' }} />
              </button>
            </div>
            {schedule.length > 0 && (
              <div className="mt-3 space-y-2">
                {schedule.map(ev => (
                  <div key={ev.id} className="flex items-center justify-between py-2 px-3 bg-white border border-stone-100 rounded-lg text-sm">
                    <span className="text-stone-700">{ev.event_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-400">{ev.start_time?.slice(0,5)}</span>
                      <button onClick={() => handleDeleteScheduleEvent(ev.id)} className="text-red-300 hover:text-red-500 text-xs leading-none px-1 py-0.5 rounded hover:bg-red-50">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 space-y-2">
              <div className="flex gap-2 flex-wrap">
                <input value={newEventName} onChange={e => setNewEventName(e.target.value)} placeholder={locale === 'he' ? 'שם אירוע' : locale === 'fr' ? 'Nom' : 'Event name'} className="flex-1 min-w-0 text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:border-stone-400 bg-stone-50" />
                <input type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:border-stone-400 bg-stone-50" />
                <input type="time" value={newEventTime} onChange={e => setNewEventTime(e.target.value)} className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:border-stone-400 bg-stone-50" />
              </div>
              <button onClick={handleAddScheduleEvent} disabled={addingEvent || !newEventName || !newEventDate || !newEventTime} className="w-full py-2 text-sm border border-dashed border-stone-300 rounded-lg text-stone-500 hover:border-stone-400 hover:text-stone-700 disabled:opacity-40 transition-colors">
                {addingEvent ? '…' : (locale === 'he' ? '+ הוסף אירוע' : locale === 'fr' ? '+ Ajouter un événement' : '+ Add event')}
              </button>
            </div>
          </div>
          <div className="pt-2">
            <button onClick={handleSaveEdit} disabled={savingEdit}
              className="px-8 py-3.5 text-white text-sm font-medium tracking-wider uppercase rounded-xl transition-all disabled:opacity-60"
              style={{ background: savingEdit?'#a8a29e':'#c9a84c', boxShadow: savingEdit?'none':'0 4px 14px rgba(201,168,76,0.25)' }}>
              {savingEdit ? (locale==='he'?'שומר...':locale==='fr'?'Enregistrement...':'Saving...') : (locale==='he'?'שמור שינויים':locale==='fr'?'Enregistrer les modifications':'Save changes')}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: PREVIEW
          ══════════════════════════════════════════════ */}
      {activeTab === 'preview' && (
        <div className="text-center py-8">
          <p className="text-stone-400 text-sm mb-6">
            {locale==='he'?'לצפייה בהזמנה כפי שהאורחים רואים אותה':locale==='fr'?"Voir l'invitation telle que les invités la voient":'See the invitation as guests see it'}
          </p>
          <a href={wedding.slug ? `/${locale}/${wedding.slug}` : '#'} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-white text-sm font-medium tracking-wider uppercase rounded-xl"
            style={{ background:'#c9a84c', boxShadow:'0 4px 14px rgba(201,168,76,0.25)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
            {locale==='he'?'פתח הזמנה':locale==='fr'?"Ouvrir l'invitation":'Open invitation'} ↗
          </a>

          {/* Share buttons */}
          <div className="flex gap-3 justify-center mt-6 flex-wrap">
            <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
              style={{ background: '#25D366' }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </a>
            <a href={`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(shareText)}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
              style={{ background: '#1c1917' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              {locale==='he'?'שלח באימייל':locale==='fr'?"Partager par e-mail":'Share by email'}
            </a>
          </div>

          <div className="mt-6">
            <p className="text-xs text-stone-400 mb-2">
              {locale==='he'?'קישור ההזמנה':locale==='fr'?"Lien de l'invitation":'Invitation link'}
            </p>
            <div className="flex items-center gap-2 max-w-sm mx-auto">
              <code className="flex-1 text-xs bg-stone-100 px-3 py-2 rounded-lg text-stone-600 truncate" dir="ltr">
                {invitationUrl}
              </code>
              <button
                onClick={() => wedding.slug && navigator.clipboard?.writeText(invitationUrl)}
                className="p-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors" title="Copy">
                <svg className="w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: SETTINGS
          ══════════════════════════════════════════════ */}
      {activeTab === 'settings' && (
        <div dir={isRTL?'rtl':'ltr'} className="max-w-2xl space-y-8">

          {/* ── Visibility ── */}
          <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
            <h3 className="font-cormorant text-xl text-stone-800 mb-1">
              {locale==='he'?'נראות ההזמנה':locale==='fr'?"Visibilité de l'invitation":'Invitation visibility'}
            </h3>
            <p className="text-xs text-stone-400 mb-5">
              {locale==='he'?'כאשר ההזמנה מוסתרת, האורחים לא יוכלו לגשת אליה'
                :locale==='fr'?"Quand l'invitation est cachée, les invités ne peuvent pas y accéder"
                :'When hidden, guests cannot access the invitation page'}
            </p>
            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-stone-700">
                  {isHidden
                    ? (locale==='he'?'ההזמנה מוסתרת':locale==='fr'?'Invitation cachée':'Invitation hidden')
                    : (locale==='he'?'ההזמנה פומבית':locale==='fr'?'Invitation publique':'Invitation public')}
                </p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {isHidden
                    ? (locale==='he'?'לחץ להפוך לציבורית':locale==='fr'?'Cliquer pour rendre publique':'Click to make public')
                    : (locale==='he'?'לחץ להסתיר':locale==='fr'?'Cliquer pour cacher':'Click to hide')}
                </p>
              </div>
              <button type="button" onClick={handleToggleVisibility} disabled={savingVisibility}
                className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none disabled:opacity-60"
                style={{ background: !isHidden ? '#c9a84c' : '#d4d0cb' }}>
                <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200"
                  style={{ transform: !isHidden ? 'translateX(22px)' : 'translateX(2px)' }} />
              </button>
            </div>
          </div>

          {/* ── Guest PIN ── */}
          <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
            <h3 className="font-cormorant text-xl text-stone-800 mb-1">
              {locale==='he'?'הגנת PIN לאורחים':locale==='fr'?'PIN de protection':'Guest PIN protection'}
            </h3>
            <p className="text-xs text-stone-400 mb-5">
              {locale==='he'?'אורחים יצטרכו להזין קוד 4 ספרות כדי לגשת להזמנה. השאר ריק לביטול ה-PIN.'
                :locale==='fr'?"Les invités devront saisir un code à 4 chiffres. Laisser vide pour désactiver."
                :'Guests must enter a 4-digit code to view the invitation. Leave empty to disable.'}
            </p>
            {pinSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs px-3 py-2 rounded-lg mb-3">
                {locale==='he'?'ה-PIN עודכן בהצלחה':locale==='fr'?'PIN mis à jour':'PIN updated successfully'}
              </div>
            )}
            <div className="flex gap-3">
              <input type="text" inputMode="numeric" pattern="\d{4}" maxLength={4} value={pinInput}
                onChange={e => setPinInput(e.target.value.replace(/\D/g,'').slice(0,4))}
                placeholder="1234" dir="ltr"
                className="w-32 px-4 py-3 border border-stone-200 bg-stone-50 text-center text-lg tracking-[0.5em] font-mono focus:outline-none focus:border-[#c9a84c] rounded-xl transition-colors" />
              <button onClick={handleSavePin} disabled={savingPin}
                className="px-6 py-3 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-60"
                style={{ background: savingPin?'#a8a29e':'#c9a84c' }}>
                {savingPin
                  ? (locale==='he'?'שומר...':locale==='fr'?'Enregistrement...':'Saving...')
                  : (locale==='he'?'שמור PIN':locale==='fr'?'Enregistrer':'Save PIN')}
              </button>
            </div>
          </div>

          {/* ── Design Panel ── */}
          <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
            <h3 className="font-cormorant text-xl text-stone-800 mb-1">
              {locale==='he'?'עיצוב ההזמנה':locale==='fr'?"Design de l'invitation":'Invitation design'}
            </h3>
            <p className="text-xs text-stone-400 mb-5">
              {locale==='he'?'בחר גופן ופריסה להזמנה שלך'
                :locale==='fr'?"Choisissez la police et la mise en page"
                :'Choose font style and layout for your invitation'}
            </p>
            {designSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs px-3 py-2 rounded-lg mb-4">
                {locale==='he'?'העיצוב עודכן':locale==='fr'?'Design mis à jour':'Design updated'}
              </div>
            )}
            <div className="space-y-5">
              <div>
                <label className={labelCls}>{locale==='he'?'גופן':locale==='fr'?'Police':'Font'}</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'cormorant', label: 'Cormorant', preview: 'Aa' },
                    { value: 'playfair', label: 'Playfair', preview: 'Aa' },
                    { value: 'libre', label: 'Libre Baskerville', preview: 'Aa' },
                  ].map(f => (
                    <button key={f.value} onClick={() => setFontStyle(f.value)}
                      className="p-3 border rounded-xl text-center transition-all"
                      style={{
                        borderColor: fontStyle===f.value ? '#c9a84c' : '#e7e5e4',
                        background: fontStyle===f.value ? '#fdf6e3' : '#fafaf9',
                      }}>
                      <p className="text-2xl mb-1" style={{ fontFamily: f.value === 'cormorant' ? "'Cormorant Garamond', serif" : f.value === 'playfair' ? "'Playfair Display', serif" : "'Libre Baskerville', serif" }}>{f.preview}</p>
                      <p className="text-xs text-stone-500">{f.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>{locale==='he'?'פריסה':locale==='fr'?'Mise en page':'Layout'}</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'centered', label: locale==='he'?'מרכז':locale==='fr'?'Centré':'Centered' },
                    { value: 'elegant', label: locale==='he'?'אלגנטי':locale==='fr'?'Ãlégant':'Elegant' },
                    { value: 'minimal', label: locale==='he'?'מינימליסטי':locale==='fr'?'Minimaliste':'Minimal' },
                  ].map(l => (
                    <button key={l.value} onClick={() => setLayoutStyle(l.value)}
                      className="p-4 border rounded-xl text-center transition-all"
                      style={{
                        borderColor: layoutStyle===l.value ? '#c9a84c' : '#e7e5e4',
                        background: layoutStyle===l.value ? '#fdf6e3' : '#fafaf9',
                      }}>
                      <div className="flex flex-col gap-1 mb-2 items-center">
                        {l.value === 'centered' && <>
                          <div className="w-16 h-1 bg-stone-300 rounded" />
                          <div className="w-10 h-1 bg-stone-200 rounded" />
                          <div className="w-14 h-1 bg-stone-200 rounded" />
                        </>}
                        {l.value === 'elegant' && <>
                          <div className="w-4 h-4 border border-stone-300 rounded-full" />
                          <div className="w-16 h-1 bg-stone-300 rounded" />
                          <div className="w-12 h-1 bg-stone-200 rounded" />
                        </>}
                        {l.value === 'minimal' && <>
                          <div className="w-16 h-px bg-stone-300" />
                          <div className="w-16 h-1 bg-stone-300 rounded mt-1" />
                          <div className="w-16 h-px bg-stone-300 mt-1" />
                        </>}
                      </div>
                      <p className="text-xs text-stone-500">{l.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleSaveDesign} disabled={savingDesign}
                className="px-8 py-3 text-white text-sm font-medium tracking-wider uppercase rounded-xl transition-all disabled:opacity-60"
                style={{ background: savingDesign?'#a8a29e':'#c9a84c' }}>
                {savingDesign
                  ? (locale==='he'?'שומר...':locale==='fr'?'Enregistrement...':'Saving...')
                  : (locale==='he'?'שמור עיצוב':locale==='fr'?'Enregistrer le design':'Save design')}
              </button>
            </div>
          </div>

          {/* ── Danger Zone ── */}
          <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm">
            <h3 className="font-cormorant text-xl text-red-700 mb-1">
              {locale==='he'?'מחיקת חשבון':locale==='fr'?'Supprimer le compte':'Delete account'}
            </h3>
            <p className="text-xs text-stone-400 mb-5">
              {locale==='he'?'מחיקת החשבון תמחק את ההזמנה ואת כל המידע על האורחים. פעולה זו בלתי הפיכה.'
                :locale==='fr'?"La suppression effacera définitivement l'invitation et toutes les données invités."
                :'Deletes the invitation and all guest data permanently. This cannot be undone.'}
            </p>
            {deleteConfirmUrl ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800 font-medium mb-2">
                  {locale==='he'?'קישור אישור מחיקה נשלח לאימייל שלך. לחילופין, לחץ כאן:'
                    :locale==='fr'?"Un lien de confirmation a été envoyé à votre email. Alternativement :"
                    :'A confirmation link was sent to your email. Alternatively:'}
                </p>
                <a href={deleteConfirmUrl} className="text-xs text-red-600 underline break-all" dir="ltr">{deleteConfirmUrl}</a>
              </div>
            ) : (
              <button onClick={handleRequestDelete} disabled={deleteLoading}
                className="flex items-center gap-2 px-6 py-3 border-2 border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-all disabled:opacity-60">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                {deleteLoading
                  ? (locale==='he'?'שולח...':locale==='fr'?'Envoi...':'Sending...')
                  : (locale==='he'?'בקש מחיקת חשבון':locale==='fr'?'Demander la suppression':'Request account deletion')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          מודאל הוספת אורח
          ══════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background:'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target===e.currentTarget) setShowAddModal(false) }}>
          <div dir={isRTL?'rtl':'ltr'} className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-cormorant text-xl text-stone-800">{t.addGuestTitle}</h2>
              <button onClick={()=>setShowAddModal(false)} className="text-stone-300 hover:text-stone-600 transition-colors text-2xl leading-none">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {guestModalError && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-lg">{guestModalError}</div>}
              <div>
                <label className={labelCls}>{t.name} *</label>
                <input value={newGuest.name} onChange={e=>setNewGuest(p=>({...p,name:e.target.value}))}
                  placeholder={locale==='he'?'ישראל ישראלי':'Marie Dupont'} dir="auto" className={inputCls}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{t.email}</label>
                  <input type="email" value={newGuest.email} onChange={e=>setNewGuest(p=>({...p,email:e.target.value}))} className={inputCls} dir="ltr"/>
                </div>
                <div>
                  <label className={labelCls}>{t.phone}</label>
                  <input type="tel" value={newGuest.phone} onChange={e=>setNewGuest(p=>({...p,phone:e.target.value}))} className={inputCls} dir="ltr"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{t.adults}</label>
                  <input type="number" min={0} value={newGuest.adults_count} onChange={e=>setNewGuest(p=>({...p,adults_count:parseInt(e.target.value)||0}))} className={inputCls} dir="ltr"/>
                </div>
                <div>
                  <label className={labelCls}>{t.children}</label>
                  <input type="number" min={0} value={newGuest.children_count} onChange={e=>setNewGuest(p=>({...p,children_count:parseInt(e.target.value)||0}))} className={inputCls} dir="ltr"/>
                </div>
              </div>
              <div>
                <label className={labelCls}>{t.status}</label>
                <div className="flex gap-2">
                  {(['confirmed','pending','declined'] as const).map(s=>(
                    <button key={s} type="button" onClick={()=>setNewGuest(p=>({...p,rsvp_status:s}))}
                      className="flex-1 py-2 text-xs font-medium border transition-all rounded-lg"
                      style={{
                        background: newGuest.rsvp_status===s?(s==='confirmed'?'#ecfdf5':s==='declined'?'#fef2f2':'#fffbeb'):'#fafaf9',
                        color: newGuest.rsvp_status===s?(s==='confirmed'?'#059669':s==='declined'?'#ef4444':'#d97706'):'#a8a29e',
                        borderColor: newGuest.rsvp_status===s?(s==='confirmed'?'#6ee7b7':s==='declined'?'#fca5a5':'#fcd34d'):'#e7e5e4',
                      }}>
                      {s==='confirmed'?t.confirmed:s==='declined'?t.declined:t.pending}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>{t.dietary}</label>
                <input value={newGuest.dietary_preferences} onChange={e=>setNewGuest(p=>({...p,dietary_preferences:e.target.value}))} placeholder={locale==='he'?'צמחוני, כשר...':'Végétarien, Casher...'} className={inputCls}/>
              </div>
              <div>
                <label className={labelCls}>{t.allergies}</label>
                <input value={newGuest.allergies} onChange={e=>setNewGuest(p=>({...p,allergies:e.target.value}))} placeholder={locale==='he'?'אגוזים, גלוטן...':'Noix, gluten...'} className={inputCls}/>
              </div>
              <div>
                <label className={labelCls}>{t.notes}</label>
                <textarea value={newGuest.notes} onChange={e=>setNewGuest(p=>({...p,notes:e.target.value}))} rows={2} dir="auto" className={inputCls+' resize-none'}/>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-stone-100 bg-stone-50">
              <button onClick={()=>setShowAddModal(false)} className="flex-1 py-3 border border-stone-200 text-stone-600 text-sm font-medium tracking-wide hover:bg-stone-100 transition-colors">
                {t.cancel}
              </button>
              <button onClick={handleAddGuest} disabled={savingGuest}
                className="flex-1 py-3 text-white text-sm font-medium tracking-wide transition-colors disabled:opacity-60"
                style={{ background: savingGuest?'#a8a29e':'#c9a84c' }}>
                {savingGuest ? t.saving : t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
