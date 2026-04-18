// src/app/[locale]/refund/page.tsx
import LegalPage from '@/components/LegalPage'
import type { Locale } from '@/lib/i18n'

export const revalidate = 3600

export default async function RefundPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  return <LegalPage type="refund" locale={locale} />
}
