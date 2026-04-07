// ============================================================
// GrandInvite – Root Page
// Redirects to /fr by default (Task 3: no language pre-selection screen)
// Detects browser preferred language and redirects to fr/he/en
// src/app/page.tsx
// ============================================================
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function RootPage() {
  const headersList = await headers()
  const acceptLanguage = headersList.get('accept-language') ?? ''

  // Detect preferred locale from browser
  const preferred = acceptLanguage.toLowerCase()
  let locale: 'fr' | 'he' | 'en' = 'fr' // default

  if (preferred.includes('he') || preferred.includes('iw')) {
    locale = 'he'
  } else if (preferred.includes('en')) {
    locale = 'en'
  }
  // else: French / any other language defaults to 'fr'

  redirect(`/${locale}`)
}
