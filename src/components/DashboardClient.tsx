'use client'
// ============================================================
//  GrandInvite – Dashboard Client Component
//  טאב 1: ניהול אורחים | טאב 2: ישיבה | טאב 3: עריכה
//  טאב 4: תצוגה | טאב 5: הגדרות
// src/components/DashboardClient.tsx
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

  // ============================================================
  // TAB 1 – Guests List
  // ============================================================
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<RSVPStatus>('all')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newGuest, setNewGuest] = useState({ ...emptyNewGuest })
  const [savingGuest, setSavingGuest] = useState(false)
  const [guestModalError, setGuestModalError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // ============================================================
  // SEATING TAB
  // ============================================================
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<RSVPStatus>('all')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newGuest, setNewGuest] = useState({ ...emptyNewGuest })
  const [savingGuest, setSavingGuest] = useState(false)
  const [guestModalError, setGuestModalError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  return (
    <div className="p-6">
      <h1>{t.dashboard || 'Dashboard'}</h1>
      <p>{t.welcome || 'Welcome'}</p>
    </div>
  )
}
