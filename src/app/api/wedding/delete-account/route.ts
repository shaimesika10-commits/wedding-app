// ============================================================
//  GrandInvite - Direct Delete Account API
//  Verifies user email then permanently deletes account + data
//  src/app/api/wedding/delete-account/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { confirmEmail } = body as { confirmEmail: string }

    if (!confirmEmail || confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: 'Email does not match' }, { status: 400 })
    }

    const { data: wedding } = await supabase
      .from('weddings')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })
    }

    const admin = createAdminSupabaseClient()
    const wedding_id = wedding.id

    await admin.from('guests').delete().eq('wedding_id', wedding_id)
    await admin.from('gallery_photos').delete().eq('wedding_id', wedding_id)
    await admin.from('event_schedule').delete().eq('wedding_id', wedding_id)

    const { error: deleteWeddingError } = await admin
      .from('weddings')
      .delete()
      .eq('id', wedding_id)

    if (deleteWeddingError) {
      console.error('Delete wedding error:', deleteWeddingError)
      return NextResponse.json({ error: 'Failed to delete wedding' }, { status: 500 })
    }

    await admin.from('users').delete().eq('id', user.id)

    const { error: authDeleteError } = await admin.auth.admin.deleteUser(user.id)
    if (authDeleteError) {
      console.error('Auth user delete error:', authDeleteError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
