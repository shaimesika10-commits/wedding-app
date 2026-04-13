'use client'
// ============================================================
//  GrandInvite – Onboarding Page
//  (יצירת חתונה ראשונה לזוג חדש)
//  src/app/[locale]/onboarding/page.tsx
// ============================================================

import { useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Locale } from '@/lib/i18n'

const PALETTE_OPTIONS = [
  { key: 'ivory',    bg: '#faf8f5', accent: '#c9a84c', text: '#292524' },
  { key: 'blush',    bg: '#fff5f5', accent: '#d4888a', text: '#3d1f1f' },
  { key: 'sage',     bg: '#f4f7f4', accent: '#6a9a6e', text: '#1f2e1f' },
  { key: 'midnight', bg: '#1a1a2e', accent: '#c9a84c', text: '#f5f0e8' },
] as const

// ── All countries, alphabetical (France & Israel pinned top) ──
const COUNTRIES = [
  'France', 'Israel',
  '─────────────',
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda',
  'Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize',
  'Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil',
  'Brunei','Bulgaria','Burkina Faso','Burundi',
  'Cabo Verde','Cambodia','Cameroon','Canada','Central African Republic','Chad',
  'Chile','China','Colombia','Comoros','Congo (Brazzaville)','Congo (Kinshasa)',
  'Costa Rica','Croatia','Cuba','Cyprus','Czech Republic',
  'Denmark','Djibouti','Dominica','Dominican Republic',
  'Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia',
  'Eswatini','Ethiopia',
  'Fiji','Finland',
  'Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada',
  'Guatemala','Guinea','Guinea-Bissau','Guyana',
  'Haiti','Honduras','Hungary',
  'Iceland','India','Indonesia','Iran','Iraq','Ireland','Italy',
  'Jamaica','Japan','Jordan',
  'Kazakhstan','Kenya','Kiribati','Kuwait','Kyrgyzstan',
  'Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein',
  'Lithuania','Luxembourg',
  'Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands',
  'Mauritania','Mauritius','Mexico','Micronesia','Moldova','Monaco','Mongolia',
  'Montenegro','Morocco','Mozambique','Myanmar',
  'Namibia','Nauru','Nepal','Netherlands','New Zealand','Nicaragua','Niger',
  'Nigeria','North Korea','North Macedonia','Norway',
  'Oman',
  'Pakistan','Palau','Palestine','Panama','Papua New Guinea','Paraguay','Peru',
  'Philippines','Poland','Portugal',
  'Qatar',
  'Romania','Russia','Rwanda',
  'Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines',
  'Samoa','San Marino','Sao Tome and Principe','Saudi Arabia','Senegal','Serbia',
  'Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands',
  'Somalia','South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan',
  'Suriname','Sweden','Switzerland','Syria',
  'Taiwan','Tajikistan','Tanzania','Thailand','Timor-Leste','Togo','Tonga',
  'Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu',
  'Uganda','Ukraine','United Arab Emirates','United Kingdom','United States',
  'Uruguay','Uzbekistan',
  'Vanuatu','Vatican City','Venezuela','Vietnam',
  'Yemen',
  'Zambia','Zimbabwe',
  'Other',
]

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
    locale: 'Langue de l\'invitation',
    rsvpDeadline: 'Date limite de réponse',
    welcomeMessage: 'Message de bienvenue',
    welcomePlaceholder: 'Nous sommes ravis de vous inviter à notre mariage...',
    palette: 'Palette de couleurs',
    coverPhoto: 'Photo de couverture',
    coverPhotoHint: 'JPG, PNG, WEBP · max 5 MB · optionnel',
    coverPhotoClick: 'Cliquez pour choisir une photo',
    coverPhotoChange: 'Changer la photo',
    next: 'Continuer',
    back: 'Retour',
    create: 'Créer mon invitation',
    creating: 'Création en cours...',
    logout: 'Se déconnecter',
    localeFr: 'Français',
    localeHe: 'Hébreu',
    localeEn: 'Anglais',
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
    palette: 'פלטת צבעים',
    coverPhoto: 'תמונת שער',
    coverPhotoHint: 'JPG, PNG, WEBP · עד 5 MB · אופציונלי',
    coverPhotoClick: 'לחצו לבחירת תמונה',
    coverPhotoChange: 'החלפת תמונה',
    next: 'המשך',
    back: 'חזרה',
    create: 'יצירת ההזמנה',
    creating: 'יוצר...',
    logout: 'התנתקות',
    localeFr: 'צרפתית',
    localeHe: 'עברית',
    localeEn: 'אנגלית',
  },
  en: {
    title: 'Create your invitation',
    subtitle: 'A few details to get started',
    chooseLanguage: 'Choose your language',
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
    palette: 'Color palette',
    coverPhoto: 'Cover photo',
    coverPhotoHint: 'JPG, PNG, WEBP · max 5 MB · optional',
    coverPhotoClick: 'Click to choose a photo',
    coverPhotoChange: 'Change photo',
    next: 'Continue',
    back: 'Back',
    create: 'Create my invitation',
    creating: 'Creating...',
    logout: 'Sign out',
    localeFr: 'French',
    localeHe: 'Hebrew',
    localeEn: 'English',
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
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // step 0 = language picker, steps 1-3 = form
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0)
  const [locale, setLocale] = useState<Locale>(urlLocale)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)

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
    layout_style: 'ivory' as string,
    font_style: 'cormorant' as string,
  })

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Image too large (max 5 MB)')
      return
    }
    setCoverImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setCoverImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    setError('')
  }

  const handleSelectLanguage = (lang: Locale) => {
    setLocale(lang)
    setForm(prev => ({
      ...prev,
      invitation_locale: lang,
      venue_country: lang === 'he' ? 'Israel' : 'France',
    }))
    setStep(1)
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

    // Upload cover image if provided
    let coverImageUrl: string | null = null
    if (coverImageFile) {
      const ext = coverImageFile.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const path = `${user.id}/${slug}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('wedding-covers')
        .upload(path, coverImageFile, { upsert: true })
      if (!uploadErr) {
        const { data: { publicUrl } } = supabase.storage
          .from('wedding-covers')
          .getPublicUrl(path)
        coverImageUrl = publicUrl
      }
    }

    const { error: insertError } = await supabase
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
        venue_country: form.venue_country === '─────────────' ? null : form.venue_country,
        locale: form.invitation_locale,
        rsvp_deadline: form.rsvp_deadline || null,
        welcome_message: form.welcome_message.trim() || null,
        layout_style: form.layout_style,
        font_style: form.font_style,
        cover_image_url: coverImageUrl,
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

  const inputCls =
    'w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:border-gold transition'

  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-cream flex items-center justify-center px-4 py-12"
      style={{ background: '#faf8f5' }}
    >
      <div className="w-full max-w-lg">

        {/* ── Logo + logout ── */}
        <div className="text-center mb-8 relative">
          <h1 className="font-cormorant text-4xl font-light text-stone-900 tracking-widest mb-2">
            Grand<span style={{ color: '#c9a84c' }}>Invite</span>
          </h1>
          <div className="h-px w-16 mx-auto my-4" style={{ background: '#c9a84c' }} />
          <button
            onClick={handleLogout}
            className="absolute top-0 text-xs text-stone-400 hover:text-stone-600 transition-colors flex items-center gap-1"
            style={{ [isRTL ? 'left' : 'right']: 0 }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {l.logout}
          </button>
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
                        {COUNTRIES.map(c => (
                          c === '─────────────'
                            ? <option key={c} value={c} disabled>{c}</option>
                            : <option key={c} value={c}>{c}</option>
                        ))}
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

                  {/* ── Cover photo upload ── */}
                  <div>
                    <label className="block text-xs text-stone-500 mb-2 font-medium uppercase tracking-wider">
                      {l.coverPhoto}
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleCoverImageChange}
                      className="hidden"
                    />
                    {coverImagePreview ? (
                      <div className="relative rounded-xl overflow-hidden" style={{ height: 180 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={coverImagePreview}
                          alt="cover preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition"
                          style={{ background: 'rgba(0,0,0,0.55)' }}
                        >
                          {l.coverPhotoChange}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-200 hover:border-stone-300 transition-colors"
                        style={{ height: 120 }}
                      >
                        <svg className="w-8 h-8 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-stone-400">{l.coverPhotoClick}</span>
                        <span className="text-xs text-stone-300">{l.coverPhotoHint}</span>
                      </button>
                    )}
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

                  {/* Palette picker — mini invitation previews */}
                  <div>
                    <label className="block text-xs text-stone-500 mb-3 font-medium uppercase tracking-wider">
                      {l.palette}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {PALETTE_OPTIONS.map(p => {
                        const isSelected = form.layout_style === p.key
                        const themeName =
                          p.key === 'ivory'    ? (locale === 'he' ? 'שנהב' : locale === 'fr' ? 'Ivoire'  : 'Ivory')
                        : p.key === 'blush'    ? (locale === 'he' ? 'ורוד'  : locale === 'fr' ? 'Blush'   : 'Blush')
                        : p.key === 'sage'     ? (locale === 'he' ? 'מרווה' : locale === 'fr' ? 'Sauge'   : 'Sage')
                        :                        (locale === 'he' ? 'חצות'  : locale === 'fr' ? 'Minuit'  : 'Midnight')
                        const bridePH   = locale === 'he' ? 'כלה'  : locale === 'fr' ? 'Mariée' : 'Bride'
                        const groomPH   = locale === 'he' ? 'חתן'  : locale === 'fr' ? 'Marié'  : 'Groom'
                        const datePH    = locale === 'he' ? 'תאריך החתונה' : locale === 'fr' ? 'Votre date' : 'Your date'
                        const displayDate = form.wedding_date
                          ? new Date(form.wedding_date + 'T12:00:00').toLocaleDateString(
                              locale === 'he' ? 'he-IL' : locale === 'fr' ? 'fr-FR' : 'en-GB',
                              { day: 'numeric', month: 'long', year: 'numeric' }
                            )
                          : datePH
                        return (
                          <button
                            key={p.key}
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, layout_style: p.key }))}
                            className="relative rounded-2xl overflow-hidden transition-all text-left focus:outline-none"
                            style={{
                              border: isSelected ? `2px solid ${p.accent}` : '2px solid transparent',
                              boxShadow: isSelected
                                ? `0 0 0 2px ${p.accent}40, 0 4px 14px rgba(0,0,0,0.1)`
                                : '0 1px 5px rgba(0,0,0,0.07)',
                              transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                            }}
                          >
                            {/* Mini invitation card body */}
                            <div
                              dir={locale === 'he' ? 'rtl' : 'ltr'}
                              style={{
                                background: p.bg,
                                padding: '20px 14px 16px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 7,
                                minHeight: 126,
                                justifyContent: 'center',
                              }}
                            >
                              {/* Ornament */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                                <div style={{ width: 14, height: 1, background: p.accent, opacity: 0.55 }} />
                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: p.accent, flexShrink: 0 }} />
                                <div style={{ width: 14, height: 1, background: p.accent, opacity: 0.55 }} />
                              </div>
                              {/* Couple names */}
                              <p style={{
                                fontFamily: "'Cormorant Garamond', Cormorant, Georgia, serif",
                                fontSize: 13,
                                fontWeight: 400,
                                letterSpacing: '0.04em',
                                color: p.text,
                                margin: 0,
                                lineHeight: 1.35,
                                textAlign: 'center',
                              }}>
                                {form.bride_name || bridePH}
                                {' '}<span style={{ opacity: 0.35 }}>&</span>{' '}
                                {form.groom_name || groomPH}
                              </p>
                              {/* Accent line */}
                              <div style={{ width: 28, height: 1, background: p.accent }} />
                              {/* Date */}
                              <p style={{
                                fontFamily: 'system-ui, sans-serif',
                                fontSize: 8,
                                letterSpacing: '0.13em',
                                textTransform: 'uppercase',
                                color: p.text,
                                opacity: 0.4,
                                margin: 0,
                                textAlign: 'center',
                              }}>
                                {displayDate}
                              </p>
                            </div>
                            {/* Theme name footer */}
                            <div style={{
                              background: p.key === 'midnight' ? '#0f0f22' : '#f0ede8',
                              padding: '7px 12px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}>
                              <span style={{
                                fontSize: 9,
                                fontFamily: 'system-ui, sans-serif',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.13em',
                                color: p.key === 'midnight' ? '#6b7280' : '#a8a29e',
                              }}>
                                {themeName}
                              </span>
                              <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.accent, flexShrink: 0 }} />
                            </div>
                            {/* Selected checkmark */}
                            {isSelected && (
                              <div
                                className="absolute top-2 flex items-center justify-center w-5 h-5 rounded-full"
                                style={{
                                  [locale === 'he' ? 'right' : 'left']: 8,
                                  background: p.accent,
                                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                                }}
                              >
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                                </svg>
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
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
