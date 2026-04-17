// ============================================================
//  GrandInvite — Super Admin Utilities
//  src/lib/admin.ts
// ============================================================

import { createAdminSupabaseClient } from './supabase-server'

export const SUPER_ADMIN_EMAIL = 'shaimesika10@gmail.com'

/** Verify that the given email is the super-admin. */
export function isSuperAdmin(email: string | null | undefined): boolean {
  return email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
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
    // Never crash the request just because audit logging failed
    console.error('[admin-audit] failed to log action:', err)
  }
}
