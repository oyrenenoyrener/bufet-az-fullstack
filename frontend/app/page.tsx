import Link from "next/link";
import { GraduationCap, ArrowRight, MessageCircle, ShoppingBag, Zap, Users, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white overflow-x-hidden">
      
      {/* --- BACKGROUND GLOW EFFECTS (CANLI FON) --- */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#FF6B00] rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-screen filter blur-[150px] opacity-20"></div>
      </div>

      {/* --- NAVBAR (SADƏ) --- */}
      <nav className="relative z-10 max-w-7xl mx-auto p-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-[#FF6B00] tracking-tighter flex items-center gap-2">
            <GraduationCap size={32} /> bufet.az
        </div>
        <div className="flex gap-4">
            <Link href="/login" className="text-slate-300 hover:text-white font-medium transition">Daxil Ol</Link>
            <Link href="/register" className="bg-white text-[#0F172A] px-5 py-2 rounded-full font-bold hover:bg-slate-200 transition">Qeydiyyat</Link>
        </div>
      </nav>

      {/* --- HERO SECTION (BAŞLIQ) --- */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-32 text-center">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 text-sm mb-8 animate-fade-in-up">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Azərbaycanın ilk tələbə ekosistemi
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          Tələbə Həyatını <br/>
          <span className="bg-gradient-to-r from-[#FF6B00] to-yellow-500 text-transparent bg-clip-text">Rəqəmsallaşdırırıq</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Qrupunla əlaqə saxla, köhnə kitablarını sat, anonim etiraflar et və universitet həyatından zövq al. Hamısı bir yerdə.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/register" 
            className="px-8 py-4 bg-[#FF6B00] hover:bg-orange-600 text-white rounded-2xl font-bold text-lg transition shadow-lg shadow-orange-900/20 flex items-center gap-2 w-full sm:w-auto justify-center hover:scale-105 transform duration-200"
          >
            İndi Başla <ArrowRight size={20} />
          </Link>
          
          <Link 
            href="/login" 
            className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-700 rounded-2xl font-bold text-lg transition w-full sm:w-auto justify-center block backdrop-blur-sm"
          >
            Hesabım Var
          </Link>
        </div>

        {/* --- FEATURES (KARTLAR) --- */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            
            {/* Kart 1 */}
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-[#FF6B00]/30 transition group backdrop-blur-sm">
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition text-blue-400">
                    <Users size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Kollektiv Çat</h3>
                <p className="text-slate-400 leading-relaxed">Sənin qrupun, sənin qaydaların. Yalnız öz qrup yoldaşlarınla real vaxtda yazış.</p>
            </div>

            {/* Kart 2 */}
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-[#FF6B00]/30 transition group backdrop-blur-sm">
                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition text-[#FF6B00]">
                    <ShoppingBag size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Tələbə Bazarı</h3>
                <p className="text-slate-400 leading-relaxed">Köhnə kitabları sat, kirayə ev tap və ya lazım olan ləvazimatları ucuz qiymətə al.</p>
            </div>

            {/* Kart 3 */}
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:border-[#FF6B00]/30 transition group backdrop-blur-sm">
                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition text-purple-400">
                    <Zap size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Anonim Axış</h3>
                <p className="text-slate-400 leading-relaxed">Sirr saxlamaq istəyirsən? Anonim etiraflar et və ya universitet müzakirələrinə qoşul.</p>
            </div>

        </div>

        {/* --- STATISTIKA --- */}
        <div className="mt-32 border-t border-slate-800 pt-16 pb-10">
            <p className="text-slate-500 text-sm mb-8 uppercase tracking-widest font-bold">Təhlükəsizlik bizim prioritetimizdir</p>
            <div className="flex flex-col md:flex-row justify-center gap-12 items-center opacity-70 grayscale hover:grayscale-0 transition duration-500">
                <div className="flex items-center gap-3">
                    <ShieldCheck size={40} className="text-green-500"/>
                    <div className="text-left">
                        <p className="font-bold text-white">FİN Təsdiqi</p>
                        <p className="text-xs text-slate-400">Yalnız real tələbələr</p>
                    </div>
                </div>
                <div className="h-12 w-[1px] bg-slate-700 hidden md:block"></div>
                <div className="flex items-center gap-3">
                    <MessageCircle size={40} className="text-blue-500"/>
                    <div className="text-left">
                        <p className="font-bold text-white">Şifrəli Çat</p>
                        <p className="text-xs text-slate-400">Məlumatlarınız qorunur</p>
                    </div>
                </div>
            </div>
        </div>

      </main>

      <footer className="border-t border-slate-800 bg-slate-900 py-8 text-center text-slate-500 text-sm relative z-10">
        <p>© 2025 bufet.az | Bütün hüquqlar qorunur.</p>
      </footer>
    </div>
  );
}