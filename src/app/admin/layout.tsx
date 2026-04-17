// ============================================================
//  GrandInvite — Super Admin Layout
//  src/app/admin/layout.tsx
//  Protected: only shaimesika10@gmail.com can access
// ============================================================

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { isSuperAdmin } from '@/lib/admin'
import AdminSidebar from './AdminSidebar'

export const metadata = { title: 'GrandInvite Admin' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // ── Server-side auth guard ──
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isSuperAdmin(user.email)) {
    redirect('/fr/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
