// ============================================================
//  GrandInvite – Supabase SERVER-ONLY Client
//  Import this only in Server Components and Route Handlers
//  (uses next/headers – cannot be used in 'use client' files)
// ============================================================

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

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

export async function getWeddingBySlug(slug: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('weddings')
    .select(`
      *,
      event_schedule (*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) return null
  return data
}

export async function getGuestsByWeddingId(weddingId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getGalleryPhotosByWeddingId(weddingId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('gallery_photos')
    .select('*')
    .eq('wedding_id', weddingId)
    .eq('approved', true)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}
