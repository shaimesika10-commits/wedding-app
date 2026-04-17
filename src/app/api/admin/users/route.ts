// ============================================================
//  GrandInvite — Admin Users API
//  GET  /api/admin/users          — list all users
//  POST /api/admin/users          — ban / unban user
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

// ── GET — list all auth users ──────────────────────────────
export async function GET(req: NextRequest) {
  const admin = await getAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin_sb = createAdminSupabaseClient()
  const { data, error } = await admin_sb.auth.admin.listUsers({ perPage: 200 })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Enrich with wedding count
  const userIds = data.users.map(u => u.id)
  const { data: weddings } = await admin_sb
    .from('weddings')
    .select('user_id, id, slug, bride_name, groom_name, banned_at')
    .in('user_id', userIds)

  const weddingMap: Record<string, typeof weddings> = {}
  for (const w of weddings ?? []) {
    if (!weddingMap[w.user_id]) weddingMap[w.user_id] = []
    weddingMap[w.user_id]!.push(w)
  }

  const users = data.users.map(u => ({
    id:             u.id,
    email:          u.email,
    created_at:     u.created_at,
    last_sign_in:   u.last_sign_in_at,
    banned_until:   u.banned_until,
    weddings:       weddingMap[u.id] ?? [],
  }))

  return NextResponse.json({ users })
}

// ── POST — ban / unban a user ──────────────────────────────
export async function POST(req: NextRequest) {
  const admin = await getAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, action, reason } = await req.json()
  if (!userId || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const admin_sb = createAdminSupabaseClient()

  if (action === 'ban') {
    const { error } = await admin_sb.auth.admin.updateUserById(userId, {
      ban_duration: '876000h', // 100 years ≈ permanent
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Also mark their wedding as banned
    await admin_sb.from('weddings')
      .update({ banned_at: new Date().toISOString(), banned_reason: reason ?? 'Admin ban' })
      .eq('user_id', userId)

    await logAdminAction({ adminEmail: admin.email!, action: 'BAN_USER', targetTable: 'auth.users', targetId: userId, details: { reason } })

  } else if (action === 'unban') {
    const { error } = await admin_sb.auth.admin.updateUserById(userId, {
      ban_duration: 'none',
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await admin_sb.from('weddings')
      .update({ banned_at: null, banned_reason: null })
      .eq('user_id', userId)

    await logAdminAction({ adminEmail: admin.email!, action: 'UNBAN_USER', targetTable: 'auth.users', targetId: userId })

  } else if (action === 'delete') {
    const { error } = await admin_sb.auth.admin.deleteUser(userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await logAdminAction({ adminEmail: admin.email!, action: 'DELETE_USER', targetTable: 'auth.users', targetId: userId })
  }

  return NextResponse.json({ ok: true })
}
