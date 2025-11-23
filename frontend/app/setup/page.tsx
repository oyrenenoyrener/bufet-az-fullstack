"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function SetupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [universities, setUniversities] = useState<any[]>([]);
    const [faculties, setFaculties] = useState<any[]>([]);
    const [specialties, setSpecialties] = useState<any[]>([]);

    const [selectedUni, setSelectedUni] = useState("");
    const [selectedFaculty, setSelectedFaculty] = useState("");
    const [selectedSpecialty, setSelectedSpecialty] = useState("");

    const [groupNumber, setGroupNumber] = useState("");

    // 1. Uni
    useEffect(() => {
        axios.get("http://127.0.0.1:8000/api/users/universities/")
            .then(res => setUniversities(res.data))
            .catch(err => console.error(err));
    }, []);

    // 2. Fakültə
    useEffect(() => {
        if (selectedUni) {
            // Təmizlə
            setFaculties([]); setSpecialties([]); setSelectedFaculty(""); setSelectedSpecialty("");

            axios.get(`http://127.0.0.1:8000/api/users/faculties/?university_id=${selectedUni}`)
                .then(res => setFaculties(res.data));
        }
    }, [selectedUni]);

    // 3. İxtisas
    useEffect(() => {
        if (selectedFaculty) {
            setSpecialties([]); setSelectedSpecialty("");
            axios.get(`http://127.0.0.1:8000/api/users/specialties/?faculty_id=${selectedFaculty}`)
                .then(res => setSpecialties(res.data));
        }
    }, [selectedFaculty]);

    const handleSubmit = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) { router.push("/login"); return; }

        // 🔍 CASUS: Göndəriləcək məlumatı konsola yazırıq
        console.log("GÖNDƏRİLƏN PAKET:", {
            university_id: selectedUni,
            specialty_id: selectedSpecialty,
            group_number: groupNumber
        });

        // Frontend Yoxlaması
        if (!selectedUni || !selectedSpecialty || !groupNumber) {
            alert("Zəhmət olmasa bütün sahələri doldurun!");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post("http://127.0.0.1:8000/api/users/assign-group/", {
                university_id: selectedUni,
                specialty_id: selectedSpecialty,
                group_number: groupNumber
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("CAVAB:", response.data);
            router.push("/dashboard");
        } catch (error: any) {
            console.error("API XƏTASI:", error);
            if (error.response && error.response.data) {
                alert("Server Xətası: " + JSON.stringify(error.response.data));
            } else {
                alert("Naməlum xəta baş verdi.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4 text-white">
            <div className="w-full max-w-2xl bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
                <h1 className="text-3xl font-bold text-[#FF6B00] mb-2 text-center">Təhsil Məlumatları</h1>
                <p className="text-slate-400 text-center mb-8 text-sm">Zəhmət olmasa ixtisasınızı seçin və qrupunuzu qeyd edin.</p>

                <div className="space-y-5">

                    {/* 1. Uni */}
                    <div>
                        <label className="text-sm font-bold text-slate-300">Universitet</label>
                        <select className="w-full p-4 mt-1 bg-slate-900 rounded-lg border border-slate-600 focus:border-[#FF6B00] outline-none" onChange={(e) => setSelectedUni(e.target.value)} value={selectedUni}>
                            <option value="">Seçin...</option>
                            {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>

                    {/* 2. Fak */}
                    <div className={!selectedUni ? "opacity-50 pointer-events-none" : ""}>
                        <label className="text-sm font-bold text-slate-300">Fakültə</label>
                        <select className="w-full p-4 mt-1 bg-slate-900 rounded-lg border border-slate-600 focus:border-[#FF6B00] outline-none" disabled={!selectedUni} onChange={(e) => setSelectedFaculty(e.target.value)} value={selectedFaculty}>
                            <option value="">Seçin...</option>
                            {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>

                    {/* 3. İxtisas */}
                    <div className={!selectedFaculty ? "opacity-50 pointer-events-none" : ""}>
                        <label className="text-sm font-bold text-slate-300">İxtisas</label>
                        <select className="w-full p-4 mt-1 bg-slate-900 rounded-lg border border-slate-600 focus:border-[#FF6B00] outline-none" disabled={!selectedFaculty} onChange={(e) => setSelectedSpecialty(e.target.value)} value={selectedSpecialty}>
                            <option value="">Seçin...</option>
                            {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    {/* 4. Qrup */}
                    <div className={!selectedSpecialty ? "opacity-50 pointer-events-none" : ""}>
                        <label className="text-sm font-bold text-slate-300">Qrup Nömrəsi</label>
                        <input
                            type="text"
                            placeholder="Məsələn: 694.21"
                            className="w-full p-4 mt-1 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-[#FF6B00] outline-none"
                            disabled={!selectedSpecialty}
                            onChange={(e) => setGroupNumber(e.target.value)}
                            value={groupNumber}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !groupNumber}
                        className="w-full py-4 bg-[#FF6B00] hover:bg-orange-600 text-white font-bold rounded-lg mt-6 transition disabled:bg-slate-700"
                    >
                        {loading ? "Saxlanılır..." : "Təsdiqlə və Başla 🚀"}
                    </button>

                </div>
            </div>
        </div>
    );
}