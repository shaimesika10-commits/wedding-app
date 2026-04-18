// ============================================================
//  GrandInvite — Admin Legal Documents API
//  GET   /api/admin/legal?type=tos&locale=fr  — fetch one doc
//  PATCH /api/admin/legal                     — update a doc
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

  const type   = req.nextUrl.searchParams.get('type')   ?? 'tos'
  const locale = req.nextUrl.searchParams.get('locale') ?? 'fr'

  const sb = createAdminSupabaseClient()
  const { data, error } = await sb
    .from('legal_documents')
    .select('*')
    .eq('doc_type', type)
    .eq('locale', locale)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ doc: data })
}

export async function PATCH(req: NextRequest) {
  const user = await guardAdmin(req)
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { doc_type, locale, title, content, version } = body

  if (!doc_type || !locale || !title || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const sb = createAdminSupabaseClient()

  // Upsert: update if exists, insert if not
  const { error } = await sb
    .from('legal_documents')
    .upsert(
      {
        doc_type,
        locale,
        title,
        content,
        version: version ?? '1.0',
        updated_at: new Date().toISOString(),
        updated_by: user.email!,
      },
      { onConflict: 'doc_type,locale' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAction({
    adminEmail: user.email!,
    action: 'UPDATE_LEGAL_DOC',
    targetTable: 'legal_documents',
    targetId: `${doc_type}/${locale}`,
    details: { doc_type, locale, version },
  })

  return NextResponse.json({ ok: true })
}
