'use client'

import { useState } from 'react'
import type { Locale } from '@/lib/i18n'

interface CustomField {
  id: string
  label: string
  type: 'text' | 'select' | 'boolean'
  required: boolean
  options?: string
}

interface RSVPFormProps {
  weddingId: string
  locale: Locale
  hasBrunch?: boolean
  rsvpDeadline?: string | null
  customFields?: CustomField[]
}

const l = {
  fr: {
    title: 'Confirmer ma présence',
    name: 'Votre prénom et nom',
    email: 'Email (facultatif)',
    phone: 'Téléphone (facultatif)',
    adults: 'Nombre d'adultes',
    children: 'Nombre d'enfants',
    diet: 'Régime alimentaire',
    dietOpts: ['Aucun', 'Végétarien', 'Vegan', 'Halal', 'Casher', 'Sans gluten'],
    allergies: 'Allergies',
    notes: 'Autre / Remarques',
    brunchQ: 'Serez-vous présent(e) au brunch le lendemain ?',
    yes: 'Oui', no: 'Non',
    confirm: 'Confirmer', decline: 'Décliner',
    submit: 'Envoyer',
    submitting: 'Envoi...',
    success: 'Merci ! Votre réponse a été enregistrée.',
    error: 'Une erreur est survenue. Veuillez réessayer.',
    deadline: 'Date limite :',
    attending: 'Je serai présent(e)',
    notAttending: 'Je ne pourrai pas venir',
  },
  he: {
    title: 'אישור הגעה',
    name: 'שם מלא',
    email: 'אימייל (אופציונלי)',
    phone: 'טלפון (אופציונלי)',
    adults: 'מספר מבוגרים',
    children: 'מספר ילדים',
    diet: 'העדפות תזונתיות',
    dietOpts: ['ללא', 'צמחוני', 'טבעוני', 'חלאל', 'כשר', 'ללא גלוטן'],
    allergies: 'אלרגיות',
    notes: 'אחר / הערות נוספות',
    brunchQ: 'האם תגיעו לבראנץ׳ למחרת?',
    yes: 'כן', no: 'לא',
    confirm: 'מאשר הגעה', decline: 'לא מגיע',
    submit: 'שלח',
    submitting: 'שולח...',
    success: 'תודה! תגובתך נרשמה.',
    error: 'אירעה שגיאה. נסה שוב.',
    deadline: 'תאריך אחרון:',
    attending: 'מגיע/ה',
    notAttending: 'לא מגיע/ה',
  },
  en: {
    title: 'RSVP',
    name: 'Full name',
    email: 'Email (optional)',
    phone: 'Phone (optional)',
    adults: 'Number of adults',
    children: 'Number of children',
    diet: 'Dietary preference',
    dietOpts: ['None', 'Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-free'],
    allergies: 'Allergies',
    notes: 'Other / Additional notes',
    brunchQ: 'Will you join us for brunch the next day?',
    yes: 'Yes', no: 'No',
    confirm: 'Confirm attendance', decline: 'Decline',
    submit: 'Submit',
    submitting: 'Submitting...',
    success: 'Thank you! Your response has been recorded.',
    error: 'An error occurred. Please try again.',
    deadline: 'RSVP by:',
    attending: 'Attending',
    notAttending: 'Not attending',
  },
}

export default function RSVPForm({ weddingId, locale, hasBrunch, rsvpDeadline, customFields = [] }: RSVPFormProps) {
  const labels = l[locale] || l.fr
  const isRtl = locale === 'he'

  const [attending, setAttending] = useState<boolean | null>(null)
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    adults_count: 1, children_count: 0,
    dietary_preferences: '', allergies: '', notes: '',
    brunch_attending: null as boolean | null,
  })
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name || attending === null) return
    setSubmitting(true); setError('')
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wedding_id: weddingId,
          name: form.name,
          email: form.email,
          phone: form.phone,
          adults_count: form.adults_count,
          children_count: form.children_count,
          dietary_preferences: form.dietary_preferences,
          allergies: form.allergies,
          notes: Object.entries(customAnswers).map(([k,v]) => `${k}: ${v}`).join('\n') + (form.notes ? '\n' + form.notes : ''),
          rsvp_status: attending ? 'confirmed' : 'declined',
          brunch_attending: form.brunch_attending,
        })
      })
      if (!res.ok) throw new Error('error')
      setSubmitted(true)
    } catch { setError(labels.error) }
    setSubmitting(false)
  }

  const inputClass = "w-full border border-stone-200 rounded px-4 py-3 text-stone-700 focus:outline-none focus:border-stone-400 text-sm font-montserrat bg-white"
  const labelClass = "block text-xs text-stone-400 mb-1 tracking-widest uppercase font-montserrat"

  if (submitted) {
    return (
      <section className="py-20 px-4 text-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-md mx-auto">
          <div className="text-4xl mb-4">✓</div>
          <p className="font-cormorant text-2xl text-stone-800 mb-2">{labels.success}</p>
        </div>
      </section>
    )
  }

  return (
    <section id="rsvp" className="py-16 px-4 bg-white" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-lg mx-auto">
        <h2 className="text-3xl font-cormorant text-stone-800 text-center mb-2">{labels.title}</h2>
        {rsvpDeadline && (
          <p className="text-xs text-stone-400 font-montserrat text-center mb-8">
            {labels.deadline} {new Date(rsvpDeadline).toLocaleDateString()}
          </p>
        )}

        {/* Attending toggle */}
        <div className="flex gap-3 mb-8">
          <button onClick={() => setAttending(true)}
            className={`flex-1 py-3 text-sm font-montserrat tracking-widest uppercase border-2 transition ${attending === true ? 'border-stone-800 bg-stone-800 text-white' : 'border-stone-200 text-stone-500 hover:border-stone-400'}`}>
            {labels.attending}
          </button>
          <button onClick={() => setAttending(false)}
            className={`flex-1 py-3 text-sm font-montserrat tracking-widest uppercase border-2 transition ${attending === false ? 'border-stone-400 bg-stone-100 text-stone-600' : 'border-stone-200 text-stone-500 hover:border-stone-400'}`}>
            {labels.notAttending}
          </button>
        </div>

        {attending !== null && (
          <div className="space-y-5">
            <div><label className={labelClass}>{labels.name} *</label><input className={inputClass} value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div><label className={labelClass}>{labels.email}</label><input type="email" className={inputClass} value={form.email} onChange={e => set('email', e.target.value)} /></div>
            <div><label className={labelClass}>{labels.phone}</label><input type="tel" className={inputClass} value={form.phone} onChange={e => set('phone', e.target.value)} /></div>

            {attending && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelClass}>{labels.adults}</label>
                    <input type="number" min={1} max={20} className={inputClass} value={form.adults_count} onChange={e => set('adults_count', parseInt(e.target.value) || 1)} />
                  </div>
                  <div><label className={labelClass}>{labels.children}</label>
                    <input type="number" min={0} max={20} className={inputClass} value={form.children_count} onChange={e => set('children_count', parseInt(e.target.value) || 0)} />
                  </div>
                </div>
                <div><label className={labelClass}>{labels.diet}</label>
                  <select className={inputClass} value={form.dietary_preferences} onChange={e => set('dietary_preferences', e.target.value)}>
                    {labels.dietOpts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div><label className={labelClass}>{labels.allergies}</label><input className={inputClass} value={form.allergies} onChange={e => set('allergies', e.target.value)} /></div>

                {/* Custom fields */}
                {customFields.map(field => (
                  <div key={field.id}>
                    <label className={labelClass}>{field.label}{field.required ? ' *' : ''}</label>
                    {field.type === 'text' && (
                      <input className={inputClass} value={customAnswers[field.label] || ''} onChange={e => setCustomAnswers(prev => ({ ...prev, [field.label]: e.target.value }))} />
                    )}
                    {field.type === 'select' && (
                      <select className={inputClass} value={customAnswers[field.label] || ''} onChange={e => setCustomAnswers(prev => ({ ...prev, [field.label]: e.target.value }))}>
                        <option value="">—</option>
                        {(field.options || '').split(',').map(o => o.trim()).filter(Boolean).map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                    {field.type === 'boolean' && (
                      <div className="flex gap-3">
                        {[labels.yes, labels.no].map(val => (
                          <button key={val} type="button" onClick={() => setCustomAnswers(prev => ({ ...prev, [field.label]: val }))}
                            className={`flex-1 py-2 text-sm font-montserrat border-2 transition ${customAnswers[field.label] === val ? 'border-stone-800 bg-stone-800 text-white' : 'border-stone-200 text-stone-500 hover:border-stone-300'}`}>
                            {val}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Brunch */}
                {hasBrunch && (
                  <div>
                    <label className={labelClass}>{labels.brunchQ}</label>
                    <div className="flex gap-3">
                      {[{ val: true, lbl: labels.yes }, { val: false, lbl: labels.no }].map(({ val, lbl }) => (
                        <button key={String(val)} type="button" onClick={() => set('brunch_attending', val)}
                          className={`flex-1 py-2 text-sm font-montserrat border-2 transition ${form.brunch_attending === val ? 'border-stone-800 bg-stone-800 text-white' : 'border-stone-200 text-stone-500 hover:border-stone-300'}`}>
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div><label className={labelClass}>{labels.notes}</label><textarea className={inputClass + ' h-24 resize-none'} value={form.notes} onChange={e => set('notes', e.target.value)} /></div>

            {error && <p className="text-red-500 text-sm font-montserrat">{error}</p>}

            <button onClick={handleSubmit} disabled={submitting || !form.name}
              className="w-full bg-stone-800 text-white py-4 font-montserrat text-sm tracking-widest uppercase hover:bg-stone-700 transition disabled:opacity-40">
              {submitting ? labels.submitting : labels.submit}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
