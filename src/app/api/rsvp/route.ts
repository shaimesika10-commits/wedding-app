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
      brunch_attending,
    } = body

    if (!wedding_id || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Check guest limit
    const { data: wedding } = await supabase
      .from('weddings')
      .select('max_guests, plan')
      .eq('id', wedding_id)
      .single()

    if (wedding) {
      const { count } = await supabase
        .from('guests')
        .select('*', { count: 'exact', head: true })
        .eq('wedding_id', wedding_id)
        .eq('rsvp_status', 'confirmed')

      const maxGuests = wedding.max_guests || 200
      if (rsvp_status === 'confirmed' && (count || 0) >= maxGuests) {
        return NextResponse.json({ error: 'Guest limit reached' }, { status: 403 })
      }
    }

    const { error } = await supabase.from('guests').insert({
      wedding_id,
      name,
      email: email || null,
      phone: phone || null,
      adults_count: adults_count || 1,
      children_count: children_count || 0,
      dietary_preferences: dietary_preferences || null,
      allergies: allergies || null,
      notes: notes || null,
      rsvp_status: rsvp_status || 'confirmed',
      brunch_attending: brunch_attending !== undefined ? brunch_attending : null,
      rsvp_submitted_at: new Date().toISOString(),
    })

    if (error) {
      console.error('RSVP insert error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('RSVP error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
