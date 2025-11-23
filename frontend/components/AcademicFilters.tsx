// frontend/src/components/AcademicFilters.tsx

"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Filter, X } from "lucide-react";

// 👇 DÜZƏLİŞ: LIVE API ünvanı (Environment Variable)
const LIVE_API_URL = process.env.NEXT_PUBLIC_API_URL + "/api/users"; 


export default function AcademicFilters({ onFilterChange }: { onFilterChange: (filters: { uni?: string, fac?: string, spec?: string }) => void }) {
  
  const [universities, setUniversities] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);

  const [selectedUni, setSelectedUni] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");

  // 1. Universitetləri gətir
  useEffect(() => {
    // API_URL istifadə olunur
    axios.get(`${LIVE_API_URL}/universities/`)
      .then(res => setUniversities(res.data))
      .catch(console.error);
  }, []);

  // 2. Fakültələri gətir
  useEffect(() => {
    if (selectedUni) {
        setSelectedFaculty(""); 
        setSelectedSpecialty("");
        setSpecialties([]);
        
        axios.get(`${LIVE_API_URL}/faculties/?university_id=${selectedUni}`) // Link dəyişdi
          .then(res => setFaculties(res.data));
    } else {
        setFaculties([]); 
        setSelectedFaculty(""); 
        setSpecialties([]);
        setSelectedSpecialty("");
    }
  }, [selectedUni]);

  // 3. İxtisasları gətir
  useEffect(() => {
    if (selectedFaculty) {
        setSelectedSpecialty("");
        axios.get(`${LIVE_API_URL}/specialties/?faculty_id=${selectedFaculty}`) // Link dəyişdi
        .then(res => setSpecialties(res.data));
    } else {
        setSpecialties([]);
        setSelectedSpecialty("");
    }
  }, [selectedFaculty]);

  // 4. Əsas Səhifəni Yenilə
  useEffect(() => {
      onFilterChange({ 
          uni: selectedUni, 
          fac: selectedFaculty, 
          spec: selectedSpecialty 
      });
  }, [selectedUni, selectedFaculty, selectedSpecialty, onFilterChange]);


  const handleClear = () => {
      setSelectedUni("");
      setSelectedFaculty("");
      setSelectedSpecialty("");
  }

  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md">
      <h3 className="text-white font-bold mb-3 flex items-center gap-2 border-b border-slate-700 pb-2">
        <Filter size={18} className="text-[#FF6B00]"/> Məlumat Süzgəci
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
        
        {/* 1. Universitet */}
        <select 
            className="w-full p-2 bg-slate-900 rounded border border-slate-700 text-sm outline-none"
            onChange={(e) => setSelectedUni(e.target.value)}
            value={selectedUni}
        >
          <option value="">Universitet (Hamısı)</option>
          {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>

        {/* 2. Fakültə */}
        <select 
            className="w-full p-2 bg-slate-900 rounded border border-slate-700 text-sm outline-none"
            onChange={(e) => setSelectedFaculty(e.target.value)}
            value={selectedFaculty}
            disabled={!selectedUni}
        >
          <option value="">Fakültə (Hamısı)</option>
          {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>

        {/* 3. İxtisas */}
        <select 
            className="w-full p-2 bg-slate-900 rounded border border-slate-700 text-sm outline-none"
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            value={selectedSpecialty}
            disabled={!selectedFaculty}
        >
          <option value="">İxtisas (Hamısı)</option>
          {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        
        {/* Təmizləmək */}
        <button 
            onClick={handleClear} 
            className="w-full p-2 bg-red-600/10 text-red-400 rounded border border-red-600/30 text-sm hover:bg-red-600/20 disabled:opacity-50"
            disabled={!selectedUni && !selectedFaculty && !selectedSpecialty}
        >
            <X size={16} className="inline mr-1"/> Təmizlə
        </button>
        
      </div>
    </div>
  );
}