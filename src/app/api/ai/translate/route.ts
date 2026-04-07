// ============================================================
//  GrandInvite â AI Translation Route
//  POST /api/ai/translate
//  Body: { text: string, targetLanguage: 'fr' | 'he' | 'en', context?: string }
// ============================================================

import { NextRequest, NextResponse } from 'next/server'

const LANGUAGE_NAMES: Record<string, string> = {
  fr: 'French',
  he: 'Hebrew',
  en: 'English',
}

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage, context } = await request.json()

    if (!text || !targetLanguage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const langName = LANGUAGE_NAMES[targetLanguage] ?? targetLanguage

    const systemPrompt = `You are a professional wedding invitation translator.
Rules:
- If the text is ALREADY written in ${langName}, return it EXACTLY as-is without any modification.
- Otherwise translate it into ${langName} while:
  - Preserving the elegant, formal, and romantic tone of a wedding invitation
  - Keeping proper names (people, venues, cities, addresses) unchanged in their original language
  - Keeping dates and times in their original format
  - Maintaining any formatting or line breaks
  - For Hebrew: use right-to-left appropriate phrasing and natural Israeli Hebrew
  - Being natural and culturally appropriate for the target language
${context ? `Wedding context: ${context}` : ''}

Return ONLY the translated text with zero additional commentary.`

    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      // Fallback: return original text if no API key
      return NextResponse.json({ translatedText: text, fallback: true })
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
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Translate this wedding invitation text to ${langName}:\n\n${text}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const data = await response.json()
    const translatedText = data.content?.[0]?.text ?? text

    return NextResponse.json({ translatedText })
  } catch (err) {
    console.error('Translation error:', err)
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}
