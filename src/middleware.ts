// ============================================================
//  GrandInvite – Next.js Middleware
//  (i18n routing + Supabase auth session refresh + Admin guard)
//  src/middleware.ts
// ============================================================

import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const SUPPORTED_LOCALES = ['fr', 'he', 'en']
const DEFAULT_LOCALE    = 'fr'
const SUPER_ADMIN_EMAIL = 'shaimesika10@gmail.com'

function getLocaleFromRequest(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language') ?? ''
  for (const lang of acceptLanguage.split(',')) {
    const code = lang.trim().split(';')[0].split('-')[0].toLowerCase()
    if (SUPPORTED_LOCALES.includes(code)) return code
  }
  return DEFAULT_LOCALE
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── 1. i18n Redirect ──
  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (
    !pathnameHasLocale &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/auth') &&
    !pathname.startsWith('/admin')   // /admin has its own routing
  ) {
    const locale  = getLocaleFromRequest(request)
    const newUrl  = request.nextUrl.clone()
    newUrl.pathname = `/${locale}${pathname}`
    return NextResponse.redirect(newUrl)
  }

  // ── 2. Supabase Auth Session Refresh ──
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll()               { return request.cookies.getAll() },
        setAll(cookiesToSet)   {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // ── 3. Dashboard / Onboarding guard ──
  const locale = SUPPORTED_LOCALES.find(l => pathname.startsWith(`/${l}/`))
  if (locale && (pathname.includes('/dashboard') || pathname.includes('/onboarding'))) {
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = `/${locale}/login`
      return NextResponse.redirect(loginUrl)
    }
  }

  // ── 4. Admin guard (supports multiple admins via DB) ──
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/fr/login', request.url))
    }

    const email = user.email?.toLowerCase() ?? ''

    // Primary super-admin always has access
    if (email === SUPER_ADMIN_EMAIL.toLowerCase()) {
      return response
    }

    // Check admin_users table for additional admins (graceful — deny on error)
    try {
      const { data: adminRow } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', email)
        .maybeSingle()

      if (!adminRow) {
        return NextResponse.redirect(new URL('/fr/login', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/fr/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
