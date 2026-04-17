// ============================================================
//  GrandInvite — Admin Weddings API
//  GET  /api/admin/weddings          — list all weddings
//  PATCH /api/admin/weddings         — edit wedding
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import { isSuperAdmin, logAdminAction } from '@/lib/admin'

async function getAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) return null
  return user
}

export async function GET() {
  const admin = await getAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin_sb = createAdminSupabaseClient()
  const { data, error } = await admin_sb
    .from('weddings')
    .select(`
      id, user_id, slug, bride_name, groom_name, wedding_date,
      venue_name, venue_city, venue_country, locale, plan, is_active,
      banned_at, banned_reason, created_at,
      guests(count)
    `)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ weddings: data })
}

export async function PATCH(req: NextRequest) {
  const admin = await getAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, updates } = await req.json()
  if (!id || !updates) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const admin_sb = createAdminSupabaseClient()

  // Prevent slug collision
  if (updates.slug) {
    const { data: existing } = await admin_sb
      .from('weddings').select('id').eq('slug', updates.slug).neq('id', id).maybeSingle()
    if (existing) return NextResponse.json({ error: 'Slug already taken' }, { status: 409 })
  }

  const { error } = await admin_sb
    .from('weddings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction({
    adminEmail: admin.email!,
    action: 'EDIT_WEDDING',
    targetTable: 'weddings',
    targetId: id,
    details: updates,
  })

  return NextResponse.json({ ok: true })
}
