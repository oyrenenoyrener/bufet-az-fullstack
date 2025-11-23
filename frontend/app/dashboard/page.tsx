// frontend/src/app/dashboard/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/Navbar"; 
import AcademicFilters from "../../components/AcademicFilters"; 
import { ArrowRight, BookOpen } from "lucide-react";

interface NewsItem {
  id: number;
  title: string;
  content: string;
  image: string | null;
  created_at: string;
  university_name: string;
}

// 👇 DÜZƏLİŞ: LIVE API ünvanını Environment Variable-dan alırıq
const LIVE_API_URL = process.env.NEXT_PUBLIC_API_URL + "/api/users"; 

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterParams, setFilterParams] = useState({});

  const fetchData = useCallback(async (filters: any) => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/login"); return; }
    
    setLoading(true);

    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const filterQuery = new URLSearchParams(filters).toString();
        
        const [userRes, newsRes] = await Promise.all([
            // Link dəyişdirildi
            axios.get(`${LIVE_API_URL}/profile/`, config), 
            // Link dəyişdirildi
            axios.get(`${LIVE_API_URL}/news/?${filterQuery}`, config)
        ]);

        setUser(userRes.data);
        setNewsList(newsRes.data);

    } catch (err: any) {
        if (err.response?.status === 401) {
             localStorage.removeItem("access_token");
             router.push("/login");
        } else {
             console.error("Dashboard Load Error:", err.response?.data);
        }
    } finally {
        setLoading(false);
    }
  }, [router]);

  useEffect(() => {
      fetchData(filterParams);
  }, [filterParams, fetchData]);

  const handleFilterChange = useCallback((filters: { uni?: string, fac?: string, spec?: string }) => {
      const newFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v)
      );
      setFilterParams(newFilters);
  }, []); 

  if (loading) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">🚀 Yüklənir...</div>;

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pb-24 md:pb-0">
      <Navbar />

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        
        {/* Başlıq */}
        <div className="mb-8 border-b border-slate-700 pb-4">
            <h1 className="text-3xl font-bold text-[#FF6B00]">Şəxsi Kabinet</h1>
            <p className="text-slate-400">Xoş gəldin, {user?.first_name} 👋</p>
        </div>
        
        {/* 📢 FILTR PANELİ */}
        <div className="mb-8">
            <AcademicFilters onFilterChange={handleFilterChange} />
        </div>

        {/* --- MƏLUMAT KARTLARI (GRID) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
             
             {/* SOL: Şəxsi Məlumatlar */}
             <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <h3 className="text-slate-400 text-xs font-bold mb-4 uppercase tracking-wider border-b border-slate-700 pb-2">Şəxsi Məlumatlar</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Ad Soyad:</span> 
                        <span className="font-medium text-white">
                            {user?.first_name === "Pending" ? <span className="text-yellow-500">Təsdiq Gözləyir</span> : `${user?.first_name} ${user?.last_name}`}
                        </span>
                    </div>
                    <div className="flex justify-between"><span className="text-slate-500">FİN Kod:</span> <span className="font-mono text-[#FF6B00]">{user?.fin_code}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Telefon:</span> <span className="font-mono text-white">{user?.phone_number}</span></div>
                </div>
             </div>

             {/* SAĞ: Akademik Məlumatlar */}
             <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <h3 className="text-slate-400 text-xs font-bold mb-4 uppercase tracking-wider border-b border-slate-700 pb-2">Akademik Məlumatlar</h3>
                
                {user?.group_info ? (
                    <div className="space-y-3 text-sm">
                        <div><span className="text-slate-500 text-xs block mb-1">Universitet:</span> <span className="font-bold text-white">{user.group_info.university}</span></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><span className="text-slate-500 text-xs block mb-1">Fakültə:</span> <span>{user.group_info.faculty}</span></div>
                            <div><span className="text-slate-500 text-xs block mb-1">İxtisas:</span> <span>{user.group_info.specialty}</span></div>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-slate-700 mt-1">
                            <span className="text-slate-400">Qrup:</span> <span className="text-[#FF6B00] font-bold text-2xl">{user.group_info.name}</span>
                        </div>
                        <button onClick={() => router.push("/chat")} className="mt-2 w-full py-2 bg-[#FF6B00] hover:bg-orange-600 rounded-lg text-white font-bold transition flex items-center justify-center gap-2 shadow-sm text-sm"><span>💬</span> Kollektivə Qoşul</button>
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <p className="text-yellow-500 mb-3 text-sm">Akademik məlumat yoxdur.</p>
                        <button onClick={() => router.push("/setup")} className="bg-slate-700 px-6 py-2 rounded-full hover:bg-slate-600 transition text-sm border border-slate-600 text-white font-bold">⚙️ Setup-a Keç</button>
                    </div>
                )}
             </div>
        </div>

        {/* Xəbərlər (FILTRLƏNMİŞ) */}
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-l-4 border-[#FF6B00] pl-3">
            <BookOpen size={20} className="text-[#FF6B00]"/> Xəbərlər
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newsList.length > 0 ? newsList.map(news => (
                <div key={news.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition flex flex-col h-full">
                    {news.image && (<img src={news.image.startsWith("http") ? news.image : `${process.env.NEXT_PUBLIC_API_URL}${news.image}`} alt={news.title} className="w-full h-40 object-cover rounded mb-3"/>)}
                    <span className="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-400 self-start mb-2 border border-slate-700 truncate max-w-full">{news.university_name}</span>
                    <h3 className="font-bold text-md mb-2 line-clamp-2 text-white break-words leading-tight">{news.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-3 flex-1 break-words leading-relaxed">{news.content}</p>
                </div>
            )) : (
                <div className="col-span-3 text-center p-10 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
                    Bu süzgəcə uyğun xəbər tapılmadı.
                </div>
            )}
        </div>
      </div>
    </div>
  );
}