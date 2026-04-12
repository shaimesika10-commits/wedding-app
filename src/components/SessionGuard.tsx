'use client'
// ============================================================
//  GrandInvite – SessionGuard
//  Enforces "Remember me = OFF" behavior:
//  When a user logs in WITHOUT remember-me, we store a flag in
//  localStorage. On every page load we check: if that flag is
//  set but this is a NEW browser session (sessionStorage is
//  empty), sign the user out automatically.
//
//  This lets new tabs stay logged in during the same session,
//  while logging out after the browser is fully closed.
// ============================================================

import { useEffect } from 'react'
import { useRouter, useParams, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function SessionGuard() {
  const router   = useRouter()
  const params   = useParams()
  const pathname = usePathname()
  const locale   = (params?.locale as string) ?? 'fr'

  useEffect(() => {
    // Don't interfere with the login page itself
    if (pathname?.includes('/login') || pathname?.includes('/auth')) return

    const noRemember   = localStorage.getItem('gi_no_remember')
    const sessionAlive = sessionStorage.getItem('gi_session_started')

    if (noRemember && !sessionAlive) {
      // New browser session + user chose not to be remembered → sign out
      const supabase = createClient()
      supabase.auth.signOut().then(() => {
        localStorage.removeItem('gi_no_remember')
        router.replace(`/${locale}/login`)
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return null
}
