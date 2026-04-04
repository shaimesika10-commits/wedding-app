// ============================================================
//  GrandInvite – AI Invitation Builder Chat
//  POST /api/ai/invitation-chat
//  Body: { messages: ChatMessage[], weddingContext?: object, locale: string }
// ============================================================

import { NextRequest, NextResponse } from 'next/server'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPTS: Record<string, string> = {
  fr: `Tu es un assistant expert en création d'invitations de mariage de luxe pour GrandInvite.
Ton rôle est d'aider les mariés à créer l'invitation de leurs rêves en posant des questions pertinentes et en les guidant.

Tu dois :
1. Poser des questions sur leur vision, style, ambiance souhaitée
2. Recueillir les informations manquantes (lieu, horaire, programme, dress code, etc.)
3. Proposer des formulations élégantes et romantiques
4. À la fin de la conversation, générer le contenu complet de l'invitation

Quand tu as assez d'informations, génère l'invitation au format JSON structuré comme:
{
  "ready": true,
  "invitation": {
    "welcome_message": "...",
    "ceremony_time": "...",
    "reception_time": "...",
    "dress_code": "...",
    "additional_info": "...",
    "rsvp_message": "..."
  }
}

Sois chaleureux, élégant et enthousiaste. Tu parles français.`,

  he: `אתה עוזר מומחה ליצירת הזמנות חתונה יוקרתיות עבור GrandInvite.
תפקידך לעזור לזוג ליצור את ההזמנה המושלמת שלהם על ידי שאלת שאלות רלוונטיות והדרכתם.

עליך:
1. לשאול על החזון שלהם, הסגנון, האווירה הרצויה
2. לאסוף מידע חסר (מיקום, שעות, תוכנית, קוד לבוש וכו')
3. להציע ניסוחים אלגנטיים ורומנטיים
4. בסוף השיחה, לייצר את תוכן ההזמנה המלא

כשיש לך מספיק מידע, צור את ההזמנה בפורמט JSON:
{
  "ready": true,
  "invitation": {
    "welcome_message": "...",
    "ceremony_time": "...",
    "reception_time": "...",
    "dress_code": "...",
    "additional_info": "...",
    "rsvp_message": "..."
  }
}

היה חם, אלגנטי ונלהב. אתה מדבר עברית.`,

  en: `You are an expert luxury wedding invitation assistant for GrandInvite.
Your role is to help couples create their dream invitation by asking relevant questions and guiding them.

You should:
1. Ask about their vision, style, desired atmosphere
2. Gather missing information (venue details, times, program, dress code, etc.)
3. Suggest elegant and romantic phrasing
4. At the end of the conversation, generate the complete invitation content

When you have enough information, generate the invitation in JSON format:
{
  "ready": true,
  "invitation": {
    "welcome_message": "...",
    "ceremony_time": "...",
    "reception_time": "...",
    "dress_code": "...",
    "additional_info": "...",
    "rsvp_message": "..."
  }
}

Be warm, elegant and enthusiastic. You speak English.`,
}

const FIRST_MESSAGES: Record<string, string> = {
  fr: "Bonjour ! Je suis votre assistant GrandInvite 💫 Je vais vous aider à créer une invitation de mariage parfaite. Commençons par votre vision : quelle ambiance souhaitez-vous pour votre invitation ? (romantique, moderne, bohème, classique...)",
  he: "שלום! אני העוזר שלכם ב-GrandInvite 💫 אני אעזור לכם ליצור הזמנת חתונה מושלמת. נתחיל מהחזון שלכם: איזה אווירה אתם רוצים להעביר בהזמנה? (רומנטית, מודרנית, בוהמיינית, קלאסית...)",
  en: "Hello! I'm your GrandInvite assistant 💫 I'll help you create the perfect wedding invitation. Let's start with your vision: what atmosphere do you want for your invitation? (romantic, modern, bohemian, classic...)",
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale') ?? 'en'
  return NextResponse.json({ firstMessage: FIRST_MESSAGES[locale] ?? FIRST_MESSAGES.en })
}

export async function POST(request: NextRequest) {
  try {
    const { messages, weddingContext, locale = 'en' } = await request.json()

    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        reply: locale === 'he'
          ? 'שירות ה-AI אינו מוגדר כרגע. אנא הוסף ANTHROPIC_API_KEY בהגדרות Vercel.'
          : locale === 'fr'
          ? "Le service AI n'est pas configuré. Ajoutez ANTHROPIC_API_KEY dans les paramètres Vercel."
          : 'AI service not configured. Please add ANTHROPIC_API_KEY in Vercel settings.',
        ready: false,
      })
    }

    let systemPrompt = SYSTEM_PROMPTS[locale] ?? SYSTEM_PROMPTS.en

    if (weddingContext) {
      const ctx = `
Current wedding details:
- Bride: ${weddingContext.bride_name || 'not set'}
- Groom: ${weddingContext.groom_name || 'not set'}
- Date: ${weddingContext.wedding_date || 'not set'}
- Venue: ${weddingContext.venue_name || 'not set'}
- City: ${weddingContext.venue_city || 'not set'}
`
      systemPrompt += `\n\nAlready known:${ctx}`
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages.map((m: ChatMessage) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const replyText = data.content?.[0]?.text ?? ''

    // Try to parse JSON response (when ready)
    let parsed: { ready?: boolean; invitation?: Record<string, string> } = {}
    try {
      const jsonMatch = replyText.match(/\{[\s\S]*"ready":\s*true[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      }
    } catch {
      // not JSON yet, normal chat response
    }

    return NextResponse.json({
      reply: replyText,
      ready: parsed.ready ?? false,
      invitation: parsed.invitation ?? null,
    })
  } catch (err) {
    console.error('AI chat error:', err)
    return NextResponse.json({ error: 'AI service error' }, { status: 500 })
  }
}
