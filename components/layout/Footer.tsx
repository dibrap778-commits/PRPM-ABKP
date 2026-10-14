import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#081F3D] text-white/70 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/logo-prpm.png"
                alt="Logo PRPM"
                width={40}
                height={40}
                className="rounded-full flex-shrink-0"
              />
              <div>
                <div className="font-jakarta text-white font-bold text-sm">PRPM</div>
                <div className="text-white/40 text-[10px] uppercase tracking-wider">ABK Primaniyarta</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/55 max-w-xs">
              Mendorong ekosistem penelitian dan pengabdian masyarakat yang berdampak di Akademi Bisnis dan Keuangan Primaniyarta.
            </p>
            <div className="flex flex-col gap-2 mt-5 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-[#B8720A] flex-shrink-0" />
                <span>Jl. A.A. Maramis No. 273, Mapanget, Manado, 95111</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#B8720A] flex-shrink-0" />
                <span>0811-4390-3993</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#B8720A] flex-shrink-0" />
                <span>abkprimaniyarta@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-jakarta font-semibold text-white text-sm mb-4 uppercase tracking-wider text-xs">
              Menu
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Beranda</Link></li>
              <li><Link href="/kegiatan" className="hover:text-white transition-colors">Kegiatan PRPM</Link></li>
              <li><Link href="/surat" className="hover:text-white transition-colors">Ajukan Surat</Link></li>
              <li><Link href="/surat/status" className="hover:text-white transition-colors">Cek Status Surat</Link></li>
            </ul>
          </div>

          {/* Letter Types */}
          <div>
            <h3 className="font-jakarta font-semibold text-white text-sm mb-4 uppercase tracking-wider text-xs">
              Jenis Surat
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link href="/surat?jenis=tugas-penelitian" className="hover:text-white transition-colors">Surat Tugas Penelitian</Link></li>
              <li><Link href="/surat?jenis=tugas-pengabdian" className="hover:text-white transition-colors">Surat Tugas Pengabdian</Link></li>
              <li><Link href="/surat?jenis=keterangan-penelitian" className="hover:text-white transition-colors">Surat Keterangan Penelitian</Link></li>
              <li><Link href="/surat?jenis=rekomendasi" className="hover:text-white transition-colors">Surat Rekomendasi</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between gap-3 text-xs text-white/35">
          <span>© {new Date().getFullYear()} PRPM — Akademi Bisnis dan Keuangan Primaniyarta. Seluruh hak dilindungi.</span>
          <Link href="/admin" className="hover:text-white/60 transition-colors">
            Login Admin →
          </Link>
        </div>
      </div>
    </footer>
  )
}
