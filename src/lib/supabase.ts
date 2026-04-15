// ============================================================
//  GrandInvite – Supabase Browser Client
//  Safe to import in 'use client' components
//  For server-side use, import from @/lib/supabase-server
// ============================================================

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Use 'implicit' flow so that email confirmation links use token_hash
        // instead of PKCE code — this makes confirmation work when the link is
        // opened on a different device or browser than where signup happened.
        flowType: 'implicit',
      },
    }
  )
}
