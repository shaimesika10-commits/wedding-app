// ============================================================
//  GrandInvite – Co-owner Email API
//  GET  /api/account/co-owner — returns current co_owner_email
//  POST /api/account/co-owner — set/update co_owner_email
//  DELETE /api/account/co-owner — remove co_owner_email
//
//  NOTE: Run this SQL in Supabase first:
//  ALTER TABLE weddings ADD COLUMN IF NOT EXISTS co_owner_email TEXT;
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
    try {
          const supabase = await createServerSupabaseClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

      const { data: wedding } = await supabase
            .from('weddings')
            .select('co_owner_email')
            .eq('user_id', user.id)
            .single()

      return NextResponse.json({ co_owner_email: wedding?.co_owner_email ?? null })
    } catch (err) {
          console.error('GET co-owner error:', err)
          return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
          const supabase = await createServerSupabaseClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

      const { co_owner_email } = await req.json()

      if (!co_owner_email || typeof co_owner_email !== 'string') {
              return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(co_owner_email.trim())) {
                  return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
          }

      const { error } = await supabase
            .from('weddings')
            .update({ co_owner_email: co_owner_email.trim().toLowerCase() })
            .eq('user_id', user.id)

      if (error) {
              console.error('Co-owner update error:', error)
              return NextResponse.json({ error: 'Failed to update co-owner email' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    } catch (err) {
          console.error('POST co-owner error:', err)
          return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE() {
    try {
          const supabase = await createServerSupabaseClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

      const { error } = await supabase
            .from('weddings')
            .update({ co_owner_email: null })
            .eq('user_id', user.id)

      if (error) {
              return NextResponse.json({ error: 'Failed to remove co-owner email' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    } catch (err) {
          console.error('DELETE co-owner error:', err)
          return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
            }
