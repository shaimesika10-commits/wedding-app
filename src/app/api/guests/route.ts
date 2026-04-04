// ============================================================
//  GrandInvite – Guests API Route
//  GET  /api/guests?wedding_id=xxx   → רשימת אורחים (עם auth)
//  PATCH /api/guests/[id]            → עדכון סטטוס / מספר שולחן
//  DELETE /api/guests/[id]           → מחיקת אורח
//  src/app/api/guests/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// ── POST – הוספת אורח ידנית ─────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      wedding_id, name, email, phone,
      adults_count, children_count, rsvp_status,
      dietary_preferences, allergies, notes,
    } = body

    if (!wedding_id || !name?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields: wedding_id, name' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // וידוא בעלות
    const { data: wedding } = await supabase
      .from('weddings')
      .select('id')
      .eq('id', wedding_id)
      .eq('user_id', user.id)
      .single()
    if (!wedding) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: guest, error } = await supabase
      .from('guests')
      .insert({
        wedding_id,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        adults_count: adults_count ?? 1,
        children_count: children_count ?? 0,
        rsvp_status: rsvp_status ?? 'confirmed',
        dietary_preferences: dietary_preferences?.trim() || null,
        allergies: allergies?.trim() || null,
        notes: notes?.trim() || null,
        rsvp_submitted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ guest }, { status: 201 })
  } catch (err) {
    console.error('Guests POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── GET – טעינת אורחים ──────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const wedding_id = searchParams.get('wedding_id')

    if (!wedding_id) {
      return NextResponse.json(
        { error: 'Missing wedding_id parameter' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // בדיקת אותנטיקציה
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // וידוא שהחתונה שייכת למשתמש
    const { data: wedding } = await supabase
      .from('weddings')
      .select('id')
      .eq('id', wedding_id)
      .eq('user_id', user.id)
      .single()

    if (!wedding) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // טעינת אורחים
    const { data: guests, error } = await supabase
      .from('guests')
      .select('*')
      .eq('wedding_id', wedding_id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ guests })
  } catch (err) {
    console.error('Guests GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── PATCH – עדכון אורח ──────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, wedding_id, ...updates } = body

    if (!id || !wedding_id) {
      return NextResponse.json(
        { error: 'Missing id or wedding_id' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // וידוא בעלות
    const { data: wedding } = await supabase
      .from('weddings')
      .select('id')
      .eq('id', wedding_id)
      .eq('user_id', user.id)
      .single()

    if (!wedding) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // שדות מותרים לעדכון
    const allowedFields = [
      'rsvp_status',
      'table_number',
      'adults_count',
      'children_count',
      'dietary_preferences',
      'allergies',
      'notes',
      'name',
      'email',
      'phone',
    ]

    const safeUpdates: Record<string, unknown> = {}
    for (const key of allowedFields) {
      if (key in updates) {
        safeUpdates[key] = updates[key]
      }
    }
    safeUpdates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('guests')
      .update(safeUpdates)
      .eq('id', id)
      .eq('wedding_id', wedding_id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ guest: data })
  } catch (err) {
    console.error('Guests PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── DELETE – מחיקת אורח ──────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const wedding_id = searchParams.get('wedding_id')

    if (!id || !wedding_id) {
      return NextResponse.json(
        { error: 'Missing id or wedding_id' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // וידוא בעלות
    const { data: wedding } = await supabase
      .from('weddings')
      .select('id')
      .eq('id', wedding_id)
      .eq('user_id', user.id)
      .single()

    if (!wedding) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', id)
      .eq('wedding_id', wedding_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Guests DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
