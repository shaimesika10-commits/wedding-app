// ============================================================
//  GrandInvite — Site Settings API
//  GET   /api/admin/settings   — list all settings
//  PATCH /api/admin/settings   — update a setting
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import { isAdminDB, logAdminAction } from '@/lib/admin'

async function guardAdmin(req: NextRequest) {
  const sb = await createServerSupabaseClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user || !(await isAdminDB(user.email))) return null
  return user
}

export async function GET(req: NextRequest) {
  const user = await guardAdmin(req)
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const sb = createAdminSupabaseClient()
  const { data: settings, error } = await sb
    .from('site_settings')
    .select('key, value, description, updated_by, updated_at')
    .order('key')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ settings })
}

export async function PATCH(req: NextRequest) {
  const user = await guardAdmin(req)
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { key, value } = await req.json()
  if (!key || value === undefined) {
    return NextResponse.json({ error: 'Missing key or value' }, { status: 400 })
  }

  const sb = createAdminSupabaseClient()
  const { error } = await sb
    .from('site_settings')
    .update({ value: String(value), updated_by: user.email!, updated_at: new Date().toISOString() })
    .eq('key', key)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction({
    adminEmail: user.email!,
    action: 'UPDATE_SETTING',
    targetTable: 'site_settings',
    targetId: key,
    details: { key, new_value: value },
  })

  return NextResponse.json({ ok: true })
}