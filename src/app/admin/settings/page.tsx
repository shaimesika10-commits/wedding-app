'use client'
// ============================================================
//  GrandInvite — Site Settings Page (NEW)
//  src/app/admin/settings/page.tsx
// ============================================================

import { useEffect, useState } from 'react'

interface Setting { key: string; value: string; description: string }

const SETTING_META: Record<string, { label: string; type: 'number' | 'toggle' | 'text' | 'email'; description: string }> = {
  max_free_guests:  { label: 'Free Plan Guest Limit',      type: 'number',  description: 'Max guests allowed on the free plan per wedding' },
  gallery_enabled:  { label: 'Gallery Feature',            type: 'toggle',  description: 'Enable the photo gallery for all weddings' },
  ai_chat_enabled:  { label: 'AI Invitation Chat',         type: 'toggle',  description: 'Enable the AI assistant on invitation pages' },
  maintenance_mode: { label: 'Maintenance Mode',           type: 'toggle',  description: 'Show maintenance page to all non-admin visitors' },
  support_email:    { label: 'Support Email',              type: 'email',   description: 'Contact email shown on the site' },
}

export default function AdminSettingsPage() {
  const [settings, setSettings]   = useState<Record<string, string>>({})
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState<string | null>(null)
  const [saved, setSaved]         = useState<string | null>(null)
  const [localValues, setLocalValues] = useState<Record<string, string>>({})

  const load = () => {
    setLoading(true)
    fetch('/api/admin/settings').then(r => r.json()).then((d: { settings: Setting[] }) => {
      const map: Record<string, string> = {}
      d.settings?.forEach((s: Setting) => { map[s.key] = s.value })
      setSettings(map)
      setLocalValues(map)
    }).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const saveSetting = async (key: string) => {
    setSaving(key)
    const r = await fetch('/api/admin/settings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
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
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: newVal }),
    })
    setSaving(null)
    setSettings(prev => ({ ...prev, [key]: newVal }))
    setSaved(key)
    setTimeout(() => setSaved(null), 2000)
  }

  const sections = [
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
      keys: ['maintenance_mode', 'support_email'],
    },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-stone-900">Settings</h1>
        <p className="text-sm text-stone-400 mt-0.5">Configure platform-wide settings and feature flags.</p>
      </div>

      <div className="space-y-6">
        {sections.map(({ title, desc, keys }) => (
          <div key={title} className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100">
              <h2 className="text-sm font-semibold text-stone-800">{title}</h2>
              <p className="text-xs text-stone-400 mt-0.5">{desc}</p>
            </div>
            <div className="divide-y divide-stone-50">
              {keys.map(key => {
                const meta = SETTING_META[key]
                if (!meta) return null
                const value = localValues[key] ?? ''
                const isSaving = saving === key
                const isSaved = saved === key

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
                          type={meta.type}
                          value={value}
                          onChange={e => setLocalValues(prev => ({ ...prev, [key]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && saveSetting(key)}
                          className="w-40 border border-stone-200 rounded-lg px-3 py-1.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c]"
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
      </div>

      {localValues['maintenance_mode'] === 'true' && (
        <div className="mt-5 flex gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <p className="text-xs text-red-700">
            <strong>Maintenance mode is ON.</strong> All visitors (except admins) see a maintenance page. Turn it off to restore access.
          </p>
        </div>
      )}
    </div>
  )
}
