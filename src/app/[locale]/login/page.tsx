'use client'
// ============================================================
//  GrandInvite – Login Page
//  src/app/[locale]/login/page.tsx
// ============================================================

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Locale } from '@/lib/i18n'

const labels = {
  fr: {
    title: 'Connexion',
    subtitle: 'Accédez à votre espace couple',
    email: 'Adresse e-mail',
    login: 'Se connecter',
    loggingIn: 'Connexion...',
    magicLink: 'Envoyer un lien magique',
    magicLinkSent: 'Vérifiez votre email !',
    magicLinkSubtitle: 'Nous vous avons envoyé un lien de connexion.',
    error: 'Une erreur est survenue. Veuillez réessayer.',
  },
  he: {
    title: 'התחברות',
    subtitle: 'כניסה לאזור הזוג',
    email: 'כתובת אימייל',
    login: 'התחבר/י',
    loggingIn: 'מתחבר...',
    magicLink: 'שלח קישור קסם',
    magicLinkSent: 'בדוק/י את האימייל שלך!',
    magicLinkSubtitle: 'שלחנו לך קישור כניסה.',
    error: 'משהו השתבש. נסה/י שוב.',
  },
  en: {
    title: 'Sign In',
    subtitle: 'Access your couple dashboard',
    email: 'Email address',
    login: 'Sign in',
    loggingIn: 'Signing in...',
    magicLink: 'Send magic link',
    magicLinkSent: 'Check your email!',
    magicLinkSubtitle: 'We sent you a login link.',
    error: 'Something went wrong. Please try again.',
  },
}

export default function LoginPage() {
  const params = useParams()
  const locale = (params.locale as Locale) ?? 'fr'
  const l = labels[locale] ?? labels.fr
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Must route through /auth/callback so the server session cookie is set
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/${locale}/dashboard`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  const isRTL = locale === 'he'

  if (sent) {
    return (
      <main
        dir={isRTL ? 'rtl' : 'ltr'}
        className="min-h-screen bg-cream flex items-center justify-center px-4"
      >
        <div className="text-center max-w-md">
          <div className="text-5xl mb-6">✉️</div>
          <h1 className="font-cormorant text-3xl font-light text-stone-800 mb-3">
            {l.magicLinkSent}
          </h1>
          <p className="text-stone-400 text-sm">{l.magicLinkSubtitle}</p>
          <div className="h-px w-12 mx-auto mt-6" style={{ background: '#c9a84c' }} />
        </div>
      </main>
    )
  }

  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-cream flex items-center justify-center px-4"
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-cormorant text-4xl font-light text-stone-900 tracking-widest mb-2">
            Grand<span style={{ color: '#c9a84c' }}>Invite</span>
          </h1>
          <div className="h-px w-16 mx-auto my-4" style={{ background: '#c9a84c' }} />
          <p className="text-stone-500 text-sm font-light">{l.subtitle}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          <h2 className="font-cormorant text-2xl font-light text-stone-800 mb-6 text-center">
            {l.title}
          </h2>

          <form onSubmit={handleMagicLink} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs text-stone-500 mb-1.5 font-medium uppercase tracking-wider">
                {l.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:border-gold transition"
                placeholder="vous@exemple.com"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3.5 rounded-xl text-white text-sm font-medium tracking-wider uppercase transition-all disabled:opacity-60"
              style={{ background: loading ? '#a8a29e' : '#c9a84c' }}
            >
              {loading ? l.loggingIn : l.magicLink}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-stone-300 mt-6">
          © {new Date().getFullYear()} GrandInvite
        </p>
      </div>
    </main>
  )
}
