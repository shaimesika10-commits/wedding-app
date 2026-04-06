// test
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
