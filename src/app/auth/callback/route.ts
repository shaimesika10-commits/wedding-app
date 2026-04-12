// ============================================================
//  GrandInvite – Auth Callback Route
//  Handles Magic Link & OAuth redirects from Supabase
//  src/app/auth/callback/route.ts
// ============================================================

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash  = requestUrl.searchParams.get('token_hash')
  const type        = requestUrl.searchParams.get('type')
  const code        = requestUrl.searchParams.get('code')
  const next        = requestUrl.searchParams.get('next')
  const oauthError  = requestUrl.searchParams.get('error')   // provider-level error (access_denied…)

  // Determine locale from the 'next' param or default to 'fr'
  const locale       = next?.split('/')?.[1] ?? 'fr'
  const dashboardUrl  = new URL(`/${locale}/dashboard`,   requestUrl.origin)
  const onboardingUrl = new URL(`/${locale}/onboarding`,  requestUrl.origin)
  const loginUrl      = new URL(`/${locale}/login`,       requestUrl.origin)

  // ── BUG FIX: Handle OAuth provider-level errors (user cancelled, account disabled…) ──
  if (oauthError) {
    loginUrl.searchParams.set(
      'error',
      oauthError === 'access_denied' ? 'oauth_cancelled' : 'oauth_failed'
    )
    return NextResponse.redirect(loginUrl)
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore – middleware refreshes sessions anyway
          }
        },
      },
    }
  )

  // ── BUG FIX: After any successful auth, redirect to onboarding if user has no wedding ──
  // (Covers: first-time Google OAuth signup, email confirmation for new users)
  const redirectByWeddingStatus = async (): Promise<NextResponse> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(loginUrl)

    const { data: wedding } = await supabase
      .from('weddings')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    return NextResponse.redirect(wedding ? dashboardUrl : onboardingUrl)
  }

  // ── Magic Link / Email Confirmation / Password Recovery (token_hash flow) ──
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as 'magiclink' | 'recovery' | 'invite' | 'email',
      token_hash,
    })

    if (!error) {
      // Password recovery → dedicated reset page
      if (type === 'recovery') {
        const resetUrl = new URL(`/${locale}/reset-password`, requestUrl.origin)
        return NextResponse.redirect(resetUrl)
      }
      // Email confirmation: go to onboarding if no wedding, dashboard otherwise
      return redirectByWeddingStatus()
    }

    loginUrl.searchParams.set('error', 'invalid_link')
    return NextResponse.redirect(loginUrl)
  }

  // ── OAuth code exchange (Google, etc.) ──
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // First-time Google signup: go to onboarding; returning user: go to dashboard
      return redirectByWeddingStatus()
    }

    loginUrl.searchParams.set('error', 'oauth_failed')
    return NextResponse.redirect(loginUrl)
  }

  // No valid params — redirect to login
  loginUrl.searchParams.set('error', 'missing_params')
  return NextResponse.redirect(loginUrl)
}
