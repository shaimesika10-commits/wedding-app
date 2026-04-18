'use client'
// ============================================================
//  GrandInvite — Site Settings Page
//  Sections: Freemium • Features • Site Info • Legal Docs
//  src/app/admin/settings/page.tsx
// ============================================================

import { useEffect, useState, useCallback } from 'react'

interface Setting { key: string; value: string; description: string }

// ── Settings meta-config ──────────────────────────────────────
const SETTING_META: Record<string, {
  label: string
  type: 'number' | 'toggle' | 'text' | 'email' | 'url' | 'tel'
  description: string
  placeholder?: string
}> = {
  max_free_guests:    { label: 'Free Plan Guest Limit',  type: 'number', description: 'Max guests on the free plan per wedding' },
  gallery_enabled:    { label: 'Gallery Feature',        type: 'toggle', description: 'Enable photo gallery for all weddings' },
  ai_chat_enabled:    { label: 'AI Invitation Chat',     type: 'toggle', description: 'Enable the AI assistant on invitation pages' },
  maintenance_mode:   { label: 'Maintenance Mode',       type: 'toggle', description: 'Show maintenance page to all non-admin visitors' },
  // Site Info
  support_email:      { label: 'Support Email',          type: 'email',  description: 'Support email shown in footer', placeholder: 'contact@grandinvite.com' },
  contact_email:      { label: 'Contact Email',          type: 'email',  description: 'Public contact email in footer', placeholder: 'hello@grandinvite.com' },
  contact_phone:      { label: 'Phone / WhatsApp',       type: 'tel',    description: 'Phone number shown in footer', placeholder: '+33 6 00 00 00 00' },
  whatsapp_number:    { label: 'WhatsApp Number',        type: 'tel',    description: 'WhatsApp number (with country code)', placeholder: '+972501234567' },
  instagram_url:      { label: 'Instagram URL',          type: 'url',    description: 'Your Instagram profile link', placeholder: 'https://instagram.com/grandinvite' },
  facebook_url:       { label: 'Facebook URL',           type: 'url',    description: 'Your Facebook page link', placeholder: 'https://facebook.com/grandinvite' },
  footer_tagline_he:  { label: 'Footer Tagline — עברית', type: 'text',   description: 'Hebrew tagline shown in footer' },
  footer_tagline_fr:  { label: 'Footer Tagline — FR',    type: 'text',   description: 'French tagline in footer' },
  footer_tagline_en:  { label: 'Footer Tagline — EN',    type: 'text',   description: 'English tagline in footer' },
  tos_version:        { label: 'ToS Version',            type: 'text',   description: 'Current Terms of Service version (e.g. 1.0, 1.1)', placeholder: '1.0' },
}

const SECTIONS = [
  {
    title: 'Freemium Limits',
    desc: 'Control what users can do on the free plan.',
    keys: ['max_free_guests'],
  },
  {
    title: 'Features',
    desc: 'Enable or disable platform features globally.',
    keys: ['gallery_enabled', 'ai_chat_enabled'],
  },
  {
    title: 'Site',
    desc: 'General site configuration.',
    keys: ['maintenance_mode', 'support_email', 'tos_version'],
  },
  {
    title: 'Contact & Social',
    desc: 'Shown in the site footer. Fill in what you have.',
    keys: ['contact_email', 'contact_phone', 'whatsapp_number', 'instagram_url', 'facebook_url'],
  },
  {
    title: 'Footer Taglines',
    desc: 'Tagline text shown under the GrandInvite logo in the footer.',
    keys: ['footer_tagline_he', 'footer_tagline_fr', 'footer_tagline_en'],
  },
]

// ── Legal doc types & locales ─────────────────────────────────
const DOC_TYPES  = ['tos', 'privacy', 'refund'] as const
const DOC_LABELS = { tos: 'Terms of Use', privacy: 'Privacy Policy', refund: 'Refund Policy' }
const LOCALES    = ['he', 'fr', 'en'] as const
const LOCALE_LABELS = { he: 'עברית', fr: 'Français', en: 'English' }

type DocType = typeof DOC_TYPES[number]
type Locale  = typeof LOCALES[number]

interface LegalDoc { title: string; content: string; version: string }

// ══════════════════════════════════════════════════════════════
export default function AdminSettingsPage() {
  const [settings, setSettings]         = useState<Record<string, string>>({})
  const [localValues, setLocalValues]   = useState<Record<string, string>>({})
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState<string | null>(null)
  const [saved, setSaved]               = useState<string | null>(null)

  // Legal docs state
  const [legalTab, setLegalTab]         = useState<DocType>('tos')
  const [legalLocale, setLegalLocale]   = useState<Locale>('he')
  const [legalDoc, setLegalDoc]         = useState<LegalDoc>({ title: '', content: '', version: '1.0' })
  const [legalLoading, setLegalLoading] = useState(false)
  const [legalSaving, setLegalSaving]   = useState(false)
  const [legalSaved, setLegalSaved]     = useState(false)

  // ── Load settings ───────────────────────────────────────────
  const loadSettings = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/settings').then(r => r.json()).then((d: { settings: Setting[] }) => {
      const map: Record<string, string> = {}
      d.settings?.forEach((s: Setting) => { map[s.key] = s.value })
      setSettings(map)
      setLocalValues(map)
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadSettings() }, [loadSettings])

  // ── Load legal doc ──────────────────────────────────────────
  const loadLegalDoc = useCallback(async (type: DocType, locale: Locale) => {
    setLegalLoading(true)
    try {
      const r = await fetch(`/api/admin/legal?type=${type}&locale=${locale}`)
      const d = await r.json()
      if (d.doc) {
        setLegalDoc({ title: d.doc.title, content: d.doc.content, version: d.doc.version })
      } else {
        setLegalDoc({ title: '', content: '', version: '1.0' })
      }
    } catch {
      setLegalDoc({ title: '', content: '', version: '1.0' })
    } finally {
      setLegalLoading(false)
    }
  }, [])

  useEffect(() => { loadLegalDoc(legalTab, legalLocale) }, [legalTab, legalLocale, loadLegalDoc])

  // ── Save setting ────────────────────────────────────────────
  const saveSetting = async (key: string) => {
    setSaving(key)
    const r = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: localValues[key] }),
    })
    setSaving(null)
    if (r.ok) {
      setSettings(prev => ({ ...prev, [key]: localValues[key] }))
      setSaved(key)
      setTimeout(() => setSaved(null), 2000)
    }
  }

  const toggleSetting = async (key: string) => {
    const newVal = localValues[key] === 'true' ? 'false' : 'true'
    setLocalValues(prev => ({ ...prev, [key]: newVal }))
    setSaving(key)
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: newVal }),
    })
    setSaving(null)
    setSettings(prev => ({ ...prev, [key]: newVal }))
    setSaved(key)
    setTimeout(() => setSaved(null), 2000)
  }

  // ── Save legal doc ──────────────────────────────────────────
  const saveLegalDoc = async () => {
    setLegalSaving(true)
    try {
      const r = await fetch('/api/admin/legal', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doc_type: legalTab,
          locale: legalLocale,
          title: legalDoc.title,
          content: legalDoc.content,
          version: legalDoc.version,
        }),
      })
      if (r.ok) {
        setLegalSaved(true)
        setTimeout(() => setLegalSaved(false), 2500)
      }
    } finally {
      setLegalSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">

      {/* ── Page header ──────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-stone-900">Settings</h1>
        <p className="text-sm text-stone-400 mt-0.5">Configure platform-wide settings, footer, and legal documents.</p>
      </div>

      {/* ── Standard settings sections ───────────────────────── */}
      {SECTIONS.map(({ title, desc, keys }) => (
        <div key={title} className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="text-sm font-semibold text-stone-800">{title}</h2>
            <p className="text-xs text-stone-400 mt-0.5">{desc}</p>
          </div>
          <div className="divide-y divide-stone-50">
            {keys.map(key => {
              const meta = SETTING_META[key]
              if (!meta) return null
              const value     = localValues[key] ?? ''
              const isSaving  = saving === key
              const isSaved   = saved === key

              return (
                <div key={key} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800">{meta.label}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{meta.description}</p>
                  </div>

                  {meta.type === 'toggle' ? (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isSaved && <span className="text-xs text-emerald-600">Saved ✓</span>}
                      <button
                        onClick={() => toggleSetting(key)}
                        disabled={!!isSaving}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                          value === 'true' ? 'bg-[#c9a84c]' : 'bg-stone-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          value === 'true' ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                      <span className={`text-xs font-medium ${value === 'true' ? 'text-emerald-600' : 'text-stone-400'}`}>
                        {isSaving ? '…' : value === 'true' ? 'On' : 'Off'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isSaved && <span className="text-xs text-emerald-600">Saved ✓</span>}
                      <input
                        type={meta.type === 'url' || meta.type === 'tel' ? 'text' : meta.type}
                        value={value}
                        onChange={e => setLocalValues(prev => ({ ...prev, [key]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && saveSetting(key)}
                        placeholder={meta.placeholder ?? ''}
                        className="w-48 border border-stone-200 rounded-lg px-3 py-1.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c]"
                      />
                      <button
                        onClick={() => saveSetting(key)}
                        disabled={isSaving || value === settings[key]}
                        className="px-3 py-1.5 rounded-lg bg-[#c9a84c] text-white text-xs font-medium hover:bg-[#b8973a] disabled:opacity-40 transition-colors"
                      >
                        {isSaving ? '…' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* ── Maintenance mode warning ─────────────────────────── */}
      {localValues['maintenance_mode'] === 'true' && (
        <div className="flex gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <p className="text-xs text-red-700">
            <strong>Maintenance mode is ON.</strong> All visitors (except admins) see a maintenance page.
          </p>
        </div>
      )}

      {/* ── Legal Documents Editor ────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h2 className="text-sm font-semibold text-stone-800">Legal Documents</h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Edit Terms of Use, Privacy Policy, and Refund Policy for each language.
            Content is HTML — use &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;&lt;li&gt; tags.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Doc type tabs */}
          <div className="flex gap-2">
            {DOC_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setLegalTab(type)}
                className="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: legalTab === type ? '#c9a84c' : '#f5f3ef',
                  color:      legalTab === type ? '#fff'     : '#78716c',
                }}
              >
                {DOC_LABELS[type]}
              </button>
            ))}
          </div>

          {/* Locale tabs */}
          <div className="flex gap-2">
            {LOCALES.map(loc => (
              <button
                key={loc}
                onClick={() => setLegalLocale(loc)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                style={{
                  background:  legalLocale === loc ? '#1c1814' : 'white',
                  color:       legalLocale === loc ? '#e8d08a' : '#78716c',
                  borderColor: legalLocale === loc ? '#1c1814' : '#e7e5e4',
                }}
              >
                {LOCALE_LABELS[loc]}
              </button>
            ))}
          </div>

          {legalLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-5 h-5 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Title</label>
                  <input
                    value={legalDoc.title}
                    onChange={e => setLegalDoc(p => ({ ...p, title: e.target.value }))}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30"
                    placeholder="Document title"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Version</label>
                  <input
                    value={legalDoc.version}
                    onChange={e => setLegalDoc(p => ({ ...p, version: e.target.value }))}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30"
                    placeholder="1.0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">
                  Content (HTML)
                </label>
                <textarea
                  value={legalDoc.content}
                  onChange={e => setLegalDoc(p => ({ ...p, content: e.target.value }))}
                  rows={20}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-700 font-mono focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 resize-y"
                  placeholder="<h3>Section title</h3>&#10;<p>Content...</p>"
                  spellCheck={false}
                  dir={legalLocale === 'he' ? 'rtl' : 'ltr'}
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Supported tags: &lt;h2&gt; &lt;h3&gt; &lt;h4&gt; &lt;p&gt; &lt;ul&gt;&lt;li&gt; &lt;strong&gt; &lt;a&gt;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={saveLegalDoc}
                  disabled={legalSaving || !legalDoc.title || !legalDoc.content}
                  className="px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
                  style={{ background: '#c9a84c', color: '#fff' }}
                >
                  {legalSaving ? 'Saving…' : `Save ${DOC_LABELS[legalTab]} (${legalLocale.toUpperCase()})`}
                </button>
                {legalSaved && (
                  <span className="text-sm text-emerald-600 font-medium">Saved ✓</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
