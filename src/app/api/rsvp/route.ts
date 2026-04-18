// ============================================================
//  GrandInvite – RSVP API Route
//  src/app/api/rsvp/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'

// ─────────────────────────────────────────────────────────────
//  EMAIL TEMPLATES
// ─────────────────────────────────────────────────────────────

const LOGO_HTML = `<span style="font-size:20px;font-weight:300;letter-spacing:0.1em;color:#fff">Grand<span style="color:#c9a84c">Invite</span></span>`

function emailWrapper(locale: string, bodyContent: string) {
  const isHe = locale === 'he'
  return `<!DOCTYPE html>
<html dir="${isHe ? 'rtl' : 'ltr'}" lang="${locale}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:Georgia,serif;color:#1c1917">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f5;padding:40px 16px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e7e5e4;border-radius:16px;overflow:hidden;max-width:100%">
        <tr>
          <td style="background:#1c1917;padding:24px 40px;text-align:center">
            ${LOGO_HTML}
          </td>
        </tr>
        ${bodyContent}
        <tr>
          <td style="padding:16px 40px;border-top:1px solid #f0ede8;text-align:center">
            <p style="font-size:11px;color:#a8a29e;font-family:system-ui,sans-serif;margin:0">© ${new Date().getFullYear()} GrandInvite</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function guestConfirmationEmail(
  guestName: string,
  rsvpStatus: 'confirmed' | 'declined',
  weddingDetails: {
    bride_name: string
    groom_name: string
    wedding_date: string
    venue_name: string | null
    venue_city: string | null
    locale: string
  }
) {
  const loc = weddingDetails.locale ?? 'fr'
  const isHe = loc === 'he'
  const isFr = loc === 'fr'
  const isConfirmed = rsvpStatus === 'confirmed'

  const greet = isHe ? `שלום ${guestName}` : isFr ? `Bonjour ${guestName}` : `Hello ${guestName}`
  const coupleNames = `${weddingDetails.bride_name} & ${weddingDetails.groom_name}`
  const dateStr = new Date(weddingDetails.wedding_date).toLocaleDateString(
    isHe ? 'he-IL' : isFr ? 'fr-FR' : 'en-GB',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  let subject: string, heading: string, body: string, statusPill: string

  if (isConfirmed) {
    subject = isHe
      ? `אישרת הגעה לחתונת ${coupleNames} ✓`
      : isFr
      ? `Confirmation de présence — Mariage de ${coupleNames}`
      : `RSVP Confirmed — ${coupleNames}'s Wedding`
    heading = isHe ? '🎉 אישור הגעה התקבל' : isFr ? '🎉 Présence confirmée !' : '🎉 Attendance Confirmed!'
    body = isHe
      ? `אישרת את הגעתך לחתונת <strong>${coupleNames}</strong>. אנו שמחים שתהיו איתנו ביום המיוחד הזה!`
      : isFr
      ? `Vous avez confirmé votre présence au mariage de <strong>${coupleNames}</strong>. Nous sommes ravis de vous accueillir !`
      : `You've confirmed your attendance at <strong>${coupleNames}</strong>'s wedding. We're thrilled you'll be joining us!`
    statusPill = `<span style="display:inline-block;background:#d1fae5;color:#065f46;font-family:system-ui,sans-serif;font-size:12px;font-weight:600;padding:4px 14px;border-radius:999px;letter-spacing:0.04em">${isHe ? '✓ מאושר' : isFr ? '✓ Confirmé' : '✓ Confirmed'}</span>`
  } else {
    subject = isHe
      ? `קיבלנו את תשובתך — חתונת ${coupleNames}`
      : isFr
      ? `Réponse enregistrée — Mariage de ${coupleNames}`
      : `RSVP Received — ${coupleNames}'s Wedding`
    heading = isHe ? 'תשובתך התקבלה' : isFr ? 'Votre réponse a bien été reçue' : 'Your Response Was Received'
    body = isHe
      ? `ציינת שלא תוכל להגיע לחתונת <strong>${coupleNames}</strong>. תודה על עדכון הזוג — הם מקווים לראותך בפעם אחרת.`
      : isFr
      ? `Vous avez indiqué que vous ne pourrez pas assister au mariage de <strong>${coupleNames}</strong>. Merci d'avoir informé les mariés.`
      : `You've indicated that you won't be able to attend <strong>${coupleNames}</strong>'s wedding. Thank you for letting the couple know.`
    statusPill = `<span style="display:inline-block;background:#fee2e2;color:#991b1b;font-family:system-ui,sans-serif;font-size:12px;font-weight:600;padding:4px 14px;border-radius:999px;letter-spacing:0.04em">${isHe ? '✗ לא מגיע' : isFr ? '✗ Absent(e)' : '✗ Not Attending'}</span>`
  }

  const detailsLabel = isHe ? 'פרטי האירוע' : isFr ? "Détails de l'événement" : 'Event Details'
  const dateLabel = isHe ? 'תאריך' : isFr ? 'Date' : 'Date'
  const venueLabel = isHe ? 'מקום' : isFr ? 'Lieu' : 'Venue'
  const venue = [weddingDetails.venue_name, weddingDetails.venue_city].filter(Boolean).join(', ')

  const bodyContent = `
    <tr>
      <td style="padding:36px 40px;text-align:${isHe ? 'right' : 'left'}">
        <p style="font-size:18px;font-weight:300;margin:0 0 8px">${greet},</p>
        <p style="font-size:14px;line-height:1.7;color:#44403c;font-family:system-ui,sans-serif;margin:0 0 20px">${body}</p>
        <div style="text-align:center;margin:20px 0">${statusPill}</div>
        ${venue ? `
        <div style="background:#faf8f5;border:1px solid #e7e5e4;border-radius:12px;padding:20px;margin-top:24px">
          <p style="font-size:11px;color:#a8a29e;font-family:system-ui,sans-serif;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px">${detailsLabel}</p>
          <p style="margin:0 0 8px;font-size:14px;color:#1c1917;font-family:system-ui,sans-serif"><strong>${dateLabel}:</strong> ${dateStr}</p>
          <p style="margin:0;font-size:14px;color:#1c1917;font-family:system-ui,sans-serif"><strong>${venueLabel}:</strong> ${venue}</p>
        </div>` : `
        <div style="background:#faf8f5;border:1px solid #e7e5e4;border-radius:12px;padding:20px;margin-top:24px">
          <p style="font-size:11px;color:#a8a29e;font-family:system-ui,sans-serif;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px">${detailsLabel}</p>
          <p style="margin:0;font-size:14px;color:#1c1917;font-family:system-ui,sans-serif"><strong>${dateLabel}:</strong> ${dateStr}</p>
        </div>`}
      </td>
    </tr>`

  return { subject, html: emailWrapper(loc, bodyContent) }
}

function ownerNotificationEmail(
  ownerName: string,
  guestName: string,
  rsvpStatus: 'confirmed' | 'declined',
  guestDetails: {
    email: string | null
    phone: string | null
    adults_count: number
    children_count: number
    dietary_preferences: string | null
    allergies: string | null
    notes: string | null
  },
  weddingLocale: string
) {
  const loc = weddingLocale ?? 'fr'
  const isHe = loc === 'he'
  const isFr = loc === 'fr'
  const isConfirmed = rsvpStatus === 'confirmed'

  const subject = isHe
    ? `${isConfirmed ? '✓ אישור הגעה' : '✗ אי הגעה'} — ${guestName}`
    : isFr
    ? `${isConfirmed ? '✓ Nouvelle confirmation' : '✗ Refus'} — ${guestName}`
    : `${isConfirmed ? '✓ New RSVP' : '✗ Declined'} — ${guestName}`

  const greet = isHe ? `שלום ${ownerName}` : isFr ? `Bonjour ${ownerName}` : `Hello ${ownerName}`
  const statusLabel = isConfirmed
    ? isHe ? '✓ אישר הגעה' : isFr ? '✓ A confirmé sa présence' : '✓ Confirmed attendance'
    : isHe ? '✗ לא יגיע' : isFr ? '✗ Ne viendra pas' : '✗ Cannot attend'
  const statusColor = isConfirmed ? '#065f46' : '#991b1b'
  const statusBg = isConfirmed ? '#d1fae5' : '#fee2e2'

  const adultsLabel = isHe ? 'מבוגרים' : isFr ? 'Adultes' : 'Adults'
  const childrenLabel = isHe ? 'ילדים' : isFr ? 'Enfants' : 'Children'
  const dietLabel = isHe ? 'העדפות קולינריות' : isFr ? 'Préférences alimentaires' : 'Dietary preferences'
  const allergyLabel = isHe ? 'אלרגיות' : isFr ? 'Allergies' : 'Allergies'
  const notesLabel = isHe ? 'הערות' : isFr ? 'Notes' : 'Notes'

  const details = [
    guestDetails.email && `<p style="margin:0 0 8px;font-size:13px;color:#44403c;font-family:system-ui,sans-serif">📧 ${guestDetails.email}</p>`,
    guestDetails.phone && `<p style="margin:0 0 8px;font-size:13px;color:#44403c;font-family:system-ui,sans-serif">📞 ${guestDetails.phone}</p>`,
    isConfirmed && `<p style="margin:0 0 8px;font-size:13px;color:#44403c;font-family:system-ui,sans-serif">👤 ${adultsLabel}: <strong>${guestDetails.adults_count}</strong>${guestDetails.children_count > 0 ? `  👶 ${childrenLabel}: <strong>${guestDetails.children_count}</strong>` : ''}</p>`,
    guestDetails.dietary_preferences && `<p style="margin:0 0 8px;font-size:13px;color:#44403c;font-family:system-ui,sans-serif">🍽️ ${dietLabel}: ${guestDetails.dietary_preferences}</p>`,
    guestDetails.allergies && `<p style="margin:0 0 8px;font-size:13px;color:#b91c1c;font-family:system-ui,sans-serif">⚠️ ${allergyLabel}: ${guestDetails.allergies}</p>`,
    guestDetails.notes && `<p style="margin:0;font-size:13px;color:#44403c;font-family:system-ui,sans-serif">💬 ${notesLabel}: ${guestDetails.notes}</p>`,
  ].filter(Boolean).join('')

  const bodyContent = `
    <tr>
      <td style="padding:36px 40px;text-align:${isHe ? 'right' : 'left'}">
        <p style="font-size:18px;font-weight:300;margin:0 0 16px">${greet},</p>
        <p style="font-size:15px;color:#1c1917;font-family:system-ui,sans-serif;margin:0 0 6px">
          <strong>${guestName}</strong>
        </p>
        <p style="margin:0 0 20px">
          <span style="display:inline-block;background:${statusBg};color:${statusColor};font-family:system-ui,sans-serif;font-size:12px;font-weight:600;padding:4px 14px;border-radius:999px;letter-spacing:0.04em">${statusLabel}</span>
        </p>
        ${details ? `<div style="background:#faf8f5;border:1px solid #e7e5e4;border-radius:12px;padding:20px">${details}</div>` : ''}
      </td>
    </tr>`

  return { subject, html: emailWrapper(loc, bodyContent) }
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // ⚠️  Production fix required: add RESEND_API_KEY to Vercel environment variables.
    // Get your key at https://resend.com/api-keys
    console.warn('[GrandInvite] RESEND_API_KEY not set — email NOT sent.', { to, subject })
    return
  }
  // Use a custom sender if configured, otherwise fall back to Resend shared domain.
  // For production, verify your domain at resend.com and set RESEND_FROM_EMAIL.
  const from = process.env.RESEND_FROM_EMAIL
    ? `GrandInvite <${process.env.RESEND_FROM_EMAIL}>`
    : 'GrandInvite <onboarding@resend.dev>'
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    })
    if (!res.ok) {
      const errText = await res.text()
      console.error('[GrandInvite] Resend API error:', errText)
    }
  } catch (err) {
    console.error('[GrandInvite] sendEmail network error:', err)
  }
}

// ─────────────────────────────────────────────────────────────
//  ROUTE HANDLER
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      wedding_id,
      name,
      email,
      phone,
      adults_count,
      children_count,
      dietary_preferences,
      allergies,
      notes,
      rsvp_status,
    } = body

    // ── Validation ──
    if (!wedding_id || !name || !rsvp_status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['confirmed', 'declined'].includes(rsvp_status)) {
      return NextResponse.json(
        { error: 'Invalid RSVP status' },
        { status: 400 }
      )
    }

    // Use admin client to bypass RLS for unauthenticated guest submissions
    const supabase = createAdminSupabaseClient()

    // ── בדיקת מגבלת אורחים (Freemium) ──
    // co_owner_email is included in the main query (column added via admin_setup.sql migration)
    const { data: wedding } = await supabase
      .from('weddings')
      .select('max_guests, plan, bride_name, groom_name, wedding_date, venue_name, venue_city, locale, user_id, rsvp_deadline, co_owner_email')
      .eq('id', wedding_id)
      .single()

    const coOwnerEmailFromDb: string | null =
      (wedding as (typeof wedding & { co_owner_email?: string | null }) | null)?.co_owner_email ?? null

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })
    }

    // ── RSVP deadline enforcement ──
    if (wedding.rsvp_deadline && new Date() > new Date(wedding.rsvp_deadline)) {
      return NextResponse.json(
        { error: 'RSVP deadline has passed', deadline: wedding.rsvp_deadline },
        { status: 410 }
      )
    }

    if (rsvp_status === 'confirmed') {
      // Sum total people (adults + children), not just row count
      const { data: confirmedGuests } = await supabase
        .from('guests')
        .select('adults_count, children_count')
        .eq('wedding_id', wedding_id)
        .eq('rsvp_status', 'confirmed')

      const currentTotal = (confirmedGuests ?? []).reduce(
        (sum, g) => sum + (g.adults_count ?? 1) + (g.children_count ?? 0),
        0
      )
      const newTotal = currentTotal + (adults_count ?? 1) + (children_count ?? 0)

      if (newTotal > wedding.max_guests) {
        return NextResponse.json(
          { error: 'Guest limit reached', limit: wedding.max_guests },
          { status: 409 }
        )
      }
    }

    // ── הכנסת RSVP לבסיס הנתונים ──
    const { data, error } = await supabase
      .from('guests')
      .insert({
        wedding_id,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        adults_count: adults_count ?? 1,
        children_count: children_count ?? 0,
        dietary_preferences: dietary_preferences?.trim() || null,
        allergies: allergies?.trim() || null,
        notes: notes?.trim() || null,       // שדה 'אחר / הערות נוספות'
        rsvp_status,
        rsvp_submitted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('RSVP insert error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // ── שליחת מיילים (non-blocking) ──
    if (wedding) {
      const weddingLocale = (wedding.locale as string) ?? 'fr'
      const coupleNames = `${wedding.bride_name} & ${wedding.groom_name}`

      // 1. Guest confirmation email
      if (email?.trim()) {
        const { subject, html } = guestConfirmationEmail(
          name.trim(),
          rsvp_status as 'confirmed' | 'declined',
          {
            bride_name: wedding.bride_name,
            groom_name: wedding.groom_name,
            wedding_date: wedding.wedding_date,
            venue_name: wedding.venue_name,
            venue_city: wedding.venue_city,
            locale: weddingLocale,
          }
        )
        sendEmail(email.trim(), subject, html).catch(e => console.error('[RSVP] Guest confirmation email error:', e))
      } else {
        console.log('[RSVP] Guest has no email — confirmation email skipped.')
      }

      // 2. Owner notification email (+ co-owner if set)
      if (wedding.user_id) {
        try {
          // Try admin API to get owner email
          let ownerEmail: string | undefined
          try {
            const { data: ownerData, error: authErr } = await supabase.auth.admin.getUserById(wedding.user_id)
            if (authErr) {
              console.error('[RSVP] auth.admin.getUserById error:', authErr.message)
            }
            ownerEmail = ownerData?.user?.email
          } catch (authFetchErr) {
            console.error('[RSVP] Could not fetch owner via admin API:', authFetchErr)
            // Fallback: try public users table
            const { data: publicUser } = await supabase
              .from('users')
              .select('email')
              .eq('id', wedding.user_id)
              .maybeSingle()
            ownerEmail = (publicUser as { email?: string } | null)?.email
          }

          if (!ownerEmail) {
            console.warn('[RSVP] No owner email found for user_id:', wedding.user_id, '— owner notification not sent')
          }

          if (!process.env.RESEND_API_KEY) {
            console.warn('[RSVP] RESEND_API_KEY is not set — emails will NOT be sent. Add it to Vercel environment variables.')
          }

          const coOwnerEmail = coOwnerEmailFromDb

          const notificationDetails = {
            email: email?.trim() || null,
            phone: phone?.trim() || null,
            adults_count: adults_count ?? 1,
            children_count: children_count ?? 0,
            dietary_preferences: dietary_preferences?.trim() || null,
            allergies: allergies?.trim() || null,
            notes: notes?.trim() || null,
          }

          if (ownerEmail) {
            const { subject, html } = ownerNotificationEmail(
              coupleNames,
              name.trim(),
              rsvp_status as 'confirmed' | 'declined',
              notificationDetails,
              weddingLocale
            )
            sendEmail(ownerEmail, subject, html).catch(e => console.error('[RSVP] Owner email error:', e))
          }

          // Also notify co-owner if set (and different from owner email)
          if (coOwnerEmail && coOwnerEmail !== ownerEmail) {
            const { subject, html } = ownerNotificationEmail(
              coupleNames,
              name.trim(),
              rsvp_status as 'confirmed' | 'declined',
              notificationDetails,
              weddingLocale
            )
            sendEmail(coOwnerEmail, subject, html).catch(e => console.error('[RSVP] Co-owner email error:', e))
          }
        } catch (err) {
          console.error('[RSVP] Email notification block failed:', err)
        }
      }
    }

    return NextResponse.json({ success: true, guest: data }, { status: 201 })
  } catch (err) {
    console.error('RSVP route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
