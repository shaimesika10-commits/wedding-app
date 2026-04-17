'use client'
// ============================================================
//  GrandInvite — Admin Audit Log Page
//  src/app/admin/audit/page.tsx
// ============================================================

import { useEffect, useState } from 'react'

interface Log {
  id: string; admin_email: string; action: string
  target_table: string | null; target_id: string | null
  details: Record<string, unknown> | null; created_at: string
}

const ACTION_COLOR: Record<string, string> = {
  BAN_USER:    'text-red-400',
  UNBAN_USER:  'text-emerald-400',
  DELETE_USER: 'text-red-500',
  EDIT_WEDDING:'text-amber-400',
  EDIT_GUEST:  'text-blue-400',
}

export default function AdminAuditPage() {
  const [logs, setLogs]       = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Log | null>(null)

  useEffect(() => {
    fetch('/api/admin/audit').then(r => r.json()).then(d => setLogs(d.logs ?? [])).finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-1">Audit Log</h1>
      <p className="text-sm text-gray-500 mb-6">Every admin action is recorded here.</p>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800 text-gray-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Time</th>
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-left px-4 py-3">Target</th>
                <th className="text-left px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr
                  key={log.id}
                  onClick={() => setSelected(log)}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className={`px-4 py-3 font-mono font-medium ${ACTION_COLOR[log.action] ?? 'text-gray-300'}`}>
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {log.target_table && <span>{log.target_table}</span>}
                    {log.target_id && <span className="text-gray-600 ml-1">#{log.target_id.slice(0, 8)}</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                    {log.details ? JSON.stringify(log.details).slice(0, 60) : '—'}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-600">No audit logs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-mono font-bold ${ACTION_COLOR[selected.action] ?? 'text-white'}`}>{selected.action}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-lg">✕</button>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex gap-2"><dt className="text-gray-500 w-24 shrink-0">Time</dt><dd className="text-gray-300">{new Date(selected.created_at).toLocaleString('en-GB')}</dd></div>
              <div className="flex gap-2"><dt className="text-gray-500 w-24 shrink-0">Table</dt><dd className="text-gray-300">{selected.target_table ?? '—'}</dd></div>
              <div className="flex gap-2"><dt className="text-gray-500 w-24 shrink-0">Target ID</dt><dd className="text-gray-300 font-mono text-xs break-all">{selected.target_id ?? '—'}</dd></div>
              {selected.details && (
                <div><dt className="text-gray-500 mb-1">Details</dt>
                  <pre className="bg-gray-800 rounded-lg p-3 text-xs text-gray-300 overflow-auto max-h-40">
                    {JSON.stringify(selected.details, null, 2)}
                  </pre>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}
    </div>
  )
}
