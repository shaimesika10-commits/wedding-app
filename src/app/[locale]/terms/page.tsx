// src/app/[locale]/terms/page.tsx
import LegalPage from '@/components/LegalPage'
import type { Locale } from '@/lib/i18n'

export const revalidate = 3600 // ISR: re-fetch every hour

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  return <LegalPage type="tos" locale={locale} />
}
