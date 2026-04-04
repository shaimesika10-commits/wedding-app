'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import type { Locale } from '@/lib/i18n'

const labels = {
  fr: {
    step1Title: 'Vos prénoms',
    partner1: 'Prénom du/de la marié(e) 1',
    partner2: 'Prénom du/de la marié(e) 2',
    next: 'Suivant',
    step2Title: 'Date & lieu',
    date: 'Date du mariage',
    venue: 'Nom du lieu',
    address: 'Adresse',
    back: 'Retour',
    step3Title: 'Votre invitation',
    locale: 'Langue principale',
    welcome: 'Message de bienvenue',
    deadline: 'Date limite RSVP',
    couplePhoto: 'Photo du couple (facultatif)',
    uploadPhoto: 'Choisir une photo',
    changePhoto: 'Changer la photo',
    multiLangNotice: 'Les invités verront cette invitation dans leur propre langue (français, hébreu ou anglais) automatiquement.',
    create: 'Créer mon invitation',
    creating: 'Création en cours...',
  },
  he: {
    step1Title: 'שמות בני הזוג',
    partner1: 'שם בן/בת הזוג הראשון',
    partner2: 'שם בן/בת הזוג השני',
    next: 'הבא',
    step2Title: 'תאריך ומקום',
    date: 'תאריך החתונה',
    venue: 'שם האולם',
    address: 'כתובת',
    back: 'חזור',
    step3Title: 'ההזמנה שלכם',
    locale: 'שפה ראשית',
    welcome: 'הודעת ברוכים הבאים',
    deadline: 'תאריך אחרון לאישור הגעה',
    couplePhoto: 'תמונת הזוג (אופציונלי)',
    uploadPhoto: 'בחר תמונה',
    changePhoto: 'החלף תמונה',
    multiLangNotice: 'האורחים יראו את ההזמנה בשפה שלהם (צרפתית, עברית או אנגלית) באופן אוטומטי.',
    create: 'צור את ההזמנה שלי',
    creating: 'יוצר...',
  },
  en: {
    step1Title: 'Your names',
    partner1: 'Partner 1 name',
    partner2: 'Partner 2 name',
    next: 'Next',
    step2Title: 'Date & venue',
    date: 'Wedding date',
    venue: 'Venue name',
    address: 'Address',
    back: 'Back',
    step3Title: 'Your invitation',
    locale: 'Main language',
    welcome: 'Welcome message',
    deadline: 'RSVP deadline',
    couplePhoto: 'Couple photo (optional)',
    uploadPhoto: 'Choose a photo',
    changePhoto: 'Change photo',
    multiLangNotice: 'Guests will see this invitation in their own language (French, Hebrew, or English) automatically.',
    create: 'Create my invitation',
    creating: 'Creating...',
  },
}

export default function OnboardingPage({ params }: { params: { locale: Locale } }) {
  const locale = params.locale as Locale
  const l = labels[locale] || labels.fr
  const router = useRouter()
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const fileRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [couplePhotoFile, setCouplePhotoFile] = useState<File | null>(null)
  const [couplePhotoPreview, setCouplePhotoPreview] = useState<string | null>(null)

  const [form, setForm] = useState({
    partner1_name: '',
    partner2_name: '',
    wedding_date: '',
    venue_name: '',
    venue_address: '',
    invitation_locale: locale,
    welcome_message: '',
    rsvp_deadline: '',
  })

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCouplePhotoFile(file)
    setCouplePhotoPreview(URL.createObjectURL(file))
  }

  const handleCreate = async () => {
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const slug = `${form.partner1_name.toLowerCase().replace(/\s+/g, '-')}-${form.partner2_name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`

      let couple_photo_url: string | null = null
      if (couplePhotoFile) {
        const ext = couplePhotoFile.name.split('.').pop()
        const path = `${user.id}/${slug}.${ext}`
        const { error: upErr } = await supabase.storage.from('couple-photos').upload(path, couplePhotoFile, { upsert: true })
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('couple-photos').getPublicUrl(path)
          couple_photo_url = urlData.publicUrl
        }
      }

      const { error: wErr } = await supabase.from('weddings').insert({
        user_id: user.id,
        partner1_name: form.partner1_name,
        partner2_name: form.partner2_name,
        wedding_date: form.wedding_date || null,
        venue_name: form.venue_name,
        venue_address: form.venue_address,
        invitation_locale: form.invitation_locale,
        welcome_message: form.welcome_message,
        rsvp_deadline: form.rsvp_deadline || null,
        wedding_slug: slug,
        couple_photo_url,
        plan: 'free',
        max_guests: 200,
      })

      if (wErr) throw wErr
      router.push(`/${locale}/dashboard`)
    } catch (e: any) {
      setError(e.message || 'Error')
      setLoading(false)
    }
  }

  const inputClass = "w-full border border-stone-200 rounded px-4 py-3 text-stone-700 focus:outline-none focus:border-stone-400 bg-white font-montserrat text-sm"
  const labelClass = "block text-xs text-stone-500 mb-1 tracking-widest uppercase font-montserrat"

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-montserrat ${step >= s ? 'bg-stone-800 text-white' : 'bg-stone-200 text-stone-400'}`}>{s}</div>
              {s < 3 && <div className={`w-8 h-px ${step > s ? 'bg-stone-800' : 'bg-stone-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-cormorant text-stone-800 text-center">{l.step1Title}</h1>
            <div>
              <label className={labelClass}>{l.partner1}</label>
              <input className={inputClass} value={form.partner1_name} onChange={e => set('partner1_name', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>{l.partner2}</label>
              <input className={inputClass} value={form.partner2_name} onChange={e => set('partner2_name', e.target.value)} />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!form.partner1_name || !form.partner2_name}
              className="w-full bg-stone-800 text-white py-3 font-montserrat text-sm tracking-widest uppercase hover:bg-stone-700 transition disabled:opacity-40"
            >{l.next}</button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-cormorant text-stone-800 text-center">{l.step2Title}</h1>
            <div>
              <label className={labelClass}>{l.date}</label>
              <input type="datetime-local" className={inputClass} value={form.wedding_date} onChange={e => set('wedding_date', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>{l.venue}</label>
              <input className={inputClass} value={form.venue_name} onChange={e => set('venue_name', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>{l.address}</label>
              <input className={inputClass} value={form.venue_address} onChange={e => set('venue_address', e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border border-stone-300 text-stone-600 py-3 font-montserrat text-sm tracking-widest uppercase hover:bg-stone-100 transition">{l.back}</button>
              <button onClick={() => setStep(3)} className="flex-1 bg-stone-800 text-white py-3 font-montserrat text-sm tracking-widest uppercase hover:bg-stone-700 transition">{l.next}</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-cormorant text-stone-800 text-center">{l.step3Title}</h1>
            
            {/* Couple Photo Upload */}
            <div>
              <label className={labelClass}>{l.couplePhoto}</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              {couplePhotoPreview ? (
                <div className="relative">
                  <img src={couplePhotoPreview} alt="couple" className="w-full h-48 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-white/90 text-stone-700 px-3 py-1 text-xs font-montserrat rounded shadow"
                  >{l.changePhoto}</button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-stone-300 rounded py-8 text-stone-400 text-sm font-montserrat hover:border-stone-400 transition flex flex-col items-center gap-2"
                >
                  <span className="text-2xl">📸</span>
                  {l.uploadPhoto}
                </button>
              )}
            </div>

            <div>
              <label className={labelClass}>{l.locale}</label>
              <select className={inputClass} value={form.invitation_locale} onChange={e => set('invitation_locale', e.target.value)}>
                <option value="fr">Français</option>
                <option value="he">עברית</option>
                <option value="en">English</option>
              </select>
              <p className="mt-2 text-xs text-stone-400 leading-relaxed">🌍 {l.multiLangNotice}</p>
            </div>

            <div>
              <label className={labelClass}>{l.welcome}</label>
              <textarea className={inputClass + ' h-28 resize-none'} value={form.welcome_message} onChange={e => set('welcome_message', e.target.value)} />
            </div>

            <div>
              <label className={labelClass}>{l.deadline}</label>
              <input type="date" className={inputClass} value={form.rsvp_deadline} onChange={e => set('rsvp_deadline', e.target.value)} />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border border-stone-300 text-stone-600 py-3 font-montserrat text-sm tracking-widest uppercase hover:bg-stone-100 transition">{l.back}</button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="flex-1 bg-stone-800 text-white py-3 font-montserrat text-sm tracking-widest uppercase hover:bg-stone-700 transition disabled:opacity-40"
              >{loading ? l.creating : l.create}</button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
