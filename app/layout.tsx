import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: {
    default: 'PRPM — Pusat Riset & Pengabdian Masyarakat | ABK Primaniyarta',
    template: '%s | PRPM ABK Primaniyarta',
  },
  description: 'Portal resmi PRPM Akademi Bisnis dan Keuangan Primaniyarta — informasi kegiatan penelitian dan pengabdian masyarakat, serta layanan permohonan surat resmi.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  )
}
