// ============================================================
//  GrandInvite – Sign Out API Route
//  POST /api/auth/signout
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()

  // Use the request origin so this works on any domain (Vercel preview, custom domain, etc.)
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin
  return NextResponse.redirect(new URL('/', origin), { status: 302 })
}
