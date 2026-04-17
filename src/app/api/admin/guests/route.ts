// ============================================================
//  GrandInvite — Admin Guests API
//  GET   /api/admin/guests?weddingId=...  — list guests
//  PATCH /api/admin/guests                — edit guest
//  GET   /api/admin/guests?export=csv     — CSV export
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

export async function GET(req: NextRequest) {
  const admin = await getAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const weddingId = searchParams.get('weddingId')
  const exportCsv = searchParams.get('export') === 'csv'

  const admin_sb = createAdminSupabaseClient()

  let query = admin_sb.from('guests').select(`
    id, wedding_id, name, adults_count, children_count,
    rsvp_status, dietary_notes, notes, created_at,
    weddings(bride_name, groom_name, slug)
  `).order('created_at', { ascending: false })

  if (weddingId) query = query.eq('wedding_id', weddingId)

  const { data, error } = await query.limit(1000)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (exportCsv) {
    const rows = [
      ['Wedding', 'Guest Name', 'Adults', 'Children', 'RSVP Status', 'Dietary Notes', 'Notes', 'Date'].join(','),
      ...(data ?? []).map(g => {
        const w = (g as Record<string, unknown>).weddings as { bride_name: string; groom_name: string } | null
        return [
          `"${w ? `${w.bride_name} & ${w.groom_name}` : ''}"`,
          `"${g.name}"`,
          g.adults_count,
          g.children_count,
          g.rsvp_status,
          `"${g.dietary_notes ?? ''}"`,
          `"${g.notes ?? ''}"`,
          new Date(g.created_at).toLocaleDateString('en-GB'),
        ].join(',')
      })
    ].join('\n')

    return new NextResponse(rows, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="guests-${Date.now()}.csv"`,
      }
    })
  }

  return NextResponse.json({ guests: data })
}

export async function PATCH(req: NextRequest) {
  const admin = await getAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { guestId, updates } = await req.json()
  if (!guestId || !updates) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const admin_sb = createAdminSupabaseClient()
  const { error } = await admin_sb.from('guests').update(updates).eq('id', guestId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction({
    adminEmail: admin.email!,
    action: 'EDIT_GUEST',
    targetTable: 'guests',
    targetId: guestId,
    details: updates,
  })

  return NextResponse.json({ ok: true })
}
