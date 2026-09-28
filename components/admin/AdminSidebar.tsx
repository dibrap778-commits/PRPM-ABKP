'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BookOpen, LayoutDashboard, FileText, LogOut, Menu, X, ChevronRight, CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/surat', label: 'Permohonan Surat', icon: FileText, exact: false },
  { href: '/admin/kegiatan', label: 'Kelola Kegiatan', icon: CalendarDays, exact: false },
]

export default function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  function isActive(item: typeof NAV[0]) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-[#B8720A] rounded-xl flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="font-jakarta font-bold text-white text-sm leading-tight">PRPM Admin</p>
          <p className="text-white/40 text-[11px] leading-tight truncate max-w-[140px]">{userEmail}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3">
        <p className="px-3 mb-2 text-[10px] font-semibold text-white/30 uppercase tracking-widest">Menu</p>
        {NAV.map(item => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-colors group ${
                active
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#E8A030]' : 'text-white/40 group-hover:text-white/60'}`} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 text-white/30" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 border-t border-white/10 pt-4">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors w-full disabled:opacity-50"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {loggingOut ? 'Keluar...' : 'Keluar'}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-[#0C3461] flex-shrink-0 min-h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0C3461] flex items-center justify-between px-4 h-14 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#B8720A] rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <span className="font-jakarta font-bold text-white text-sm">PRPM Admin</span>
        </div>
        <button onClick={() => setOpen(v => !v)} className="text-white/70 hover:text-white p-1">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-30 flex">
          <div className="w-56 bg-[#0C3461] min-h-screen pt-14">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
        </div>
      )}

      {/* Mobile spacer */}
      <div className="lg:hidden h-14 w-full fixed" />
    </>
  )
}
