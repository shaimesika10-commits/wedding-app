'use client'
// ============================================================
//  GrandInvite – Onboarding Page
//  (יצירת חתונה ראשונה לזוג חדש)
//  src/app/[locale]/onboarding/page.tsx
// ============================================================

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { Locale } from '@/lib/i18n'

const labels = {
  fr: {
    title: 'Créez votre invitation',
    subtitle: 'Quelques détails pour commencer',
    chooseLanguage: 'Choisissez votre langue',
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
    locale: "Langue de l'invitation",
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
    errorCreate: 'Erreur lors de la création. Veuillez réessayer.',
  },
  he: {
    title: 'יצירת ההזמנה שלכם',
    subtitle: 'כמה פרטים כדי להתחיל',
    chooseLanguage: 'בחרו את השפה שלכם',
    step1: 'הזוג',
    step2: 'תאריך ומיקום',
    step3: 'העדפות',
    brideName: 'שם הכלה',
    groomName: 'שם החתן',
    weddingDate: 'תאריך החתונה',
    venueName: 'שם האולם / המקום',
    venueAddress: 'כתובת',
    venueCity: 'עיר',
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
    errorCreate: 'שגיאה ביצירת ההזמנה. נסה שוב.',
  },
  en: {
    title: 'Create your invitation',
    subtitle: 'A few details to get started',
    chooseLanguage: 'Choose your language',
    step1: 'The couple',
    step2: 'Date & venue',
    step3: 'Preferences',
    brideName: "Bride's first name",
    groomName: "Groom's first name",
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
    errorCreate: 'Error creating invitation. Please try again.',
  },
}

const LANGUAGES: { code: Locale; flag: string; label: string; nativeLabel: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'fr', flag: '🇫🇷', label: 'Français',  nativeLabel: 'French',  dir: 'ltr' },
  { code: 'he', flag: '🇮🇱', label: 'עברית',     nativeLabel: 'Hebrew',  dir: 'rtl' },
  { code: 'en', flag: '🇬🇧', label: 'English',   nativeLabel: 'English', dir: 'ltr' },
]

function slugify(bride: string, groom: string, date: string): string {
  const clean = (s: string) => {
    const latin = s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
    if (!latin) return s.split('').map(c => c.charCodeAt(0).toString(36)).join('').substring(0, 8)
    return latin
  }
  const year = date ? new Date(date).getFullYear() : new Date().getFullYear()
  return `${clean(bride)}-${clean(groom)}-${year}`
}

export default function OnboardingPage() {
  const params = useParams()
  const urlLocale = (params.locale as Locale) ?? 'fr'
  const router = useRouter()

  // step 0 = language picker, steps 1-3 = form
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0)
  const [locale, setLocale] = useState<Locale>(urlLocale)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const l = labels[locale] ?? labels.fr
  // Only apply RTL direction from step 1 onwards — applying dir change at step 0 causes
  // a layout shift mid-click that requires a double-click to advance (browser click-cancel bug)
  const isRTL = locale === 'he' && step > 0

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

  const handleSelectLanguage = (lang: Locale) => {
    setLocale(lang)
    setForm(prev => ({
      ...prev,
      invitation_locale: lang,
      venue_country: lang === 'he' ? 'Israel' : 'France',
    }))
    // Update URL without full reload so back-button works correctly
    setStep(1)
  }

  const handleCreate = async () => {
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/create-wedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bride_name: form.bride_name,
          groom_name: form.groom_name,
          wedding_date: form.wedding_date,
          venue_name: form.venue_name,
          venue_address: form.venue_address,
          venue_city: form.venue_city,
          venue_country: form.venue_country,
          locale: form.invitation_locale,
          rsvp_deadline: form.rsvp_deadline,
          welcome_message: form.welcome_message,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.code === 'AUTH_ERROR') {
          setLoading(false)
          router.push(`/${locale}/login`)
          return
        }
        setError(result.error || l.errorCreate)
        setLoading(false)
        return
      }

      // Full page reload bypasses Next.js router cache
      window.location.href = `/${locale}/dashboard`
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : String(err)}`)
      setLoading(false)
    }
  }


  const inputCls =
    'w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:border-gold transition'

  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-cream flex items-center justify-center px-4 py-12"
      style={{ background: '#faf8f5' }}
    >
      <div className="w-full max-w-lg">

        {/* ── Logo ── */}
        <div className="text-center mb-8">
          <h1 className="font-cormorant text-4xl font-light text-stone-900 tracking-widest mb-2">
            Grand<span style={{ color: '#c9a84c' }}>Invite</span>
          </h1>
          <div className="h-px w-16 mx-auto my-4" style={{ background: '#c9a84c' }} />
        </div>

        {/* ══════════════════════════════════════════════
            STEP 0 — Language selector
        ══════════════════════════════════════════════ */}
        {step === 0 && (
          <div className="text-center">
            <p className="text-stone-400 text-xs uppercase tracking-widest mb-8">
              Choose your language · Choisissez votre langue · בחרו שפה
            </p>

            <div className="space-y-3">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className="w-full flex items-center gap-4 px-6 py-5 bg-white rounded-2xl border border-stone-100 hover:border-stone-300 shadow-sm hover:shadow-md transition-all text-left"
                  dir={lang.dir}
                >
                  <span className="text-3xl flex-shrink-0">{lang.flag}</span>
                  <div className="flex-1">
                    <p className="font-cormorant text-xl font-light text-stone-800 leading-tight">
                      {lang.label}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">{lang.nativeLabel}</p>
                  </div>
                  <svg className="w-4 h-4 text-stone-300 flex-shrink-0" style={{ transform: lang.dir === 'rtl' ? 'rotate(180deg)' : '' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            STEPS 1-3 — Form
        ══════════════════════════════════════════════ */}
        {step > 0 && (
          <>
            {/* Progress indicator */}
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

            {/* Language badge — lets them go back and change */}
            <div className="flex justify-center mb-4">
              <button
                onClick={() => setStep(0)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-stone-200 text-xs text-stone-500 hover:border-stone-300 transition-colors"
              >
                <span>{LANGUAGES.find(l => l.code === locale)?.flag}</span>
                <span>{LANGUAGES.find(l => l.code === locale)?.label}</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-red-600 text-sm mb-4">
                  {error}
                </div>
              )}

              {/* ── Step 1: The couple ── */}
              {step === 1 && (
                <div className="space-y-5">
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
                      className={inputCls}
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
                      className={inputCls}
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

              {/* ── Step 2: Date & Venue ── */}
              {step === 2 && (
                <div className="space-y-5">
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
                      className={inputCls}
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
                      className={inputCls}
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
                        className={inputCls}
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
                        className={inputCls + ' bg-white'}
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
                      className={inputCls}
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

              {/* ── Step 3: Preferences ── */}
              {step === 3 && (
                <div className="space-y-5">
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
                      className={inputCls + ' bg-white'}
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
                      className={inputCls + ' resize-none'}
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
          </>
        )}
      </div>
    </main>
  )
}
