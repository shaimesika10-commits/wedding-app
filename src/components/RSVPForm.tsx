'use client'
import { useState } from 'react'
import type { Locale } from '@/lib/i18n'

type RSVPStatus = 'confirmed' | 'declined' | null

interface Props {
  weddingId: string
  locale: Locale
  t: Record<string, string>
  maxGuests: number
}

export default function RSVPForm({ weddingId, locale, t, maxGuests }: Props) {
  const [status, setStatus] = useState<RSVPStatus>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [dietary, setDietary] = useState('')
  const [allergies, setAllergies] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<'confirmed' | 'declined' | null>(null)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!status) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wedding_id: weddingId, name, email, phone, adults_count: adults, children_count: children, dietary_preferences: dietary, allergies, notes, rsvp_status: status }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? t.error); return }
      setSuccess(status)
    } catch { setError(t.error) }
    finally { setSubmitting(false) }
  }

  if (success) {
    return (
      <div className="text-center py-12 fade-in">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: success === 'confirmed' ? '#ecfdf5' : '#fef2f2' }}>
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke={success === 'confirmed' ? '#059669' : '#ef4444'}>
            {success === 'confirmed'
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            }
          </svg>
        </div>
        <h3 className="font-cormorant text-2xl text-stone-800 mb-3">{success === 'confirmed' ? t.successConfirm : t.successDecline}</h3>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <p className="text-center text-sm text-stone-500 tracking-wide mb-4">{t.attending}</p>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setStatus('confirmed')}
            className={`py-4 border text-sm font-medium tracking-wide transition-all ${
              status === 'confirmed' ? 'bg-[#c9a84c] border-[#c9a84c] text-white' : 'border-stone-200 text-stone-600 hover:border-[#c9a84c]'
            }`}>{t.yes}</button>
          <button type="button" onClick={() => setStatus('declined')}
            className={`py-4 border text-sm font-medium tracking-wide transition-all ${
              status === 'declined' ? 'bg-stone-800 border-stone-800 text-white' : 'border-stone-200 text-stone-600 hover:border-stone-400'
            }`}>{t.no}</button>
        </div>
      </div>

      {status && (
        <div className="space-y-5 fade-in">
          <div>
            <label className="block text-xs text-stone-400 tracking-widest uppercase mb-2">{t.name} *</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder={t.namePlaceholder} className="input-grand" />
          </div>

          {status === 'confirmed' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-stone-400 tracking-widest uppercase mb-2">{t.adults}</label>
                  <input type="number" min={1} max={20} value={adults} onChange={e => setAdults(+e.target.value)} className="input-grand" />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 tracking-widest uppercase mb-2">{t.children}</label>
                  <input type="number" min={0} max={20} value={children} onChange={e => setChildren(+e.target.value)} className="input-grand" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-stone-400 tracking-widest uppercase mb-2">{t.dietary}</label>
                <input type="text" value={dietary} onChange={e => setDietary(e.target.value)} placeholder={t.dietaryPlaceholder} className="input-grand" />
              </div>
              <div>
                <label className="block text-xs text-stone-400 tracking-widest uppercase mb-2">{t.allergies}</label>
                <input type="text" value={allergies} onChange={e => setAllergies(e.target.value)} placeholder={t.allergiesPlaceholder} className="input-grand" />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs text-stone-400 tracking-widest uppercase mb-2">{t.email}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="marie@example.com" className="input-grand" />
          </div>
          <div>
            <label className="block text-xs text-stone-400 tracking-widest uppercase mb-2">{t.notes}</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={t.notesPlaceholder} rows={3}
              className="w-full px-4 py-3 bg-transparent border-b border-stone-300 focus:border-[#c9a84c] focus:outline-none text-stone-800 placeholder-stone-400 transition-colors resize-none" />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button type="submit" disabled={submitting || !name}
            className={`w-full py-4 text-sm font-medium tracking-widest uppercase transition-all ${
              status === 'confirmed' ? 'btn-gold' : 'btn-outline'
            } ${submitting || !name ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {submitting ? t.submitting : status === 'confirmed' ? t.confirm : t.decline}
          </button>
        </div>
      )}
    </form>
  )
}
