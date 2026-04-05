// ============================================================
//  GrandInvite – Create Wedding API Route
//  Server-side: bypasses browser cookie issues for email auth
//  src/app/api/create-wedding/route.ts
// ============================================================

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

function slugify(bride: string, groom: string, date: string): string {
  const clean = (s: string) => {
    const latin = s.toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')
    if (!latin) return s.split('').map(c => c.charCodeAt(0).toString(36)).join('').substring(0, 8)
    return latin
  }
  const year = date ? new Date(date).getFullYear() : new Date().getFullYear()
  return `${clean(bride)}-${clean(groom)}-${year}`
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Not authenticated', code: 'AUTH_ERROR' },
      { status: 401 }
    )
  }

  const body = await request.json()
  const {
    bride_name,
    groom_name,
    wedding_date,
    venue_name,
    venue_address,
    venue_city,
    venue_country,
    locale,
    rsvp_deadline,
    welcome_message,
  } = body

  const baseSlug = slugify(bride_name || '', groom_name || '', wedding_date || '')

  const weddingData = {
    user_id: user.id,
    bride_name: (bride_name || '').trim(),
    groom_name: (groom_name || '').trim(),
    wedding_date,
    venue_name: (venue_name || '').trim() || null,
    venue_address: (venue_address || '').trim() || null,
    venue_city: (venue_city || '').trim() || null,
    venue_country: venue_country || 'France',
    locale: locale || 'fr',
    rsvp_deadline: rsvp_deadline || null,
    welcome_message: (welcome_message || '').trim() || null,
    max_guests: 200,
    plan: 'free' as const,
    is_active: true,
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`
    const { error: insertError } = await supabase
      .from('weddings')
      .insert({ ...weddingData, slug })

    if (!insertError) {
      return NextResponse.json({ success: true })
    }

    if (insertError.code === '23505') continue

    return NextResponse.json(
      {
        error: `[${insertError.code}] ${insertError.message}${insertError.details ? ': ' + insertError.details : ''}`,
        code: insertError.code,
      },
      { status: 400 }
    )
  }

  return NextResponse.json(
    { error: 'Slug conflict after 5 attempts', code: 'SLUG_CONFLICT' },
    { status: 409 }
  )
}
