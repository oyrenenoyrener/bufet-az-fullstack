"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, MessageCircle, LogOut, Zap, ShoppingBag, Search, Bell, X } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();

    // Bildiriş və Axtarış State-ləri
    const [showNotifs, setShowNotifs] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // DEMO Bildirişlər (Bunu sonra Backend-dən çəkəcəyik)
    const notifications = [
        { id: 1, text: "Əli sənin elanını bəyəndi ❤️", time: "2 dəq" },
        { id: 2, text: "Qrupda yeni mesaj var 💬", time: "15 dəq" },
        { id: 3, text: "Riyaziyyat kitabı satıldı 📚", time: "1 saat" },
    ];

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push("/login");
    };

    const isActive = (path: string) => pathname === path ? "text-[#FF6B00]" : "text-slate-400 hover:text-white";

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            alert(`Axtarılır: ${searchQuery} (Tezliklə...)`);
            // Gələcəkdə: router.push(`/search?q=${searchQuery}`);
        }
    }

    return (
        <>
            {/* ==============================
          1. TOP BAR (HƏM MOBİL, HƏM PC)
         ============================== */}
            <div className="bg-slate-900 border-b border-slate-800 p-3 sticky top-0 z-50 shadow-md">
                <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">

                    {/* LOGO */}
                    <Link href="/dashboard" className="text-xl md:text-2xl font-bold text-[#FF6B00] tracking-tighter shrink-0">
                        bufet.az
                    </Link>

                    {/* AXTARIŞ (Mərkəz) */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-md relative hidden md:block">
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Tələbə, kitab və ya post axtar..."
                            className="w-full bg-slate-800 text-white pl-10 pr-4 py-2 rounded-full border border-slate-700 focus:border-[#FF6B00] outline-none text-sm transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>

                    {/* SAĞ TƏRƏF (İkonlar & Çıxış) */}
                    <div className="flex items-center gap-4">

                        {/* Mobil üçün Axtarış İkonu (Input yox, sadəcə ikon) */}
                        <button className="md:hidden text-slate-400 hover:text-white">
                            <Search size={24} />
                        </button>

                        {/* BİLDİRİŞLƏR (Zəng) */}
                        <div className="relative">
                            <button onClick={() => setShowNotifs(!showNotifs)} className="relative text-slate-400 hover:text-white transition">
                                <Bell size={24} />
                                {/* Qırmızı nöqtə (Badge) */}
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">3</span>
                            </button>

                            {/* Bildiriş Pəncərəsi (Dropdown) */}
                            {showNotifs && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)}></div> {/* Arxanı bağlamaq üçün */}
                                    <div className="absolute right-0 mt-3 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-3 border-b border-slate-700 flex justify-between items-center">
                                            <span className="font-bold text-white text-sm">Bildirişlər</span>
                                            <button onClick={() => setShowNotifs(false)}><X size={16} className="text-slate-400" /></button>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {notifications.map(notif => (
                                                <div key={notif.id} className="p-3 hover:bg-slate-700/50 border-b border-slate-700/50 cursor-pointer transition">
                                                    <p className="text-sm text-slate-200">{notif.text}</p>
                                                    <p className="text-[10px] text-slate-500 mt-1">{notif.time}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="w-full p-2 text-center text-xs text-[#FF6B00] font-bold hover:bg-slate-700 transition">
                                            Hamısını gör
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Desktop Linkləri (Mobildə gizlənir) */}
                        <div className="hidden md:flex gap-6 items-center">
                            <Link href="/dashboard" className={isActive("/dashboard")}><Home size={20} /></Link>
                            <Link href="/chat" className={isActive("/chat")}><MessageCircle size={20} /></Link>
                            <Link href="/feed" className={isActive("/feed")}><Zap size={20} /></Link>
                            <Link href="/market" className={isActive("/market")}><ShoppingBag size={20} /></Link>
                            <button onClick={handleLogout} className="text-red-500 hover:text-red-400"><LogOut size={20} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==============================
          2. BOTTOM NAVIGATION (YALNIZ MOBİL)
         ============================== */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 p-2 z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
                <div className="flex justify-between items-center px-2">

                    <Link href="/dashboard" className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${isActive("/dashboard")}`}>
                        <Home size={24} />
                        <span className="text-[10px] font-medium">Ev</span>
                    </Link>

                    <Link href="/feed" className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${isActive("/feed")}`}>
                        <Zap size={24} />
                        <span className="text-[10px] font-medium">Axış</span>
                    </Link>

                    {/* Mərkəzi Çat (Qabarıq Düymə) */}
                    <div className="relative -top-6">
                        <Link href="/chat" className="flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-[#FF6B00] to-orange-500 rounded-full shadow-lg border-4 border-slate-900 text-white hover:scale-105 transition">
                            <MessageCircle size={28} />
                        </Link>
                    </div>

                    <Link href="/market" className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${isActive("/market")}`}>
                        <ShoppingBag size={24} />
                        <span className="text-[10px] font-medium">Bazar</span>
                    </Link>

                    <button onClick={handleLogout} className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-red-500 transition">
                        <LogOut size={24} />
                        <span className="text-[10px] font-medium">Çıxış</span>
                    </button>

                </div>
            </nav>
        </>
    );
}