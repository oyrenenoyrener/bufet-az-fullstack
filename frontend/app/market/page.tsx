"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { ShoppingBag, Plus, X, Phone, Book, Home, Briefcase, MoreHorizontal } from "lucide-react";

export default function MarketPage() {
    const [items, setItems] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState("all");
    const [formData, setFormData] = useState({ title: "", description: "", price: "", currency: "AZN", category: "book", contact_info: "" });
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        axios.get("http://127.0.0.1:8000/api/users/market/", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setItems(res.data)).catch(console.error);
    }, []);

    const handleSubmit = async () => {
        if (!formData.title || !formData.price) return alert("Məlumatları doldurun");
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, (formData as any)[key]));
        if (imageFile) data.append("image", imageFile);

        const token = localStorage.getItem("access_token");
        await axios.post("http://127.0.0.1:8000/api/users/market/", data, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } });
        window.location.reload();
    };

    const filtered = filter === "all" ? items : items.filter(i => i.category === filter);

    return (
        <div className="min-h-screen bg-[#0F172A] text-white pb-24">
            <Navbar />
            <div className="max-w-6xl mx-auto p-4">
                <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                    <h1 className="text-2xl font-bold text-[#FF6B00] flex gap-2"><ShoppingBag /> Bazar</h1>
                    <button onClick={() => setShowForm(!showForm)} className={`px-4 py-2 rounded font-bold flex gap-2 ${showForm ? "bg-red-600" : "bg-green-600"}`}>
                        {showForm ? <><X size={18} /> Bağla</> : <><Plus size={18} /> Yeni Elan</>}
                    </button>
                </div>

                {showForm && (
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <input placeholder="Başlıq" className="p-3 bg-slate-900 rounded border border-slate-700 outline-none" onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            <input placeholder="Qiymət" type="number" className="p-3 bg-slate-900 rounded border border-slate-700 outline-none" onChange={e => setFormData({ ...formData, price: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <select className="p-3 bg-slate-900 rounded border border-slate-700 outline-none" onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                <option value="book">Kitab</option><option value="supply">Ləvazimat</option><option value="roommate">Ev</option><option value="other">Digər</option>
                            </select>
                            <input placeholder="Əlaqə" className="p-3 bg-slate-900 rounded border border-slate-700 outline-none" onChange={e => setFormData({ ...formData, contact_info: e.target.value })} />
                        </div>
                        <div className="mb-4"><input type="file" className="text-slate-400" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} /></div>
                        <textarea placeholder="Məlumat..." className="w-full p-3 bg-slate-900 rounded border border-slate-700 outline-none mb-4" onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        <button onClick={handleSubmit} className="w-full bg-[#FF6B00] py-3 rounded font-bold">Paylaş</button>
                    </div>
                )}

                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                    {['all', 'book', 'supply', 'roommate', 'other'].map(cat => (
                        <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-1 rounded-full border ${filter === cat ? "bg-[#FF6B00] border-[#FF6B00]" : "border-slate-700 text-slate-400"}`}>{cat}</button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(item => (
                        <div key={item.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition flex flex-col h-full">
                            <div className="h-48 bg-slate-900 rounded-lg mb-3 overflow-hidden relative">
                                {item.image ? <img src={item.image.startsWith("http") ? item.image : `http://127.0.0.1:8000${item.image}`} className="w-full h-full object-cover" /> : <ShoppingBag className="m-auto mt-16 text-slate-700" />}
                                <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-[#FF6B00] font-bold text-xs">{item.price} {item.currency}</div>
                            </div>
                            <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                            <p className="text-sm text-slate-400 mb-4 flex-1 line-clamp-2">{item.description}</p>
                            <div className="pt-3 border-t border-slate-700 flex justify-between items-center">
                                <span className="text-xs text-slate-500">{item.seller_name}</span>
                                <a href={`tel:${item.contact_info}`} className="text-green-400 text-xs font-bold border border-green-600/30 px-3 py-1 rounded hover:bg-green-600 hover:text-white transition">Əlaqə</a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}