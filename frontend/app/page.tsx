/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();

    // Məlumat qutuları
    const [formData, setFormData] = useState({
        phone_number: "",
        password: "",
        fin_code: "", // FİN kod üçün yer
    });

    // Şəkillər üçün qutular
    const [files, setFiles] = useState({
        id_card_front: null as File | null,
        id_card_back: null as File | null,
        student_card: null as File | null,
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Yazı yazanda işləyən funksiya
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Şəkil seçəndə işləyən funksiya
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFiles({ ...files, [e.target.name]: e.target.files[0] });
        }
    };

    // "Qeydiyyat" düyməsi
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        // Məlumatları paketləyirik (FormData)
        const data = new FormData();
        data.append("phone_number", formData.phone_number);
        data.append("password", formData.password);
        data.append("fin_code", formData.fin_code); // FİN kodu əlavə etdik

        if (files.id_card_front) data.append("id_card_front", files.id_card_front);
        if (files.id_card_back) data.append("id_card_back", files.id_card_back);
        if (files.student_card) data.append("student_card", files.student_card);

        try {
            // Backend-ə göndəririk
            const response = await axios.post(
                "http://127.0.0.1:8000/api/users/register/",
                data,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            console.log("Uğurlu:", response.data);
            setMessage("✅ Qeydiyyat uğurludur! Yönləndirilirsiniz...");

            // 2 saniyə sonra ana səhifəyə atır
            setTimeout(() => router.push("/"), 2000);

        } catch (error: any) {
            console.error("Xəta:", error);
            if (error.response) {
                // Backend-dən gələn dəqiq xətanı göstər
                setMessage("❌ Xəta: " + JSON.stringify(error.response.data));
            } else {
                setMessage("❌ Serverlə əlaqə yoxdur!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4">
            <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
                <h2 className="text-3xl font-bold text-[#FF6B00] mb-6 text-center">
                    Tələbə Qeydiyyatı
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Telefon */}
                    <div>
                        <label className="block text-slate-300 mb-1 text-sm">Telefon Nömrəsi</label>
                        <input
                            type="text"
                            name="phone_number"
                            placeholder="+99450xxxxxxx"
                            className="w-full p-3 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-[#FF6B00] outline-none"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Şifrə */}
                    <div>
                        <label className="block text-slate-300 mb-1 text-sm">Şifrə</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Gizli şifrəniz"
                            className="w-full p-3 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-[#FF6B00] outline-none"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* FİN Kod */}
                    <div>
                        <label className="block text-slate-300 mb-1 text-sm">FİN Kod (Şəxsiyyət Vəsiqəsi)</label>
                        <input
                            type="text"
                            name="fin_code"
                            placeholder="Məs: 5J38K9L"
                            maxLength={7}
                            className="w-full p-3 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-[#FF6B00] outline-none uppercase"
                            onChange={handleChange}
                            required
                        />
                        <p className="text-xs text-slate-500 mt-1">Vəsiqənin sağ aşağı küncündəki 7 simvol</p>
                    </div>

                    {/* Sənədlər */}
                    <div className="space-y-3 pt-2">
                        <p className="text-slate-400 text-xs font-bold uppercase">Sənədlərin Yüklənməsi</p>

                        <div className="bg-slate-900 p-3 rounded-lg border border-dashed border-slate-600">
                            <label className="block text-slate-300 text-sm mb-1">Şəxsiyyət Vəsiqəsi (Ön)</label>
                            <input type="file" name="id_card_front" accept="image/*" onChange={handleFileChange} required className="text-slate-400 text-sm w-full" />
                        </div>

                        <div className="bg-slate-900 p-3 rounded-lg border border-dashed border-slate-600">
                            <label className="block text-slate-300 text-sm mb-1">Şəxsiyyət Vəsiqəsi (Arxa)</label>
                            <input type="file" name="id_card_back" accept="image/*" onChange={handleFileChange} required className="text-slate-400 text-sm w-full" />
                        </div>

                        <div className="bg-slate-900 p-3 rounded-lg border border-dashed border-slate-600">
                            <label className="block text-slate-300 text-sm mb-1">Tələbə Kartı</label>
                            <input type="file" name="student_card" accept="image/*" onChange={handleFileChange} required className="text-slate-400 text-sm w-full" />
                        </div>
                    </div>

                    {/* Mesaj Yeri */}
                    {message && (
                        <div className={`text-center text-sm p-2 rounded ${message.includes("❌") ? "bg-red-900/50 text-red-200" : "bg-green-900/50 text-green-200"}`}>
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#FF6B00] hover:bg-orange-600 text-white font-bold rounded-lg transition duration-300 disabled:opacity-50"
                    >
                        {loading ? "Gözləyin..." : "Qeydiyyatı Tamamla"}
                    </button>
                </form>
            </div>
        </div>
    );
}