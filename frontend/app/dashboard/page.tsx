"use client";
import AcademicFilters from "../../components/AcademicFilters"; 
// Və ya @/components/AcademicFilters
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/components/Navbar";
import AcademicFilters from "../../components/AcademicFilters"; // <--- YENİ KOMPONENT
import { ArrowRight, BookOpen } from "lucide-react";

interface NewsItem {
  id: number;
  title: string;
  content: string;
  image: string | null;
  created_at: string;
  university_name: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterParams, setFilterParams] = useState({}); // <--- YENİ: Filterləri saxlayır

  // 1. Məlumatı Çəkən Əsas Funksiya (Filterlərə həssasdır)
  const fetchData = useCallback(async (filters: any) => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/login"); return; }
    
    setLoading(true);

    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Filter URL parametrlərini hazırlayırıq
        const filterQuery = new URLSearchParams(filters).toString();
        
        // Həm Profil, Həm Xəbərləri çəkirik
        const [userRes, newsRes] = await Promise.all([
            axios.get("http://127.0.0.1:8000/api/users/profile/", config),
            // Xəbərləri filterləyərək çəkirik
            axios.get(`http://127.0.0.1:8000/api/users/news/?${filterQuery}`, config)
        ]);

        setUser(userRes.data);
        setNewsList(newsRes.data);

    } catch (err: any) {
        if (err.response?.status === 401) {
             localStorage.removeItem("access_token");
             router.push("/login");
        } else {
             // Ətraflı xətanı konsolda göstərək
             console.error("Dashboard Load Error:", err.response?.data);
        }
    } finally {
        setLoading(false);
    }
  }, [router]);

  // 2. Səhifə yüklənəndə və Filterlər dəyişəndə Məlumatı Yenilə
  useEffect(() => {
      fetchData(filterParams);
  }, [filterParams, fetchData]);

  // 3. Filter Komponentindən gələn dəyişiklikləri qəbul et
  const handleFilterChange = (filters: { uni?: string, fac?: string, spec?: string }) => {
      // Yalnız boş olmayan filterləri saxla
      const newFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v)
      );
      setFilterParams(newFilters);
  };

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
        
        {/* 📢 FILTR PANELİ BURADADIR */}
        <div className="mb-8">
            <AcademicFilters onFilterChange={handleFilterChange} />
        </div>

        {/* --- MƏLUMAT KARTLARI (GRID) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
             
             {/* SOL: Şəxsi Məlumatlar */}
             <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
                <h3 className="text-slate-400 text-xs font-bold mb-4 uppercase tracking-wider border-b border-slate-700 pb-2">Şəxsi Məlumatlar</h3>
                {/* ... (Bu hissə eynidir) ... */}
             </div>

             {/* SAĞ: Akademik Məlumatlar */}
             <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
                <h3 className="text-slate-400 text-xs font-bold mb-4 uppercase tracking-wider border-b border-slate-700 pb-2">Akademik Məlumatlar</h3>
                {/* ... (Bu hissə eynidir) ... */}
                <button 
                    onClick={() => router.push("/chat")}
                    className="mt-4 w-full py-3 bg-[#FF6B00] hover:bg-orange-600 rounded-lg text-white font-bold transition flex items-center justify-center gap-2 shadow-sm text-sm"
                >
                    <span>💬</span> Kollektivə Qoşul
                </button>
             </div>
        </div>

        {/* Xəbərlər (FILTRLƏNMİŞ) */}
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-l-4 border-[#FF6B00] pl-3">
            <BookOpen size={20} className="text-[#FF6B00]"/> Xəbərlər
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newsList.length > 0 ? newsList.map(news => (
                <div key={news.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition flex flex-col h-full">
                    {/* ... (Xəbər kartı eynidir) ... */}
                    <p className="text-sm text-slate-400 line-clamp-3 flex-1 break-words leading-relaxed">{news.content}</p>
                </div>
            )) : (
                <div className="col-span-3 text-center p-10 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 text-sm">
                    Bu süzgəcə uyğun xəbər tapılmadı.
                </div>
            )}
        </div>
      </div>
    </div>
  );
}