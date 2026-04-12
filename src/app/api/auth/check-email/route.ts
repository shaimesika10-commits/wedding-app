// ============================================================
//  GrandInvite – Check if email is registered in Supabase Auth
//  POST /api/auth/check-email
//  Body: { email: string }
//  Response: { exists: boolean }
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ exists: false }, { status: 400 })
    }

    const admin = createAdminSupabaseClient()
    const { data, error } = await admin.auth.admin.getUserByEmail(email.toLowerCase().trim())

    if (error || !data?.user) {
      return NextResponse.json({ exists: false })
    }

    return NextResponse.json({ exists: true })
  } catch {
    // On any unexpected error, don't reveal information — return false
    return NextResponse.json({ exists: false })
  }
}
