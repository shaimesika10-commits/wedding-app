import { createServerSupabaseClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
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
  params: { locale: Locale; wedding_slug: string }
}) {
  const supabase = await createServerSupabaseClient()
  const locale = params.locale as Locale

  const { data: wedding } = await supabase
    .from('weddings')
    .select('*')
    .eq('wedding_slug', params.wedding_slug)
    .single()

  if (!wedding) notFound()

  const { data: photos } = await supabase
    .from('gallery_photos')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === wedding.user_id

  const ctaLabel = ctaLabels[locale] || ctaLabels.fr
  const ownerLabel = ownerLabels[locale] || ownerLabels.fr

  return (
    <div className="min-h-screen bg-stone-50">
      <WeddingPageContent
        wedding={wedding}
        photos={photos || []}
        locale={locale}
        couplePhotoUrl={wedding.couple_photo_url}
      />

      {/* Owner dashboard link */}
      {isOwner && (
        <div className="fixed bottom-4 right-4 z-50">
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-2 bg-stone-800 text-white px-4 py-2 rounded-full text-xs font-montserrat shadow-lg hover:bg-stone-700 transition"
          >
            <span>⚙️</span> {ownerLabel}
          </Link>
        </div>
      )}

      {/* CTA for guests */}
      <div className="py-12 bg-stone-100 border-t border-stone-200">
        <div className="max-w-xl mx-auto text-center px-4">
          <p className="text-stone-400 text-xs font-montserrat tracking-widest uppercase mb-4">GrandInvite</p>
          <Link
            href={`/${locale}`}
            className="inline-block border border-stone-400 text-stone-600 px-6 py-3 text-sm font-montserrat tracking-wide hover:bg-stone-200 transition"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}
