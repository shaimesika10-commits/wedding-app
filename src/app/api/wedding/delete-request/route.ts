// ============================================================
//  API: Request account deletion (sends confirmation email)
//  POST /api/wedding/delete-request
// ============================================================
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function POST() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(toSet) {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )

  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Generate a secure token valid for 1 hour
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

  const { error: updateErr } = await supabase
    .from('weddings')
    .update({ delete_token: token, delete_token_expires_at: expiresAt })
    .eq('user_id', user.id)

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://grandinvite.vercel.app'
  const confirmUrl = `${baseUrl}/api/wedding/delete-confirm?token=${token}`

  // Send email via Supabase Edge Function or fallback to logged URL in dev
  // In production: integrate with Resend/SendGrid here
  // For now, return the URL so the dashboard can display it
  console.log('[delete-request] confirm URL:', confirmUrl)

  return NextResponse.json({ success: true, confirmUrl })
}
