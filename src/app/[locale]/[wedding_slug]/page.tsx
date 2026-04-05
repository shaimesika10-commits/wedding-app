import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import type { Locale } from '@/lib/i18n'
import WeddingPageContent from '@/components/WeddingPageContent'
import Link from 'next/link'


const ctaLabels = {
  fr: 'Créer votre propre invitation de mariage →',
  he: 'צרו את ההזמנה שלכם →',
  en: 'Create your own wedding invitation →',
}


const ownerLabels = {
  fr: 'Accéder au tableau de bord',
  he: 'כניסה ללוח הבקרה',
  en: 'Go to Dashboard',
}


export default async function WeddingPage({
  params,
}: {
  params: Promise<{ locale: Locale; wedding_slug: string }>
}) {
  const { locale: localeParam, wedding_slug } = await params
  const locale = localeParam as Locale
  const supabase = await createServerSupabaseClient()


  const { data: wedding } = await supabase
    .from('weddings')
    .select('*')
    .eq('slug', wedding_slug)
    .single()


  if (!wedding) notFound()


  const { data: photos } = await supabase
