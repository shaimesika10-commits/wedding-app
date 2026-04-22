// ============================================================
//  GrandInvite – Premium Activation API
//  POST /api/premium/activate
//
//  Body: { code: string }
//  Validates the activation code against the PREMIUM_ACTIVATION_CODE
//  environment variable and upgrades the user's wedding plan to 'premium'.
//
//  To change the code: update PREMIUM_ACTIVATION_CODE in Vercel env vars.
//  Default (dev fallback): '10203040'
//
//  Future: replace with one-time payment webhook from Stripe / Lemonsqueezy.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse body
    const body = await req.json()
    const { code } = body as { code?: string }

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Missing activation code' }, { status: 400 })
    }

    // Validate code — compare against env var (trimmed, case-insensitive)
    const validCode = (process.env.PREMIUM_ACTIVATION_CODE ?? '10203040').trim()
    if (code.trim() !== validCode) {
      return NextResponse.json({ error: 'Invalid activation code' }, { status: 400 })
    }

    // Fetch the user's wedding to check current plan
    const { data: wedding, error: fetchError } = await supabase
      .from('weddings')
      .select('id, plan')
      .eq('user_id', user.id)
      .single()

    if (fetchError || !wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })
    }

    if (wedding.plan === 'premium') {
      return NextResponse.json({ alreadyPremium: true, message: 'Already Premium' })
    }

    // Upgrade to premium
    const { error: updateError } = await supabase
      .from('weddings')
      .update({
        plan: 'premium',
        max_guests: 999999,          // effectively unlimited
        notify_new_rsvp: true,       // enable RSVP email notifications
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Premium activation error:', updateError)
      return NextResponse.json({ error: 'Failed to activate premium' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Premium activated' })
  } catch (err) {
    console.error('POST /api/premium/activate error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
