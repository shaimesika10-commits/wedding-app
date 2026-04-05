// ============================================================
//  API: Send RSVP notification email to wedding owner
//  POST /api/wedding/rsvp-notify
//  Called internally after a guest submits RSVP
// ============================================================
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
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

  const { wedding_slug, guest_name, adults, children, attending, notes } = await req.json()

  if (!wedding_slug || !guest_name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Fetch wedding owner email
  const { data: wedding } = await supabase
    .from('weddings')
    .select('bride_name, groom_name, user_id')
    .eq('slug', wedding_slug)
    .single()

  if (!wedding) {
    return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })
  }

  // Get owner email from auth.users via admin or service role
  // For now, log the notification and return success
  // In production: integrate Resend/SendGrid with RESEND_API_KEY env var
  const resendApiKey = process.env.RESEND_API_KEY
  
  if (resendApiKey) {
    try {
      const { data: userRecord } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('id', wedding.user_id)
        .single()
        
      if (userRecord?.email) {
        const emailBody = {
          from: 'GrandInvite <noreply@grandinvite.app>',
          to: [userRecord.email],
          subject: `💌 Nouvelle réponse de ${guest_name}`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; color: #1c1917;">
              <h2 style="color: #c9a84c; font-weight: 300; letter-spacing: 2px;">Grand<strong>Invite</strong></h2>
              <hr style="border-color: #c9a84c; border-width: 1px 0 0; margin: 16px 0;" />
              <p><strong>${guest_name}</strong> vient de répondre à l'invitation de 
                <em>${wedding.bride_name} & ${wedding.groom_name}</em>.</p>
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr><td style="padding: 6px 0; color: #78716c;">Présence</td>
                    <td style="padding: 6px 0;"><strong>${attending ? '✅ Confirmé' : '❌ Absent'}</strong></td></tr>
                <tr><td style="padding: 6px 0; color: #78716c;">Adultes</td>
                    <td style="padding: 6px 0;">${adults ?? 1}</td></tr>
                <tr><td style="padding: 6px 0; color: #78716c;">Enfants</td>
                    <td style="padding: 6px 0;">${children ?? 0}</td></tr>
                ${notes ? `<tr><td style="padding: 6px 0; color: #78716c; vertical-align: top;">Notes</td>
                    <td style="padding: 6px 0;">${notes}</td></tr>` : ''}
              </table>
              <p style="color: #a8a29e; font-size: 13px;">Connectez-vous à votre tableau de bord GrandInvite pour voir toutes les réponses.</p>
            </div>
          `,
        }
        
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(emailBody),
        })
      }
    } catch (err) {
      console.error('[rsvp-notify] email error:', err)
      // Don't fail the request — notification is non-critical
    }
  }

  return NextResponse.json({ success: true })
}
