// ============================================================
//  GrandInvite – RSVP API Route
//  src/app/api/rsvp/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      wedding_id,
      name,
      email,
      phone,
      adults_count,
      children_count,
      dietary_preferences,
      allergies,
      notes,
      rsvp_status,
    } = body

    // ── Validation ──
    if (!wedding_id || !name || !rsvp_status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['confirmed', 'declined'].includes(rsvp_status)) {
      return NextResponse.json(
        { error: 'Invalid RSVP status' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // ── בדיקת מגבלת אורחים (Freemium) ──
    const { data: wedding } = await supabase
      .from('weddings')
      .select('max_guests, plan')
      .eq('id', wedding_id)
      .single()

    if (wedding && rsvp_status === 'confirmed') {
      const { count } = await supabase
        .from('guests')
        .select('*', { count: 'exact', head: true })
        .eq('wedding_id', wedding_id)
        .eq('rsvp_status', 'confirmed')

      const currentCount = count ?? 0
      const newTotal = currentCount + (adults_count ?? 1) + (children_count ?? 0)

      if (newTotal > wedding.max_guests) {
        return NextResponse.json(
          { error: 'Guest limit reached', limit: wedding.max_guests },
          { status: 409 }
        )
      }
    }

    // ── הכנסת RSVP לבסיס הנתונים ──
    const { data, error } = await supabase
      .from('guests')
      .insert({
        wedding_id,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        adults_count: adults_count ?? 1,
        children_count: children_count ?? 0,
        dietary_preferences: dietary_preferences?.trim() || null,
        allergies: allergies?.trim() || null,
        notes: notes?.trim() || null,
        rsvp_status,
        rsvp_submitted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('RSVP insert error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true, guest: data }, { status: 201 })
  } catch (err) {
    console.error('RSVP route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
          }
