// ============================================================
//  GrandInvite – Delete Account Request API
//  Sends a confirmation email with a deletion link via Resend
//  src/app/api/wedding/delete-request/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createHmac } from 'crypto'

function generateDeleteToken(weddingId: string): string {
  const secret = process.env.DELETE_TOKEN_SECRET ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'fallback-secret'
  const timestamp = Date.now()
  const payload = `${weddingId}:${timestamp}`
  const sig = createHmac('sha256', secret).update(payload).digest('hex')
  return Buffer.from(`${payload}:${sig}`).toString('base64url')
}

const deleteEmailHtml = (names: string, confirmUrl: string, locale: string) => {
  const isHe = locale === 'he'
  const isFr = locale === 'fr'

  const subject = isHe
    ? 'אישור מחיקת חשבון GrandInvite'
    : isFr
    ? 'Confirmation de suppression de compte GrandInvite'
    : 'Confirm GrandInvite account deletion'

  const heading = isHe ? `שלום ${names}` : isFr ? `Bonjour ${names}` : `Hello ${names}`
  const body = isHe
    ? 'קיבלנו בקשה למחיקת חשבון GrandInvite שלכם, כולל כל נתוני החתונה והאורחים. פעולה זו היא <strong>בלתי הפיכה</strong>.'
    : isFr
    ? 'Nous avons reçu une demande de suppression de votre compte GrandInvite, y compris toutes les données de votre mariage et de vos invités. Cette action est <strong>irréversible</strong>.'
    : 'We received a request to delete your GrandInvite account, including all wedding and guest data. This action is <strong>irreversible</strong>.'

  const btnLabel = isHe
    ? 'אישור מחיקה'
    : isFr
    ? 'Confirmer la suppression'
    : 'Confirm deletion'

  const ignoreNote = isHe
    ? 'אם לא ביקשת זאת, התעלמו מאימייל זה — החשבון שלכם בטוח.'
    : isFr
    ? "Si vous n'avez pas fait cette demande, ignorez cet e-mail — votre compte est en sécurité."
    : "If you didn't request this, ignore this email — your account is safe."

  return { subject, html: `<!DOCTYPE html>
<html dir="${isHe ? 'rtl' : 'ltr'}" lang="${locale}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:Georgia,serif;color:#1c1917">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f5;padding:48px 16px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e7e5e4;border-radius:16px;overflow:hidden">
        <!-- Header -->
        <tr>
          <td style="background:#1c1917;padding:28px 40px;text-align:center">
            <span style="font-size:22px;font-weight:300;letter-spacing:0.1em;color:#fff">
              Grand<span style="color:#c9a84c">Invite</span>
            </span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;text-align:${isHe ? 'right' : 'left'}">
            <p style="font-size:18px;font-weight:300;margin:0 0 16px">${heading}</p>
            <p style="font-size:14px;line-height:1.7;color:#44403c;font-family:system-ui,sans-serif;margin:0 0 32px">${body}</p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto">
              <tr>
                <td style="background:#c9084c;border-radius:10px;padding:0">
                  <a href="${confirmUrl}"
                     style="display:inline-block;padding:14px 36px;background:#b91c1c;color:#fff;font-family:system-ui,sans-serif;font-size:14px;font-weight:500;letter-spacing:0.06em;text-decoration:none;border-radius:10px">
                    ${btnLabel}
                  </a>
                </td>
              </tr>
            </table>
            <p style="font-size:12px;color:#a8a29e;font-family:system-ui,sans-serif;margin:32px 0 0;line-height:1.6">${ignoreNote}</p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #e7e5e4;text-align:center">
            <p style="font-size:11px;color:#a8a29e;font-family:system-ui,sans-serif;margin:0">
              © ${new Date().getFullYear()} GrandInvite
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>` }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the wedding for this user
    const { data: wedding } = await supabase
      .from('weddings')
      .select('id, bride_name, groom_name, locale')
      .eq('user_id', user.id)
      .single()

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })
    }

    // Generate a secure HMAC-signed deletion token (expires in 1 hour)
    const token = generateDeleteToken(wedding.id)
    const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/wedding/delete-confirm?token=${token}`

    const names = `${wedding.bride_name} & ${wedding.groom_name}`
    const locale = (wedding.locale as string) ?? 'fr'
    const { subject, html } = deleteEmailHtml(names, confirmUrl, locale)

    // Send email via Resend REST API
    const resendApiKey = process.env.RESEND_API_KEY
    if (resendApiKey) {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'GrandInvite <onboarding@resend.dev>',
          to: [user.email],
          subject,
          html,
        }),
      })

      if (!emailRes.ok) {
        const errBody = await emailRes.text()
        console.error('Resend email error:', errBody)
        return NextResponse.json({ error: 'Failed to send confirmation email' }, { status: 500 })
      }
    } else {
      // Dev fallback: log the link (RESEND_API_KEY not set)
      console.log(`[DEV] Delete confirmation link for ${user.email}: ${confirmUrl}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent',
      // confirmUrl intentionally omitted from production response
      ...(process.env.NODE_ENV === 'development' ? { confirmUrl } : {}),
    })
  } catch (error) {
    console.error('Delete request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
