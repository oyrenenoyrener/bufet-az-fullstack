"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    phone_number: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Səhifə açılanda təmizlik
  useEffect(() => {
    localStorage.clear();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); 
    setError("");

    try {
      console.log("Sorğu göndərilir...");
      
      const response = await axios.post("http://127.0.0.1:8000/api/users/login/", {
        phone_number: formData.phone_number, 
        password: formData.password
      });

      if (response.data.access) {
          localStorage.setItem("access_token", response.data.access);
          localStorage.setItem("refresh_token", response.data.refresh);
          router.push("/dashboard");
      } else {
          setError("Token gəlmədi! Server cavabı səhvdir.");
      }

    } catch (err: any) {
      console.error("Login Xətası:", err);
      if (err.response) {
          if (err.response.status === 401) {
              setError("Telefon nömrəsi və ya şifrə yanlışdır!");
          } else {
              setError(`Xəta: ${JSON.stringify(err.response.data)}`);
          }
      } else {
          setError("Serverlə əlaqə yoxdur!");
      }
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
        <h2 className="text-3xl font-bold text-[#FF6B00] mb-6 text-center">Xoş Gəldiniz</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-300 text-sm">Telefon Nömrəsi</label>
            <input 
                type="text" 
                name="phone_number" 
                onChange={handleChange} 
                className="w-full p-3 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-[#FF6B00] outline-none" 
                placeholder="+99450xxxxxxx" 
                required 
            />
          </div>
          <div>
            <label className="text-slate-300 text-sm">Şifrə</label>
            <input 
                type="password" 
                name="password" 
                onChange={handleChange} 
                className="w-full p-3 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-[#FF6B00] outline-none" 
                placeholder="********" 
                required 
            />
          </div>

          {error && (
            <div className="bg-red-900/50 text-red-200 p-3 rounded text-sm text-center border border-red-500 animate-pulse">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-3 bg-[#FF6B00] hover:bg-orange-600 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Yoxlanılır..." : "Daxil Ol"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
            <Link href="/register" className="text-sm text-slate-400 hover:text-white">
              Hesabınız yoxdur? <span className="text-[#FF6B00] hover:underline">Qeydiyyatdan keçin</span>
            </Link>
        </div>
      </div>
    </div>
  );
}