'use client'
// ============================================================
//  GrandInvite â Login / Register Page
//  src/app/[locale]/login/page.tsx
// ============================================================

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Locale } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'

// ââ Labels ââââââââââââââââââââââââââââââââââââââââââââââââââ
// Maps URL ?error= codes to localized messages
const URL_ERRORS: Record<string, Record<string, string>> = {
  invalid_link:    { fr: 'Ce lien est invalide ou a expirÃ©. Veuillez rÃ©essayer.',       he: '××§××©××¨ ××× × ×ª×§×× ×× ×©×¤× ×ª××§×¤×. ×× × × ×¡×/× ×©××.',       en: 'This link is invalid or has expired. Please try again.' },
  oauth_failed:    { fr: 'La connexion Google a Ã©chouÃ©. Veuillez rÃ©essayer.',           he: '×××ª×××¨××ª ×¢× ×××× × ××©××. ×× × × ×¡×/× ×©××.',               en: 'Google sign-in failed. Please try again.' },
  oauth_cancelled: { fr: 'Connexion Google annulÃ©e.',                                   he: '×××ª×××¨××ª ×¢× ×××× ×××××.',                               en: 'Google sign-in was cancelled.' },
  missing_params:  { fr: 'Lien de connexion manquant. Veuillez vous reconnecter.',      he: '×§××©××¨ ×××ª×××¨××ª ××¡×¨. ×× × ××ª×××¨/× ××××©.',                en: 'Missing login link. Please sign in again.' },
}

const L = {
  fr: {
    confirmSubject: 'VÃ©rifiez votre e-mail',
    confirmMsg: (email: string) => `Un lien de confirmation a Ã©tÃ© envoyÃ© Ã  ${email}. Cliquez sur le lien pour activer votre compte.`,
    tabLogin: 'Se connecter',
    tabRegister: 'CrÃ©er un compte',
    email: 'Adresse e-mail',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    brideName: 'PrÃ©nom de la mariÃ©e',
    groomName: 'PrÃ©nom du mariÃ©',
    weddingDate: 'Date du mariage',
    venue: 'Lieu de rÃ©ception (facultatif)',
    language: "Langue de l'invitation",
    loginBtn: 'Se connecter',
    registerBtn: 'CrÃ©er mon compte',
    loggingIn: 'Connexion...',
    registering: 'CrÃ©ation...',
    orWith: 'ou',
    google: 'Continuer avec Google',
    forgotPassword: 'Mot de passe oubliÃ© ?',
    passwordMismatch: 'Les mots de passe ne correspondent pas.',
    errorLogin: 'Email ou mot de passe incorrect.',
    errorRegister: 'Une erreur est survenue. Veuillez rÃ©essayer.',
    errorDuplicateEmail: 'Cette adresse e-mail est dÃ©jÃ  utilisÃ©e. Veuillez vous connecter.',
    langFr: 'FranÃ§ais',
    langHe: 'HÃ©breu',
    langEn: 'Anglais',
    subtitle: 'Votre espace mariage de luxe',
    passwordHint: 'Minimum 8 caractÃ¨res',
    // forgot password
    forgotTitle: 'Mot de passe oubliÃ©',
    forgotSubtitle: 'Entrez votre e-mail pour recevoir un lien de rÃ©initialisation.',
    forgotBtn: 'Envoyer le lien',
    forgotSending: 'Envoi...',
    forgotSentTitle: 'VÃ©rifiez votre e-mail',
    forgotSentMsg: (email: string) => `Un lien de rÃ©initialisation a Ã©tÃ© envoyÃ© Ã  ${email}.`,
    backToLogin: 'Retour Ã  la connexion',
    forgotEmailError: 'Veuillez entrer une adresse e-mail valide.',
    forgotEmailNotFound: 'Cette adresse e-mail n\'est pas enregistrÃ©e dans notre systÃ¨me.',
    rememberMe: 'Se souvenir de moi',
  },
  he: {
    confirmSubject: '×××§× ××ª ××××××× ×©×××',
    confirmMsg: (email: string) => `× ×©×× ×§××©××¨ ×××©××¨ ×××ª×××ª ${email}. ×××¦× ×¢× ××§××©××¨ ××× ×××¤×¢×× ××ª ×××©×××.`,
    tabLogin: '×× ××¡×',
    tabRegister: '××¦××¨×ª ××©×××',
    email: '××ª×××ª ××××××',
    password: '×¡××¡××',
    confirmPassword: '×××××ª ×¡××¡××',
    brideName: '×©× ××××',
    groomName: '×©× ×××ª×',
    weddingDate: '×ª××¨×× ×××ª×× ×',
    venue: '××§×× ××××¨××¢ (×××¤×¦××× ××)',
    language: '×©×¤×ª ××××× ×',
    loginBtn: '×× ××¡×',
    registerBtn: '××¦××¨×ª ××©×××',
    loggingIn: '××ª×××¨...',
    registering: '×××¦×¨ ××©×××...',
    orWith: '××',
    google: '×××©× ×¢× Google',
    forgotPassword: '×©×××ª ×¡××¡××?',
    passwordMismatch: '××¡××¡××××ª ××× × ×ª×××××ª.',
    errorLogin: '×××××× ×× ×¡××¡×× ×©×××××.',
    errorRegister: '×××¨×¢× ×©××××. ×× × × ×¡×/× ×©××.',
    errorDuplicateEmail: '××ª×××ª ×××××× ×× ×××¨ ×¨×©×××. ×× × ××ª×××¨/×.',
    langFr: '×¦×¨×¤×ª××ª',
    langHe: '×¢××¨××ª',
    langEn: '×× ××××ª',
    subtitle: '××¨×× ×××ª×× × ××××§×¨×ª× ×©×××',
    passwordHint: '××¤×××ª 8 ×ª××××',
    // forgot password
    forgotTitle: '×©×××ª ×¡××¡××',
    forgotSubtitle: '×××× × ××ª ××ª×××ª ××××××× ×©××× ××§×××ª ×§××©××¨ ××××¤××¡ ×¡××¡××.',
    forgotBtn: '×©×× ×§××©××¨',
    forgotSending: '×©×××...',
    forgotSentTitle: '×××§× ××ª ××××××× ×©×××',
    forgotSentMsg: (email: string) => `×§××©××¨ ××××¤××¡ ×¡××¡×× × ×©×× ×××ª×××ª ${email}.`,
    backToLogin: '×××¨× ××× ××¡×',
    forgotEmailError: '×× × ×××× × ××ª×××ª ×××××× ×ª×§×× ×.',
    forgotEmailNotFound: '××ª×××ª ×××××× ×× ××× × ×¨×©××× ×××¢×¨××ª.',
    rememberMe: '××××¨ ×××ª×',
  },
  en: {
    confirmSubject: 'Check your email',
    confirmMsg: (email: string) => `A confirmation link was sent to ${email}. Click the link to activate your account.`,
    tabLogin: 'Sign In',
    tabRegister: 'Create Account',
    email: 'Email address',
    password: 'Password',
    confirmPassword: 'Confirm password',
    brideName: "Bride's first name",
    groomName: "Groom's first name",
    weddingDate: 'Wedding date',
    venue: 'Venue (optional)',
    language: 'Invitation language',
    loginBtn: 'Sign in',
    registerBtn: 'Create my account',
    loggingIn: 'Signing in...',
    registering: 'Creating account...',
    orWith: 'or',
    google: 'Continue with Google',
    forgotPassword: 'Forgot password?',
    passwordMismatch: 'Passwords do not match.',
    errorLogin: 'Invalid email or password.',
    errorRegister: 'Something went wrong. Please try again.',
    errorDuplicateEmail: 'This email address is already registered. Please sign in.',
    langFr: 'French',
    langHe: 'Hebrew',
    langEn: 'English',
    subtitle: 'Your luxury wedding space',
    passwordHint: 'Minimum 8 characters',
    // forgot password
    forgotTitle: 'Forgot password',
    forgotSubtitle: 'Enter your email to receive a password reset link.',
    forgotBtn: 'Send reset link',
    forgotSending: 'Sending...',
    forgotSentTitle: 'Check your email',
    forgotSentMsg: (email: string) => `A password reset link was sent to ${email}.`,
    backToLogin: 'Back to sign in',
    forgotEmailError: 'Please enter a valid email address.',
    forgotEmailNotFound: 'This email address is not registered in our system.',
    rememberMe: 'Remember me',
  },
}

function slugify(bride: string, groom: string, date: string): string {
  const clean = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')
  const year = date ? new Date(date).getFullYear() : new Date().getFullYear()
  return `${clean(bride)}-${clean(groom)}-${year}`
}

// ââ Shared field style âââââââââââââââââââââââââââââââââââââââ
const fieldCls = 'w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-500 transition bg-stone-50'
const labelCls = 'block text-xs text-stone-500 mb-1.5 font-medium uppercase tracking-wider'

// ââ OAuth button âââââââââââââââââââââââââââââââââââââââââââââ
function OAuthButton({
  provider,
  label,
  icon,
  onClick,
}: {
  provider: string
  label: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-sm font-medium transition-all"
    >
      {icon}
      {label}
    </button>
  )
}

// ââ Google Icon ââââââââââââââââââââââââââââââââââââââââââââââ
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}

// ââ Divider ââââââââââââââââââââââââââââââââââââââââââââââââââ
function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-stone-200" />
      <span className="text-xs text-stone-400 font-medium uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-px bg-stone-200" />
    </div>
  )
}

// ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
export default function LoginPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (params.locale as Locale) ?? 'fr'
  const l = L[locale] ?? L.fr
  const supabase = createClient()
  const isRTL = locale === 'he'

  // Main view: 'login' | 'register' | 'forgot' | 'forgot-sent' | 'confirm-email'
  const [view, setView] = useState<'login' | 'register' | 'forgot' | 'forgot-sent' | 'confirm-email'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sentEmail, setSentEmail] = useState('')   // for both forgot-sent and confirm-email

  // BUG FIX: If already authenticated â redirect to dashboard immediately
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace(`/${locale}/dashboard`)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Read ?tab=register URL param â open register tab directly when coming from CTA buttons
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab')
    if (tab === 'register') setView('register')
  }, [])

  // Read error from URL and resolve to a localized message
  const urlError = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('error')
    : null
  const urlErrorMsg = urlError
    ? (URL_ERRORS[urlError]?.[locale] ?? URL_ERRORS[urlError]?.['en'] ?? l.errorLogin)
    : null

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('')

  // Register state
  const [reg, setReg] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    bride_name: '',
    groom_name: '',
    wedding_date: '',
    venue: '',
    invitation_locale: locale,
  })

  // ââ Handle login âââââââââââââââââââââââââââââââââââââââââ
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    })
    if (authError) {
      setError(l.errorLogin)
      setLoading(false)
      return
    }
    // Mark this as an active browser session (used by SessionGuard)
    sessionStorage.setItem('gi_session_started', '1')
    if (rememberMe) {
      localStorage.removeItem('gi_no_remember')
    } else {
      localStorage.setItem('gi_no_remember', '1')
    }
    router.push(`/${locale}/dashboard`)
  }

  // ââ Handle register ââââââââââââââââââââââââââââââââââââââ
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (reg.password !== reg.confirmPassword) {
      setError(l.passwordMismatch)
      return
    }
    if (reg.password.length < 8) {
      setError(l.passwordHint)
      return
    }
    setLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: reg.email,
        password: reg.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/${locale}/dashboard`,
        },
      })
      if (authError) {
        // Supabase rate-limit or server error
        setError(l.errorRegister)
        setLoading(false)
        return
      }
      if (!authData.user) {
        setError(l.errorRegister)
        setLoading(false)
        return
      }

      // Duplicate email â Supabase returns user with empty identities array
      if (!authData.user.identities || authData.user.identities.length === 0) {
        setError(l.errorDuplicateEmail)
        setLoading(false)
        return
      }

      // ×× ××¡×©× ×§××× (×××××ª ×××××× ×××××) â ××¦××¨×ª ××ª×× × ××××××ª
      if (authData.session) {
        // BUG FIX: ××××§ ×× ×××¨ ×§××××ª ××ª×× × ×××©×ª××© ×× (×××©×, × ×¨×©× ×§××× ×¢× ××××)
        const { data: existingWedding } = await supabase
          .from('weddings')
          .select('id')
          .eq('user_id', authData.user.id)
          .maybeSingle()

        if (!existingWedding) {
          // BUG FIX: ×××¤×× ×××ª× ××©××ª ×¡××× â ×××¡×£ ×¡××××ª ××§×¨×××ª ×× ××¡××× ×××¨ ×ª×¤××¡
          let slug = slugify(reg.bride_name, reg.groom_name, reg.wedding_date)
          const { data: slugExists } = await supabase
            .from('weddings')
            .select('id')
            .eq('slug', slug)
            .maybeSingle()
          if (slugExists) {
            slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`
          }

          await supabase.from('weddings').insert({
            user_id: authData.user.id,
            slug,
            bride_name: reg.bride_name.trim(),
            groom_name: reg.groom_name.trim(),
            wedding_date: reg.wedding_date,
            venue_name: reg.venue.trim() || null,
            locale: reg.invitation_locale,
            max_guests: 200,
            plan: 'free',
            is_active: true,
          })
        }

        setLoading(false)
        // New session: always remember (registration = first time)
        sessionStorage.setItem('gi_session_started', '1')
        localStorage.removeItem('gi_no_remember')
        router.push(`/${locale}/dashboard`)
        return
      }

      // ×××©××¨ ×××××× × ××¨×© â ××¦× ××¡× ×××©××¨
      setSentEmail(reg.email)
      setView('confirm-email')
      setLoading(false)
    } catch {
      setError(l.errorRegister)
      setLoading(false)
    }
  }

  // ââ Handle forgot password ââââââââââââââââââââââââââââââ
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      setError(l.forgotEmailError)
      return
    }
    setLoading(true)
    try {
      // ââ Step 1: check if the email is registered ââââââââââ
      const checkRes = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      })
      const { exists } = await checkRes.json()
      if (!exists) {
        setError(l.forgotEmailNotFound)
        setLoading(false)
        return
      }

      // ââ Step 2: send the reset email ââââââââââââââââââââââ
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery&next=/${locale}/reset-password`,
      })
      if (resetError) {
        setError(resetError.message)
        setLoading(false)
        return
      }
      setSentEmail(forgotEmail)
      setView('forgot-sent')
    } catch {
      setError(l.forgotEmailError)
    } finally {
      setLoading(false)
    }
  }

  // ââ Handle OAuth âââââââââââââââââââââââââââââââââââââââââ
  const handleOAuth = async (provider: 'google') => {
    // OAuth always remembers (standard behavior for social login)
    sessionStorage.setItem('gi_session_started', '1')
    localStorage.removeItem('gi_no_remember')
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/${locale}/dashboard`,
      },
    })
  }

  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-lg">

        {/* ââ Language Switcher + Logo ââ */}
        <div className="flex justify-end mb-4">
          <LanguageSwitcher currentLocale={locale} variant="inline" />
        </div>
        <div className="text-center mb-8">
          <a href={`/${locale}`}>
            <h1 className="font-cormorant text-4xl font-light text-stone-900 tracking-widest">
              Grand<span style={{ color: '#c9a84c' }}>Invite</span>
            </h1>
          </a>
          <div className="h-px w-14 mx-auto my-3" style={{ background: '#c9a84c' }} />
          <p className="text-stone-400 text-sm">{l.subtitle}</p>
        </div>

        {/* ââââââââââââââââââââââââââââââââââââââ
            ××¡×: ×××©××¨ ×××××× ××××¨ ××¨×©××
        ââââââââââââââââââââââââââââââââââââââ */}
        {view === 'confirm-email' && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#fdf6e3' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5">
                <path d="M3 8l9 6 9-6M3 8v10a1 1 0 001 1h16a1 1 0 001-1V8M3 8l9-6 9 6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="font-cormorant text-2xl text-stone-800 mb-2">{l.confirmSubject}</h2>
            <p className="text-stone-500 text-sm leading-relaxed">{l.confirmMsg(sentEmail)}</p>
            <button
              onClick={() => { setView('login'); setSentEmail('') }}
              className="mt-6 text-xs text-stone-400 hover:text-stone-600 underline transition"
            >
              {l.tabLogin}
            </button>
          </div>
        )}

        {/* ââââââââââââââââââââââââââââââââââââââ
            ××¡×: ×©×××ª ×¡××¡×× â ××× ×ª ××××××
        ââââââââââââââââââââââââââââââââââââââ */}
        {view === 'forgot' && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
            <div className="mb-6">
              <h2 className="font-cormorant text-2xl text-stone-800 mb-1">{l.forgotTitle}</h2>
              <p className="text-stone-400 text-sm">{l.forgotSubtitle}</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-red-600 text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className={labelCls}>{l.email}</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                  dir="ltr"
                  className={fieldCls}
                  placeholder="vous@exemple.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-white text-sm font-medium tracking-wider uppercase transition-all disabled:opacity-60"
                style={{ background: loading ? '#a8a29e' : '#c9a84c' }}
              >
                {loading ? l.forgotSending : l.forgotBtn}
              </button>
            </form>

            <button
              onClick={() => { setView('login'); setError('') }}
              className="mt-4 w-full text-center text-xs text-stone-400 hover:text-stone-600 transition"
            >
              â {l.backToLogin}
            </button>
          </div>
        )}

        {/* ââââââââââââââââââââââââââââââââââââââ
            ××¡×: ×©×××ª ×¡××¡×× â ××× ×§ × ×©××
                                ââââââââââââââââââââââââââââââââââââââ */}
        {view === 'forgot-sent' && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#fdf6e3' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5">
                <path d="M3 8l9 6 9-6M3 8v10a1 1 0 001 1h16a1 1 0 001-1V8M3 8l9-6 9 6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="font-cormorant text-2xl text-stone-800 mb-2">{l.forgotSentTitle}</h2>
            <p className="text-stone-500 text-sm leading-relaxed">{l.forgotSentMsg(sentEmail)}</p>
            <button
              onClick={() => { setView('login'); setSentEmail('') }}
              className="mt-6 text-xs text-stone-400 hover:text-stone-600 underline transition"
            >
              {l.backToLogin}
            </button>
          </div>
        )}

        {/* ââââââââââââââââââââââââââââââââââââââ
            Tabs + Card (login / register)
        ââââââââââââââââââââââââââââââââââââââ */}
        {(view === 'login' || view === 'register') && (<>

        <div className="flex bg-stone-100 rounded-2xl p-1 mb-6">
          {(['login', 'register'] as const).map(tabKey => (
            <button
              key={tabKey}
              onClick={() => { setView(tabKey); setError('') }}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: view === tabKey ? '#fff' : 'transparent',
                color: view === tabKey ? '#1c1917' : '#a8a29e',
                boxShadow: view === tabKey ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {tabKey === 'login' ? l.tabLogin : l.tabRegister}
            </button>
          ))}
        </div>

        {/* ââ Card ââ */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">

          {(error || urlErrorMsg) && (
            <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-red-600 text-sm mb-5">
              {error || urlErrorMsg}
            </div>
          )}

          {/* ââââ LOGIN TAB ââââ */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={labelCls}>{l.email}</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  required
                  dir="ltr"
                  className={fieldCls}
                  placeholder="vous@exemple.com"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={labelCls}>{l.password}</label>
                  <button
                    type="button"
                    className="text-xs text-[#c9a84c] hover:text-stone-700 transition"
                    onClick={() => { setView('forgot'); setError(''); setForgotEmail(loginEmail) }}
                  >
                    {l.forgotPassword}
                  </button>
                </div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  required
                  dir="ltr"
                  className={fieldCls}
                  placeholder="â¢â¢â¢â¢â¢â¢â¢â¢"
                />
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div
                    className="w-4 h-4 rounded border-2 transition-all peer-focus:ring-2 peer-focus:ring-yellow-400/30"
                    style={{
                      background: rememberMe ? '#c9a84c' : 'white',
                      borderColor: rememberMe ? '#c9a84c' : '#d6d3d1',
                    }}
                  >
                    {rememberMe && (
                      <svg className="w-full h-full text-white" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8l3.5 3.5 6.5-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs text-stone-500">{l.rememberMe}</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-white text-sm font-medium tracking-wider uppercase transition-all disabled:opacity-60"
                style={{ background: loading ? '#a8a29e' : '#c9a84c', boxShadow: loading ? 'none' : '0 4px 14px rgba(201,168,76,0.25)' }}
              >
                {loading ? l.loggingIn : l.loginBtn}
              </button>

              <Divider label={l.orWith} />

              <OAuthButton provider="google" label={l.google} icon={<GoogleIcon />} onClick={() => handleOAuth('google')} />
            </form>
          )}

          {/* ââââ REGISTER TAB ââââ */}
          {view === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">

              {/* Account */}
              <div>
                <label className={labelCls}>{l.email}</label>
                <input
                  type="email"
                  value={reg.email}
                  onChange={e => setReg(p => ({ ...p, email: e.target.value }))}
                  required
                  dir="ltr"
                  className={fieldCls}
                  placeholder="vous@exemple.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{l.password}</label>
                  <input
                    type="password"
                    value={reg.password}
                    onChange={e => setReg(p => ({ ...p, password: e.target.value }))}
                    required
                    dir="ltr"
                    className={fieldCls}
                    placeholder="â¢â¢â¢â¢â¢â¢â¢â¢" ¢óà¢ÂöFcà¢ÆFcà¢ÆÆ&VÂ6Æ74æÖS×¶Æ&VÄ6Ç7Óç¶Âæ6öæf&Õ77v÷&GÓÂöÆ&VÃà¢ÆçW@¢GSÒ'77v÷&B ¢fÇVS×·&Vræ6öæf&Õ77v÷&GÐ¢öä6ævS×¶RÓâ6WE&VrÓâ²ââçÂ6öæf&Õ77v÷&C¢RçF&vWBçfÇVRÒÐ¢&WV&V@¢F#Ò&ÇG" ¢6Æ74æÖS×¶fVÆD6Ç7Ð¢Æ6VöÆFW#Ò.(
.(
.(
.(
.(
.(
.(
.(
" ¢óà¢ÂöFcà¢ÂöFcà¢Ç6Æ74æÖSÒ'FWB×2FWB×7FöæRÓCÖ×BÓ"#ç¶Âç77v÷&DçGÓÂ÷à ¢²ò¢FfFW"¢÷Ð¢ÆFb6Æ74æÖSÒ&×&r×7FöæRÓ×Ó""óà ¢²ò¢vVFFærFWFÇ2¢÷Ð¢ÆFb6Æ74æÖSÒ&w&Bw&BÖ6öÇ2Ó"vÓ2#à¢ÆFcà¢ÆÆ&VÂ6Æ74æÖS×¶Æ&VÄ6Ç7Óç¶Âæ'&FTæÖWÓÂöÆ&VÃà¢ÆçW@¢æÖSÒ&'&FUöæÖR ¢fÇVS×·&Vræ'&FUöæÖWÐ¢öä6ævS×¶RÓâ6WE&VrÓâ²ââçÂ'&FUöæÖS¢RçF&vWBçfÇVRÒÐ¢&WV&V@¢6Æ74æÖS×¶fVÆD6Ç7Ð¢Æ6VöÆFW#×¶Æö6ÆRÓÓÒvRrò}z
y]z-yÂr¢Æö6ÆRÓÓÒvVâròu6÷Rr¢u6÷RwÐ¢óà¢ÂöFcà¢ÆFcà¢ÆÆ&VÂ6Æ74æÖS×¶Æ&VÄ6Ç7Óç¶Âæw&ööÔæÖWÓÂöÆ&VÃà¢ÆçW@¢æÖSÒ&w&ööÕöæÖR ¢fÇVS×·&Vræw&ööÕöæÖWÐ¢öä6ævS×¶RÓâ6WE&VrÓâ²ââçÂw&ööÕöæÖS¢RçF&vWBçfÇVRÒÐ¢&WV&V@¢6Æ74æÖS×¶fVÆD6Ç7Ð¢Æ6VöÆFW#×¶Æö6ÆRÓÓÒvRrò}y=z
yy½yÂr¢Æö6ÆRÓÓÒvVâròt¦ÖW2r¢tçFöæRwÐ¢óà¢ÂöFcà¢ÂöFcà ¢ÆFcà¢ÆÆ&VÂ6Æ74æÖS×¶Æ&VÄ6Ç7Óç¶ÂçvVFFætFFWÓÂöÆ&VÃà¢ÆçW@¢GSÒ&FFR ¢fÇVS×·&VrçvVFFæuöFFWÐ¢öä6ævS×¶RÓâ6WE&VrÓâ²ââçÂvVFFæuöFFS¢RçF&vWBçfÇVRÒÐ¢&WV&V@¢F#Ò&ÇG" ¢6Æ74æÖS×¶fVÆD6Ç7Ð¢óà¢ÂöFcà ¢ÆFcà¢ÆÆ&VÂ6Æ74æÖS×¶Æ&VÄ6Ç7Óç¶ÂçfVçVWÓÂöÆ&VÃà¢ÆçW@¢fÇVS×·&VrçfVçVWÐ¢öä6ævS×¶RÓâ6WE&VrÓâ²ââçÂfVçVS¢RçF&vWBçfÇVRÒÐ¢6Æ74æÖS×¶fVÆD6Ç7Ð¢Æ6VöÆFW#×¶Æö6ÆRÓÓÒvRrò}y
y]yÍyÒ
y
yzy]z-yyrr¢t6:'FVRFRfW'6ÆÆW2wÐ¢óà¢ÂöFcà ¢²ò¢ÆæwVvR¢÷Ð¢ÆFcà¢ÆÆ&VÂ6Æ74æÖS×¶Æ&VÄ6Ç7Óç¶ÂæÆæwVvWÓÂöÆ&VÃà¢ÆFb6Æ74æÖSÒ&fÆWvÓ"#à¢²²vg"rÂvRrÂvVâuÒ26öç7BæÖÆærÓâ¢Æ'WGFöà¢¶W×¶ÆæwÐ¢GSÒ&'WGFöâ ¢öä6Æ6³×²Óâ6WE&VrÓâ²ââçÂçfFFöåöÆö6ÆS¢ÆærÒÐ¢6Æ74æÖSÒ&fÆWÓÓ"ãR&÷VæFVB×ÂFWB×6ÒföçBÖÖVFVÒ&÷&FW"G&ç6FöâÖÆÂ ¢7GÆS×·°¢&6¶w&÷VæC¢&VræçfFFöåöÆö6ÆRÓÓÒÆæròr63F2r¢r6fccRrÀ¢6öÆ÷#¢&VræçfFFöåöÆö6ÆRÓÓÒÆæròr6ffbr¢r3ssf2rÀ¢&÷&FW$6öÆ÷#¢&VræçfFFöåöÆö6ÆRÓÓÒÆæròr63F2r¢r6SvSVSBrÀ¢×Ð¢à¢¶ÆærÓÓÒvg"ròÂæÆætg"¢ÆærÓÓÒvRròÂæÆætR¢ÂæÆætVçÐ¢Âö'WGFöãà¢Ð¢ÂöFcà¢ÂöFcà ¢Æ'WGFöà¢GSÒ'7V&ÖB ¢F6&ÆVC×¶ÆöFæwÐ¢6Æ74æÖSÒ'rÖgVÆÂÓ2ãR&÷VæFVB×ÂFWB×vFRFWB×6ÒföçBÖÖVFVÒG&6¶ær×vFW"WW&66RG&ç6FöâÖÆÂF6&ÆVC¦÷6GÓc ¢7GÆS×·²&6¶w&÷VæC¢ÆöFæròr6#Rr¢r63F2rÂ&÷6F÷s¢ÆöFæròvæöæRr¢sGG&v&#ÃcÃsbÃã#Rr×Ð¢à¢¶ÆöFæròÂç&Vv7FW&ær¢Âç&Vv7FW$'FçÐ¢Âö'WGFöãà ¢ÄFfFW"Æ&VÃ×¶Âæ÷%vFÒóà ¢ÄôWF'WGFöâ&÷fFW#Ò&vöövÆR"Æ&VÃ×¶ÂævöövÆWÒ6öã×³ÄvöövÆT6öâóçÒöä6Æ6³×²ÓâæFÆTôWFvvöövÆRrÒóà¢Âöf÷&Óà¢Ð¢ÂöFcà¢ÂóâÐ ¢Ç6Æ74æÖSÒ'FWBÖ6VçFW"FWB×2FWB×7FöæRÓ3×BÓb#à¢*¶æWrFFRævWDgVÆÅV"Òw&æDçfFP¢Â÷à¢ÂöFcà¢ÂöÖãà¢§Ð
