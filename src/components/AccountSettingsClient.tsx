'use client'
// ============================================================
//  GrandInvite – Account Settings Client Component
//  Sections: Password · Co-owner Email · Delete Account
//  src/components/AccountSettingsClient.txx
// ============================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Locale } from '@/lib/i18n'

interface Props {
  locale: Locale
  userEmail: string
  initialCoOwnerEmail: string | null
  weddingId: string
}

const L = {
  he: {
    title: 'ניהול חשבון',
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
    deleteDone: "Compte supprimé. Redirection vers la page d'accueil...",
    deleteError: 'Erreur. Veuillez réessayer.',
    saving: 'Enregistrement...',
    updating: 'Mise à jour...',
    sending: 'Envoi...',
    error: 'Erreur. Veuillez réessayer.',
  },
  en: {
    title: 'Account Settings',
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

export default function AccountSettingsClient({ locale, userEmail, initialCoOwnerEmail, weddingId }: Props) {
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
  const [coOwnerEmail, setCoOwnerEmail] = useState(initialCoOwnerEmail ?? '')
  const [coOwnerLoading, setCoOwnerLoading] = useState(false)
  const [coOwnerSuccess, setCoOwnerSuccess] = useState('')
  const [coOwnerError, setCoOwnerError] = useState('')

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
    if (!coOwnerEmail.trim()) {
      setCoOwnerError(locale === 'he' ? 'יש להזין כתובת אימייל' : locale === 'fr' ? 'Veuillez entrer un e-mail' : 'Please enter an email')
      return
    }
    setCoOwnerLoading(true)
    try {
      const res = await fetch('/api/account/co-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ co_owner_email: coOwnerEmail }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCoOwnerError(data.error || l.error)
        return
      }
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
      setTimeout(() => router.push('/'), 2000)
    } catch {
      setDeleteError(l.deleteError)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>

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

      {/* ── Section 2: Co-owner Email ── */}
      <section className="bg-white border border-stone-100 rounded-2xl p-6 md:p-8 mb-6">
        <h2 className="font-cormorant text-2xl text-stone-800 mb-2">{l.coOwnerSection}</h2>
        <p className="text-sm text-stone-400 mb-6 leading-relaxed">{l.coOwnerDesc}</p>

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-stone-500 uppercase tracking-widest mb-1.5">{l.coOwnerEmail}</label>
            <input
              type="email"
              value={coOwnerEmail}
              onChange={e => { setCoOwnerEmail(e.target.value); setCoOwnerSuccess(''); setCoOwnerError('') }}
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
          {initialCoOwnerEmail && (
            <button
              onClick={handleRemoveCoOwner}
              disabled={coOwnerLoading}
              className="px-4 py-3 border border-stone-200 text-stone-500 text-sm font-medium rounded-xl hover:bg-stone-50 transition-colors flex-shrink-0"
            >
              {l.removeCoOwner}
            </button>
          )}
        </div>

        {coOwnerSuccess && (
          <p className="mt-3 text-sm text-emerald-600">{coOwnerSuccess}</p>
        )}
        {coOwnerError && (
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
