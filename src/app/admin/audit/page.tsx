'use client'
// ============================================================
//  GrandInvite â Admin Audit Log (Redesigned)
//  src/app/admin/audit/page.tsx
// ============================================================

import { useEffect, useState } from 'react'

interface AuditEntry {
  id: string
  admin_email: string
  action: string
  target_table: string | null
  target_id: string | null
  details: Record<string, unknown> | null
  created_at: string
}

const ACTION_STYLE: Record<string, string> = {
  BAN_USER:         'bg-red-50 text-red-600 border-red-100',
  UNBAN_USER:       'bg-emerald-50 text-emerald-700 border-emerald-100',
  DELETE_USER:      'bg-red-100 text-red-700 border-red-200',
  EDIT_WEDDING:      'bg-blue-50 text-blue-600 border-blue-100',
  EDIT_GUEST:       'bg-violet-50 text-violet-600 border-violet-100',
  IMPERSONATE_USER: 'bg-amber-50 text-amber-600 border-amber-100',
  ADD_ADMIN:        'bg-[#c9a84c]/10 text-[#c9a84c] border-[#c9a84c]/20',
  REMOVE_ADMIN:     'bg-rose-50 text-rose-600 border-rose-100',
  UPDATE_SETTING:   'bg-sky-50 text-sky-600 border-sky-100',
}

export default function AdminAuditPage() {
  const [entries, setEntries]   = useState<AuditEntry[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<AuditEntry | null>(null)
  const [filter, setFilter]     = useState('all')
  const [search, setSearch]     = useState('')

  useEffect(() => {
    fetch('/api/admin/audit')
      .then(r => r.json())
      .then(d => setEntries(d.entries ?? []))
      .finally(() => setLoading(false))
  }, [])

  const actions = Array.from(new Set(entries.map(e => e.action))).sort()

  const filtered = entries.filter(e => {
    const matchAction = filter === 'all' || e.action === filter
    const matchSearch = e.admin_email.toLowerCase().includes(search.toLowerCase()) ||
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      (e.target_id ?? '').includes(search)
    return matchAction && matchSearch
  })

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Audit Log</h1>
          <p className="text-sm text-stone-400 mt-0.5">{entries.length} actions recorded</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30">
            <option value="all">All actions</option>
            {actions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
          </select>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Searchâ¦"
              className="border border-stone-200 rounded-lg pl-9 pr-4 py-2 text-sm text-stone-800 bg-white w-56 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c]" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                {['Date','Admin','Action','Target','Details'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map(entry => (
                <tr key={entry.id} className="hover:bg-stone-50 transition-colors cursor-pointer" onClick={() => setSelected(entry)}>
                  <td className="px-5 py-3.5 text-xs text-stone-400 whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="px-5 py-3.5 text-stone-600 text-xs font-mono">
                    {entry.admin_email.split('@')[0]}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ACTION_STYLE[entry.action] ?? 'bg-stone-50 text-stone-500 border-stone-200'}`}>
                      {entry.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-stone-400">
                    {entry.target_table ? `${entry.target_table}` : 'â'}
                    {entry.target_id ? <span className="text-stone-300 font-mono ml-1">#{entry.target_id.slice(0, 8)}</span> : null}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-stone-400 max-w-48 truncate">
                    {entry.details ? JSON.stringify(entry.details).slice(0, 60) : 'â'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-stone-400 text-sm">No actions found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-stone-900">Action Details</h2>
              <button onClick={() => setSelected(null)} className="text-stone-400 hover:text-stone-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['Action', <span key="a" className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ACTION_STYLE[selected.action] ?? 'bg-stone-50 text-stone-500 border-stone-200'}`}>{selected.action.replace(/_/g,' ')}</span>],
                ['Admin', selected.admin_email],
                ['Date', new Date(selected.created_at).toLocaleString('en-GB')],
                ['Target Table', selected.target_table ?? 'â'],
                ['Target ID', selected.target_id ?? 'â'],
              ].map(([label, value]) => (
                <div key={label as string} className="flex items-start gap-3">
                  <span className="text-xs font-medium text-stone-400 w-28 flex-shrink-0 pt-0.5">{label}</span>
                  <span className="text-stone-700 text-xs">{value as React.ReactNode}</span>
                </div>
              ))}
              {selected.details && (
                <div>
                  <span className="text-xs font-medium text-stone-400 block mb-1">Details</span>
                  <pre className="bg-stone-50 rounded-lg p-3 text-xs text-stone-600 overflow-auto max-h-40 border border-stone-100">
                    {JSON.stringify(selected.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
