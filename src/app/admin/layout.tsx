// ============================================================
//  GrandInvite — Super Admin Layout (Redesigned)
//  src/app/admin/layout.tsx
// ============================================================

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { isAdminDB } from '@/lib/admin'
import AdminSidebar from './AdminSidebar'

export const metadata = { title: 'GrandInvite Admin' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !(await isAdminDB(user.email))) {
    redirect('/fr/login')
  }

  return (
    <div className="flex min-h-screen bg-stone-50">
      <AdminSidebar adminEmail={user.email ?? ''} />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  )
}
