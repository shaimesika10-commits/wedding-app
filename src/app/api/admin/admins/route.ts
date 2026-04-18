// ============================================================
//  GrandInvite — Admin Management API (NEW)
//  GET  /api/admin/admins       
//  POST /api/admin/admins       
//  DELETE /api/admin/admins     
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
  const { data: admins, error } = await sb
    .from('admin_users')
    .select('*')
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ admins })
}

export async function POST(req: NextRequest) {
  const user = await guardAdmin(req)
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { email } = await req.json()
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 })
  }

  const emailLower = email.toLowerCase().trim()
  const sb = createAdminSupabaseClient()

  const { data: existing } = await sb.from('admin_users').select('email').eq('email', emailLower).maybeSingle()
  if (existing) return NextResponse.json({ error: 'User is already an admin.' }, { status: 409 })

  const { error } = await sb.from('admin_users').insert({
    email: emailLower,
    added_by: user.email!,
    is_primary: false,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction({
    adminEmail: user.email!,
    action: 'ADD_ADMIN',
    targetTable: 'admin_users',
    details: { added_email: emailLower },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const user = await guardAdmin(req)
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  if (email.toLowerCase() === 'shaimesika10@gmail.com') {
    return NextResponse.json({ error: 'Cannot remove the primary admin.' }, { status: 403 })
  }

  const sb = createAdminSupabaseClient()
  const { error } = await sb.from('admin_users').delete().eq('email', email.toLowerCase())
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction({
    adminEmail: user.email!,
    action: 'REMOVE_ADMIN',
    targetTable: 'admin_users',
    details: { removed_email: email },
  })

  return NextResponse.json({ ok: true })
}
