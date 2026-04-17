'use client'
// ============================================================
//  GrandInvite — Admin Sidebar
//  src/app/admin/AdminSidebar.tsx
// ============================================================

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin',          label: 'Dashboard',  icon: '📊' },
  { href: '/admin/users',    label: 'Users',      icon: '👥' },
  { href: '/admin/weddings', label: 'Weddings',   icon: '💍' },
  { href: '/admin/guests',   label: 'Guests',     icon: '🪑' },
  { href: '/admin/audit',    label: 'Audit Log',  icon: '📋' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <p className="text-xs font-semibold tracking-widest text-amber-400 uppercase">GrandInvite</p>
        <p className="text-lg font-bold text-white mt-0.5">Super Admin</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-amber-500/10 text-amber-400 border-r-2 border-amber-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-800">
        <p className="text-xs text-gray-600">shaimesika10@gmail.com</p>
      </div>
    </aside>
  )
}
