'use client'
// ============================================================
//  GrandInvite – Account Settings Client Component
//  Sections: Password · Co-owner Email · Delete Account
//  src/components/AccountSettingsClient.tsx
// ============================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Locale } from '@/lib/i18n'

interface Props {
  locale: Locale
  userEmail: string
  initialCoOwnerEmail: string | null
  weddingId: string
  plan: 'free' | 'premium'
}

const L = {
  he: {
    title: 'ניהול חשבון',
    // Plan
    planSection: 'תוכנית נוכחית',
    planFree: 'חינמי',
    planPremium: 'פרמיום ♛',
    planFreeDesc: 'עד 200 מוזמנים · RSVP + לוח ניהול · ייצוא CSV',
    planPremiumDesc: 'מוזמנים ללא הגבלה · תמונת זוג · התראות RSVP · שותף/ה נוסף/ת',
    upgradeSection: 'שדרוג לפרמיום',
    upgradeDesc: 'פרמיום כולל: מוזמנים ללא הגבלה, תמונת זוג בהזמנה, קבלת אימייל על כל RSVP חדש, והוספת שותף/ה נוסף/ת.',
    upgradePrice: '₪99 · 25 € · 27 $',
    upgradePeriod: 'גישה לצמיתות · תשלום חד פעמי',
    upgradeNote: 'תשלום מקוון טרם הופעל. לשדרוג ידני, פנו אלינו ישירות:',
    upgradeContact: 'contact@grandinvite.app',
    activateSection: 'הפעלה עם קוד',
    activateDesc: 'קיבלת קוד הפעלה? הזן אותו כאן כדי לפתוח גישת פרמיום מיידית.',
    activateLabel: 'קוד הפעלה',
    activatePlaceholder: 'הזן את הקוד שלך',
    activateButton: 'הפעל',
    activating: 'מפעיל...',
    activateSuccess: '✓ פרמיום הופעל! מרענן…',
    activateInvalid: 'קוד הפעלה שגוי. אנא בדוק ונסה שוב.',
    activateAlready: 'החשבון שלך כבר פרמיום.',
    premiumOnlyBadge: 'פרמיום בלבד',
    premiumLocked: 'פיצ׳ר זה זמין בתוכנית פרמיום בלבד. שדרגו כדי להפעילו.',
    // Password
    passwordSection: 'שינוי סיסמה',
    currentPassword: 'סיסמה נוכחית',
    newPassword: 'סיסמה חדשה',
    confirmPassword: 'אימות סיסמה חדשה',
    updatePassword: 'עדכן סיסמה',
    passwordUpdated: '✓ הסיסמה עודכנה בהצלחה',
    passwordMismatch: 'הסיסמאות החדשות אינן תואמות',
    passwordTooShort: 'הסיסמה חייבת להכיל לפחות 8 תווים',
    currentPasswordWrong: 'הסיסמה הנוכחית שגויה',
    // Co-owner
    coOwnerSection: 'בעל/ת שמחה נוסף/ת',
    coOwnerDesc: 'הוסף כתובת אימייל נוספת שתקבל את כל עדכוני ה-RSVP וההתראות בדיוק כמוך.',
    coOwnerEmail: 'אימייל בעל/ת השמחה הנוסף/ת',
    coOwnerPlaceholder: 'example@email.com',
    currentCoOwners: 'שותפ/ת קיימ/ת',
    saveCoOwner: 'שמור',
    removeCoOwner: 'הסר',
    coOwnerSaved: '✓ האימייל נשמר. הוא/היא יקבל/תקבל את כל העדכונים.',
    coOwnerRemoved: '✓ האימייל הוסר.',
    // Delete
    dangerZone: 'אזור מסוכן',
    deleteTitle: 'מחיקת חשבון',
    deleteWarning: 'שים/י לב: מחיקת החשבון היא פעולה סופית ובלתי הפיכה. כל נתוני האירוע, רשימות האורחים וההגדרות יימחקו לצמיתות.',
    deleteButton: 'מחיקת חשבון',
    deleteModalTitle: 'אישור מחיקת חשבון',
    deleteModalDesc: 'כדי לאשר את המחיקה, הקלד/י את כתובת האימייל שלך:',
    deleteEmailPlaceholder: 'הכנס/י כתובת אימייל',
    deleteModalConfirm: 'מחק חשבון לצמיתות',
    deleteModalCancel: 'ביטול',
    deleteEmailMismatch: 'האימייל שהוקלד אינו תואם לחשבונך',
    deleteDone: 'החשבון נמחק. מועבר/ת לדף הבית...',
    deleteError: 'שגיאה. אנא נסה שוב.',
    saving: 'שומר...',
    updating: 'מעדכן...',
    sending: 'שולח...',
    error: 'שגיאה. אנא נסה שוב.',
  },
  fr: {
    title: 'Gestion du compte',
    // Plan
    planSection: 'Formule actuelle',
    planFree: 'Gratuit',
    planPremium: 'Premium ♛',
    planFreeDesc: "Jusqu'à 200 invités · RSVP + tableau de bord · Export CSV",
    planPremiumDesc: 'Invités illimités · Photo de couple · Notifications RSVP · Co-organisateur',
    upgradeSection: 'Passer à Premium',
    upgradeDesc: "Premium inclut : invités illimités, photo de couple sur l'invitation, e-mail à chaque RSVP et ajout d'un(e) co-organisateur/trice.",
    upgradePrice: '25 € · 27 $ · ₪99',
    upgradePeriod: 'accès à vie · paiement unique',
    upgradeNote: "Le paiement en ligne n'est pas encore activé. Pour passer à Premium, contactez-nous directement :",
    upgradeContact: 'contact@grandinvite.app',
    activateSection: 'Activer avec un code',
    activateDesc: 'Vous avez un code d\'activation ? Saisissez-le ci-dessous pour débloquer Premium instantanément.',
    activateLabel: 'Code d\'activation',
    activatePlaceholder: 'Entrez votre code',
    activateButton: 'Activer',
    activating: 'Activation...',
    activateSuccess: '✓ Premium activé ! Actualisation…',
    activateInvalid: 'Code d\'activation invalide. Veuillez vérifier et réessayer.',
    activateAlready: 'Votre compte est déjà Premium.',
    premiumOnlyBadge: 'Premium uniquement',
    premiumLocked: 'Cette fonctionnalité est réservée aux comptes Premium. Passez à Premium pour y accéder.',
    passwordSection: 'Changer le mot de passe',
    currentPassword: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Confirmer le nouveau mot de passe',
    updatePassword: 'Mettre à jour',
    passwordUpdated: '✓ Mot de passe mis à jour avec succès',
    passwordMismatch: 'Les nouveaux mots de passe ne correspondent pas',
    passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères',
    currentPasswordWrong: 'Le mot de passe actuel est incorrect',
    coOwnerSection: 'Co-responsable du compte',
    coOwnerDesc: "Ajoutez une adresse e-mail supplémentaire qui recevra toutes les notifications RSVP et mises à jour, exactement comme vous.",
    coOwnerEmail: 'E-mail du/de la co-responsable',
    coOwnerPlaceholder: 'exemple@email.com',
    currentCoOwners: 'Co-responsable actuel(le)',
    saveCoOwner: 'Enregistrer',
    removeCoOwner: 'Supprimer',
    coOwnerSaved: '✓ E-mail enregistré. Il/Elle recevra toutes les notifications.',
    coOwnerRemoved: '✓ E-mail supprimé.',
    dangerZone: 'Zone de danger',
    deleteTitle: 'Supprimer le compte',
    deleteWarning: "Attention : La suppression du compte est une action définitive et irréversible. Toutes les données de l'événement, les listes d'invités et les paramètres seront supprimés définitivement.",
    deleteButton: 'Supprimer mon compte',
    deleteModalTitle: 'Confirmer la suppression du compte',
    deleteModalDesc: "Pour confirmer la suppression, saisissez votre adresse e-mail :",
    deleteEmailPlaceholder: 'Entrez votre adresse e-mail',
    deleteModalConfirm: 'Supprimer définitivement',
    deleteModalCancel: 'Annuler',
    deleteEmailMismatch: "L'e-mail saisi ne correspond pas à votre compte",
    deleteDone: 'Compte supprimé. Redirection vers la page d\'accueil...',
    deleteError: 'Erreur. Veuillez réessayer.',
    saving: 'Enregistrement...',
    updating: 'Mise à jour...',
    sending: 'Envoi...',
    error: 'Erreur. Veuillez réessayer.',
  },
  en: {
    title: 'Account Settings',
    // Plan
    planSection: 'Current Plan',
    planFree: 'Free',
    planPremium: 'Premium ♛',
    planFreeDesc: 'Up to 200 guests · RSVP + dashboard · CSV export',
    planPremiumDesc: 'Unlimited guests · Couple photo · RSVP notifications · Co-owner',
    upgradeSection: 'Upgrade to Premium',
    upgradeDesc: 'Premium includes: unlimited guests, couple photo on your invitation, email per new RSVP, and a co-owner for RSVP updates.',
    upgradePrice: '$27 · 25 € · ₪99',
    upgradePeriod: 'lifetime access · one-time payment',
    upgradeNote: 'Online payment is not yet active. To upgrade manually, contact us directly:',
    upgradeContact: 'contact@grandinvite.app',
    // Activation code
    activateSection: 'Activate with a code',
    activateDesc: 'Already have an activation code? Enter it below to unlock Premium instantly.',
    activateLabel: 'Activation code',
    activatePlaceholder: 'Enter your code',
    activateButton: 'Activate',
    activating: 'Activating...',
    activateSuccess: '✓ Premium activated! Refreshing…',
    activateInvalid: 'Invalid activation code. Please check and try again.',
    activateAlready: 'Your account is already Premium.',
    premiumOnlyBadge: 'Premium only',
    premiumLocked: 'This feature is available on the Premium plan only. Upgrade to unlock it.',
    passwordSection: 'Change Password',
    currentPassword: 'Current password',
    newPassword: 'New password',
    confirmPassword: 'Confirm new password',
    updatePassword: 'Update password',
    passwordUpdated: '✓ Password updated successfully',
    passwordMismatch: 'New passwords do not match',
    passwordTooShort: 'Password must be at least 8 characters',
    currentPasswordWrong: 'Current password is incorrect',
    coOwnerSection: 'Co-owner Account',
    coOwnerDesc: 'Add a secondary email address that will receive all RSVP updates and notifications, exactly like you.',
    coOwnerEmail: 'Co-owner email address',
    coOwnerPlaceholder: 'example@email.com',
    currentCoOwners: 'Current co-owner',
    saveCoOwner: 'Save',
    removeCoOwner: 'Remove',
    coOwnerSaved: '✓ Email saved. They will receive all updates.',
    coOwnerRemoved: '✓ Email removed.',
    dangerZone: 'Danger Zone',
    deleteTitle: 'Delete Account',
    deleteWarning: 'Warning: Deleting the account is a final and irreversible action. All event data, guest lists, and settings will be permanently deleted.',
    deleteButton: 'Delete my account',
    deleteModalTitle: 'Confirm Account Deletion',
    deleteModalDesc: 'To confirm deletion, enter your email address:',
    deleteEmailPlaceholder: 'Enter your email address',
    deleteModalConfirm: 'Permanently delete account',
    deleteModalCancel: 'Cancel',
    deleteEmailMismatch: 'The email entered does not match your account',
    deleteDone: 'Account deleted. Redirecting to homepage...',
    deleteError: 'Error. Please try again.',
    saving: 'Saving...',
    updating: 'Updating...',
    sending: 'Sending...',
    error: 'Error. Please try again.',
  },
} as const

export default function AccountSettingsClient({ locale, userEmail, initialCoOwnerEmail, weddingId, plan }: Props) {
  const l = L[locale] ?? L.fr
  const isRTL = locale === 'he'
  const router = useRouter()

  // ── Password section ──
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // ── Co-owner section ──
  // coOwnerEmail = the saved/current value (shown in list)
  // newCoOwnerInput = the input field for adding a new co-owner
  const [coOwnerEmail, setCoOwnerEmail] = useState(initialCoOwnerEmail ?? '')
  const [newCoOwnerInput, setNewCoOwnerInput] = useState('')
  const [coOwnerLoading, setCoOwnerLoading] = useState(false)
  const [coOwnerSuccess, setCoOwnerSuccess] = useState('')
  const [coOwnerError, setCoOwnerError] = useState('')

  // ── Activation code section ──
  const [activationCode, setActivationCode] = useState('')
  const [activationLoading, setActivationLoading] = useState(false)
  const [activationSuccess, setActivationSuccess] = useState(false)
  const [activationError, setActivationError] = useState('')

  // ── Delete section ──
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteDone, setDeleteDone] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [confirmEmailInput, setConfirmEmailInput] = useState('')

  // ── Handlers ──

  const handleUpdatePassword = async () => {
    setPasswordError('')
    setPasswordSuccess(false)

    if (newPassword.length < 8) {
      setPasswordError(l.passwordTooShort)
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(l.passwordMismatch)
      return
    }

    setPasswordLoading(true)
    try {
      const res = await fetch('/api/account/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPasswordError(
          data.error === 'Current password is incorrect'
            ? l.currentPasswordWrong
            : l.error
        )
        return
      }
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setPasswordError(l.error)
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleSaveCoOwner = async () => {
    setCoOwnerError('')
    setCoOwnerSuccess('')
    const emailToSave = newCoOwnerInput.trim()
    if (!emailToSave) {
      setCoOwnerError(locale === 'he' ? 'יש להזין כתובת אימייל' : locale === 'fr' ? 'Veuillez entrer un e-mail' : 'Please enter an email')
      return
    }
    setCoOwnerLoading(true)
    try {
      const res = await fetch('/api/account/co-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ co_owner_email: emailToSave }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCoOwnerError(data.error || l.error)
        return
      }
      setCoOwnerEmail(emailToSave.toLowerCase())
      setNewCoOwnerInput('')
      setCoOwnerSuccess(l.coOwnerSaved)
    } catch {
      setCoOwnerError(l.error)
    } finally {
      setCoOwnerLoading(false)
    }
  }

  const handleRemoveCoOwner = async () => {
    setCoOwnerError('')
    setCoOwnerSuccess('')
    setCoOwnerLoading(true)
    try {
      const res = await fetch('/api/account/co-owner', { method: 'DELETE' })
      if (!res.ok) { setCoOwnerError(l.error); return }
      setCoOwnerEmail('')
      setCoOwnerSuccess(l.coOwnerRemoved)
    } catch {
      setCoOwnerError(l.error)
    } finally {
      setCoOwnerLoading(false)
    }
  }

  const handleDeleteRequest = async () => {
    setDeleteError('')
    if (!confirmEmailInput.trim()) return

    if (confirmEmailInput.trim().toLowerCase() !== userEmail.toLowerCase()) {
      setDeleteError(l.deleteEmailMismatch)
      return
    }

    setDeleteLoading(true)
    try {
      const res = await fetch('/api/wedding/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmEmail: confirmEmailInput.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        setDeleteError(
          data.error === 'Email does not match' ? l.deleteEmailMismatch : l.deleteError
        )
        return
      }
      setDeleteDone(true)
      setShowDeleteModal(false)
      // Redirect to homepage after short delay
      setTimeout(() => router.push('/'), 2000)
    } catch {
      setDeleteError(l.deleteError)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleActivate = async () => {
    setActivationError('')
    setActivationSuccess(false)
    const trimmed = activationCode.trim()
    if (!trimmed) return
    setActivationLoading(true)
    try {
      const res = await fetch('/api/premium/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      })
      const data = await res.json()
      if (data.alreadyPremium) {
        setActivationError(l.activateAlready)
        return
      }
      if (!res.ok) {
        setActivationError(
          data.error === 'Invalid activation code' ? l.activateInvalid : l.error
        )
        return
      }
      setActivationSuccess(true)
      setActivationCode('')
      // Refresh the page after 1.5s so plan badge updates
      setTimeout(() => router.refresh(), 1500)
    } catch {
      setActivationError(l.error)
    } finally {
      setActivationLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Section 0: Current Plan ── */}
      <section className="bg-white border border-stone-100 rounded-2xl p-6 md:p-8 mb-6">
        <h2 className="font-cormorant text-2xl text-stone-800 mb-4">{l.planSection}</h2>
        <div className="flex items-center gap-3 mb-3">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
            style={{
              background: plan === 'premium' ? '#c9a84c' : '#f5f5f4',
              color: plan === 'premium' ? '#fff' : '#78716c',
            }}
          >
            {plan === 'premium' ? l.planPremium : l.planFree}
          </span>
          <span className="text-xs text-stone-400">
            {plan === 'premium' ? l.planPremiumDesc : l.planFreeDesc}
          </span>
        </div>

        {/* Upgrade section — shown only for free users */}
        {plan === 'free' && (
          <div
            className="mt-4 rounded-xl p-4 border-2"
            style={{
              borderColor: 'rgba(201,168,76,0.35)',
              background: 'linear-gradient(135deg, #fdfbf4 0%, #faf6e8 100%)',
            }}
          >
            <h3 className="font-medium text-stone-800 mb-1 flex items-center gap-2">
              <span style={{ color: '#c9a84c' }}>♛</span>
              {l.upgradeSection}
            </h3>
            <p className="text-sm text-stone-500 mb-2 leading-relaxed">{l.upgradeDesc}</p>
            <p className="text-sm mb-0.5">
              <span className="font-semibold" style={{ color: '#c9a84c' }}>{l.upgradePrice}</span>
            </p>
            <p className="text-xs text-stone-400 mb-3">{l.upgradePeriod}</p>
            <p className="text-xs text-stone-400 italic mb-2">{l.upgradeNote}</p>
            <a
              href={`mailto:${l.upgradeContact}?subject=${encodeURIComponent('Upgrade to Premium')}`}
              className="text-sm font-medium underline"
              style={{ color: '#c9a84c' }}
            >
              {l.upgradeContact}
            </a>

            {/* ── Activation code input ── */}
            <div className="mt-5 pt-4 border-t border-stone-200/60">
              <h4 className="text-sm font-medium text-stone-700 mb-1 flex items-center gap-1.5">
                <span style={{ color: '#c9a84c' }}>🔑</span>
                {l.activateSection}
              </h4>
              <p className="text-xs text-stone-400 mb-3">{l.activateDesc}</p>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-stone-500 uppercase tracking-widest mb-1.5">
                    {l.activateLabel}
                  </label>
                  <input
                    type="text"
                    value={activationCode}
                    onChange={e => { setActivationCode(e.target.value); setActivationError(''); setActivationSuccess(false) }}
                    onKeyDown={e => { if (e.key === 'Enter') handleActivate() }}
                    placeholder={l.activatePlaceholder}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-[#c9a84c] transition-colors tracking-widest"
                    dir="ltr"
                    autoComplete="off"
                  />
                </div>
                <button
                  onClick={handleActivate}
                  disabled={activationLoading || !activationCode.trim()}
                  className="px-5 py-2.5 text-white text-sm font-medium tracking-wider uppercase rounded-xl transition-all disabled:opacity-50 flex-shrink-0"
                  style={{ background: activationLoading ? '#a8a29e' : '#c9a84c', boxShadow: activationLoading ? 'none' : '0 4px 14px rgba(201,168,76,0.25)' }}
                >
                  {activationLoading ? l.activating : l.activateButton}
                </button>
              </div>
              {activationSuccess && (
                <p className="mt-2 text-sm text-emerald-600">{l.activateSuccess}</p>
              )}
              {activationError && (
                <p className="mt-2 text-sm text-red-600">{activationError}</p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── Section 1: Password ── */}
      <section className="bg-white border border-stone-100 rounded-2xl p-6 md:p-8 mb-6">
        <h2 className="font-cormorant text-2xl text-stone-800 mb-1">{l.passwordSection}</h2>
        <p className="text-xs text-stone-400 mb-6 tracking-wide">{userEmail}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-stone-500 uppercase tracking-widest mb-1.5">{l.currentPassword}</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 focus:outline-none focus:border-[#c9a84c] transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-widest mb-1.5">{l.newPassword}</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 focus:outline-none focus:border-[#c9a84c] transition-colors"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-widest mb-1.5">{l.confirmPassword}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 focus:outline-none focus:border-[#c9a84c] transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        {passwordError && (
          <p className="mt-3 text-sm text-red-600">{passwordError}</p>
        )}
        {passwordSuccess && (
          <p className="mt-3 text-sm text-emerald-600">{l.passwordUpdated}</p>
        )}

        <div className="mt-5">
          <button
            onClick={handleUpdatePassword}
            disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
            className="px-7 py-3 text-white text-sm font-medium tracking-wider uppercase rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: passwordLoading ? '#a8a29e' : '#c9a84c', boxShadow: passwordLoading ? 'none' : '0 4px 14px rgba(201,168,76,0.25)' }}
          >
            {passwordLoading ? l.updating : l.updatePassword}
          </button>
        </div>
      </section>

      {/* ── Section 2: Co-owner Email (Premium only) ── */}
      <section className="bg-white border border-stone-100 rounded-2xl p-6 md:p-8 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="font-cormorant text-2xl text-stone-800">{l.coOwnerSection}</h2>
          {plan !== 'premium' && (
            <span
              className="text-[9px] font-bold tracking-[0.15em] px-2 py-0.5 rounded-full"
              style={{ background: '#c9a84c', color: '#fff' }}
            >
              {l.premiumOnlyBadge}
            </span>
          )}
        </div>
        <p className="text-sm text-stone-400 mb-6 leading-relaxed">{l.coOwnerDesc}</p>

        {/* Premium gate — shown when user is on free plan */}
        {plan !== 'premium' && (
          <div
            className="rounded-xl p-4 border-2"
            style={{
              borderColor: 'rgba(201,168,76,0.35)',
              background: 'linear-gradient(135deg, #fdfbf4 0%, #faf6e8 100%)',
            }}
          >
            <p className="text-sm text-stone-600 mb-3 flex items-center gap-2">
              <span style={{ color: '#c9a84c' }}>🔒</span>
              {l.premiumLocked}
            </p>
            <a
              href={`mailto:${l.upgradeContact}?subject=${encodeURIComponent('Upgrade to Premium')}`}
              className="text-xs font-medium px-4 py-2 rounded-xl inline-flex items-center gap-1.5 transition-all"
              style={{ background: '#c9a84c', color: '#fff', boxShadow: '0 2px 8px rgba(201,168,76,0.3)' }}
            >
              {l.upgradeSection} →
            </a>
          </div>
        )}

        {/* ── Existing co-owner list (premium only) ── */}
        {plan === 'premium' && coOwnerEmail && (
          <div className="mb-5">
            <p className="text-xs text-stone-400 uppercase tracking-widest mb-2">{l.currentCoOwners}</p>
            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl group">
              <div className="flex items-center gap-2.5 min-w-0">
                <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#c9a84c' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                </svg>
                <span className="text-sm text-stone-700 truncate" dir="ltr">{coOwnerEmail}</span>
              </div>
              <button
                onClick={handleRemoveCoOwner}
                disabled={coOwnerLoading}
                className="text-stone-300 hover:text-red-400 transition-colors flex-shrink-0 disabled:opacity-40"
                title={l.removeCoOwner}
              >
                {coOwnerLoading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Add co-owner form (premium only, when slot is empty) ── */}
        {plan === 'premium' && !coOwnerEmail && (
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs text-stone-500 uppercase tracking-widest mb-1.5">{l.coOwnerEmail}</label>
              <input
                type="email"
                value={newCoOwnerInput}
                onChange={e => { setNewCoOwnerInput(e.target.value); setCoOwnerSuccess(''); setCoOwnerError('') }}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 focus:outline-none focus:border-[#c9a84c] transition-colors"
                placeholder={l.coOwnerPlaceholder}
                dir="ltr"
              />
            </div>
            <button
              onClick={handleSaveCoOwner}
              disabled={coOwnerLoading}
              className="px-5 py-3 text-white text-sm font-medium tracking-wider uppercase rounded-xl transition-all disabled:opacity-50 flex-shrink-0"
              style={{ background: '#c9a84c', boxShadow: '0 4px 14px rgba(201,168,76,0.25)' }}
            >
              {coOwnerLoading ? l.saving : l.saveCoOwner}
            </button>
          </div>
        )}

        {plan === 'premium' && coOwnerSuccess && (
          <p className="mt-3 text-sm text-emerald-600">{coOwnerSuccess}</p>
        )}
        {plan === 'premium' && coOwnerError && (
          <p className="mt-3 text-sm text-red-600">{coOwnerError}</p>
        )}
      </section>

      {/* ── Section 3: Delete Account ── */}
      <section className="bg-white border border-red-100 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-red-400 font-medium uppercase tracking-widest border border-red-100 rounded-full px-2.5 py-0.5">{l.dangerZone}</span>
        </div>
        <h2 className="font-cormorant text-2xl text-red-700 mb-3">{l.deleteTitle}</h2>
        <p className="text-sm text-stone-500 leading-relaxed mb-6">{l.deleteWarning}</p>

        {deleteDone ? (
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-700">
            {l.deleteDone}
          </div>
        ) : (
          <>
            <button
              onClick={() => { setShowDeleteModal(true); setConfirmEmailInput(''); setDeleteError('') }}
              className="px-6 py-2.5 border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors"
            >
              {l.deleteButton}
            </button>
          </>
        )}
      </section>

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div
            className="relative bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <h3 className="font-cormorant text-2xl text-red-700 mb-3">{l.deleteModalTitle}</h3>
            <p className="text-sm text-stone-500 leading-relaxed mb-4">{l.deleteModalDesc}</p>

            <input
              type="email"
              value={confirmEmailInput}
              onChange={e => { setConfirmEmailInput(e.target.value); setDeleteError('') }}
              placeholder={l.deleteEmailPlaceholder}
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 focus:outline-none focus:border-red-400 transition-colors mb-4"
              dir="ltr"
              onKeyDown={e => { if (e.key === 'Enter') handleDeleteRequest() }}
            />

            {deleteError && (
              <p className="mb-4 text-sm text-red-600">{deleteError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 border border-stone-200 text-stone-600 text-sm font-medium rounded-xl hover:bg-stone-50 transition-colors"
              >
                {l.deleteModalCancel}
              </button>
              <button
                onClick={handleDeleteRequest}
                disabled={deleteLoading}
                className="flex-1 py-3 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? l.sending : l.deleteModalConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
