// ============================================================
//  GrandInvite – Delete Account Confirmation API
//  Confirms deletion and removes wedding + guest data
//  src/app/api/wedding/delete-confirm/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Decode token to get wedding_id
    let wedding_id: string
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      wedding_id = decoded.split(':')[0]
    } catch {
      return NextResponse.redirect(new URL('/', req.url))
    }

    const admin = createAdminSupabaseClient()

    // Delete all guests for this wedding
    await admin
      .from('guests')
      .delete()
      .eq('wedding_id', wedding_id)

    // Delete all gallery photos
    await admin
      .from('gallery_photos')
      .delete()
      .eq('wedding_id', wedding_id)

    // Delete all event schedules
    await admin
      .from('event_schedule')
      .delete()
      .eq('wedding_id', wedding_id)

    // Fetch the wedding to get the user_id before deleting
    const { data: wedding, error: fetchError } = await admin
      .from('weddings')
      .select('user_id')
      .eq('id', wedding_id)
      .single()

    if (fetchError || !wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })
    }

    const user_id = wedding.user_id

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

    // Return HTML success page (user clicked link in email)
    return new Response(
      `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Compte supprimé · GrandInvite</title>
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
    <h1>Compte supprimé</h1>
    <p>Votre compte GrandInvite et toutes les données associées ont été supprimés définitivement.<br>Nous vous souhaitons un merveilleux mariage !</p>
    <a href="/">Retour à l'accueil</a>
  </div>
</body>
</html>`,
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  } catch (error) {
    console.error('Delete confirm error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
