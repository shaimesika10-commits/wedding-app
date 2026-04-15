// ============================================================
//  GrandInvite – Translation Route
//  POST /api/ai/translate
//  Body: { text: string, targetLanguage: 'fr' | 'he' | 'en', sourceLang?: string, context?: string }
//
//  Uses DeepL if DEEPL_API_KEY is set (best quality).
//  Falls back to MyMemory API (free, no key needed) otherwise.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'

const DEEPL_LANG: Record<string, string> = { fr: 'FR', he: 'HE', en: 'EN-US' }
const MYMEMORY_LANG: Record<string, string> = { fr: 'fr', he: 'he', en: 'en' }

async function translateWithDeepL(text: string, targetLanguage: string, preserveTerms: string[]): Promise<string | null> {
  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) return null
  let processedText = text
  preserveTerms.forEach((term, i) => { processedText = processedText.split(term).join(`<x id="${i}">${term}</x>`) })
  const res = await fetch('https://api.deepl.com/v2/translate', {
    method: 'POST',
    headers: { 'Authorization': `DeepL-Auth-Key ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: [processedText],
      target_lang: DEEPL_LANG[targetLanguage] ?? 'EN-US',
      tag_handling: preserveTerms.length > 0 ? 'xml' : undefined,
      ignore_tags: preserveTerms.length > 0 ? ['x'] : undefined,
      split_sentences: 'nonewlines', preserve_formatting: true, formality: 'prefer_more',
    }),
  })
  if (!res.ok) return null
  const data = await res.json()
  let translated: string = data.translations?.[0]?.text ?? text
  translated = translated.replace(/<x id="\d+">(.*?)<\/x>/g, (_m: string, inner: string) => inner)
  return translated
}

async function translateWithMyMemory(text: string, srcLang: string, targetLanguage: string): Promise<string | null> {
  const langPair = `${MYMEMORY_LANG[srcLang] ?? 'fr'}|${MYMEMORY_LANG[targetLanguage] ?? 'en'}`
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langPair)}`
  const res = await fetch(url, { headers: { 'User-Agent': 'GrandInvite/1.0' } })
  if (!res.ok) return null
  const data = await res.json()
  if (data.responseStatus !== 200) return null
  const translated = data.responseData?.translatedText
  if (!translated || translated.startsWith('NO QUERY SPECIFIED')) return null
  return translated
}

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage, sourceLang, context } = await request.json()
    if (!text || !targetLanguage) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

    const srcLang = sourceLang ?? 'fr'
    if (srcLang === targetLanguage) return NextResponse.json({ translatedText: text })

    const preserveTerms: string[] = context
      ? context.split(/[,\n]/).map((t: string) => t.trim()).filter((t: string) => t.length > 2)
      : []

    if (process.env.DEEPL_API_KEY) {
      try {
        const result = await translateWithDeepL(text, targetLanguage, preserveTerms)
        if (result) return NextResponse.json({ translatedText: result })
      } catch { console.warn('[translate] DeepL failed, falling back to MyMemory') }
    }

    try {
      const result = await translateWithMyMemory(text, srcLang, targetLanguage)
      if (result) return NextResponse.json({ translatedText: result, provider: 'mymemory' })
    } catch { console.warn('[translate] MyMemory failed') }

    return NextResponse.json({ translatedText: text, fallback: true })
  } catch (err) {
    console.error('Translation error:', err)
    return NextResponse.json({ translatedText: '', fallback: true }, { status: 200 })
  }
}
