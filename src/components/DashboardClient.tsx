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
type Tab = 'guests' | 'edit' | 'preview'

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
        const brunchDate = new Date(wedding.wedding_date)
        brunchDate.setDate(brunchDate.getDate() + 1)
        const dateStr = brunchDate.toISOString().split('T')[0]
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
      <div className="flex border-b border-stone-200 mb-8 gap-1">
        x([
          { key:'guests', label: locale==='he'?'אורחים':locale==='fr'?'Invités':'Guests' },
          { key:'edit',   label: locale==='he'?'עריכה':locale==='fr'?'Modifier':'Edit' },
          { key:'preview',label: locale==='he'?'תצוגה':locale==='fr'?'Aperçu':'Preview' },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-6 py-3 text-sm font-medium tracking-wide transition-all relative"
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
          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
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
                  rows={4} className={inputCls+' resize-none'}/>
              </div>
              <div>
                <label className={labelCls}>{locale==='he'?'תאריך אחרון לאישור':locale==='fr'?'Date limite RSVP':'RSVP deadline'}</label>
                <input type="date" value={editForm.rsvp_deadline} onChange={e=>setEditForm(p=>({...p,rsvp_deadline:e.target.value}))} dir="ltr" className={inputCls}/>
              </div>
            </div>
          </div>

          {/* ── לו"W�: כפתור בראנץ' ── */}
          <div>
            <h3 className="font-cormorant text-xl text-stone-700 mb-4 pb-2 border-b border-stone-100">
              {locale==='he'?"לו\"ז האירוע":locale==='fr'?"Programme de l'événement":'Event Schedule'}
            </h3>
            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
              <div>
                <p className="text-sm font-medium text-stone-700">
                  {locale==='he'?'בראנץ׳ למחרת':locale==='fr'?'Brunch du lendemain':'Morning-after Brunch'}
                </p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {locale==='he'?'הםסף בראנץ׳ ביום שאחרי החתונה (11:00–14:00)'
                    :locale==='fr'?"Ajouter un brunch le lendemain du mariage (11h–14h)"
                    :'Add a brunch event the day after the wedding (11am–2pm)'}
                </p>
              </div>
              {/* Toggle switch */}
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
            {/* רשימת אירועים קיימים */}
            {schedule.length > 0 && (
              <div className="mt-3 space-y-2">
                {schedule.map(ev => (
                  <div key={ev.id} className="flex items-center justify-between py-2 px-3 bg-white border border-stone-100 rounded-lg text-sm">
                    <span className="text-stone-700">{ev.event_name}</span>
                    <span className="text-xs text-stone-400">{ev.start_time?.slice(0,5)}</span>
                  </div>
                ))}
              </div>
            )}
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
            href={`/${locale}/${wedding.slug}`}
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
                {typeof window!=='undefined'?window.location.origin:''}/{locale}/{wedding.slug}
              </code>
              <button
                onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/${locale}/${wedding.slug}`)}
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
                <textarea value={newGuest.notes} onChange={e=>setNewGuest(p=>({...p,notes:e.target.value}))} rows={2} className={inputCls+' resize-none'}/>
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
