// ============================================================
//  GrandInvite — Admin Stats API
//  GET /api/admin/stats
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import { isAdminDB } from '@/lib/admin'

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdminDB(user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminSupabaseClient()

  const [
    weddings, guests, photos, newWeddings,
    confirmedGuests, bannedWeddings, auditRecent,
    adminUsers, allUsers,
  ] = await Promise.all([
    admin.from('weddings').select('id', { count: 'exact', head: true }),
    admin.from('guests').select('id', { count: 'exact', head: true }),
    admin.from('gallery_photos').select('id', { count: 'exact', head: true }),
    admin.from('weddings').select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
    admin.from('guests').select('id', { count: 'exact', head: true })
      .eq('rsvp_status', 'confirmed'),
    admin.from('weddings').select('id', { count: 'exact', head: true })
      .not('banned_at', 'is', null),
    admin.from('admin_audit_log').select('action, created_at, admin_email')
      .order('created_at', { ascending: false }).limit(8),
    admin.from('admin_users').select('id', { count: 'exact', head: true }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ])

  return NextResponse.json({
    total_weddings:   weddings.count        ?? 0,
    total_guests:     guests.count          ?? 0,
    total_photos:     photos.count          ?? 0,
    new_weddings_7d:  newWeddings.count     ?? 0,
    confirmed_guests: confirmedGuests.count ?? 0,
    banned_weddings:  bannedWeddings.count  ?? 0,
    total_admins:     adminUsers.count      ?? 0,
    total_users:      allUsers.data?.users?.length ?? 0,
    recent_actions:   auditRecent.data      ?? [],
  })
}