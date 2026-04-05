'use client'
// ============================================================
//  GrandInvite – Onboarding Page
//  (יצירת חתונה ראשונה לזוג חדש)
//  src/app/[locale]/onboarding/page.tsx
// ============================================================

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Locale } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const labels = {
  fr: {
    title: 'Créez votre invitation',
    subtitle: 'Quelques détails pour commencer',
    step1: 'Les mariés',
    step2: 'La date & le lieu',
    step3: 'Préférences',
    brideName: 'Prénom de la mariée',
    groomName: 'Prénom du marié',
    weddingDate: 'Date du mariage',
    venueName: 'Nom du lieu de réception',
    venueAddress: 'Adresse',
    venueCity: 'Ville',
    venueCountry: 'Pays',
    locale: 'Langue de l\'invitation',
    rsvpDeadline: 'Date limite de réponse',
    welcomeMessage: 'Message de bienvenue',
    welcomePlaceholder: 'Nous sommes ravis de vous inviter à notre mariage...',
    next: 'Continuer',
    back: 'Retour',
    create: 'Créer mon invitation',
    creating: 'Création en cours...',
    france: 'France',
    israel: 'Israël',
    other: 'Autre',
    localeFr: 'Français',
    localeHe: 'Hébreu',
    localeEn: 'Anglais',
  },
  he: {
    title: 'יצירת ההזמנה שלכם',
    subtitle: 'כמה פרטים כדי להתחיל',
    step1: 'הזוג',
    step2: 'תאריך ומיקום',
    step3: 'העדפות',
    brideName: 'שם הכלה',
    groomName: 'שם החתן',
    weddingDate: 'תאריך החתונה',
    venueName: 'שם האולם / המקום',
    venueAddress: 'כתובת',
    venueCity: 'עכר',
    venueCountry: 'מדינה',
    locale: 'שפת ההזמנה',
    rsvpDeadline: 'תאריך אחרון לאישור',
    welcomeMessage: 'הודעת פתיחה',
    welcomePlaceholder: 'אנו שמחים להזמינכם לחגוג איתנו...',
    next: 'המשך',
    back: 'חזרה',
    create: 'יצירת ההזמנה',
    creating: 'יוצר...',
    france: 'צרפת',
    israel: 'ישראל',
    other: 'אחר',
    localeFr: 'צרפתית',
    localeHe: 'עברית',
    localeEn: 'אנגלית',
  },
  en: {
    title: 'Create your invitation',
    subtitle: 'A few details to get started',
    step1: 'The couple',
    step2: 'Date & venue',
    step3: 'Preferences',
    brideName: 'Bride\'s first name',
    groomName: 'Groom\'s first name',
    weddingDate: 'Wedding date',
    venueName: 'Venue name',
    venueAddress: 'Address',
    venueCity: 'City',
    venueCountry: 'Country',
    locale: 'Invitation language',
    rsvpDeadline: 'RSVP deadline',
    welcomeMessage: 'Welcome message',
    welcomePlaceholder: 'We are delighted to invite you to our wedding...',
    next: 'Continue',
    back: 'Back',
    create: 'Create my invitation',
    creating: 'Creating...',
    france: 'France',
    israel: 'Israel',
    other: 'Other',
    localeFr: 'French',
    localeHe: 'Hebrew',
    localeEn: 'English',
  },
}

function slugify(bride: string, groom: string, date: string): string {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
  const year = date ? new Date(date).getFullYear() : new Date().getFullYear()
  return `${clean(bride)}-${clean(groom)}-${year}`
}

export default function OnboardingPage() {
  const params = useParams()
  const locale = (params.locale as Locale) ?? 'fr'
  const l = labels[locale] ?? labels.fr
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    bride_name: '',
    groom_name: '',
    wedding_date: '',
    venue_name: '',
    venue_address: '',
    venue_city: '',
    venue_country: locale === 'he' ? 'Israel' : 'France',
    invitation_locale: locale,
    rsvp_deadline: '',
    welcome_message: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleCreate = async () => {
    setError('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push(`/${locale}/login`)
      return
    }

    const slug = slugify(form.bride_name, form.groom_name, form.wedding_date)

    const { data, error: insertError } = await supabase
      .from('weddings')
      .insert({
        user_id: user.id,
        slug,
        bride_name: form.bride_name.trim(),
        groom_name: form.groom_name.trim(),
        wedding_date: form.wedding_date,
        venue_name: form.venue_name.trim() || null,
        venue_address: form.venue_address.trim() || null,
        venue_city: form.venue_city.trim() || null,
        venue_country: form.venue_country,
        locale: form.invitation_locale,
        rsvp_deadline: form.rsvp_deadline || null,
        welcome_message: form.welcome_message.trim() || null,
        max_guests: 200,
        plan: 'free',
        is_active: true,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push(`/${locale}/dashboard`)
  }

  const isRTL = locale === 'he'

  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-cream flex items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-lg">
        {/* Language switcher */}
        <div className="flex justify-end mb-4">
          <LanguageSwitcher currentLocale={locale} variant="inline" />
        </div>
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-cormorant text-4xl font-light text-stone-900 tracking-widest mb-2">
            Grand<span style={{ color: '#c9a84c' }}>Invite</span>
          </h1>
          <div className="h-px w-16 mx-auto my-4" style={{ background: '#c9a84c' }} />
          <p className="text-stone-500 text-sm">{l.subtitle}</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all"
                style={{
                  background: s <= step ? '#c9a84c' : '#e7e5e4',
                  color: s <= step ? 'white' : '#a8a29e',
                }}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className="w-12 h-px transition-all"
                  style={{ background: s < step ? '#c9a84c' : '#e7e5e4' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-red-600 text-sm mb-4">
              {error}
            </div>
          )}

          {/* Step 1 – The couple */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-cormorant text-2xl font-light text-stone-800 mb-6">
                {l.step1}
              </h2>

              <div>
                <label className="block text-xs text-stone-500 mb-1.5 font-medium uppercase tracking-wider">
                  {l.brideName}
                </label>
                <input
                  name="bride_name"
                  value={form.bride_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
                  placeholder="Sophie"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-500 mb-1.5 font-medium uppercase tracking-wider">
                  {l.groomName}
                </label>
                <input
                  name="groom_name"
                  value={form.groom_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
                  placeholder="Antoine"
                />
              </div>

              <button
                onClick={() => form.bride_name && form.groom_name && setStep(2)}
                disabled={!form.bride_name || !form.groom_name}
                className="w-full py-3.5 rounded-xl text-white text-sm font-medium tracking-wider uppercase transition-all disabled:opacity-40"
                style={{ background: '#c9a84c' }}
              >
                {l.next}
              </button>
            </div>
          )}

          {/* Step 2 – Date & Venue */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-cormorant text-2xl font-light text-stone-800 mb-6">
                {l.step2}
              </h2>

              <div>
                <label className="block text-xs text-stone-500 mb-1.5 font-medium uppercase tracking-wider">
                  {l.weddingDate}
                </label>
                <input
                  type="date"
                  name="wedding_date"
                  value={form.wedding_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-500 mb-1.5 font-medium uppercase tracking-wider">
                  {l.venueName}
                </label>
                <input
                  name="venue_name"
                  value={form.venue_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
                  placeholder="Château de Versailles"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-500 mb-1.5 font-medium uppercase tracking-wider">
                    {l.venueCity}
                  </label>
                  <input
                    name="venue_city"
                    value={form.venue_city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
                    placeholder="Paris"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1.5 font-medium uppercase tracking-wider">
                    {l.venueCountry}
                  </label>
                  <select
                    name="venue_country"
                    value={form.venue_country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition bg-white"
                  >
                    <option value="France">{l.france}</option>
                    <option value="Israel">{l.israel}</option>
                    <option value="Other">{l.other}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone-500 mb-1.5 font-medium uppercase tracking-wider">
                  {l.rsvpDeadline}
                </label>
                <input
                  type="date"
                  name="rsvp_deadline"
                  value={form.rsvp_deadline}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
                  dir="ltr"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium tracking-wider uppercase transition hover:bg-stone-50"
                >
                  {l.back}
                </button>
                <button
                  onClick={() => form.wedding_date && setStep(3)}
                  disabled={!form.wedding_date}
                  className="flex-1 py-3.5 rounded-xl text-white text-sm font-medium tracking-wider uppercase transition-all disabled:opacity-40"
                  style={{ background: '#c9a84c' }}
                >
                  {l.next}
                </button>
              </div>
            </div>
          )}

          {/* Step 3 – Preferences */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-cormorant text-2xl font-light text-stone-800 mb-6">
                {l.step3}
              </h2>

              <div>
                <label className="block text-xs text-stone-500 mb-1.5 font-medium uppercase tracking-wider">
                  {l.locale}
                </label>
                <select
                  name="invitation_locale"
                  value={form.invitation_locale}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition bg-white"
                >
                  <option value="fr">{l.localeFr}</option>
                  <option value="he">{l.localeHe}</option>
                  <option value="en">{l.localeEn}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-stone-500 mb-1.5 font-medium uppercase tracking-wider">
                  {l.welcomeMessage}
                </label>
                <textarea
                  name="welcome_message"
                  value={form.welcome_message}
                  onChange={handleChange}
                  rows={4}
                  placeholder={l.welcomePlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium tracking-wider uppercase transition hover:bg-stone-50"
                >
                  {l.back}
                </button>
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-xl text-white text-sm font-medium tracking-wider uppercase transition-all disabled:opacity-60"
                  style={{ background: loading ? '#a8a29e' : '#c9a84c' }}
                >
                  {loading ? l.creating : l.create}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
