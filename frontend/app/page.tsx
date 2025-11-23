import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center text-white p-4 relative overflow-hidden">
      
      {/* Arxa fon bəzəyi */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#FF6B00] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl">
        <div className="mb-6 flex justify-center">
            <div className="bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-700 rotate-3 hover:rotate-0 transition duration-500">
                <GraduationCap size={64} className="text-[#FF6B00]" />
            </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-r from-white to-slate-400 text-transparent bg-clip-text">
          bufet.az
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed">
          Azərbaycan tələbələrinin vahid rəqəmsal məkanı. <br/>
          Kollektiv, Bazar, Etiraflar və daha çoxu.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/login" 
            className="px-8 py-4 bg-[#FF6B00] hover:bg-orange-600 text-white rounded-xl font-bold text-lg transition shadow-lg shadow-orange-900/20 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            Daxil Ol <ArrowRight size={20} />
          </Link>
          
          <Link 
            href="/register" 
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-bold text-lg transition w-full sm:w-auto justify-center block"
          >
            Qeydiyyat
          </Link>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-800/50 text-slate-600 text-sm">
            © 2025 Bufet.az - Tələbələr tərəfindən, tələbələr üçün.
        </div>
      </div>
    </div>
  );
}