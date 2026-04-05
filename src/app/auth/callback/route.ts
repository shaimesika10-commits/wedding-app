// ============================================================
//  GrandInvite – Auth Callback Route
//  CRITICAL FIX: cookies collected from verifyOtp/exchangeCodeForSession
//  are explicitly set on the redirect response (not just the server context).
//  Without this, email-confirmed users never get their session cookie.
//  src/app/auth/callback/route.ts
// ============================================================

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type        = requestUrl.searchParams.get('type')
  const code        = requestUrl.searchParams.get('code')
  const next        = requestUrl.searchParams.get('next')

  // Determine locale from the 'next' param or default to 'fr'
  const locale = next?.split('/')?.[1] ?? 'fr'
  const dashboardUrl = new URL(`/${locale}/dashboard`, requestUrl.origin)
  const loginUrl     = new URL(`/${locale}/login`,    requestUrl.origin)

  // ── Handle Magic Link / Email Confirmation / Password Recovery ──────────
  if (token_hash && type) {
    // Collect cookies that verifyOtp wants to set
    const cookieStore = await cookies()
    const cookiesToForward: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll()  { return cookieStore.getAll() },
          setAll(toSet) {
            // Capture — we'll apply these to the actual response below
            cookiesToForward.push(...toSet)
          },
        },
      }
    )

    const { error } = await supabase.auth.verifyOtp({
      type: type as 'magiclink' | 'recovery' | 'invite' | 'email',
      token_hash,
    })

    if (!error) {
      const redirectUrl =
        type === 'recovery'
          ? new URL(`/${locale}/reset-password`, requestUrl.origin)
          : dashboardUrl

      // Build the redirect and explicitly attach the session cookies
      const response = NextResponse.redirect(redirectUrl)
      cookiesToForward.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
      })
      return response
    }

    loginUrl.searchParams.set('error', 'invalid_link')
    return NextResponse.redirect(loginUrl)
  }

  // ── Handle OAuth (code flow — Google, etc.) ──────────────────────────────
  if (code) {
    const cookieStore = await cookies()
    const cookiesToForward: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll()  { return cookieStore.getAll() },
          setAll(toSet) {
            cookiesToForward.push(...toSet)
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const response = NextResponse.redirect(dashboardUrl)
      cookiesToForward.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
      })
      return response
    }

    loginUrl.searchParams.set('error', 'oauth_failed')
    return NextResponse.redirect(loginUrl)
  }

  // No valid params — redirect to login
  loginUrl.searchParams.set('error', 'missing_params')
  return NextResponse.redirect(loginUrl)
}
