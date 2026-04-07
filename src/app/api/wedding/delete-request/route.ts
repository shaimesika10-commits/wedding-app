// ============================================================
// API: Request account deletion (sends confirmation email via Resend)
// POST /api/wedding/delete-request
// Task 4: Actually sends the confirmation email to the account owner
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
        setAll(toSet) { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wedding-app-pearl-alpha.vercel.app'
  const confirmUrl = `${baseUrl}/api/wedding/delete-confirm?token=${token}`
  const userEmail = user.email

  // ── Send confirmation email via Resend ──
  const resendApiKey = process.env.RESEND_API_KEY
  if (resendApiKey && userEmail) {
    try {
      const emailBody = {
        from: 'GrandInvite <noreply@grandinvite.app>',
        to: [userEmail],
        subject: '⚠️ Confirmation de suppression de compte GrandInvite',
        html: `
          <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; color: #1c1917; background: #faf8f5; padding: 40px 32px; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h2 style="font-size: 1.5rem; font-weight: 300; letter-spacing: 3px; color: #1c1917; margin: 0;">
                Grand<span style="color: #c9a84c;">Invite</span>
              </h2>
              <div style="height: 1px; background: #c9a84c; width: 48px; margin: 16px auto;"></div>
            </div>

            <h3 style="font-size: 1.2rem; font-weight: 300; color: #44403c; margin-bottom: 16px;">
              Demande de suppression de compte
            </h3>

            <p style="color: #78716c; line-height: 1.7; font-size: 0.95rem; margin-bottom: 24px;">
              Nous avons reçu une demande de suppression de votre compte GrandInvite
              (<strong>${userEmail}</strong>).<br/><br/>
              Si vous avez bien fait cette demande, cliquez sur le bouton ci-dessous pour confirmer.
              <strong>Cette action est irréversible</strong> — toutes vos données, invités et réponses seront supprimés.
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${confirmUrl}"
                 style="display: inline-block; padding: 14px 36px; background: #dc2626; color: #fff;
                        text-decoration: none; font-family: system-ui, sans-serif; font-size: 0.85rem;
                        font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; border-radius: 8px;">
                Confirmer la suppression
              </a>
            </div>

            <p style="color: #a8a29e; font-size: 0.8rem; text-align: center; line-height: 1.6; margin-top: 32px;">
              Ce lien expire dans <strong>1 heure</strong>.<br/>
              Si vous n’avez pas fait cette demande, ignorez cet email — votre compte reste intact.
            </p>

            <div style="height: 1px; background: #e7e5e4; margin: 32px 0;"></div>
            <p style="color: #d4d4d4; font-size: 0.75rem; text-align: center; font-family: system-ui, sans-serif;">
              © 2026 GrandInvite — Invitations de mariage de luxe
            </p>
          </div>
        `,
      }

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailBody),
      })

      if (!resendRes.ok) {
        const errText = await resendRes.text()
        console.error('[delete-request] Resend error:', errText)
      }
    } catch (err) {
      console.error('[delete-request] email error:', err)
      // Don’t fail the request — token was saved, user can request again
    }
  } else {
    // Dev fallback: log the URL
    console.log('[delete-request] confirm URL (no Resend key):', confirmUrl)
  }

  return NextResponse.json({ success: true, confirmUrl })
}
