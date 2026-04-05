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


    const supabase = await createServerSupabaseClient()


    // Check guest limit
    const { data: wedding } = await supabase
      .from('weddings')
      .select('max_guests, plan')
      .eq('id', wedding_id)
      .single()


    if (wedding) {
      const { count } = await supabase
        .from('guests')
