// ============================================================
//  GrandInvite – Guests API Route
//  GET  /api/guests?wedding_id=xxx
//  PATCH /api/guests/[id]
//  DELETE /api/guests/[id]
//  src/app/api/guests/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// ── GET ──────────────────────────────────────────────────────
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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: wedding } = await supabase
      .from('weddings')
      .select('id')
      .eq('id', wedding_id)
      .eq('user_id', user.id)
      .single()

    if (!wedding) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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

// ── PATCH ────────────────────────────────────────────────────
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

    const { data: wedding } = await supabase
      .from('weddings')
      .select('id')
      .eq('id', wedding_id)
      .eq('user_id', user.id)
      .single()

    if (!wedding) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const allowedFields = [
      'rsvp_status', 'table_number', 'adults_count', 'children_count',
      'dietary_preferences', 'allergies', 'notes', 'name', 'email', 'phone',
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

// ── DELETE ───────────────────────────────────────────────────
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
