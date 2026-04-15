'use client'
// ============================================================
//  GrandInvite – Dashboard Client Component
//  טאב 1: ניהול אורחים (חיפוש / פילטור / הוספה / מחיקה / CSV)
//  טאב 2: עריכת הזמנה (פרטים + לו"ז + בראנץ')
//  טאב 3: תצוגה מקדימה
//  src/components/DashboardClient.tsx
// ============================================================

import { useState, useMemo, Fragment, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Guest, Wedding, EventSchedule } from '@/types'
import type { Locale } from '@/lib/i18n'
import AccountSettingsClient from '@/components/AccountSettingsClient'

type RSVPStatus = 'all' | 'confirmed' | 'declined' | 'pending'
type Tab = 'guests' | 'seating' | 'edit' | 'preview' | 'account'
type DeleteState = 'idle' | 'confirm' | 'sending' | 'sent' | 'error'
type TableInputsMap = Record<string, string>
type EditEventFormState = {
  event_name: string
  event_date: string
  start_time: string
  end_time: string
  location_name: string
  address: string
  google_maps_url: string
  waze_url: string
  description: string
}

interface Props {
  guests: Guest[]
  wedding: Wedding
  locale: Locale
  t: Record<string, string>
  userEmail?: string
  coOwnerEmail?: string | null
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

export default function DashboardClient({ guests, wedding, locale, t, userEmail = '', coOwnerEmail = null }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('guests')
  const tabBarRef = useRef<HTMLDivElement>(null)

  // Read ?tab=account from URL on mount (avoids useSearchParams Suspense requirement)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab') as Tab | null
    const validTabs: Tab[] = ['guests', 'seating', 'edit', 'preview', 'account']
    if (tab && validTabs.includes(tab)) {
      setActiveTab(tab)
      setTimeout(() => tabBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }
  }, [])

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
  const [tableInputs, setTableInputs] = useState<TableInputsMap>(() => {
    const m: TableInputsMap = {}
    guests.forEach(g => { if (g.table_number != null) m[g.id] = String(g.table_number) })
    return m
  })
  const [savingTable, setSavingTable] = useState<string | null>(null)
  // New column-per-table UI state
  const [localTables, setLocalTables] = useState<number[]>([]) // empty tables added via "+ Add Table"
  const [assignDropdown, setAssignDropdown] = useState<number | null>(null) // which table's guest picker is open
  const [assignSearch, setAssignSearch] = useState('')

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
    font_style: wedding.font_style ?? 'cormorant',
    layout_style: wedding.layout_style ?? 'ivory',
    image_position: wedding.image_position ?? 'center',
    cover_frame: wedding.cover_frame ?? 'fullscreen',
    page_layout: wedding.page_layout ?? 'classic',
    cover_image_url: wedding.cover_image_url ?? '',
  })
  const [uploadingCover, setUploadingCover] = useState(false)
  const [coverUploadError, setCoverUploadError] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState(false)

  // ── עריכת אירוע קיים ──
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [editEventForm, setEditEventForm] = useState<EditEventFormState>({
    event_name: '', event_date: '', start_time: '18:00', end_time: '',
    location_name: '', address: '', google_maps_url: '', waze_url: '', description: '',
  })
  const [savingEditEvent, setSavingEditEvent] = useState(false)
  const [editEventError, setEditEventError] = useState('')

  const openEditEvent = (ev: EventSchedule) => {
    setEditingEventId(ev.id)
    setEditEventForm({
      event_name: ev.event_name,
      event_date: ev.event_date,
      start_time: ev.start_time,
      end_time: ev.end_time ?? '',
      location_name: ev.location_name ?? '',
      address: ev.address ?? '',
      google_maps_url: ev.google_maps_url ?? '',
      waze_url: ev.waze_url ?? '',
      description: ev.description ?? '',
    })
    setEditEventError('')
  }

  const handleUpdateEvent = async () => {
    if (!editingEventId || !editEventForm.event_name || !editEventForm.event_date || !editEventForm.start_time) {
      setEditEventError(locale === 'he' ? 'שם, תאריך ושעה נדרשים' : 'Name, date and time required')
      return
    }
    setSavingEditEvent(true)
    setEditEventError('')
    try {
      const res = await fetch('/api/weddings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: editingEventId,
          wedding_id: wedding.id,
          ...editEventForm,
          end_time: editEventForm.end_time || null,
          location_name: editEventForm.location_name || null,
          address: editEventForm.address || null,
          google_maps_url: editEventForm.google_maps_url || null,
          waze_url: editEventForm.waze_url || null,
          description: editEventForm.description || null,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setEditEventError(d.error || 'Error')
        return
      }
      setEditingEventId(null)
      router.refresh()
    } catch {
      setEditEventError(locale === 'he' ? 'שגיאה בשמירה' : 'Save error')
    } finally {
      setSavingEditEvent(false)
    }
  }

  // ── מחיקת חשבון ──
  const [deleteState, setDeleteState] = useState<DeleteState>('idle')
  const [deleteError, setDeleteError] = useState('')

  const handleDeleteRequest = async () => {
    setDeleteState('sending')
    setDeleteError('')
    try {
      const res = await fetch('/api/wedding/delete-request', { method: 'POST' })
      if (!res.ok) {
        const d = await res.json()
        setDeleteError(d.error || 'Error')
        setDeleteState('error')
        return
      }
      setDeleteState('sent')
    } catch {
      setDeleteError(locale === 'he' ? 'שגיאה. אנא נסה שוב.' : locale === 'fr' ? 'Erreur. Veuillez réessayer.' : 'Error. Please try again.')
      setDeleteState('error')
    }
  }

  // ── העלאת תמונת כיסוי ──
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    setCoverUploadError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('wedding_id', wedding.id)
      const res = await fetch('/api/wedding/cover-upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const d = await res.json()
        setCoverUploadError(d.error || 'Error')
        return
      }
      const { url } = await res.json()
      setEditForm(p => ({ ...p, cover_image_url: url }))
    } catch {
      setCoverUploadError(locale === 'he' ? 'שגיאת העלאה' : locale === 'fr' ? "Erreur d'upload" : 'Upload error')
    } finally {
      setUploadingCover(false)
    }
  }

  // ── ניהול לו"ז — אירועים מותאמים ──
  const emptyEventForm = {
    event_name: '',
    event_date: wedding.wedding_date ?? '',
    start_time: '18:00',
    end_time: '',
    location_name: '',
    address: '',
    google_maps_url: '',
    waze_url: '',
    description: '',
  }
  const [showEventModal, setShowEventModal] = useState(false)
  const [eventForm, setEventForm] = useState({ ...emptyEventForm })
  const [savingEvent, setSavingEvent] = useState(false)
  const [eventModalError, setEventModalError] = useState('')
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null)

  const handleAddEvent = async () => {
    if (!eventForm.event_name || !eventForm.event_date || !eventForm.start_time) {
      setEventModalError(locale === 'he' ? 'שם, תאריך ושעה נדרשים' : locale === 'fr' ? 'Nom, date et heure sont requis' : 'Name, date and start time are required')
      return
    }
    setSavingEvent(true)
    setEventModalError('')
    try {
      const res = await fetch('/api/weddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wedding_id: wedding.id,
          event_name: eventForm.event_name.trim(),
          event_date: eventForm.event_date,
          start_time: eventForm.start_time,
          end_time: eventForm.end_time || null,
          location_name: eventForm.location_name.trim() || null,
          address: eventForm.address.trim() || null,
          google_maps_url: eventForm.google_maps_url.trim() || null,
          waze_url: eventForm.waze_url.trim() || null,
          description: eventForm.description.trim() || null,
          sort_order: schedule.length,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setEventModalError(d.error || 'Error')
        return
      }
      setShowEventModal(false)
      setEventForm({ ...emptyEventForm })
      router.refresh()
    } catch {
      setEventModalError(locale === 'he' ? 'שגיאה' : 'Error')
    } finally {
      setSavingEvent(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    setDeletingEventId(eventId)
    try {
      await fetch(`/api/weddings?event_id=${eventId}&wedding_id=${wedding.id}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setDeletingEventId(null)
    }
  }

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
        const name = locale==='he'?"בראנץ' למחרת":locale==='fr'?'Brunch du lendemain':'Morning-after Brunch'

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
      <div ref={tabBarRef} className="flex border-b border-stone-200 mb-6 md:mb-8 gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden -mx-4 md:mx-0 px-4 md:px-0">
        {([
          { key:'guests',  label: locale==='he'?'אורחים':locale==='fr'?'Invités':'Guests' },
          { key:'seating', label: locale==='he'?'ישיבה':locale==='fr'?'Tables':'Seating' },
          { key:'edit',    label: locale==='he'?'עריכה':locale==='fr'?'Modifier':'Edit' },
          { key:'preview', label: locale==='he'?'תצוגה':locale==='fr'?'Aperçu':'Preview' },
          { key:'account', label: locale==='he'?'⚙ חשבון':locale==='fr'?'⚙ Compte':'⚙ Account' },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setTimeout(() => tabBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50) }}
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
            {activeTab === 'seating' && (() => {
        // Derived seating data
        const confirmed = guests.filter(g => g.rsvp_status === 'confirmed')
        const unassigned = confirmed.filter(g => g.table_number == null)
        const assignedNums = new Set(confirmed.filter(g => g.table_number != null).map(g => g.table_number!))
        const allNums = [...new Set([...assignedNums, ...localTables])].sort((a, b) => a - b)

        const handleAddTable = () => {
          const next = allNums.length > 0 ? Math.max(...allNums) + 1 : 1
          setLocalTables(prev => [...prev, next])
        }

        const tableLabel = locale==='he'?'\u05e9\u05d5\u05dc\u05d7\u05df':locale==='fr'?'Table':'Table'
        const addGuestLabel = locale==='he'?'\u05d4\u05d5\u05e1\u05e3 \u05d0\u05d5\u05e8\u05d7':locale==='fr'?'Ajouter un invit\u00e9':'Add guest'
        const addTableLabel = locale==='he'?'\u05d4\u05d5\u05e1\u05e3 \u05e9\u05d5\u05dc\u05d7\u05df':locale==='fr'?'Ajouter une table':'Add table'

        return (
          <div dir={isRTL?'rtl':'ltr'}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h3 className="font-cormorant text-2xl text-stone-700">
                  {locale==='he'?'\u05e1\u05d9\u05d3\u05d5\u05e8\u05d9 \u05d9\u05e9\u05d9\u05d1\u05d4':locale==='fr'?'Plan de table':'Seating Chart'}
                </h3>
                <p className="text-sm text-stone-400 mt-1">
                  {locale==='he'?'\u05e9\u05d1\u05e5 \u05d0\u05d5\u05e8\u05d7\u05d9\u05dd \u05dc\u05e9\u05d5\u05dc\u05d7\u05e0\u05d5\u05ea \u2014 \u05d0\u05d5\u05e8\u05d7 \u05e9\u05d5\u05d1\u05e5 \u05dc\u05d0 \u05d9\u05d5\u05e4\u05d9\u05e2 \u05dc\u05e9\u05d9\u05d1\u05d5\u05e5 \u05d7\u05d5\u05d6\u05e8'
                    :locale==='fr'?"Placez les invit\u00e9s aux tables \u2014 un invit\u00e9 plac\u00e9 n'appara\u00eet plus dans les autres tables"
                    :'Assign guests to tables \u2014 once assigned, a guest won\'t appear for other tables'}
                </p>
              </div>
              <button
                onClick={handleAddTable}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-[#c9a84c] text-[#c9a84c] hover:bg-[#fdf6e3] transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                </svg>
                {addTableLabel}
              </button>
            </div>

            {/* Empty state */}
            {allNums.length === 0 && (
              <div className="text-center py-16 text-stone-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-stone-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                </svg>
                <p className="text-sm">
                  {locale==='he'?'\u05dc\u05d7\u05e5 \u05e2\u05dc "\u05d4\u05d5\u05e1\u05e3 \u05e9\u05d5\u05dc\u05d7\u05df" \u05db\u05d3\u05d9 \u05dc\u05d4\u05ea\u05d7\u05d9\u05dc'
                    :locale==='fr'?'Cliquez sur "Ajouter une table" pour commencer'
                    :'Click "Add table" to get started'}
                </p>
              </div>
            )}

            {/* Columns */}
            {allNums.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pb-4" onClick={() => { if (assignDropdown !== null) { setAssignDropdown(null); setAssignSearch('') } }}>
                {allNums.map(tNum => {
                  const tGuests = confirmed.filter(g => g.table_number === tNum)
                  const totalSeats = tGuests.reduce((s, g) => s + g.adults_count + g.children_count, 0)
                  const filteredUnassigned = unassigned.filter(g =>
                    assignSearch === '' || g.name.toLowerCase().includes(assignSearch.toLowerCase())
                  )

                  return (
                    <div key={tNum} className="min-w-[210px] w-[210px] flex-shrink-0 bg-white border border-stone-100 rounded-2xl shadow-sm flex flex-col" style={{ minHeight: '280px' }}>

                      {/* Column header */}
                      <div className="px-4 py-3 border-b border-stone-50 flex items-center justify-between flex-shrink-0">
                        <span className="font-cormorant text-lg text-stone-700">
                          {tableLabel} {tNum}
                        </span>
                        <span className="text-xs text-stone-400 bg-stone-50 rounded-full px-2 py-0.5">
                          {totalSeats} {locale==='he'?'\u05de\u05e7\u05d5\u05de\u05d5\u05ea':locale==='fr'?'places':'seats'}
                        </span>
                      </div>

                      {/* Guests list */}
                      <div className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto" style={{ maxHeight: '320px' }}>
                        {tGuests.length === 0 && (
                          <p className="text-xs text-stone-300 text-center py-6">
                            {locale==='he'?'\u05e8\u05d9\u05e7':locale==='fr'?'Vide':'Empty'}
                          </p>
                        )}
                        {tGuests.map(g => (
                          <div key={g.id} className="flex items-center justify-between gap-1 group">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#c9a84c' }}/>
                              <span className="text-sm text-stone-700 truncate">{g.name}</span>
                              {(g.adults_count + g.children_count) > 1 && (
                                <span className="text-xs text-stone-400 flex-shrink-0">×{g.adults_count + g.children_count}</span>
                              )}
                            </div>
                            {/* Remove button */}
                            <button
                              onClick={e => { e.stopPropagation(); handleAssignTable(g.id, '') }}
                              disabled={savingTable === g.id}
                              className="text-stone-200 hover:text-red-400 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100 disabled:opacity-40"
                              title={locale==='he'?'\u05d4\u05e1\u05e8 \u05de\u05d4\u05e9\u05d5\u05dc\u05d7\u05df':locale==='fr'?'Retirer':'Remove'}
                            >
                              {savingTable === g.id ? (
                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add guest button + dropdown */}
                      <div className="px-3 pb-3 flex-shrink-0 relative">
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            setAssignDropdown(assignDropdown === tNum ? null : tNum)
                            setAssignSearch('')
                          }}
                          className="w-full text-xs border rounded-lg py-2 transition-colors flex items-center justify-center gap-1"
                          style={{
                            borderColor: assignDropdown === tNum ? '#c9a84c' : '#e7e5e4',
                            color: assignDropdown === tNum ? '#c9a84c' : '#a8a29e',
                            background: assignDropdown === tNum ? '#fdf6e3' : 'transparent',
                          }}
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                          </svg>
                          {addGuestLabel}
                        </button>

                        {/* Dropdown */}
                        {assignDropdown === tNum && (
                          <div
                            className="absolute left-3 right-3 bg-white border border-stone-200 rounded-xl shadow-2xl z-40 overflow-hidden"
                            style={{ bottom: 'calc(100% - 8px)' }}
                            onClick={e => e.stopPropagation()}
                          >
                            {/* Search */}
                            <div className="p-2 border-b border-stone-100">
                              <input
                                autoFocus
                                type="text"
                                placeholder={locale==='he'?'\u05d7\u05d9\u05e4\u05d5\u05e9...':locale==='fr'?'Rechercher...':'Search...'}
                                value={assignSearch}
                                onChange={e => setAssignSearch(e.target.value)}
                                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-[#c9a84c]"
                                dir="auto"
                              />
                            </div>
                            {/* List */}
                            <div className="max-h-44 overflow-y-auto">
                              {filteredUnassigned.length === 0 ? (
                                <p className="text-xs text-stone-400 text-center py-4">
                                  {unassigned.length === 0
                                    ? (locale==='he'?'\u05db\u05dc \u05d4\u05d0\u05d5\u05e8\u05d7\u05d9\u05dd \u05e9\u05d5\u05d1\u05e6\u05d5':locale==='fr'?'Tous les invit\u00e9s sont plac\u00e9s':'All guests assigned')
                                    : (locale==='he'?'\u05dc\u05d0 \u05e0\u05de\u05e6\u05d0':locale==='fr'?'Aucun r\u00e9sultat':'No results')}
                                </p>
                              ) : filteredUnassigned.map(g => (
                                <button
                                  key={g.id}
                                  onClick={() => {
                                    handleAssignTable(g.id, String(tNum))
                                    setAssignDropdown(null)
                                    setAssignSearch('')
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex items-center justify-between gap-2"
                                >
                                  <span className="truncate text-stone-700">{g.name}</span>
                                  {(g.adults_count + g.children_count) > 1 && (
                                    <span className="text-stone-400 flex-shrink-0">×{g.adults_count + g.children_count}</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Unassigned guests banner */}
            {unassigned.length > 0 && allNums.length > 0 && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-sm font-medium text-amber-700 mb-2">
                  {unassigned.length}{' '}
                  {locale==='he'?'\u05d0\u05d5\u05e8\u05d7\u05d9\u05dd \u05de\u05de\u05ea\u05d9\u05e0\u05d9\u05dd \u05dc\u05e9\u05d9\u05d1\u05d5\u05e5':locale==='fr'?'invit\u00e9s non plac\u00e9s':'guests not yet assigned'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {unassigned.map(g => (
                    <span key={g.id} className="text-xs bg-amber-100 text-amber-700 rounded-full px-3 py-1">
                      {g.name}{(g.adults_count + g.children_count) > 1 ? ` ×${g.adults_count + g.children_count}` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats footer */}
            {confirmed.length > 0 && (
              <div className="mt-4 text-xs text-stone-400 text-right">
                {confirmed.filter(g => g.table_number != null).length} / {confirmed.length}{' '}
                {locale==='he'?'\u05d4\u05d5\u05e7\u05e6\u05d5 \u05dc\u05e9\u05d5\u05dc\u05d7\u05e0\u05d5\u05ea':locale==='fr'?'assign\u00e9s':'assigned'}
              </div>
            )}
          </div>
        )
      })()}
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

          {/* ── הזוג ── */}
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

          {/* ── מקום ── */}
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

          {/* ── הודעה ותאריך RSVP ── */}
          <div>
            <h3 className="font-cormorant text-xl text-stone-700 mb-4 pb-2 border-b border-stone-100">
              {locale==='he'?'תוכן ההזמנה':locale==='fr'?"Contenu de l'invitation":'Invitation Content'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>{locale==='he'?'שפה ראשית':locale==='fr'?'Langue principale':'Main language'}</label>
                <div className="flex gap-2">
                  {(['fr','he','en'] as const).map(lang=>(
                    <button key={lang} type="button"
                      onClick={()=>setEditForm(p=>({...p,locale:lang}))}
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
                <p className="text-xs text-stone-400 mt-1.5">
                  🌐 {locale==='he'?'האורחים יראו את ההזמנה בשפה שלהם אוטומטית':locale==='fr'?"Les invités verront l'invitation dans leur propre langue automatiquement":'Guests will see the invitation in their own language automatically'}
                </p>
              </div>
              <div>
                <label className={labelCls}>{locale==='he'?'הודעת פתיחה':locale==='fr'?'Message de bienvenue':'Welcome message'}</label>
                <textarea value={editForm.welcome_message} onChange={e=>setEditForm(p=>({...p,welcome_message:e.target.value}))}
                  rows={4} dir="auto" className={inputCls+' resize-none'}/>
              </div>
              <div>
                <label className={labelCls}>{locale==='he'?'תאריך אחרון לאישור':locale==='fr'?'Date limite RSVP':'RSVP deadline'}</label>
                <input type="date" value={editForm.rsvp_deadline} onChange={e=>setEditForm(p=>({...p,rsvp_deadline:e.target.value}))} dir="ltr" className={inputCls}/>
              </div>
            </div>
          </div>

          {/* ── עיצוב ── */}
          <div>
            <h3 className="font-cormorant text-xl text-stone-700 mb-4 pb-2 border-b border-stone-100">
              {locale==='he'?'עיצוב ומראה':locale==='fr'?'Design & Apparence':'Design & Appearance'}
            </h3>
            <div className="space-y-5">

              {/* ── Cover image ── */}
              <div>
                <label className={labelCls}>
                  {locale==='he'?'תמונת כיסוי':locale==='fr'?"Photo de couverture":'Cover photo'}
                </label>
                {editForm.cover_image_url && (
                  <div className="relative h-28 rounded-xl overflow-hidden mb-2 border border-stone-100">
                    <img src={editForm.cover_image_url} alt="cover" className="w-full h-full object-cover" style={{
                      objectPosition:
                        editForm.image_position === 'top' ? '50% 20%' :
                        editForm.image_position === 'bottom' ? '50% 80%' :
                        editForm.image_position === 'left' ? '20% 50%' :
                        editForm.image_position === 'right' ? '80% 50%' :
                        '50% 50%',
                    }}/>
                    <button
                      type="button"
                      onClick={() => setEditForm(p => ({ ...p, cover_image_url: '' }))}
                      className="absolute top-2 right-2 bg-black/50 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/70"
                    >×</button>
                  </div>
                )}
                <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 border border-dashed border-stone-200 rounded-xl text-sm text-stone-500 hover:bg-stone-50 transition-colors">
                  {uploadingCover ? (
                    <span className="animate-pulse">{locale==='he'?'מעלה...':locale==='fr'?'Téléchargement...':'Uploading...'}</span>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <span>{locale==='he'?'העלה תמונה (JPEG/PNG/WebP)':locale==='fr'?'Télécharger une photo (JPEG/PNG/WebP)':'Upload photo (JPEG/PNG/WebP)'}</span>
                    </>
                  )}
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverUpload} disabled={uploadingCover}/>
                </label>
                {coverUploadError && <p className="text-red-500 text-xs mt-1">{coverUploadError}</p>}
              </div>

              {/* ── Font style ── */}
              <div>
                <label className={labelCls}>
                  {locale==='he'?'סגנון גופן':locale==='fr'?'Style de police':'Font style'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { key: 'cormorant', label: 'Cormorant', preview: 'Sophie & Daniel' },
                    { key: 'playfair', label: 'Playfair', preview: 'Sophie & Daniel' },
                    { key: 'modern', label: 'Modern', preview: 'Sophie & Daniel' },
                  ] as const).map(f => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setEditForm(p => ({ ...p, font_style: f.key }))}
                      className="border rounded-xl py-3 px-2 text-center transition-all"
                      style={{
                        borderColor: editForm.font_style === f.key ? '#c9a84c' : '#e7e5e4',
                        background: editForm.font_style === f.key ? '#fdf6e3' : '#faf8f5',
                      }}
                    >
                      <span className="block text-xs text-stone-400 mb-1" style={{ fontFamily: 'system-ui, sans-serif' }}>{f.label}</span>
                      <span
                        className="block text-sm text-stone-700"
                        style={{
                          fontFamily: f.key === 'cormorant' ? 'Georgia, serif'
                            : f.key === 'playfair' ? "'Playfair Display', Georgia, serif"
                            : "'Helvetica Neue', Arial, sans-serif",
                          fontWeight: f.key === 'modern' ? 300 : undefined,
                        }}
                      >
                        {f.preview}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Color palette ── */}
              <div>
                <label className={labelCls}>
                  {locale==='he'?'פלטת צבעים':locale==='fr'?'Palette de couleurs':'Color palette'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { key: 'ivory',    label: locale==='he'?'שנהב':locale==='fr'?'Ivoire':'Ivory',     bg: '#faf8f5', accent: '#c9a84c', text: '#1c1917' },
                    { key: 'blush',    label: locale==='he'?'ורוד':locale==='fr'?'Blush':'Blush',       bg: '#fff5f5', accent: '#d4a0a0', text: '#3d1515' },
                    { key: 'sage',     label: locale==='he'?'ירוק עדין':locale==='fr'?'Sauge':'Sage',   bg: '#f4f7f2', accent: '#7a9e7e', text: '#1a2e1c' },
                    { key: 'midnight', label: locale==='he'?'לילה':locale==='fr'?'Minuit':'Midnight',   bg: '#0f172a', accent: '#c9a84c', text: '#f8f5ee' },
                  ] as const).map(p => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setEditForm(prev => ({ ...prev, layout_style: p.key }))}
                      className="border rounded-xl p-3 text-left transition-all flex items-center gap-3"
                      style={{
                        background: p.bg,
                        borderColor: editForm.layout_style === p.key ? '#c9a84c' : '#e7e5e4',
                        borderWidth: editForm.layout_style === p.key ? '2px' : '1px',
                      }}
                    >
                      <div className="flex gap-1 flex-shrink-0">
                        <span className="w-4 h-4 rounded-full" style={{ background: p.bg, border: '1px solid #e7e5e4' }}/>
                        <span className="w-4 h-4 rounded-full" style={{ background: p.accent }}/>
                      </div>
                      <span className="text-xs font-medium" style={{ color: p.text === '#f8f5ee' ? '#1c1917' : p.text }}>{p.label}</span>
                      {editForm.layout_style === p.key && (
                        <span className="ml-auto text-[#c9a84c] text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── מסגרת תמונה ── */}
              {editForm.cover_image_url && (
                <div>
                  <label className={labelCls}>
                    {locale==='he'?'מסגרת תמונה':locale==='fr'?"Cadre de la photo":'Photo frame'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { key: 'fullscreen', label: locale==='he'?'מסך מלא':locale==='fr'?'Plein écran':'Fullscreen', icon: '⬛' },
                      { key: 'arch',       label: locale==='he'?'קשת':locale==='fr'?'Arche':'Arch',                icon: '🔼' },
                      { key: 'oval',       label: locale==='he'?'אובלי':locale==='fr'?'Ovale':'Oval',              icon: '⬭' },
                      { key: 'contained',  label: locale==='he'?'ממוסגר':locale==='fr'?'Encadré':'Contained',      icon: '▢' },
                    ] as const).map(f => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setEditForm(p => ({ ...p, cover_frame: f.key }))}
                        className="border rounded-xl py-2.5 px-3 text-center transition-all flex items-center gap-2"
                        style={{
                          borderColor: editForm.cover_frame === f.key ? '#c9a84c' : '#e7e5e4',
                          background: editForm.cover_frame === f.key ? '#fdf6e3' : '#faf8f5',
                        }}
                      >
                        <span className="text-base">{f.icon}</span>
                        <span className="text-xs font-medium text-stone-600">{f.label}</span>
                        {editForm.cover_frame === f.key && <span className="ml-auto text-[#c9a84c] text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── מיקום תמונה ── */}
              {editForm.cover_image_url && (
                <div>
                  <label className={labelCls}>
                    {locale==='he'?'מיקום מוקד התמונה':locale==='fr'?"Point de focus de la photo":'Image focal point'}
                  </label>
                  {/* 3×3 grid focal point selector */}
                  <div className="relative w-full rounded-xl overflow-hidden border border-stone-200 mb-2" style={{ maxHeight: '140px', aspectRatio: '16/7' }}>
                    <img src={editForm.cover_image_url} alt="cover" className="w-full h-full object-cover" style={{
                      objectPosition:
                        editForm.image_position === 'top' ? '50% 20%' :
                        editForm.image_position === 'bottom' ? '50% 80%' :
                        editForm.image_position === 'left' ? '20% 50%' :
                        editForm.image_position === 'right' ? '80% 50%' :
                        '50% 50%',
                    }}/>
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                      {([
                        ['left','top','right'],
                        ['left','center','right'],
                        ['left','bottom','right'],
                      ] as const).map((row, ri) => row.map((pos, ci) => {
                        const isSelected = editForm.image_position === pos || (pos === 'center' && (!editForm.image_position || editForm.image_position === 'center'))
                        return (
                          <button
                            key={`${ri}-${ci}`}
                            type="button"
                            onClick={() => setEditForm(p => ({ ...p, image_position: pos }))}
                            className="transition-all"
                            style={{
                              background: isSelected ? 'rgba(201,168,76,0.5)' : 'transparent',
                              border: isSelected ? '2px solid #c9a84c' : '1px solid rgba(255,255,255,0.2)',
                            }}
                            title={pos}
                          />
                        )
                      }))}
                    </div>
                  </div>
                  <p className="text-xs text-stone-400">
                    {locale==='he'?'לחץ על החלק בתמונה שברצונך לראות בהזמנה':locale==='fr'?'Cliquez sur la zone de la photo à afficher':'Click the area of the photo you want shown'}
                  </p>
                </div>
              )}

              {/* ── פריסת דף ── */}
              <div>
                <label className={labelCls}>
                  {locale==='he'?'פריסת הדף':locale==='fr'?"Mise en page":'Page layout'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    {
                      key: 'classic',
                      label: locale==='he'?'קלאסי':locale==='fr'?'Classique':'Classic',
                      desc: locale==='he'?'גיבור מסך מלא':locale==='fr'?'Héros plein écran':'Full-screen hero',
                      preview: (
                        <div className="w-full h-16 rounded overflow-hidden flex flex-col">
                          <div className="flex-1 bg-stone-700 flex items-center justify-center">
                            <div className="text-white text-xs opacity-70">A &amp; B</div>
                          </div>
                          <div className="h-3 bg-stone-100 flex items-center px-1 gap-0.5">
                            <div className="h-1 w-6 bg-stone-300 rounded"/>
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'romantic',
                      label: locale==='he'?'רומנטי':locale==='fr'?'Romantique':'Romantic',
                      desc: locale==='he'?'גיבור קמור':locale==='fr'?'Héros en arche':'Arched hero',
                      preview: (
                        <div className="w-full h-16 rounded overflow-hidden flex flex-col">
                          <div className="flex-[2] bg-stone-700 rounded-b-full mx-1 flex items-center justify-center">
                            <div className="text-white text-xs opacity-70">A &amp; B</div>
                          </div>
                          <div className="flex-1 bg-stone-100 flex items-center justify-center">
                            <div className="h-1 w-8 bg-stone-300 rounded"/>
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'minimal',
                      label: locale==='he'?'מינימלי':locale==='fr'?'Minimaliste':'Minimal',
                      desc: locale==='he'?'טיפוגרפיה נקייה':locale==='fr'?'Typographie épurée':'Clean type',
                      preview: (
                        <div className="w-full h-16 rounded overflow-hidden bg-stone-50 flex flex-col items-center justify-center gap-1 py-1">
                          <div className="h-1 w-12 bg-stone-800 rounded"/>
                          <div className="h-0.5 w-6 bg-[#c9a84c] rounded"/>
                          <div className="h-1 w-12 bg-stone-800 rounded"/>
                          <div className="h-2 w-10 bg-stone-300 rounded mt-1"/>
                        </div>
                      ),
                    },
                  ] as const).map(l => (
                    <button
                      key={l.key}
                      type="button"
                      onClick={() => setEditForm(p => ({ ...p, page_layout: l.key }))}
                      className="border rounded-xl p-2 text-center transition-all"
                      style={{
                        borderColor: editForm.page_layout === l.key ? '#c9a84c' : '#e7e5e4',
                        background: editForm.page_layout === l.key ? '#fdf6e3' : '#faf8f5',
                        borderWidth: editForm.page_layout === l.key ? '2px' : '1px',
                      }}
                    >
                      {l.preview}
                      <span className="block text-xs font-medium text-stone-600 mt-1.5">{l.label}</span>
                      <span className="block text-[10px] text-stone-400 mt-0.5">{l.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* ── לו"ז האירוע ── */}
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-100">
              <h3 className="font-cormorant text-xl text-stone-700">
                {locale==='he'?"לו\"ז האירוע":locale==='fr'?"Programme de l'événement":'Event Schedule'}
              </h3>
              <button
                type="button"
                onClick={() => { setEventForm({ ...emptyEventForm }); setEventModalError(''); setShowEventModal(true) }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#c9a84c] text-[#c9a84c] hover:bg-[#fdf6e3] transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                </svg>
                {locale==='he'?'הוסף אירוע':locale==='fr'?'Ajouter':'Add event'}
              </button>
            </div>

            {/* רשימת אירועים — מוצגת לפני ה-toggle של בראנץ' */}
            {schedule.length > 0 ? (
              <div className="space-y-2 mb-4">
                {[...schedule]
                  .sort((a, b) => a.event_date.localeCompare(b.event_date) || a.start_time.localeCompare(b.start_time))
                  .map(ev => {
                    const isBrunch = ev.event_name?.toLowerCase().includes('brunch') || ev.event_name?.toLowerCase().includes('בראנץ')
                    return (
                      <div key={ev.id} className="flex items-center gap-3 py-2.5 px-4 bg-white border border-stone-100 rounded-xl text-sm">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: isBrunch ? '#f59e0b' : '#c9a84c' }}/>
                        <div className="flex-1 min-w-0">
                          <span className="text-stone-700 font-medium">{ev.event_name}</span>
                          {ev.location_name && <span className="text-stone-400 text-xs ml-2">· {ev.location_name}</span>}
                          <span className="text-stone-300 text-xs ml-2">{ev.event_date}</span>
                        </div>
                        <span className="text-xs text-stone-400 flex-shrink-0">{ev.start_time?.slice(0,5)}</span>
                        {/* Edit button */}
                        <button
                          type="button"
                          onClick={() => openEditEvent(ev)}
                          className="text-stone-300 hover:text-[#c9a84c] transition-colors flex-shrink-0"
                          title={locale==='he'?'עריכה':locale==='fr'?'Modifier':'Edit'}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                          </svg>
                        </button>
                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(ev.id)}
                          disabled={deletingEventId === ev.id}
                          className="text-stone-300 hover:text-red-400 transition-colors flex-shrink-0 disabled:opacity-40"
                          title={locale==='he'?'מחק':locale==='fr'?'Supprimer':'Delete'}
                        >
                          {deletingEventId === ev.id ? (
                            <span className="text-xs animate-pulse">…</span>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <p className="text-xs text-stone-400 text-center py-4 mb-4">
                {locale==='he'?'אין אירועים עדיין. הוסיפו את הטקס, הקבלת פנים ועוד.':locale==='fr'?'Pas encore d\'événements. Ajoutez la cérémonie, le cocktail, etc.':'No events yet. Add the ceremony, cocktail hour, etc.'}
              </p>
            )}

            {/* ── בראנץ' למחרת ── */}
            <div className="border-t border-stone-100 pt-4">
              <h3 className="font-cormorant text-xl text-stone-700 mb-3">
                {locale==='he'?"בראנץ' למחרת":locale==='fr'?'Brunch du lendemain':'Morning-after Brunch'}
              </h3>
              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
                <div>
                  <p className="text-sm font-medium text-stone-700">
                    {locale==='he'?"הוספה מהירה של בראנץ' (11:00–14:00)"
                      :locale==='fr'?"Ajout rapide d'un brunch (11h–14h)"
                      :'Quick-add a brunch event (11am–2pm)'}
                  </p>
                  {brunchEnabled && brunchEventId && (
                    <button
                      type="button"
                      onClick={() => {
                        const ev = schedule.find(e => e.id === brunchEventId)
                        if (ev) openEditEvent(ev)
                      }}
                      className="text-xs mt-1 underline"
                      style={{ color: '#c9a84c' }}
                    >
                      {locale==='he'?'ערוך פרטי בראנץ\'':locale==='fr'?'Modifier les détails du brunch':'Edit brunch details'}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleToggleBrunch}
                  disabled={togglingBrunch}
                  aria-pressed={brunchEnabled}
                  className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none disabled:opacity-60 flex-shrink-0"
                  style={{ background: brunchEnabled ? '#c9a84c' : '#d4d0cb' }}
                >
                  <span
                    className="inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200"
                    style={{ transform: brunchEnabled ? 'translateX(22px)' : 'translateX(2px)' }}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* ── כפתור שמירה ── */}
          <div className="pt-2">
            <button onClick={handleSaveEdit} disabled={savingEdit}
              className="px-8 py-3.5 text-white text-sm font-medium tracking-wider uppercase rounded-xl transition-all disabled:opacity-60"
              style={{ background: savingEdit?'#a8a29e':'#c9a84c', boxShadow: savingEdit?'none':'0 4px 14px rgba(201,168,76,0.25)' }}>
              {savingEdit
                ? (locale==='he'?'שומר...':locale==='fr'?'Enregistrement...':'Saving...')
                : (locale==='he'?'שמור שינויים':locale==='fr'?'Enregistrer les modifications':'Save changes')}
            </button>
          </div>

          {/* ניהול חשבון moved to account tab */}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: PREVIEW
      ══════════════════════════════════════════════ */}
      {activeTab === 'preview' && (
        <div className="text-center py-12">
          <p className="text-stone-400 text-sm mb-6">
            {locale==='he'?'לצפייה בהזמנה כפי שהאורחים רואים אותה':locale==='fr'?"Voir l'invitation telle que les invités la voient":'See the invitation as guests see it'}
          </p>
          <a
            href={wedding.slug ? `/${locale}/${wedding.slug}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-white text-sm font-medium tracking-wider uppercase rounded-xl"
            style={{ background:'#c9a84c', boxShadow:'0 4px 14px rgba(201,168,76,0.25)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
            {locale==='he'?'פתח הזמנה':locale==='fr'?"Ouvrir l'invitation":'Open invitation'} ↗
          </a>
          <div className="mt-6">
            <p className="text-xs text-stone-400 mb-2">
              {locale==='he'?'קישור ההזמנה':locale==='fr'?"Lien de l'invitation":'Invitation link'}
            </p>
            <div className="flex items-center gap-2 max-w-sm mx-auto">
              <code className="flex-1 text-xs bg-stone-100 px-3 py-2 rounded-lg text-stone-600 truncate dir-ltr" dir="ltr">
                {typeof window!=='undefined'?window.location.origin:''}/{locale}/{wedding.slug ?? '…'}
              </code>
              <button
                onClick={() => wedding.slug && navigator.clipboard?.writeText(`${window.location.origin}/${locale}/${wedding.slug}`)}
                className="p-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                title="Copy"
              >
                <svg className="w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          מודאל הוספת אירוע ללו"ז
      ══════════════════════════════════════════════ */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowEventModal(false) }}>
          <div dir={isRTL ? 'rtl' : 'ltr'}
            className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-cormorant text-xl text-stone-800">
                {locale==='he'?'הוספת אירוע ללו"ז':locale==='fr'?"Ajouter un événement":'Add event to schedule'}
              </h2>
              <button onClick={() => setShowEventModal(false)} className="text-stone-300 hover:text-stone-600 transition-colors text-2xl leading-none">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {eventModalError && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-lg">{eventModalError}</div>}

              <div>
                <label className={labelCls}>{locale==='he'?'שם האירוע *':locale==='fr'?'Nom de l\'événement *':'Event name *'}</label>
                <input
                  value={eventForm.event_name}
                  onChange={e => setEventForm(p => ({ ...p, event_name: e.target.value }))}
                  placeholder={locale==='he'?'קבלת פנים':locale==='fr'?'Cérémonie':'Ceremony'}
                  dir="auto"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{locale==='he'?'תאריך *':locale==='fr'?'Date *':'Date *'}</label>
                  <input type="date" value={eventForm.event_date} onChange={e => setEventForm(p => ({ ...p, event_date: e.target.value }))} dir="ltr" className={inputCls}/>
                </div>
                <div>
                  <label className={labelCls}>{locale==='he'?'שעת התחלה *':locale==='fr'?'Heure de début *':'Start time *'}</label>
                  <input type="time" value={eventForm.start_time} onChange={e => setEventForm(p => ({ ...p, start_time: e.target.value }))} dir="ltr" className={inputCls}/>
                </div>
              </div>

              <div>
                <label className={labelCls}>{locale==='he'?'שעת סיום':locale==='fr'?'Heure de fin':'End time'}</label>
                <input type="time" value={eventForm.end_time} onChange={e => setEventForm(p => ({ ...p, end_time: e.target.value }))} dir="ltr" className={inputCls}/>
              </div>

              <div>
                <label className={labelCls}>{locale==='he'?'מיקום':locale==='fr'?'Lieu':'Location'}</label>
                <input value={eventForm.location_name} onChange={e => setEventForm(p => ({ ...p, location_name: e.target.value }))} dir="auto" className={inputCls} placeholder={locale==='he'?'אולם אירועים':'Domaine des...'}/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Waze URL</label>
                  <input value={eventForm.waze_url} onChange={e => setEventForm(p => ({ ...p, waze_url: e.target.value }))} dir="ltr" className={inputCls} placeholder="https://waze.com/..."/>
                </div>
                <div>
                  <label className={labelCls}>Google Maps URL</label>
                  <input value={eventForm.google_maps_url} onChange={e => setEventForm(p => ({ ...p, google_maps_url: e.target.value }))} dir="ltr" className={inputCls} placeholder="https://maps.google.com/..."/>
                </div>
              </div>

              <div>
                <label className={labelCls}>{locale==='he'?'תיאור':locale==='fr'?'Description':'Description'}</label>
                <textarea value={eventForm.description} onChange={e => setEventForm(p => ({ ...p, description: e.target.value }))} rows={2} dir="auto" className={inputCls + ' resize-none'}/>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl">
              <button onClick={() => setShowEventModal(false)}
                className="flex-1 py-3 border border-stone-200 text-stone-600 text-sm font-medium tracking-wide hover:bg-stone-100 transition-colors rounded-xl">
                {locale==='he'?'ביטול':locale==='fr'?'Annuler':'Cancel'}
              </button>
              <button onClick={handleAddEvent} disabled={savingEvent}
                className="flex-1 py-3 text-white text-sm font-medium tracking-wide transition-colors disabled:opacity-60 rounded-xl"
                style={{ background: savingEvent ? '#a8a29e' : '#c9a84c' }}>
                {savingEvent ? (locale==='he'?'שומר...':locale==='fr'?'Enregistrement...':'Saving...') : (locale==='he'?'הוסף':locale==='fr'?'Ajouter':'Add')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          מודאל עריכת אירוע קיים
      ══════════════════════════════════════════════ */}
      {editingEventId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) setEditingEventId(null) }}>
          <div dir={isRTL ? 'rtl' : 'ltr'}
            className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-cormorant text-xl text-stone-800">
                {locale==='he'?'עריכת אירוע':locale==='fr'?"Modifier l'événement":'Edit event'}
              </h2>
              <button onClick={() => setEditingEventId(null)} className="text-stone-300 hover:text-stone-600 transition-colors text-2xl leading-none">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {editEventError && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-lg">{editEventError}</div>}

              <div>
                <label className={labelCls}>{locale==='he'?'שם האירוע *':locale==='fr'?'Nom de l\'אירוע *':'Event name *'}</label>
                <input
                  value={editEventForm.event_name}
                  onChange={e => setEditEventForm(p => ({ ...p, event_name: e.target.value }))}
                  dir="auto"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{locale==='he'?'תאריך *':locale==='fr'?'Date *':'Date *'}</label>
                  <input type="date" value={editEventForm.event_date} onChange={e => setEditEventForm(p => ({ ...p, event_date: e.target.value }))} dir="ltr" className={inputCls}/>
                </div>
                <div>
                  <label className={labelCls}>{locale==='he'?'שעת התחלה *':locale==='fr'?'Heure de début *':'Start time *'}</label>
                  <input type="time" value={editEventForm.start_time} onChange={e => setEditEventForm(p => ({ ...p, start_time: e.target.value }))} dir="ltr" className={inputCls}/>
                </div>
              </div>

              <div>
                <label className={labelCls}>{locale==='he'?'שעת סיום':locale==='fr'?'Heure de fin':'End time'}</label>
                <input type="time" value={editEventForm.end_time} onChange={e => setEditEventForm(p => ({ ...p, end_time: e.target.value }))} dir="ltr" className={inputCls}/>
              </div>

              <div>
                <label className={labelCls}>{locale==='he'?'מיקום':locale==='fr'?'Lieu':'Location'}</label>
                <input value={editEventForm.location_name} onChange={e => setEditEventForm(p => ({ ...p, location_name: e.target.value }))} dir="auto" className={inputCls}/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Waze URL</label>
                  <input value={editEventForm.waze_url} onChange={e => setEditEventForm(p => ({ ...p, waze_url: e.target.value }))} dir="ltr" className={inputCls} placeholder="https://waze.com/..."/>
                </div>
                <div>
                  <label className={labelCls}>Google Maps URL</label>
                  <input value={editEventForm.google_maps_url} onChange={e => setEditEventForm(p => ({ ...p, google_maps_url: e.target.value }))} dir="ltr" className={inputCls} placeholder="https://maps.google.com/..."/>
                </div>
              </div>

              <div>
                <label className={labelCls}>{locale==='he'?'תיאור':locale==='fr'?'Description':'Description'}</label>
                <textarea value={editEventForm.description} onChange={e => setEditEventForm(p => ({ ...p, description: e.target.value }))} rows={2} dir="auto" className={inputCls + ' resize-none'}/>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl">
              <button onClick={() => setEditingEventId(null)}
                className="flex-1 py-3 border border-stone-200 text-stone-600 text-sm font-medium tracking-wide hover:bg-stone-100 transition-colors rounded-xl">
                {locale==='he'?'ביטול':locale==='fr'?'Annuler':'Cancel'}
              </button>
              <button onClick={handleUpdateEvent} disabled={savingEditEvent}
                className="flex-1 py-3 text-white text-sm font-medium tracking-wide transition-colors disabled:opacity-60 rounded-xl"
                style={{ background: savingEditEvent ? '#a8a29e' : '#c9a84c' }}>
                {savingEditEvent ? (locale==='he'?'שומר...':'Saving...') : (locale==='he'?'שמור שינויים':locale==='fr'?'Enregistrer':'Save changes')}
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* ════════════════════════════════════════════
          TAB: ACCOUNT SETTINGS
      ════════════════════════════════════════════ */}
      {activeTab === 'account' && (
        <AccountSettingsClient
          locale={locale}
          userEmail={userEmail}
          initialCoOwnerEmail={coOwnerEmail}
          weddingId={wedding.id}
        />
      )}
{/* ══════════════════════════════════════════════
          מודאל הוספת אורח
      ══════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background:'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target===e.currentTarget) setShowAddModal(false) }}>
          <div dir={isRTL?'rtl':'ltr'}
            className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-cormorant text-xl text-stone-800">{t.addGuestTitle}</h2>
              <button onClick={()=>setShowAddModal(false)} className="text-stone-300 hover:text-stone-600 transition-colors text-2xl leading-none">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {guestModalError && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-lg">{guestModalError}</div>}
              <div>
                <label className={labelCls}>{t.name} *</label>
                <input value={newGuest.name} onChange={e=>setNewGuest(p=>({...p,name:e.target.value}))}
                  placeholder={locale==='he'?'ישראל ישראלי':'Marie Dupont'}
                  dir="auto"
                  className={inputCls}/>
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
                <input value={newGuest.dietary_preferences} onChange={e=>setNewGuest(p=>({...p,dietary_preferences:e.target.value}))}
                  placeholder={locale==='he'?'צמחוני, כשר...':'Végétarien, Casher...'} className={inputCls}/>
              </div>
              <div>
                <label className={labelCls}>{t.allergies}</label>
                <input value={newGuest.allergies} onChange={e=>setNewGuest(p=>({...p,allergies:e.target.value}))}
                  placeholder={locale==='he'?'אגוזים, גלוטן...':'Noix, gluten...'} className={inputCls}/>
              </div>
              <div>
                <label className={labelCls}>{t.notes}</label>
                <textarea value={newGuest.notes} onChange={e=>setNewGuest(p=>({...p,notes:e.target.value}))} rows={2} dir="auto" className={inputCls+' resize-none'}/>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-stone-100 bg-stone-50">
              <button onClick={()=>setShowAddModal(false)}
                className="flex-1 py-3 border border-stone-200 text-stone-600 text-sm font-medium tracking-wide hover:bg-stone-100 transition-colors">
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
