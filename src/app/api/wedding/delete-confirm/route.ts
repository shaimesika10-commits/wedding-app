// ============================================================
//  GrandInvite – Delete Account Confirmation API
//  Confirms deletion and removes wedding + guest data
//  src/app/api/wedding/delete-confirm/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import { createHmac, timingSafeEqual } from 'crypto'

const ONE_HOUR_MS = 60 * 60 * 1000

function verifyDeleteToken(token: string): { valid: boolean; wedding_id?: string } {
  try {
    const secret = process.env.DELETE_TOKEN_SECRET ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'fallback-secret'
    const decoded = Buffer.from(token, 'base64url').toString('utf-8')
    const parts = decoded.split(':')
    if (parts.length !== 3) return { valid: false }
    const [wedding_id, timestampStr, sig] = parts
    const timestamp = parseInt(timestampStr, 10)
    if (isNaN(timestamp) || Date.now() - timestamp > ONE_HOUR_MS) return { valid: false }
    const payload = `${wedding_id}:${timestampStr}`
    const expectedSig = createHmac('sha256', secret).update(payload).digest('hex')
    const sigBuf = Buffer.from(sig)
    const expectedBuf = Buffer.from(expectedSig)
    if (sigBuf.length !== expectedBuf.length) return { valid: false }
    if (!timingSafeEqual(sigBuf, expectedBuf)) return { valid: false }
    return { valid: true, wedding_id }
  } catch {
    return { valid: false }
  }
}

function successPage(locale: string): string {
  const isHe = locale === 'he'
  const isFr = locale === 'fr'
  const title = isHe ? 'החשבון נמחק' : isFr ? 'Compte supprimé' : 'Account deleted'
  const body = isHe
    ? 'חשבון GrandInvite שלך וכל הנתונים הקשורים אליו נמחקו לצמיתות.<br>אנו מאחלים לכם חתונה נפלאה!'
    : isFr
    ? "Votre compte GrandInvite et toutes les données associées ont été supprimés définitivement.<br>Nous vous souhaitons un merveilleux mariage !"
    : 'Your GrandInvite account and all associated data have been permanently deleted.<br>We wish you a wonderful wedding!'
  const link = isHe ? 'חזרה לדף הבית' : isFr ? "Retour à l'accueil" : 'Return to homepage'
  const langAttr = isHe ? 'he' : isFr ? 'fr' : 'en'
  const dirAttr = isHe ? 'rtl' : 'ltr'
  return `<!DOCTYPE html>
<html lang="${langAttr}" dir="${dirAttr}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} · GrandInvite</title>
  <style>
    body{margin:0;padding:0;background:#faf8f5;font-family:Georgia,serif;color:#1c1917;display:flex;align-items:center;justify-content:center;min-height:100vh}
    .card{background:#fff;border:1px solid #e7e5e4;border-radius:16px;padding:48px 40px;max-width:480px;width:90%;text-align:center}
    .icon{width:56px;height:56px;background:#f0fdf4;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px}
    h1{font-size:1.8rem;font-weight:300;margin:0 0 12px;letter-spacing:0.02em}
    p{font-size:0.9rem;color:#78716c;line-height:1.7;font-family:system-ui,sans-serif;margin:0 0 28px}
    a{display:inline-block;padding:12px 32px;background:#c9a84c;color:#fff;border-radius:10px;text-decoration:none;font-family:system-ui,sans-serif;font-size:0.85rem;font-weight:500;letter-spacing:0.06em}
    .brand{font-size:1.1rem;font-weight:300;letter-spacing:0.1em;margin-bottom:32px}
    .brand span{color:#c9a84c}
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">Grand<span>Invite</span></div>
    <div class="icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    </div>
    <h1>${title}</h1>
    <p>${body}</p>
    <a href="/">${link}</a>
  </div>
</body>
</html>`
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Verify HMAC token (includes expiry check)
    const { valid, wedding_id } = verifyDeleteToken(token)
    if (!valid || !wedding_id) {
      return new Response(
        `<!DOCTYPE html><html><body style="font-family:system-ui;text-align:center;padding:60px"><h2>Invalid or expired link</h2><p>This deletion link has expired or is invalid. Please request a new one from your dashboard.</p><a href="/">Return home</a></body></html>`,
        { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    const admin = createAdminSupabaseClient()

    // Fetch the wedding (user_id + locale) BEFORE deleting
    const { data: wedding, error: fetchError } = await admin
      .from('weddings')
      .select('user_id, locale')
      .eq('id', wedding_id)
      .single()

    if (fetchError || !wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })
    }

    const user_id = wedding.user_id
    const wLocale = (wedding.locale as string) ?? 'fr'

    // Delete all guests, gallery photos, event schedules
    await admin.from('guests').delete().eq('wedding_id', wedding_id)
    await admin.from('gallery_photos').delete().eq('wedding_id', wedding_id)
    await admin.from('event_schedule').delete().eq('wedding_id', wedding_id)

    // Delete the wedding (cascade deletes guests, schedule, gallery via FK)
    const { error: deleteError } = await admin
      .from('weddings')
      .delete()
      .eq('id', wedding_id)

    if (deleteError) {
      console.error('Delete wedding error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete wedding' }, { status: 500 })
    }

    // Delete from public.users so the email can be re-used for registration
    await admin
      .from('users')
      .delete()
      .eq('id', user_id)

    // Delete from auth.users (must be last — invalidates the session)
    const { error: authDeleteError } = await admin.auth.admin.deleteUser(user_id)
    if (authDeleteError) {
      console.error('Auth user delete error:', authDeleteError)
      // Non-fatal: public data is already gone
    }

    // Return localized HTML success page (user clicked link in email)
    return new Response(
      successPage(wLocale),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  } catch (error) {
    console.error('Delete confirm error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
