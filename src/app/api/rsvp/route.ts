// ============================================================
//  GrandInvite â RSVP API Route
//  src/app/api/rsvp/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
//  EMAIL TEMPLATES
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

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
            <p style="font-size:11px;color:#a8a29e;font-family:system-ui,sans-serif;margin:0">Â© ${new Date().getFullYear()} GrandInvite</p>
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

  const greet = isHe ? `×©××× ${guestName}` : isFr ? `Bonjour ${guestName}` : `Hello ${guestName}`
  const coupleNames = `${weddingDetails.bride_name} & ${weddingDetails.groom_name}`
  const dateStr = new Date(weddingDetails.wedding_date).toLocaleDateString(
    isHe ? 'he-IL' : isFr ? 'fr-FR' : 'en-GB',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  let subject: string, heading: string, body: string, statusPill: string

  if (isConfirmed) {
    subject = isHe
      ? `×××©×¨×ª ×××¢× ×××ª×× ×ª ${coupleNames} â`
      : isFr
      ? `Confirmation de prÃ©sence â Mariage de ${coupleNames}`
      : `RSVP Confirmed â ${coupleNames}'s Wedding`
    heading = isHe ? 'ð ×××©××¨ ×××¢× ××ª×§××' : isFr ? 'ð PrÃ©sence confirmÃ©e !' : 'ð Attendance Confirmed!'
    body = isHe
      ? `×××©×¨×ª ××ª ×××¢×ª× ×××ª×× ×ª <strong>${coupleNames}</strong>. ×× × ×©×××× ×©×ª××× ×××ª× × ×××× ×××××× ×××!`
      : isFr
      ? `Vous avez confirmÃ© votre prÃ©sence au mariage de <strong>${coupleNames}</strong>. Nous sommes ravis de vous accueillir !`
      : `You've confirmed your attendance at <strong>${coupleNames}</strong>'s wedding. We're thrilled you'll be joining us!`
    statusPill = `<span style="display:inline-block;background:#d1fae5;color:#065f46;font-family:system-ui,sans-serif;font-size:12px;font-weight:600;padding:4px 14px;border-radius:999px;letter-spacing:0.04em">${isHe ? 'â ××××©×¨' : isFr ? 'â ConfirmÃ©' : 'â Confirmed'}</span>`
  } else {
    subject = isHe
      ? `×§×××× × ××ª ×ª×©×××ª× â ××ª×× ×ª ${coupleNames}`
      : isFr
      ? `RÃ©ponse enregistrÃ©e â Mariage de ${coupleNames}`
      : `RSVP Received â ${coupleNames}'s Wedding`
    heading = isHe ? '×ª×©×××ª× ××ª×§×××' : isFr ? 'Votre rÃ©ponse a bien Ã©tÃ© reÃ§ue' : 'Your Response Was Received'
    body = isHe
      ? `×¦××× ×ª ×©×× ×ª××× ×××××¢ ×××ª×× ×ª <strong>${coupleNames}</strong>. ×ª××× ×¢× ×¢×××× ×××× â ×× ××§×××× ××¨×××ª× ××¤×¢× ×××¨×ª.`
      : isFr
      ? `Vous avez indiquÃ© que vous ne pourrez pas assister au mariage de <strong>${coupleNames}</strong>. Merci d'avoir informÃ© les mariÃ©s.`
      : `You've indicated that you won't be able to attend <strong>${coupleNames}</strong>'s wedding. Thank you for letting the couple know.`
    statusPill = `<span style="display:inline-block;background:#fee2e2;color:#991b1b;font-family:system-ui,sans-serif;font-size:12px;font-weight:600;padding:4px 14px;border-radius:999px;letter-spacing:0.04em">${isHe ? 'â ×× ××××¢' : isFr ? 'â Absent(e)' : 'â Not Attending'}</span>`
  }

  const detailsLabel = isHe ? '×¤×¨×× ××××¨××¢' : isFr ? "DÃ©tails de l'Ã©vÃ©nement" : 'Event Details'
  const dateLabel = isHe ? '×ª××¨××' : isFr ? 'Date' : 'Date'
  const venueLabel = isHe ? '××§××' : isFr ? 'Lieu' : 'Venue'
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
    ? `${isConfirmed ? 'â ×××©××¨ ×××¢×' : 'â ×× ×××¢×'} â ${guestName}`
    : isFr
    ? `${isConfirmed ? 'â Nouvelle confirmation' : 'â Refus'} â ${guestName}`
    : `${isConfirmed ? 'â New RSVP' : 'â Declined'} â ${guestName}`

  const greet = isHe ? `×©××× ${ownerName}` : isFr ? `Bonjour ${ownerName}` : `Hello ${ownerName}`
  const statusLabel = isConfirmed
    ? isHe ? 'â ×××©×¨ ×××¢×' : isFr ? 'â A confirmÃ© sa prÃ©sence' : 'â Confirmed attendance'
    : isHe ? 'â ×× ××××¢' : isFr ? 'â Ne viendra pas' : 'â Cannot attend'
  const statusColor = isConfirmed ? '#065f46' : '#991b1b'
  const statusBg = isConfirmed ? '#d1fae5' : '#fee2e2'

  const adultsLabel = isHe ? '×××××¨××' : isFr ? 'Adultes' : 'Adults'
  const childrenLabel = isHe ? '×××××' : isFr ? 'Enfants' : 'Children'
  const dietLabel = isHe ? '××¢××¤××ª ×§×××× ×¨×××ª' : isFr ? 'PrÃ©fÃ©rences alimentaires' : 'Dietary preferences'
  const allergyLabel = isHe ? '×××¨××××ª' : isFr ? 'Allergies' : 'Allergies'
  const notesLabel = isHe ? '××¢×¨××ª' : isFr ? 'Notes' : 'Notes'

  const details = [
    guestDetails.email && `<p style="margin:0 0 8px;font-size:13px;color:#44403c;font-family:system-ui,sans-serif">ð§ ${guestDetails.email}</p>`,
    guestDetails.phone && `<p style="margin:0 0 8pz;font-size:13px;color:#44403c;font-family:system-ui,sans-serif">ð ${guestDetails.phone}</p>`,
    isConfirmed && `<p style="margin:0 0 8pz;font-size:13px;color:#44403c;font-family:system-ui,sans-serif">ð¤ ${adultsLabel}: <strong>${guestDetails.adults_count}</strong>${guestDetails.children_count > 0 ? `  ð¶ ${childrenLabel}: <strong>${guestDetails.children_count}</strong>` : ''}</p>`,
    guestDetails.dietary_preferences && `<p style="margin:0 0 8pz;font-size:13px;color:#44403c;font-family:system-ui,sans-serif">ð½ï¸ ${dietLabel}: ${guestDetails.dietary_preferences}</p>`,
    guestDetails.allergies && `<p style="margin:0 0 8pz;font-size:13px;color:#b91c1c;font-family:system-ui,sans-serif">â ï¸ ${allergyLabel}: ${guestDetails.allergies}</p>`,
    guestDetails.notes && `<p style="margin:0;font-size:13px;color:#44403c;font-family:system-ui,sans-serif">ð¬ ${notesLabel}: ${guestDetails.notes}</p>`,
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
    console.log(`[DEV] Email to ${to}: ${subject}`)
    return
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'GrandInvite <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error('Resend error:', err)
    }
  } catch (err) {
    console.error('sendEmail failed:', err)
  }
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
//  ROUTE HANDLER
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

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

    // ââ Validation ââ
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

    // ââ ××××§×ª ×××××ª ×××¨××× (Freemium) ââ
    const { data: wedding } = await supabase
      .from('weddings')
      .select('max_guests, plan, bride_name, groom_name, wedding_date, venue_name, venue_city, locale, user_id')
      .eq('id', wedding_id)
      .single()

    if (wedding && rsvp_status === 'confirmed') {
      const { count } = await supabase
        .from('guests')
        .select('*', { count: 'exact', head: true })
        .eq('wedding_id', wedding_id)
        .eq('rsvp_status', 'confirmed')

      const currentCount = count ?? 0
      const newTotal = currentCount + (adults_count ?? 1) + (children_count ?? 0)

      if (newTotal > wedding.max_guests) {
        return NextResponse.json(
          { error: 'Guest limit reached', limit: wedding.max_guests },
          { status: 409 }
        )
      }
    }

    // ââ ××× ×¡×ª RSVP ×××¡××¡ ×× ×ª×× ×× ââ
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
        notes: notes?.trim() || null,       // ×©×× '×××¨ / ××¢×¨××ª × ××¡×¤××ª'
        rsvp_status,
        rsvp_submitted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('RSVP insert error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // ââ ×©××××ª ×××××× (non-blocking) ââ
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
        sendEmail(email.trim(), subject, html).catch(console.error)
      }

      // 2. Owner notification email
      if (wedding.user_id) {
        try {
          const { data: ownerData } = await supabase.auth.admin.getUserById(wedding.user_id)
          const ownerEmail = ownerData?.user?.email
          if (ownerEmail) {
            const { subject, html } = ownerNotificationEmail(
              coupleNames,
              name.trim(),
              rsvp_status as 'confirmed' | 'declined',
              {
                email: email?.trim() || null,
                phone: phone?.trim() || null,
                adults_count: adults_count ?? 1,
                children_count: children_count ?? 0,
                dietary_preferences: dietary_preferences?.trim() || null,
                allergies: allergies?.trim() || null,
                notes: notes?.trim() || null,
              },
              weddingLocale
            )
            sendEmail(ownerEmail, subject, html).catch(console.error)
          }
        } catch (err) {
          console.error('Could not fetch owner email:', err)
        }
      }
    }

    return NextResponse.json({ success: true, guest: data }, { status: 201 })
  } catch (err) {
    console.error('RSVP route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
