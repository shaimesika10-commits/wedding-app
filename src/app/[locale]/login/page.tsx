'use client'
// ============================================================
//  GrandInvite – Login / Register Page
//  src/app/[locale]/login/page.tsx
// ============================================================

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Locale } from '@/lib/i18n'

// ── Labels ──────────────────────────────────────────────────
const L = {
  fr: {
    confirmSubject: 'Vérifiez votre e-mail',
    confirmMsg: (email: string) => `Un lien de confirmation a été envoyé à ${email}. Cliquez sur le lien pour activer votre compte.`,
    tabLogin: 'Se connecter',
    tabRegister: 'Créer un compte',
    email: 'Adresse e-mail',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    brideName: 'Prénom de la mariée',
    groomName: 'Prénom du marié',
    weddingDate: 'Date du mariage',
    venue: 'Lieu de réception (facultatif)',
    language: 'Langue de l\'invitation',
    loginBtn: 'Se connecter',
    registerBtn: 'Créer mon compte',
    loggingIn: 'Connexion...',
    registering: 'Création...',
    orWith: 'ou',
    google: 'Continuer avec Google',
    facebook: 'Continuer avec Facebook',
    forgotPassword: 'Mot de passe oublié ?',
    passwordMismatch: 'Les mots de passe ne correspondent pas.',
    errorLogin: 'Email ou mot de passe incorrect.',
    errorRegister: 'Une erreur est survenue. Veuillez réessayer.',
    langFr: 'Français',
    langHe: 'Hébreu',
    langEn: 'Anglais',
    subtitle: 'Votre espace mariage de luxe',
    passwordHint: 'Minimum 8 caractères',
  },
  he: {
    confirmSubject: 'בדקו את האימייל שלכם',
    confirmMsg: (email: string) => `נשלח קישור אישור לכתובת ${email}. לחצו על הקישור כדי להפעיל את החשבון.`,
    tabLogin: 'כניסה',
    tabRegister: 'יצירת חשבון',
    email: 'כתובת אימייל',
    password: 'סיסמה',
    confirmPassword: 'אימות סיסמה',
    brideName: 'שם הכלה',
    groomName: 'שם החתן',
    weddingDate: 'תאריך החתונה',
    venue: 'מקום האירוע (אופציונלי)',
    language: 'שפת ההזמנה',
    loginBtn: 'כניסה',
    registerBtn: 'יצירת חשבון',
    loggingIn: 'מתחבר...',
    registering: 'יוצר חשבון...',
    orWith: 'או',
    google: 'המשך עם Google',
    facebook: 'המשך עם Facebook',
    forgotPassword: 'שכחת סיסמה?',
    passwordMismatch: 'הסיסמאות אינן תואמות.',
    errorLogin: 'אימייל או סיסמה שגויים.',
    errorRegister: 'אירעה שגיאה. אנא נסה/י שוב.',
    langFr: 'צרפתית',
    langHe: 'עברית',
    langEn: 'אנגלית',
    subtitle: 'מרחב החתונה היוקרתי שלכם',
    passwordHint: 'לפחות 8 תווים',
  },
  en: {
    confirmSubject: 'Check your email',
    confirmMsg: (email: string) => `A confirmation link was sent to ${email}. Click the link to activate your account.`,
    tabLogin: 'Sign In',
    tabRegister: 'Create Account',
    email: 'Email address',
    password: 'Password',
    confirmPassword: 'Confirm password',
    brideName: 'Bride\'s first name',
    groomName: 'Groom\'s first name',
    weddingDate: 'Wedding date',
    venue: 'Venue (optional)',
    language: 'Invitation language',
    loginBtn: 'Sign in',
    registerBtn: 'Create my account',
    loggingIn: 'Signing in...',
    registering: 'Creating account...',
    orWith: 'or',
    google: 'Continue with Google',
    facebook: 'Continue with Facebook',
    forgotPassword: 'Forgot password?',
    passwordMismatch: 'Passwords do not match.',
    errorLogin: 'Invalid email or password.',
    errorRegister: 'Something went wrong. Please try again.',
    langFr: 'French',
    langHe: 'Hebrew',
    langEn: 'English',
    subtitle: 'Your luxury wedding space',
    passwordHint: 'Minimum 8 characters',
  },
}

function slugify(bride: string, groom: string, date: string): string {
  const clean = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')
  const year = date ? new Date(date).getFullYear() : new Date().getFullYear()
  return `${clean(bride)}-${clean(groom)}-${year}`
}

// ── Shared field style ───────────────────────────────────────
const fieldCls = 'w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-500 transition bg-stone-50'
const labelCls = 'block text-xs text-stone-500 mb-1.5 font-medium uppercase tracking-wider'

// ── OAuth button ─────────────────────────────────────────────
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

// ── Google Icon ──────────────────────────────────────────────
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

// ── Divider ──────────────────────────────────────────────────
function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-stone-200" />
      <span className="text-xs text-stone-400 font-medium uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-px bg-stone-200" />
    </div>
  )
}

// ════════════════════════════════════════════════════════════
export default function LoginPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (params.locale as Locale) ?? 'fr'
  const l = L[locale] ?? L.fr
  const supabase = createClient()
  const isRTL = locale === 'he'

  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')  // set when email confirmation needed

  // Read error from URL (e.g. ?error=oauth_failed from auth/callback)
  const urlError = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('error')
    : null

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

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

  // ── Handle login ─────────────────────────────────────────
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
    router.push(`/${locale}/dashboard`)
  }

  // ── Handle register ──────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setConfirmEmail('')
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
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: reg.email,
        password: reg.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/${locale}/dashboard`,
        },
      })
      if (authError || !authData.user) {
        setError(l.errorRegister)
        setLoading(false)
        return
      }

      // 2. If session exists (email confirmation disabled) — create wedding & redirect
      if (authData.session) {
        const slug = slugify(reg.bride_name, reg.groom_name, reg.wedding_date)
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
        router.push(`/${locale}/dashboard`)
        return
      }

      // 3. Email confirmation required — show confirmation message
      // After confirming, user will be redirected to dashboard → onboarding to complete setup
      setConfirmEmail(reg.email)
      setLoading(false)
    } catch {
      setError(l.errorRegister)
      setLoading(false)
    }
  }

  // ── Handle OAuth ─────────────────────────────────────────
  const handleOAuth = async (provider: 'google') => {
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

        {/* ── Logo ── */}
        <div className="text-center mb-8">
          <a href={`/${locale}`}>
            <h1 className="font-cormorant text-4xl font-light text-stone-900 tracking-widest">
              Grand<span style={{ color: '#c9a84c' }}>Invite</span>
            </h1>
          </a>
          <div className="h-px w-14 mx-auto my-3" style={{ background: '#c9a84c' }} />
          <p className="text-stone-400 text-sm">{l.subtitle}</p>
        </div>

        {/* ── Email confirmation screen ── */}
        {confirmEmail && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#fdf6e3' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5">
                <path d="M3 8l9 6 9-6M3 8v10a1 1 0 001 1h16a1 1 0 001-1V8M3 8l9-6 9 6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="font-cormorant text-2xl text-stone-800 mb-2">{l.confirmSubject}</h2>
            <p className="text-stone-500 text-sm leading-relaxed">{l.confirmMsg(confirmEmail)}</p>
            <button
              onClick={() => { setConfirmEmail(''); setTab('login') }}
              className="mt-6 text-xs text-stone-400 hover:text-stone-600 underline transition"
            >
              {l.tabLogin}
            </button>
          </div>
        )}

        {/* ── Tabs + Card (hidden when waiting for email confirmation) ── */}
        {!confirmEmail && (<>

        <div className="flex bg-stone-100 rounded-2xl p-1 mb-6">
          {(['login', 'register'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError('') }}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: tab === t ? '#fff' : 'transparent',
                color: tab === t ? '#1c1917' : '#a8a29e',
                boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {t === 'login' ? l.tabLogin : l.tabRegister}
            </button>
          ))}
        </div>

        {/* ── Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">

          {(error || urlError) && (
            <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-red-600 text-sm mb-5">
              {error || l.errorLogin}
            </div>
          )}

          {/* ════ LOGIN TAB ════ */}
          {tab === 'login' && (
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
                    className="text-xs text-stone-400 hover:text-stone-600 transition"
                    onClick={() => {/* TODO: implement forgot password */}}
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
                  placeholder="••••••••"
                />
              </div>

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

          {/* ════ REGISTER TAB ════ */}
          {tab === 'register' && (
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
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className={labelCls}>{l.confirmPassword}</label>
                  <input
                    type="password"
                    value={reg.confirmPassword}
                    onChange={e => setReg(p => ({ ...p, confirmPassword: e.target.value }))}
                    required
                    dir="ltr"
                    className={fieldCls}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <p className="text-xs text-stone-400 -mt-2">{l.passwordHint}</p>

              {/* Divider */}
              <div className="h-px bg-stone-100 my-2" />

              {/* Wedding details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{l.brideName}</label>
                  <input
                    name="bride_name"
                    value={reg.bride_name}
                    onChange={e => setReg(p => ({ ...p, bride_name: e.target.value }))}
                    required
                    className={fieldCls}
                    placeholder={locale === 'he' ? 'נועה' : locale === 'en' ? 'Sophie' : 'Sophie'}
                  />
                </div>
                <div>
                  <label className={labelCls}>{l.groomName}</label>
                  <input
                    name="groom_name"
                    value={reg.groom_name}
                    onChange={e => setReg(p => ({ ...p, groom_name: e.target.value }))}
                    required
                    className={fieldCls}
                    placeholder={locale === 'he' ? 'דניאל' : locale === 'en' ? 'James' : 'Antoine'}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>{l.weddingDate}</label>
                <input
                  type="date"
                  value={reg.wedding_date}
                  onChange={e => setReg(p => ({ ...p, wedding_date: e.target.value }))}
                  required
                  dir="ltr"
                  className={fieldCls}
                />
              </div>

              <div>
                <label className={labelCls}>{l.venue}</label>
                <input
                  value={reg.venue}
                  onChange={e => setReg(p => ({ ...p, venue: e.target.value }))}
                  className={fieldCls}
                  placeholder={locale === 'he' ? 'אולם אירועים' : 'Château de Versailles'}
                />
              </div>

              {/* Language */}
              <div>
                <label className={labelCls}>{l.language}</label>
                <div className="flex gap-2">
                  {(['fr', 'he', 'en'] as const).map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setReg(p => ({ ...p, invitation_locale: lang }))}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all"
                      style={{
                        background: reg.invitation_locale === lang ? '#c9a84c' : '#faf8f5',
                        color: reg.invitation_locale === lang ? '#fff' : '#78716c',
                        borderColor: reg.invitation_locale === lang ? '#c9a84c' : '#e7e5e4',
                      }}
                    >
                      {lang === 'fr' ? l.langFr : lang === 'he' ? l.langHe : l.langEn}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-white text-sm font-medium tracking-wider uppercase transition-all disabled:opacity-60"
                style={{ background: loading ? '#a8a29e' : '#c9a84c', boxShadow: loading ? 'none' : '0 4px 14px rgba(201,168,76,0.25)' }}
              >
                {loading ? l.registering : l.registerBtn}
              </button>

              <Divider label={l.orWith} />

              <OAuthButton provider="google" label={l.google} icon={<GoogleIcon />} onClick={() => handleOAuth('google')} />
            </form>
          )}
        </div>
        </>)}

        <p className="text-center text-xs text-stone-300 mt-6">
          © {new Date().getFullYear()} GrandInvite
        </p>
      </div>
    </main>
  )
}
