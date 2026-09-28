import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
      <div className="font-jakarta text-8xl font-extrabold text-slate-200 mb-4">404</div>
      <h1 className="font-jakarta text-2xl font-bold text-slate-800 mb-2">Halaman tidak ditemukan</h1>
      <p className="text-slate-500 text-sm mb-8">Halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0C3461] hover:bg-[#081F3D] text-white font-semibold rounded-xl text-sm transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  )
}
