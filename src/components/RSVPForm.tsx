'use client'
// ============================================================
//  GrandInvite – RSVPForm Component
//  src/components/RSVPForm.tsx
// ============================================================

import { useState } from 'react'
import type { Locale } from '@/lib/i18n'
import type { RSVPFormData } from '@/types'

interface RSVPFormProps {
  weddingId: string
  locale: Locale
  t: Record<string, string>
  maxGuests: number
}

type FormState = 'idle' | 'submitting' | 'success-confirm' | 'success-decline' | 'error'
type AttendingChoice = 'confirmed' | 'declined' | null

export default function RSVPForm({ weddingId, locale, t, maxGuests }: RSVPFormProps) {
  const [attending, setAttending] = useState<AttendingChoice>(null)
  const [formState, setFormState] = useState<FormState>('idle')
  const [form, setForm] = useState<RSVPFormData>({
    name: '',
    email: '',
    phone: '',
    adults_count: 1,
    children_count: 0,
    dietary_preferences: '',
    allergies: '',
    notes: '',
    rsvp_status: 'confirmed',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'adults_count' || name === 'children_count'
        ? Math.max(0, parseInt(value) || 0)
        : value,
    }))
  }

  const handleAttending = (choice: 'confirmed' | 'declined') => {
    setAttending(choice)
    setForm(prev => ({ ...prev, rsvp_status: choice }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!attending) return
    setFormState('submitting')

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, wedding_id: weddingId }),
      })

      if (!response.ok) throw new Error('Failed')

      setFormState(
        attending === 'confirmed' ? 'success-confirm' : 'success-decline'
      )
    } catch {
      setFormState('error')
    }
  }

  // ---- Success State ----
  if (formState === 'success-confirm' || formState === 'success-decline') {
    return (
      <div className="text-center py-16 fade-in">
        <div className="text-5xl mb-6">
          {formState === 'success-confirm' ? '🎉' : '💌'}
        </div>
        <p className="font-cormorant text-2xl text-stone-700 font-light">
          {formState === 'success-confirm' ? t.successConfirm : t.successDecline}
        </p>
        <div className="mt-8 h-px w-24 bg-[#c9a84c] mx-auto" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 fade-in">

      {/* ── שם ── */}
      <div>
        <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
          {t.name} <span className="text-[#c9a84c]">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder={t.namePlaceholder}
          required
          dir="auto"
          className="input-grand"
        />
      </div>

      {/* ── אימייל ── */}
      <div>
        <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
          {t.email}
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder={t.emailPlaceholder ?? 'email@example.com'}
          className="input-grand"
        />
      </div>

      {/* ── האם מגיע? ── */}
      <div>
        <label className="block text-xs tracking-widest uppercase text-stone-400 mb-4">
          {t.attending} <span className="text-[#c9a84c]">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleAttending('confirmed')}
            className={`py-4 border transition-all duration-200 text-sm tracking-widest uppercase ${
              attending === 'confirmed'
                ? 'bg-[#c9a84c] border-[#c9a84c] text-white'
                : 'bg-white border-stone-200 text-stone-600 hover:border-[#c9a84c]'
            }`}
          >
            {t.yes}
          </button>
          <button
            type="button"
            onClick={() => handleAttending('declined')}
            className={`py-4 border transition-all duration-200 text-sm tracking-widest uppercase ${
              attending === 'declined'
                ? 'bg-stone-800 border-stone-800 text-white'
                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'
            }`}
          >
            {t.no}
          </button>
        </div>
      </div>

      {/* ── שדות נוספים רק אם מגיע ── */}
      {attending === 'confirmed' && (
        <>
          {/* מספר מבוגרים + ילדים */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
                {t.adults}
              </label>
              <div className="flex items-center border-b border-stone-300 focus-within:border-[#c9a84c] transition-colors">
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, adults_count: Math.max(1, p.adults_count - 1) }))}
                  className="px-3 py-2 text-stone-400 hover:text-stone-700"
                >−</button>
                <input
                  type="number"
                  name="adults_count"
                  value={form.adults_count}
                  onChange={handleChange}
                  min={1}
                  max={maxGuests}
                  className="flex-1 text-center py-2 bg-transparent focus:outline-none text-stone-800"
                />
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, adults_count: Math.min(maxGuests, p.adults_count + 1) }))}
                  className="px-3 py-2 text-stone-400 hover:text-stone-700"
                >+</button>
              </div>
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
                {t.children}
              </label>
              <div className="flex items-center border-b border-stone-300 focus-within:border-[#c9a84c] transition-colors">
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, children_count: Math.max(0, p.children_count - 1) }))}
                  className="px-3 py-2 text-stone-400 hover:text-stone-700"
                >−</button>
                <input
                  type="number"
                  name="children_count"
                  value={form.children_count}
                  onChange={handleChange}
                  min={0}
                  className="flex-1 text-center py-2 bg-transparent focus:outline-none text-stone-800"
                />
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, children_count: p.children_count + 1 }))}
                  className="px-3 py-2 text-stone-400 hover:text-stone-700"
                >+</button>
              </div>
            </div>
          </div>

          {/* העדפות תזונתיות */}
          <div>
            <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
              {t.dietary}
            </label>
            <input
              type="text"
              name="dietary_preferences"
              value={form.dietary_preferences}
              onChange={handleChange}
              placeholder={t.dietaryPlaceholder}
              dir="auto"
              className="input-grand"
            />
          </div>

          {/* אלרגיות */}
          <div>
            <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
              {t.allergies}
            </label>
            <input
              type="text"
              name="allergies"
              value={form.allergies}
              onChange={handleChange}
              placeholder={t.allergiesPlaceholder}
              dir="auto"
              className="input-grand"
            />
          </div>
        </>
      )}

      {/* ── שדה 'אחר / הערות נוספות' – תמיד גלוי ── */}
      {attending && (
        <div>
          <label className="block text-xs tracking-widest uppercase text-stone-400 mb-2">
            {t.notes}
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder={t.notesPlaceholder}
            rows={3}
            dir="auto"
            className="w-full px-4 py-3 bg-transparent border-b border-stone-300
                       focus:border-[#c9a84c] focus:outline-none resize-none
                       text-stone-800 placeholder-stone-400 transition-colors duration-200"
          />
        </div>
      )}

      {/* ── כפתור שליחה ── */}
      {attending && (
        <div className="pt-4">
          <button
            type="submit"
            disabled={formState === 'submitting' || !form.name.trim()}
            className={`w-full py-4 font-medium tracking-widest uppercase text-sm
                        transition-all duration-300 border
                        ${attending === 'confirmed'
                          ? 'bg-[#c9a84c] hover:bg-[#9a7d35] text-white border-[#c9a84c]'
                          : 'bg-stone-800 hover:bg-stone-900 text-white border-stone-800'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {formState === 'submitting'
              ? t.submitting
              : attending === 'confirmed'
              ? t.confirm
              : t.decline
            }
          </button>

          {formState === 'error' && (
            <p className="text-center text-red-500 text-sm mt-4">{t.error}</p>
          )}
        </div>
      )}
    </form>
  )
}
