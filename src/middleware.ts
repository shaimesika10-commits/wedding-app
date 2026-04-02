import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const SUPPORTED_LOCALES = ['fr', 'he', 'en']
const DEFAULT_LOCALE = 'fr'

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

  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (!pathnameHasLocale && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
    const locale = getLocaleFromRequest(request)
    const newUrl = request.nextUrl.clone()
    newUrl.pathname = `/${locale}${pathname}`
    return NextResponse.redirect(newUrl)
  }

  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  await supabase.auth.getUser()

  const locale = SUPPORTED_LOCALES.find(l => pathname.startsWith(`/${l}/`))
  if (locale && pathname.includes('/dashboard')) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = `/${locale}/login`
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
