// ============================================================
//  GrandInvite — Public Legal Documents API
//  GET /api/legal/[type]?locale=he|fr|en
//  Returns the content of a legal document (tos/privacy/refund)
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params
  const locale = req.nextUrl.searchParams.get('locale') ?? 'fr'

  if (!['tos', 'privacy', 'refund'].includes(type)) {
    return NextResponse.json({ error: 'Invalid document type' }, { status: 400 })
  }
  if (!['he', 'fr', 'en'].includes(locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
  }

  const sb = createAdminSupabaseClient()
  const { data, error } = await sb
    .from('legal_documents')
    .select('title, content, version, effective_date, updated_at')
    .eq('doc_type', type)
    .eq('locale', locale)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data)  return NextResponse.json({ error: 'Document not found' }, { status: 404 })

  return NextResponse.json({ doc: data }, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  })
}
