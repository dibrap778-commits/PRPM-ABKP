'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'

const NAV_LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/kegiatan', label: 'Kegiatan' },
  { href: '/surat', label: 'Ajukan Surat' },
  { href: '/surat/status', label: 'Cek Status' },
]

export default function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

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
            {NAV_LINKS.map(link => {
              const isActive = link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href)
              const isButton = link.href === '/surat' && !pathname.startsWith('/surat')
              return isButton ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="ml-2 px-4 py-2 rounded-lg bg-[#B8720A] hover:bg-[#A06008] text-white text-sm font-semibold transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white bg-white/10'
                      : 'text-white/70 hover:text-white hover:bg-white/8'
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
            {NAV_LINKS.map(link => {
              const isActive = link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white bg-white/10'
                      : 'text-white/70 hover:text-white hover:bg-white/8'
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
