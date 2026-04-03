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
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')

  // Determine locale from the 'next' param or default to 'fr'
  const locale = next?.split('/')?.[1] ?? 'fr'
  const dashboardUrl = new URL(`/${locale}/dashboard`, requestUrl.origin)
  const loginUrl = new URL(`/${locale}/login`, requestUrl.origin)

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
            // The `setAll` method is called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )

  // Handle Magic Link (token_hash flow)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as 'magiclink' | 'recovery' | 'invite' | 'email',
      token_hash,
    })

    if (!error) {
      return NextResponse.redirect(dashboardUrl)
    }

    loginUrl.searchParams.set('error', 'invalid_link')
    return NextResponse.redirect(loginUrl)
  }

  // Handle OAuth (code flow — Google, etc.)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(dashboardUrl)
    }

    loginUrl.searchParams.set('error', 'oauth_failed')
    return NextResponse.redirect(loginUrl)
  }

  // No valid params — redirect to login
  loginUrl.searchParams.set('error', 'missing_params')
  return NextResponse.redirect(loginUrl)
}
