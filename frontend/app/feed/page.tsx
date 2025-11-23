"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";

export default function FeedPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [content, setContent] = useState("");
    const [type, setType] = useState("confession");
    const [isAnon, setIsAnon] = useState(false);

    const fetchPosts = async () => {
        const token = localStorage.getItem("access_token");
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/users/feed/", { headers: { Authorization: `Bearer ${token}` } });
            setPosts(res.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchPosts(); }, []);

    const handlePost = async () => {
        const token = localStorage.getItem("access_token");
        await axios.post("http://127.0.0.1:8000/api/users/feed/", { content, post_type: type, is_anonymous: isAnon }, { headers: { Authorization: `Bearer ${token}` } });
        setContent(""); fetchPosts();
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white pb-24">
            <Navbar />
            <div className="max-w-2xl mx-auto p-4">
                <h1 className="text-2xl font-bold text-[#FF6B00] mb-6 text-center">⚡ Tələbə Axışı</h1>

                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-8">
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Fikirlərini yaz..." className="w-full bg-slate-900 p-3 rounded border border-slate-700 outline-none text-sm min-h-[80px] text-white" />
                    <div className="flex justify-between items-center mt-3">
                        <div className="flex gap-2">
                            <select className="bg-slate-900 p-2 rounded text-xs border border-slate-700 outline-none" onChange={(e) => setType(e.target.value)}>
                                <option value="confession">Etiraf</option><option value="debate">Debat</option><option value="question">Sual</option>
                            </select>
                            <label className={`flex items-center gap-2 cursor-pointer px-3 rounded text-xs select-none border border-slate-700 ${isAnon ? "bg-purple-600 border-purple-600" : "bg-slate-900"}`}>
                                <input type="checkbox" checked={isAnon} onChange={() => setIsAnon(!isAnon)} className="hidden" />
                                {isAnon ? "Anonim" : "Açıq"}
                            </label>
                        </div>
                        <button onClick={handlePost} disabled={!content.trim()} className="bg-[#FF6B00] px-6 py-2 rounded font-bold text-sm hover:bg-orange-600">Paylaş</button>
                    </div>
                </div>

                <div className="space-y-4">
                    {posts.map(post => (
                        <div key={post.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${post.is_anonymous ? "bg-purple-600" : "bg-blue-600"}`}>
                                        {post.is_anonymous ? "🎭" : "👤"}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{post.author_name}</p>
                                        <p className="text-[10px] text-slate-400">{post.author_uni}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] bg-slate-900 px-2 py-1 rounded border border-slate-600 uppercase">{post.post_type}</span>
                            </div>
                            <p className="text-sm text-slate-300 mb-3">{post.content}</p>
                            <div className="flex gap-4 border-t border-slate-700 pt-3 text-xs text-slate-400">
                                <span>❤️ {post.likes_count}</span><span>💬 {post.comments?.length || 0}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}