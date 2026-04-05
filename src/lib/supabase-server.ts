// ============================================================
//  GrandInvite – Supabase SERVER-ONLY Client
//  Import this only in Server Components and Route Handlers
//  (uses next/headers – cannot be used in 'use client' files)
// ============================================================

import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

export type WeddingRow = Database['public']['Tables']['weddings']['Row']
export type EventScheduleRow = Database['public']['Tables']['event_schedule']['Row']
export type GuestRow = Database['public']['Tables']['guests']['Row']
export type GalleryPhotoRow = Database['public']['Tables']['gallery_photos']['Row']

export type WeddingWithSchedule = WeddingRow & {
  event_schedule: EventScheduleRow[]
}

/**
 * Admin client — uses the service role key to bypass RLS.
 * Only use in trusted server-side API routes that perform their own
 * ownership/permission checks before calling this.
 */
export function createAdminSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your environment variables.')
  }
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { persistSession: false } }
  )
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export async function getWeddingBySlug(slug: string): Promise<WeddingWithSchedule | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('weddings')
    .select(`*, event_schedule (*)`)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) { console.error('[getWeddingBySlug] slug:', slug, 'error:', JSON.stringify(error)); return null }
  return data as unknown as WeddingWithSchedule
}

export async function getGuestsByWeddingId(weddingId: string): Promise<GuestRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data ?? []
}

export async function getGalleryPhotosByWeddingId(weddingId: string): Promise<GalleryPhotoRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('gallery_photos')
    .select('*')
    .eq('wedding_id', weddingId)
    .eq('approved', true)
    .order('created_at', { ascending: false })

  if (error) return []
  return data ?? []
}
