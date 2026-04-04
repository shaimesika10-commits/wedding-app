'use client'

import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import type { Locale } from '@/lib/i18n'
import DashboardClient from '@/components/DashboardClient'
import Link from 'next/link'

const t = {
  fr: {
    title: 'Tableau de bord', guests: 'Invités', edit: 'Modifier', preview: 'Aperçu', settings: 'Paramètres',
    loading: 'Chargement...', noWedding: "Vous n'avez pas encore créé d'invitation.",
    createBtn: 'Créer une invitation', signOut: 'Se déconnecter',
    editTitle: "Modifier l'invitation", save: 'Enregistrer', saving: 'Enregistrement...',
    partner1: 'Prénom 1', partner2: 'Prénom 2', date: 'Date du mariage', venue: 'Lieu', address: 'Adresse',
    welcome: 'Message de bienvenue', deadline: 'Date limite RSVP', locale: 'Langue principale',
    couplePhoto: 'Photo du couple', changePhoto: 'Changer', uploadPhoto: 'Ajouter une photo',
    brunchTitle: 'Brunch le lendemain', brunchToggle: 'Activer le brunch',
    brunchDate: 'Date du brunch', brunchVenue: 'Lieu du brunch', brunchAddress: 'Adresse du brunch',
    customFields: 'Questions personnalisées pour le RSVP', addField: '+ Ajouter une question',
    fieldLabel: 'Question', fieldType: 'Type', fieldRequired: 'Obligatoire',
    typeText: 'Texte', typeSelect: 'Choix multiple', typeBoolean: 'Oui/Non',
    fieldOptions: 'Options (séparées par des virgules)',
    removeField: 'Supprimer', designLayout: 'Mise en page', classic: 'Classique', modern: 'Moderne', intimate: 'Intime',
    inviteLink: "Lien de l'invitation", copyLink: 'Copier', copied: 'Copié !',
    saved: 'Modifications enregistrées !', saveError: "Erreur lors de l'enregistrement.",
    viewInvite: "Voir l'invitation →",
  },
  he: {
    title: 'לוח בקרה', guests: 'אורחים', edit: 'עריכה', preview: 'תצוגה מקדימה', settings: 'הגדרות',
    loading: 'טוען...', noWedding: 'עוד לא יצרת הזמנה.',
    createBtn: 'צור הזמנה', signOut: 'התנתק',
    editTitle: 'עריכת ההזמנה', save: 'שמור', saving: 'שומר...',
    partner1: 'שם 1', partner2: 'שם 2', date: 'תאריך החתונה', venue: 'שם האולם', address: 'כתובת',
    welcome: 'הודעת ברוכים הבאים', deadline: 'תאריך אחרון לאישור', locale: 'שפה ראשית',
    couplePhoto: 'תמונת הזוג', changePhoto: 'החלף', uploadPhoto: 'הוסף תמונה',
    brunchTitle: 'בראנץ׳ למחרת', brunchToggle: 'הפעל בראנץ׳',
    brunchDate: 'תאריך הבראנץ׳', brunchVenue: 'מקום הבראנץ׳', brunchAddress: 'כתובת הבראנץ׳',
    customFields: 'שאלות מותאמות לאישור הגעה', addField: '+ הוסף שאלה',
    fieldLabel: 'שאלה', fieldType: 'סוג', fieldRequired: 'חובה',
    typeText: 'טקסט', typeSelect: 'בחירה מרובה', typeBoolean: 'כן/לא',
    fieldOptions: 'אפשרויות (מופרדות בפסיק)',
    removeField: 'מחק', designLayout: 'עיצוב', classic: 'קלאסי', modern: 'מודרני', intimate: 'אינטימי',
    inviteLink: 'קישור להזמנה', copyLink: 'העתק', copied: 'הועתק!',
    saved: 'השינויים נשמרו!', saveError: 'שגיאה בשמירה.',
    viewInvite: 'צפה בהזמנה →',
  },
  en: {
    title: 'Dashboard', guests: 'Guests', edit: 'Edit', preview: 'Preview', settings: 'Settings',
    loading: 'Loading...', noWedding: "You haven't created an invitation yet.",
    createBtn: 'Create Invitation', signOut: 'Sign Out',
    editTitle: 'Edit Invitation', save: 'Save', saving: 'Saving...',
    partner1: 'Name 1', partner2: 'Name 2', date: 'Wedding date', venue: 'Venue', address: 'Address',
    welcome: 'Welcome message', deadline: 'RSVP deadline', locale: 'Main language',
    couplePhoto: 'Couple photo', changePhoto: 'Change', uploadPhoto: 'Add photo',
    brunchTitle: 'Next Day Brunch', brunchToggle: 'Enable brunch',
    brunchDate: 'Brunch date', brunchVenue: 'Brunch venue', brunchAddress: 'Brunch address',
    customFields: 'Custom RSVP questions', addField: '+ Add question',
    fieldLabel: 'Question', fieldType: 'Type', fieldRequired: 'Required',
    typeText: 'Text', typeSelect: 'Multiple choice', typeBoolean: 'Yes/No',
    fieldOptions: 'Options (comma separated)',
    removeField: 'Remove', designLayout: 'Layout', classic: 'Classic', modern: 'Modern', intimate: 'Intimate',
    inviteLink: 'Invitation link', copyLink: 'Copy', copied: 'Copied!',
    saved: 'Changes saved!', saveError: 'Error saving changes.',
    viewInvite: 'View Invitation →',
  },
}

interface CustomField { id: string; label: string; type: 'text' | 'select' | 'boolean'; required: boolean; options?: string }

export default function DashboardPage({ params }: { params: { locale: Locale } }) {
  const locale = params.locale as Locale
  const l = t[locale] || t.fr
  const isRtl = locale === 'he'
  const router = useRouter()
  const supabase = createClientComponentClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [wedding, setWedding] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'guests' | 'edit' | 'preview'>('guests')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [copied, setCopied] = useState(false)

  // Edit form state
  const [form, setForm] = useState<any>({})
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [couplePhotoFile, setCouplePhotoFile] = useState<File | null>(null)
  const [couplePhotoPreview, setCouplePhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push(`/${locale}/login`); return }
      const { data } = await supabase.from('weddings').select('*').eq('user_id', user.id).single()
      if (data) {
        setWedding(data)
        setForm({
          partner1_name: data.partner1_name || '',
          partner2_name: data.partner2_name || '',
          wedding_date: data.wedding_date ? data.wedding_date.slice(0, 16) : '',
          venue_name: data.venue_name || '',
          venue_address: data.venue_address || '',
          invitation_locale: data.invitation_locale || locale,
          welcome_message: data.welcome_message || '',
          rsvp_deadline: data.rsvp_deadline ? data.rsvp_deadline.slice(0, 10) : '',
          has_brunch: data.has_brunch || false,
          brunch_date: data.brunch_date ? data.brunch_date.slice(0, 16) : '',
          brunch_venue: data.brunch_venue || '',
          brunch_venue_address: data.brunch_venue_address || '',
          design_layout: data.design_layout || 'classic',
          couple_photo_url: data.couple_photo_url || '',
        })
        setCustomFields(data.custom_rsvp_fields || [])
        if (data.couple_photo_url) setCouplePhotoPreview(data.couple_photo_url)
      }
      setLoading(false)
    }
    load()
  }, [])

  const set = (k: string, v: any) => setForm((prev: any) => ({ ...prev, [k]: v }))

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCouplePhotoFile(file)
    setCouplePhotoPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    setSaving(true); setSaveMsg('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let couple_photo_url = form.couple_photo_url
      if (couplePhotoFile && wedding) {
        const ext = couplePhotoFile.name.split('.').pop()
        const path = `${user.id}/${wedding.wedding_slug}.${ext}`
        await supabase.storage.from('couple-photos').upload(path, couplePhotoFile, { upsert: true })
        const { data: urlData } = supabase.storage.from('couple-photos').getPublicUrl(path)
        couple_photo_url = urlData.publicUrl
      }

      const { error } = await supabase.from('weddings').update({
        partner1_name: form.partner1_name,
        partner2_name: form.partner2_name,
        wedding_date: form.wedding_date || null,
        venue_name: form.venue_name,
        venue_address: form.venue_address,
        invitation_locale: form.invitation_locale,
        welcome_message: form.welcome_message,
        rsvp_deadline: form.rsvp_deadline || null,
        has_brunch: form.has_brunch,
        brunch_date: form.brunch_date || null,
        brunch_venue: form.brunch_venue,
        brunch_venue_address: form.brunch_venue_address,
        custom_rsvp_fields: customFields,
        design_layout: form.design_layout,
        couple_photo_url,
      }).eq('id', wedding.id)
      if (error) throw error
      setWedding((w: any) => ({ ...w, ...form, couple_photo_url, custom_rsvp_fields: customFields }))
      setSaveMsg(l.saved)
    } catch { setSaveMsg(l.saveError) }
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  const addCustomField = () => {
    setCustomFields(prev => [...prev, { id: Date.now().toString(), label: '', type: 'text', required: false }])
  }
  const updateField = (id: string, key: string, val: any) => {
    setCustomFields(prev => prev.map(f => f.id === id ? { ...f, [key]: val } : f))
  }
  const removeField = (id: string) => setCustomFields(prev => prev.filter(f => f.id !== id))

  const copyLink = () => {
    if (!wedding) return
    navigator.clipboard.writeText(`${window.location.origin}/${locale}/${wedding.wedding_slug}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
  }

  const inputClass = "w-full border border-stone-200 rounded px-3 py-2 text-stone-700 focus:outline-none focus:border-stone-400 text-sm font-montserrat bg-white"
  const labelClass = "block text-xs text-stone-400 mb-1 tracking-widest uppercase font-montserrat"

  if (loading) return <div className="min-h-screen flex items-center justify-center text-stone-400 font-montserrat">{l.loading}</div>

  return (
    <div className="min-h-screen bg-stone-50" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white border-b border-stone-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-cormorant text-2xl text-stone-800">GrandInvite</h1>
            {wedding && <p className="text-xs text-stone-400 font-montserrat mt-0.5">{wedding.partner1_name} & {wedding.partner2_name}</p>}
          </div>
          <button onClick={handleSignOut} className="text-xs text-stone-400 font-montserrat hover:text-stone-600 transition">{l.signOut}</button>
        </div>
      </header>

      {!wedding ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <p className="text-stone-500 font-montserrat">{l.noWedding}</p>
          <Link href={`/${locale}/onboarding`} className="bg-stone-800 text-white px-6 py-3 text-sm font-montserrat tracking-widest uppercase hover:bg-stone-700 transition">{l.createBtn}</Link>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Invite link bar */}
          <div className="bg-white border border-stone-100 rounded-lg p-4 mb-6 flex items-center gap-3 flex-wrap">
            <span className="text-xs text-stone-400 font-montserrat tracking-widest uppercase flex-shrink-0">{l.inviteLink}</span>
            <span className="text-sm text-stone-600 font-montserrat flex-1 truncate">
              {typeof window !== 'undefined' ? window.location.origin : ''}/{locale}/{wedding.wedding_slug}
            </span>
            <button onClick={copyLink} className="text-xs bg-stone-800 text-white px-3 py-1.5 font-montserrat rounded hover:bg-stone-700 transition flex-shrink-0">
              {copied ? l.copied : l.copyLink}
            </button>
            <Link href={`/${locale}/${wedding.wedding_slug}`} target="_blank" className="text-xs text-stone-500 font-montserrat underline flex-shrink-0">{l.viewInvite}</Link>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-stone-200 mb-6 gap-0">
            {(['guests', 'edit', 'preview'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-montserrat tracking-widest uppercase border-b-2 transition ${activeTab === tab ? 'border-stone-800 text-stone-800' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>
                {l[tab]}
              </button>
            ))}
          </div>

          {/* GUESTS TAB */}
          {activeTab === 'guests' && (
            <DashboardClient weddingId={wedding.id} locale={locale} maxGuests={wedding.max_guests || 200} hasBrunch={wedding.has_brunch} />
          )}

          {/* EDIT TAB */}
          {activeTab === 'edit' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left column */}
              <div className="space-y-6">
                <h2 className="font-cormorant text-xl text-stone-800">{l.editTitle}</h2>

                {/* Couple photo */}
                <div>
                  <label className={labelClass}>{l.couplePhoto}</label>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  {couplePhotoPreview ? (
                    <div className="relative">
                      <img src={couplePhotoPreview} alt="couple" className="w-full h-40 object-cover rounded" />
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="absolute bottom-2 right-2 bg-white/90 text-stone-700 px-3 py-1 text-xs font-montserrat rounded shadow">{l.changePhoto}</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="w-full border-2 border-dashed border-stone-200 rounded py-6 text-stone-400 text-sm font-montserrat hover:border-stone-300 transition flex items-center justify-center gap-2">
                      <span>📸</span> {l.uploadPhoto}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelClass}>{l.partner1}</label><input className={inputClass} value={form.partner1_name} onChange={e => set('partner1_name', e.target.value)} /></div>
                  <div><label className={labelClass}>{l.partner2}</label><input className={inputClass} value={form.partner2_name} onChange={e => set('partner2_name', e.target.value)} /></div>
                </div>
                <div><label className={labelClass}>{l.date}</label><input type="datetime-local" className={inputClass} value={form.wedding_date} onChange={e => set('wedding_date', e.target.value)} /></div>
                <div><label className={labelClass}>{l.venue}</label><input className={inputClass} value={form.venue_name} onChange={e => set('venue_name', e.target.value)} /></div>
                <div><label className={labelClass}>{l.address}</label><input className={inputClass} value={form.venue_address} onChange={e => set('venue_address', e.target.value)} /></div>
                <div><label className={labelClass}>{l.welcome}</label><textarea className={inputClass + ' h-28 resize-none'} value={form.welcome_message} onChange={e => set('welcome_message', e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelClass}>{l.deadline}</label><input type="date" className={inputClass} value={form.rsvp_deadline} onChange={e => set('rsvp_deadline', e.target.value)} /></div>
                  <div><label className={labelClass}>{l.locale}</label>
                    <select className={inputClass} value={form.invitation_locale} onChange={e => set('invitation_locale', e.target.value)}>
                      <option value="fr">Français</option><option value="he">עברית</option><option value="en">English</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-6">
                {/* Design layout */}
                <div>
                  <label className={labelClass}>{l.designLayout}</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {(['classic', 'modern', 'intimate'] as const).map(layout => (
                      <button key={layout} onClick={() => set('design_layout', layout)}
                        className={`border-2 rounded p-3 text-xs font-montserrat tracking-widest uppercase transition ${form.design_layout === layout ? 'border-stone-800 bg-stone-50 text-stone-800' : 'border-stone-200 text-stone-400 hover:border-stone-300'}`}>
                        {l[layout]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brunch section */}
                <div className="border border-stone-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-cormorant text-lg text-stone-800">{l.brunchTitle}</h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-stone-400 font-montserrat">{l.brunchToggle}</span>
                      <div className="relative">
                        <input type="checkbox" checked={form.has_brunch} onChange={e => set('has_brunch', e.target.checked)} className="sr-only" />
                        <div className={`w-10 h-5 rounded-full transition ${form.has_brunch ? 'bg-stone-800' : 'bg-stone-200'}`} onClick={() => set('has_brunch', !form.has_brunch)} />
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.has_brunch ? (isRtl ? 'right-0.5' : 'left-5') : (isRtl ? 'right-5' : 'left-0.5')}`} />
                      </div>
                    </label>
                  </div>
                  {form.has_brunch && (
                    <>
                      <div><label className={labelClass}>{l.brunchDate}</label><input type="datetime-local" className={inputClass} value={form.brunch_date} onChange={e => set('brunch_date', e.target.value)} /></div>
                      <div><label className={labelClass}>{l.brunchVenue}</label><input className={inputClass} value={form.brunch_venue} onChange={e => set('brunch_venue', e.target.value)} /></div>
                      <div><label className={labelClass}>{l.brunchAddress}</label><input className={inputClass} value={form.brunch_venue_address} onChange={e => set('brunch_venue_address', e.target.value)} /></div>
                    </>
                  )}
                </div>

                {/* Custom RSVP fields */}
                <div className="border border-stone-200 rounded-lg p-4 space-y-3">
                  <h3 className="font-cormorant text-lg text-stone-800">{l.customFields}</h3>
                  {customFields.map(field => (
                    <div key={field.id} className="bg-stone-50 rounded p-3 space-y-2">
                      <div className="flex gap-2">
                        <input placeholder={l.fieldLabel} className={inputClass + ' flex-1'} value={field.label} onChange={e => updateField(field.id, 'label', e.target.value)} />
                        <select className={inputClass + ' w-32'} value={field.type} onChange={e => updateField(field.id, 'type', e.target.value)}>
                          <option value="text">{l.typeText}</option>
                          <option value="select">{l.typeSelect}</option>
                          <option value="boolean">{l.typeBoolean}</option>
                        </select>
                      </div>
                      {field.type === 'select' && (
                        <input placeholder={l.fieldOptions} className={inputClass} value={field.options || ''} onChange={e => updateField(field.id, 'options', e.target.value)} />
                      )}
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs text-stone-400 font-montserrat cursor-pointer">
                          <input type="checkbox" checked={field.required} onChange={e => updateField(field.id, 'required', e.target.checked)} />
                          {l.fieldRequired}
                        </label>
                        <button onClick={() => removeField(field.id)} className="text-xs text-red-400 font-montserrat hover:text-red-600">{l.removeField}</button>
                      </div>
                    </div>
                  ))}
                  <button onClick={addCustomField} className="w-full border border-dashed border-stone-300 text-stone-400 py-2 text-sm font-montserrat hover:border-stone-400 transition rounded">{l.addField}</button>
                </div>

                {/* Save */}
                <div className="flex items-center gap-4">
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 bg-stone-800 text-white py-3 font-montserrat text-sm tracking-widest uppercase hover:bg-stone-700 transition disabled:opacity-40">
                    {saving ? l.saving : l.save}
                  </button>
                  {saveMsg && <p className={`text-sm font-montserrat ${saveMsg === l.saved ? 'text-green-600' : 'text-red-500'}`}>{saveMsg}</p>}
                </div>
              </div>
            </div>
          )}

          {/* PREVIEW TAB */}
          {activeTab === 'preview' && wedding && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-stone-400 font-montserrat tracking-widest uppercase">Aperçu · Preview · תצוגה מקדימה</p>
                <Link href={`/${locale}/${wedding.wedding_slug}`} target="_blank"
                  className="text-xs bg-stone-800 text-white px-4 py-2 font-montserrat rounded hover:bg-stone-700 transition">
                  {l.viewInvite}
                </Link>
              </div>
              <div className="w-full border border-stone-200 rounded-lg overflow-hidden" style={{ height: '70vh' }}>
                <iframe
                  src={`/${locale}/${wedding.wedding_slug}`}
                  className="w-full h-full"
                  title="Invitation preview"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
