'use client'
// ============================================================
//  GrandInvite – Reset Password Page
//  הגעים אחרי לחיצה על קישור איפוס סיסמה באימייל
//  src/app/[locale]/reset-password/page.tsx
// ============================================================

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Locale } from '@/lib/i18n'

const L = {
  fr: {
    title: 'Nouveau mot de passe',
    subtitle: 'Choisissez un nouveau mot de passe pour votre compte.',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    btn: 'Enregistrer le mot de passe',
    saving: 'Enregistrement...',
    hint: 'Minimum 8 caractères',
    mismatch: 'Les mots de passe ne correspondent pas.',
    success: 'Mot de passe mis à jour ! Redirection...',
    error: 'Une erreur est survenue. Veuillez réessayer.',
    backToLogin: 'Retour à la connexion',
  },
  he: {
    title: 'סיסמה חדשה',
    subtitle: 'בחרו סיסמה חדשה לחשבון שלכם.',
    newPassword: 'סיסמה חדשה',
    confirmPassword: 'אימות סיסמה',
    btn: 'שמור סיסמה',
    saving: 'שומר...',
    hint: 'לפחות 8 תווים',
    mismatch: 'הסיסמאות אינן תואמות.',
    success: 'הסיסמה עודכנה! מעביר...',
    error: 'אירעה שגיאה. אנא נסה שוב.',
    backToLogin: 'חזרה לכניסה',
  },
  en: {
    title: 'New password',
    subtitle: 'Choose a new password for your account.',
    newPassword: 'New password',
    confirmPassword: 'Confirm password',
    btn: 'Save password',
    saving: 'Saving...',
    hint: 'Minimum 8 characters',
    mismatch: 'Passwords do not match.',
    success: 'Password updated! Redirecting...',
    error: 'An error occurred. Please try again.',
    backToLogin: 'Back to sign in',
  },
}

const fieldCls = 'w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-500 transition bg-stone-50'
const labelCls = 'block text-xs text-stone-500 mb-1.5 font-medium uppercase tracking-wider'

export default function ResetPasswordPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (params.locale as Locale) ?? 'fr'
  const l = L[locale] ?? L.fr
  const supabase = createClient()
  const isRTL = locale === 'he'

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [verifying, setVerifying] = useState(false)

  // ── BUG FIX: Verify recovery token client-side to prevent iOS Mail prefetch issue
  // The auth/callback route now passes token_hash as a query param instead of
  // verifying it server-side (which would consume the one-time token on prefetch).
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tokenHash = urlParams.get('token_hash')
    if (!tokenHash) return

    setVerifying(true)
    supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
      .then(({ error: verifyError }) => {
        setVerifying(false)
        if (verifyError) {
          router.replace(`/${locale}/login?error=invalid_link`)
        }
        // On success: Supabase sets the session; user stays on this page to enter new password
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError(l.mismatch)
      return
    }
    if (password.length < 8) {
      setError(l.hint)
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message || l.error)
        setLoading(false)
        return
      }
      setSuccess(true)
      setTimeout(() => router.push(`/${locale}/dashboard`), 2000)
    } catch {
      setError(l.error)
      setLoading(false)
    }
  }

  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <a href={`/${locale}`}>
            <h1 className="font-cormorant text-4xl font-light text-stone-900 tracking-widest">
              Grand<span style={{ color: '#c9a84c' }}>Invite</span>
            </h1>
          </a>
          <div className="h-px w-14 mx-auto my-3" style={{ background: '#c9a84c' }} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          {/* Verifying token */}
          {verifying ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
              <p className="text-stone-400 text-sm">
                {locale === 'he' ? 'מאמת קישור...' : locale === 'fr' ? 'Vérification du lien...' : 'Verifying link...'}
              </p>
            </div>
          ) : /* Success */
          success ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#ecfdf5' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.5">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-emerald-700 font-medium">{l.success}</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="font-cormorant text-2xl text-stone-800 mb-1">{l.title}</h2>
                <p className="text-stone-400 text-sm">{l.subtitle}</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-red-600 text-sm mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={labelCls}>{l.newPassword}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    dir="ltr"
                    className={fieldCls}
                    placeholder="••••••••"
                    autoFocus
                  />
                </div>
                <div>
                  <label className={labelCls}>{l.confirmPassword}</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    dir="ltr"
                    className={fieldCls}
                    placeholder="••••••••"
                  />
                </div>
                <p className="text-xs text-stone-400 -mt-1">{l.hint}</p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-white text-sm font-medium tracking-wider uppercase transition-all disabled:opacity-60"
                  style={{
                    background: loading ? '#a8a29e' : '#c9a84c',
                    boxShadow: loading ? 'none' : '0 4px 14px rgba(201,168,76,0.25)',
                  }}
                >
                  {loading ? l.saving : l.btn}
                </button>
              </form>

              <button
                onClick={() => router.push(`/${locale}/login`)}
                className="mt-4 w-full text-center text-xs text-stone-400 hover:text-stone-600 transition"
              >
                ← {l.backToLogin}
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-stone-300 mt-6">
          © {new Date().getFullYear()} GrandInvite
        </p>
      </div>
    </main>
  )
}
