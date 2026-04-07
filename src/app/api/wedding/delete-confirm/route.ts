// ============================================================
// API: Confirm account deletion via token link
// GET /api/wedding/delete-confirm?token=xxx
// ============================================================
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(toSet) {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )

  // Find wedding with matching token that has not expired
  const { data: wedding, error: findErr } = await supabase
    .from('weddings')
    .select('id, user_id, delete_token_expires_at')
    .eq('delete_token', token)
    .single()

  if (findErr || !wedding) {
    return NextResponse.redirect(new URL('/?deleted=invalid', req.url))
  }

  // Check expiry
  if (new Date(wedding.delete_token_expires_at) < new Date()) {
    return NextResponse.redirect(new URL('/?deleted=expired', req.url))
  }

  // Delete the wedding (guests cascade via FK)
  const { error: delWeddingErr } = await supabase
    .from('weddings')
    .delete()
    .eq('id', wedding.id)

  if (delWeddingErr) {
    return NextResponse.json({ error: delWeddingErr.message }, { status: 500 })
  }

  // Delete the auth user so the email can be re-used for a new account
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  await adminSupabase.auth.admin.deleteUser(wedding.user_id)

  // Sign out and redirect to home
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/?deleted=success', req.url))
}
