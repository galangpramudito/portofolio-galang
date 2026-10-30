import Link from 'next/link';

export const metadata = {
  title: 'Halaman Tidak Ditemukan',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className="bg-bg-dark min-h-screen flex items-center justify-center px-6 overflow-hidden relative">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <div className="mb-6 inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent/10 border border-accent/20">
          <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">404</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
          Halaman Tidak Ditemukan
        </h1>
        
        <p className="text-xl text-gray-400 mb-12 leading-relaxed">
          Sepertinya Anda mencari sesuatu yang tidak ada di sini. Kembali ke beranda dan jelajahi portfolio saya.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/" 
            className="px-8 py-4 bg-white text-bg-dark font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            Kembali ke Beranda
          </Link>
          <Link 
            href="/#projects" 
            className="px-8 py-4 border border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-colors"
          >
            Lihat Project
          </Link>
        </div>

        {/* Floating Elements */}
        <div className="mt-16 grid grid-cols-3 gap-8">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <i className="ri-code-s-slash-line text-2xl text-accent mb-2 block"></i>
            <p className="text-xs text-gray-400">Development</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <i className="ri-palette-line text-2xl text-accent mb-2 block"></i>
            <p className="text-xs text-gray-400">Design</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <i className="ri-video-line text-2xl text-accent mb-2 block"></i>
            <p className="text-xs text-gray-400">Video</p>
          </div>
        </div>
      </div>
    </main>
  );
}
