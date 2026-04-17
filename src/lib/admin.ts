// ============================================================
//  GrandInvite — Admin Utilities
//  src/lib/admin.ts
// ============================================================

import { createAdminSupabaseClient } from './supabase-server'

export const SUPER_ADMIN_EMAIL = 'shaimesika10@gmail.com'

/** Quick sync check — only for the primary super-admin. */
export function isSuperAdmin(email: string | null | undefined): boolean {
  return email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
}

/**
 * Async DB check — returns true for the primary admin OR any email
 * stored in the admin_users table. Use this wherever possible.
 */
export async function isAdminDB(email: string | null | undefined): Promise<boolean> {
  if (!email) return false
  // Primary admin is always allowed (fast path)
  if (isSuperAdmin(email)) return true
  try {
    const sb = createAdminSupabaseClient()
    const { data } = await sb
      .from('admin_users')
      .select('email')
      .eq('email', email.toLowerCase())
      .maybeSingle()
    return !!data
  } catch {
    return false
  }
}

/**
 * Write an entry to the admin_audit_log table.
 * Always uses the service-role client so RLS never blocks it.
 */
export async function logAdminAction(opts: {
  adminEmail: string
  action: string
  targetTable?: string
  targetId?: string
  details?: Record<string, unknown>
  ipAddress?: string
}) {
  try {
    const supabase = createAdminSupabaseClient()
    await supabase.from('admin_audit_log').insert({
      admin_email:  opts.adminEmail,
      action:       opts.action,
      target_table: opts.targetTable ?? null,
      target_id:    opts.targetId   ?? null,
      details:      opts.details    ?? null,
      ip_address:   opts.ipAddress  ?? null,
    })
  } catch (err) {
    console.error('[admin-audit] failed to log action:', err)
  }
}
