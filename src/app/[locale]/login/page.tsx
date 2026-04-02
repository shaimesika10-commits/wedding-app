'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Locale } from '@/lib/i18n'

export default function LoginPage({ params }: { params: { locale: Locale } }) {
  const locale = (params as any).locale ?? 'fr'
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/${locale}/dashboard` }
      })
      if (authError) { setError(authError.message); return }
      setSent(true)
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="font-cormorant text-3xl text-stone-800 mb-3">Check your email</h1>
          <p className="text-stone-500">We sent a magic link to <strong>{email}</strong></p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="font-cormorant text-4xl font-light text-stone-800 mb-2">
            Grand<span className="text-[#c9a84c]">Invite</span>
          </h1>
          <p className="text-stone-400 text-sm tracking-wide">Couple Dashboard</p>
        </div>

        <div className="bg-white p-8 shadow-sm border border-stone-100">
          <h2 className="font-cormorant text-2xl text-stone-800 mb-6">Sign in</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-stone-500 tracking-widest uppercase mb-2">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="marie@example.com"
                className="input-grand"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="btn-gold w-full">
              {loading ? 'Sending...' : 'Send magic link'}
            </button>
          </form>
          <p className="text-center text-xs text-stone-400 mt-6">
            You&apos;ll receive a link to sign in without a password.
          </p>
        </div>
      </div>
    </main>
  )
}
