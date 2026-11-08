'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { Menu, X, ChevronDown, Archive, Map } from 'lucide-react'
import Image from 'next/image'

type NavItem =
  | { href: string; label: string; children?: undefined }
  | { label: string; href?: undefined; children: { href: string; label: string; icon: React.ReactNode; desc: string }[] }

const NAV_LINKS: NavItem[] = [
  { href: '/', label: 'Beranda' },
  { href: '/kegiatan', label: 'Kegiatan' },
  {
    label: 'Arsip',
    children: [
      { href: '/arsip/kegiatan', label: 'Arsip Kegiatan', icon: <Archive className="w-4 h-4" />, desc: 'Dokumentasi kegiatan yang telah selesai' },
      { href: '/arsip/roadmap', label: 'Roadmap Penelitian', icon: <Map className="w-4 h-4" />, desc: 'Rencana & arah riset PRPM' },
    ],
  },
  { href: '/surat', label: 'Ajukan Surat' },
  { href: '/surat/status', label: 'Cek Status' },
]

function DropdownMenu({ item, pathname }: { item: NavItem & { children: NonNullable<NavItem['children']> }, pathname: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isActive = item.children.some(c => pathname.startsWith(c.href))

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive ? 'text-white bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/8'
        }`}
      >
        {item.label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
          {item.children.map(child => (
            <Link
              key={child.href}
              href={child.href}
              onClick={() => setOpen(false)}
              className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group ${
                pathname.startsWith(child.href) ? 'bg-slate-50' : ''
              }`}
            >
              <span className={`mt-0.5 flex-shrink-0 ${pathname.startsWith(child.href) ? 'text-[#0C3461]' : 'text-slate-400 group-hover:text-[#0C3461]'} transition-colors`}>
                {child.icon}
              </span>
              <div>
                <p className={`text-sm font-semibold ${pathname.startsWith(child.href) ? 'text-[#0C3461]' : 'text-slate-700 group-hover:text-[#0C3461]'} transition-colors`}>
                  {child.label}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{child.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileArsipOpen, setMobileArsipOpen] = useState(false)

  return (
    <header className="bg-[#0C3461] sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logo-prpm.png"
              alt="Logo PRPM"
              width={40}
              height={40}
              className="rounded-full flex-shrink-0"
            />
            <div className="leading-tight">
              <div className="font-jakarta text-white font-bold text-sm tracking-wide">PRPM Primaniyarta</div>
              <div className="text-white/50 text-[10px] font-medium tracking-wider uppercase hidden sm:block">
                Pusat Riset &amp; Pengabdian Masyarakat
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link, i) => {
              if (link.children) {
                return <DropdownMenu key={i} item={link as NavItem & { children: NonNullable<NavItem['children']> }} pathname={pathname} />
              }
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href!)
              const isButton = link.href === '/surat' && !pathname.startsWith('/surat')
              return isButton ? (
                <Link
                  key={link.href}
                  href={link.href!}
                  className="ml-2 px-4 py-2 rounded-lg bg-[#B8720A] hover:bg-[#A06008] text-white text-sm font-semibold transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <Link
                  key={link.href}
                  href={link.href!}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'text-white bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/8'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#081F3D]">
          <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link, i) => {
              if (link.children) {
                const isActive = link.children.some(c => pathname.startsWith(c.href))
                return (
                  <div key={i}>
                    <button
                      onClick={() => setMobileArsipOpen(v => !v)}
                      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? 'text-white bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/8'
                      }`}
                    >
                      {link.label}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileArsipOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {mobileArsipOpen && (
                      <div className="ml-3 mt-1 flex flex-col gap-1 border-l border-white/10 pl-3">
                        {link.children.map(child => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => { setMobileOpen(false); setMobileArsipOpen(false) }}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              pathname.startsWith(child.href) ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/8'
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href!)
              return (
                <Link
                  key={link.href}
                  href={link.href!}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'text-white bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/8'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
