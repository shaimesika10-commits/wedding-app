'use client'
// ============================================================
//  GrandInvite — Admin Sidebar (Redesigned)
//  src/app/admin/AdminSidebar.tsx
// ============================================================

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ── SVG Icon primitives ──────────────────────────────────────
function Ico({ children }: { children: React.ReactNode }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
      strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
      {children}
    </svg>
  )
}

const Icons = {
  Dashboard:  () => <Ico><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></Ico>,
  Users:      () => <Ico><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Ico>,
  Weddings:   () => <Ico><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></Ico>,
  Guests:     () => <Ico><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm8 0c-.33 0-.68.02-1.05.05 1.19.84 1.99 1.97 1.99 3.45V19h6v-2c0-2.66-5.33-4-8-4z"/></Ico>,
  Admins:     () => <Ico><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></Ico>,
  Settings:   () => <Ico><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Ico>,
  Audit:      () => <Ico><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></Ico>,
  Legal:      () => <Ico><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></Ico>,
  External:   () => <Ico><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></Ico>,
  SignOut:    () => <Ico><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Ico>,
}

// ── Navigation definition ────────────────────────────────────
const NAV_GROUPS = [
  {
    title: 'Overview',
    items: [
      { href: '/admin',            label: 'Dashboard',  Icon: Icons.Dashboard },
    ],
  },
  {
    title: 'Management',
    items: [
      { href: '/admin/users',      label: 'Users',      Icon: Icons.Users     },
      { href: '/admin/weddings',   label: 'Weddings',   Icon: Icons.Weddings  },
      { href: '/admin/guests',     label: 'Guests',     Icon: Icons.Guests    },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/admin/admins',     label: 'Admins',     Icon: Icons.Admins    },
      { href: '/admin/settings',   label: 'Settings',   Icon: Icons.Settings  },
      { href: '/admin/audit',      label: 'Audit Log',  Icon: Icons.Audit     },
    ],
  },
]

interface Props { adminEmail: string }

export default function AdminSidebar({ adminEmail }: Props) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  const initial = adminEmail.charAt(0).toUpperCase()

  return (
    <aside className="w-60 flex-shrink-0 bg-[#0f172a] flex flex-col h-screen sticky top-0 overflow-hidden">

      {/* ── Brand ── */}
      <div className="px-5 pt-6 pb-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#c9a84c] flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-tight tracking-wide">GrandInvite</p>
            <p className="text-[#c9a84c] text-[10px] tracking-[0.15em] uppercase font-medium">Super Admin</p>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {NAV_GROUPS.map(group => (
          <div key={group.title}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-[0.12em] text-slate-600 uppercase">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, Icon }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      active
                        ? 'bg-[#c9a84c]/12 text-[#c9a84c]'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                    }`}
                  >
                    <span className={`transition-colors ${active ? 'text-[#c9a84c]' : 'text-slate-500 group-hover:text-slate-300'}`}>
                      <Icon />
                    </span>
                    {label}
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="border-t border-white/8 p-3 space-y-1">

        {/* View live site */}
        <a
          href="https://wedding-app-pearl-alpha.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
        >
          <Icons.External />
          View Live Site
        </a>

        {/* Admin profile */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/30 flex items-center justify-center flex-shrink-0">
            <span className="text-[#c9a84c] text-xs font-bold">{initial}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-300 truncate font-medium">{adminEmail}</p>
            <p className="text-[10px] text-slate-600">Administrator</p>
          </div>
        </div>

        {/* Sign out */}
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all text-left"
          >
            <Icons.SignOut />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  )
}
