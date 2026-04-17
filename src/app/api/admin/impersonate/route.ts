// ============================================================
//  GrandInvite — Admin Impersonation API
//  POST /api/admin/impersonate   — generate a magic-link for any user
//  DELETE /api/admin/impersonate — clear impersonation cookie
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import { isSuperAdmin, logAdminAction } from '@/lib/admin'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  const admin_sb = createAdminSupabaseClient()

  // Get the target user's email
  const { data: targetUser, error: userErr } = await admin_sb.auth.admin.getUserById(userId)
  if (userErr || !targetUser.user?.email) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Generate a magic link so the admin can log in as that user
  const { data: link, error: linkErr } = await admin_sb.auth.admin.generateLink({
    type: 'magiclink',
    email: targetUser.user.email,
    options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/fr/dashboard` },
  })

  if (linkErr) return NextResponse.json({ error: linkErr.message }, { status: 500 })

  await logAdminAction({
    adminEmail: user.email!,
    action: 'IMPERSONATE_USER',
    targetTable: 'auth.users',
    targetId: userId,
    details: { target_email: targetUser.user.email },
  })

  // Return the magic link — admin opens it in a new tab to "become" the user
  return NextResponse.json({ url: link.properties?.action_link })
}
