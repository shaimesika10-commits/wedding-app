// ============================================================
//  GrandInvite â Translation Route (DeepL)
//  POST /api/ai/translate
//  Body: { text: string, targetLanguage: 'fr' | 'he' | 'en', context?: string }
//  context is comma-separated terms to exclude (venue names, cities)
// ============================================================

import { NextRequest, NextResponse } from 'next/server'

// DeepL language codes
const DEEPL_LANG: Record<string, string> = {
  fr: 'FR',
  he: 'HE', // DeepL added Hebrew support
  en: 'EN-US',
}

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage, context } = await request.json()

    if (!text || !targetLanguage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const apiKey = process.env.DEEPL_API_KEY

    if (!apiKey) {
      // No DeepL key: return original text as fallback
      console.warn('[translate] DEEPL_API_KEY not set â returning original text')
      return NextResponse.json({ translatedText: text, fallback: true })
    }

    const targetLang = DEEPL_LANG[targetLanguage] ?? 'EN-US'

    // ââ Extract terms to preserve (venue names, cities, addresses) ââ
    // We wrap them in <x> tags (ignored by DeepL with tag_handling=xml)
    // then restore them after translation.
    const preserveTerms: string[] = context
      ? context
          .split(/[,\n]/)
          .map((t: string) => t.trim())
          .filter((t: string) => t.length > 2)
      : []

    let processedText = text
    const termMap: Record<string, string> = {}

    preserveTerms.forEach((term, i) => {
      const placeholder = `<x id="${i}">${term}</x>`
      termMap[placeholder] = term
      // Replace exact occurrences (case-sensitive)
      processedText = processedText.split(term).join(placeholder)
    })

    // ââ Call DeepL API ââ
    const res = await fetch('https://api.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [processedText],
        target_lang: targetLang,
        tag_handling: preserveTerms.length > 0 ? 'xml' : undefined,
        ignore_tags: preserveTerms.length > 0 ? ['x'] : undefined,
        split_sentences: 'nonewlines',
        preserve_formatting: true,
        formality: 'prefer_more', // formal tone for wedding invitations
      }),
    })

    if (!res.ok) {
      const errBody = await res.text()
      console.error('DeepL API error:', errBody)
      // Graceful fallback: return original text
      return NextResponse.json({ translatedText: text, fallback: true })
    }

    const data = await res.json()
    let translatedText: string = data.translations?.[0]?.text ?? text

    // ââ Restore preserved terms ââ
    // DeepL keeps <x> tags as-is; unwrap them
    translatedText = translatedText.replace(/<x id="\d+">(.*?)<\/x>/g, (_match, inner) => inner)

    return NextResponse.json({ translatedText })
  } catch (err) {
    console.error('Translation error:', err)
    // Graceful fallback
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}
