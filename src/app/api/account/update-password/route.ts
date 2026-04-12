// ============================================================
//  GrandInvite – Update Password API
//  POST /api/account/update-password
//  Body: { currentPassword: string, newPassword: string }
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
    try {
          const supabase = await createServerSupabaseClient()
          const { data: { user } } = await supabase.auth.getUser()

      if (!user || !user.email) {
              return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { currentPassword, newPassword } = await req.json()

      if (!currentPassword || !newPassword) {
              return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      if (newPassword.length < 8) {
              return NextResponse.json(
                { error: 'New password must be at least 8 characters' },
                { status: 400 }
                      )
      }

      // Verify current password by attempting sign-in
      const { error: signInError } = await supabase.auth.signInWithPassword({
              email: user.email,
              password: currentPassword,
      })

      if (signInError) {
              return NextResponse.json(
                { error: 'Current password is incorrect' },
                { status: 400 }
                      )
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
              password: newPassword,
      })

      if (updateError) {
              console.error('Password update error:', updateError)
              return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    } catch (err) {
          console.error('Update password error:', err)
          return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
