// ============================================================
//  GrandInvite – Admin Premium Management API
//  POST /api/admin/premium
//  Body: { weddingId: string, action: 'grant' | 'revoke' }
//  Admin-only: grants or revokes premium plan for a wedding.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient, createServerSupabaseClient } from '@/lib/supabase-server'
import { isAdminDB } from '@/lib/admin'

export async function POST(req: NextRequest) {
  try {
    // ── Auth: must be admin ──
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminCheck = await isAdminDB(user.email)
    if (!adminCheck) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // ── Parse body ──
    const { weddingId, action } = await req.json() as { weddingId?: string; action?: string }
    if (!weddingId || !['grant', 'revoke'].includes(action ?? '')) {
      return NextResponse.json({ error: 'Missing or invalid weddingId / action' }, { status: 400 })
    }

    const sb = createAdminSupabaseClient()
    const newPlan = action === 'grant' ? 'premium' : 'free'
    const newMaxGuests = action === 'grant' ? 999999 : 200

    const { error } = await sb
      .from('weddings')
      .update({
        plan:          newPlan,
        max_guests:    newMaxGuests,
        notify_new_rsvp: action === 'grant',
        updated_at:    new Date().toISOString(),
      })
      .eq('id', weddingId)

    if (error) {
      console.error('[Admin Premium] update error:', error)
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true, plan: newPlan })
  } catch (err) {
    console.error('[Admin Premium] route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
