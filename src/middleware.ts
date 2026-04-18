// ============================================================
//  GrandInvite – Next.js Middleware
//  Auto language detection (cookie → Accept-Language → IP geo)
//  + Supabase auth refresh + Admin guard
//  src/middleware.ts
// ============================================================

import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// ── Constants ────────────────────────────────────────────────
const SUPPORTED_LOCALES = ['fr', 'he', 'en'] as const
type SupportedLocale    = typeof SUPPORTED_LOCALES[number]

const DEFAULT_LOCALE    = 'fr'
const LOCALE_COOKIE     = 'NEXT_LOCALE'          // persisted user preference
const SUPER_ADMIN_EMAIL = 'shaimesika10@gmail.com'

// Countries where Hebrew is the primary language
const HE_COUNTRIES = new Set(['IL', 'PS'])

// Countries / territories where French is the primary language
const FR_COUNTRIES = new Set([
  'FR', 'BE', 'LU', 'MC', 'MF',          // Metropolitan Europe
  'RE', 'GP', 'MQ', 'GF', 'PM', 'BL',    // French overseas territories
  'WF', 'PF', 'NC', 'TF', 'YT',           // Pacific & Indian Ocean
  'SN', 'CI', 'ML', 'BF', 'NE', 'TG',    // West Africa
  'BJ', 'GN', 'GW', 'MR', 'CM', 'CF',
  'CG', 'CD', 'GA', 'DJ', 'KM', 'MG',
  'SC', 'MU', 'RW', 'BI', 'HT',
])

// English-speaking countries (defaults for everything else,
// but listed explicitly so the mapping is readable)
const EN_COUNTRIES = new Set([
  'US', 'GB', 'AU', 'NZ', 'IE', 'CA', 'ZA', 'SG', 'IN',
  'PH', 'KE', 'NG', 'GH', 'JM', 'TT', 'MT',
])

// ── Helpers ──────────────────────────────────────────────────

/** Parse Accept-Language header respecting q-values and return the
 *  best supported locale, or null if nothing matches. */
function localeFromAcceptLanguage(header: string): SupportedLocale | null {
  if (!header) return null

  const entries = header
    .split(',')
    .map(part => {
      const [rawLang, rawQ] = part.trim().split(';q=')
      const code = rawLang.trim().split('-')[0].toLowerCase()
      const q    = rawQ ? parseFloat(rawQ) : 1.0
      return { code, q }
    })
    .filter(e => !isNaN(e.q))
    .sort((a, b) => b.q - a.q)

  for (const { code } of entries) {
    if ((SUPPORTED_LOCALES as readonly string[]).includes(code)) {
      return code as SupportedLocale
    }
  }
  return null
}

/** Map an ISO 3166-1 alpha-2 country code to the best locale. */
function localeFromCountry(country: string): SupportedLocale | null {
  const c = country.toUpperCase()
  if (HE_COUNTRIES.has(c)) return 'he'
  if (FR_COUNTRIES.has(c)) return 'fr'
  if (EN_COUNTRIES.has(c)) return 'en'
  return null
}

/**
 * Detect the visitor's preferred locale with the following priority:
 *
 *  1. Cookie  – user explicitly chose a language (most important)
 *  2. Accept-Language – browser / OS preference
 *  3. IP Geolocation  – Vercel's x-vercel-ip-country or Cloudflare's cf-ipcountry
 *  4. Default  – 'fr'
 */
function detectLocale(request: NextRequest): SupportedLocale {
  // 1️⃣  Saved cookie preference
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value
  if (cookie && (SUPPORTED_LOCALES as readonly string[]).includes(cookie)) {
    return cookie as SupportedLocale
  }

  // 2️⃣  Browser / OS language (Accept-Language header)
  const fromAccept = localeFromAcceptLanguage(
    request.headers.get('accept-language') ?? ''
  )
  if (fromAccept) return fromAccept

  // 3️⃣  IP Geolocation – Vercel adds x-vercel-ip-country on all plans
  //     Cloudflare adds cf-ipcountry as a fallback
  const country =
    request.headers.get('x-vercel-ip-country') ??
    request.headers.get('cf-ipcountry') ??
    ''
  const fromGeo = localeFromCountry(country)
  if (fromGeo) return fromGeo

  // 4️⃣  Default
  return DEFAULT_LOCALE
}

// ── Middleware ───────────────────────────────────────────────
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
    !pathname.startsWith('/admin')
  ) {
    const locale = detectLocale(request)
    const newUrl = request.nextUrl.clone()
    newUrl.pathname = `/${locale}${pathname === '/' ? '' : pathname}`

    const response = NextResponse.redirect(newUrl)

    // Persist the detected locale in a cookie so subsequent requests skip detection.
    // Only set it if the user hasn't already set one (don't overwrite an explicit choice).
    if (!request.cookies.get(LOCALE_COOKIE)) {
      response.cookies.set(LOCALE_COOKIE, locale, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
    }

    return response
  }

  // ── 2. Supabase Auth Session Refresh ──
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll()             { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
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

  // ── 4. Admin guard ──
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/fr/login', request.url))
    }

    const email = user.email?.toLowerCase() ?? ''

    if (email === SUPER_ADMIN_EMAIL.toLowerCase()) return response

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
