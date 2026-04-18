// src/app/[locale]/privacy/page.tsx
import LegalPage from '@/components/LegalPage'
import type { Locale } from '@/lib/i18n'

export const revalidate = 3600

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  return <LegalPage type="privacy" locale={locale} />
}
