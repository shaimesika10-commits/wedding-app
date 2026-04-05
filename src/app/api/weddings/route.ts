// ============================================================
//  GrandInvite – Weddings API Route
//  PATCH /api/weddings  → עדכון פרטי חתונה
//  src/app/api/weddings/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// ── PATCH – עדכון חתונה ──────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing wedding id' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // וידוא שהחתונה שייכת למשתמש
    const { data: wedding } = await supabase
      .from('weddings')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    if (!wedding) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // שדות מותרים לעדכון
    const allowed = [
      'bride_name', 'groom_name', 'wedding_date',
      'venue_name', 'venue_address', 'venue_city', 'venue_country',
      'locale', 'welcome_message', 'rsvp_deadline',
      'google_maps_url', 'waze_url', 'cover_image_url',
      'is_active',
    ]
    const safeUpdates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in updates) safeUpdates[key] = updates[key]
    }
    safeUpdates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('weddings')
      .update(safeUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ wedding: data })
  } catch (err) {
    console.error('Weddings PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── POST – הוספת אירוע ללו"ז ─────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { wedding_id, ...eventData } = body

    if (!wedding_id) return NextResponse.json({ error: 'Missing wedding_id' }, { status: 400 })

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: wedding } = await supabase
      .from('weddings')
      .select('id')
      .eq('id', wedding_id)
      .eq('user_id', user.id)
      .single()
    if (!wedding) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data, error } = await supabase
      .from('event_schedule')
      .insert({ wedding_id, ...eventData })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ event: data }, { status: 201 })
  } catch (err) {
    console.error('Weddings POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── DELETE – מחיקת אירוע מלו"ז ───────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const event_id = searchParams.get('event_id')
    const wedding_id = searchParams.get('wedding_id')

    if (!event_id || !wedding_id) {
      return NextResponse.json({ error: 'Missing event_id or wedding_id' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: wedding } = await supabase
      .from('weddings')
      .select('id')
      .eq('id', wedding_id)
      .eq('user_id', user.id)
      .single()
    if (!wedding) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { error } = await supabase
      .from('event_schedule')
      .delete()
      .eq('id', event_id)
      .eq('wedding_id', wedding_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Weddings DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
