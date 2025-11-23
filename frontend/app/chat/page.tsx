"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Message {
    id: number;
    text: string;
    sender: string; // "me" (mən) və ya "other" (başqası)
    senderName?: string; // Göndərənin adı
    time: string;
}

export default function ChatPage() {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [status, setStatus] = useState("Yüklənir...");
    const [groupInfo, setGroupInfo] = useState<any>(null);
    const [myProfile, setMyProfile] = useState<any>(null);

    const socketRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) { router.push("/login"); return; }

        // 1. Öncə Profil və Qrup məlumatını alırıq
        axios.get("http://127.0.0.1:8000/api/users/profile/", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                const user = res.data;
                setMyProfile(user);

                if (user.group_info && user.group_info.id) {
                    setGroupInfo(user.group_info);
                    connectWebSocket(user.group_info.id, user.first_name);
                } else {
                    setStatus("Qrup tapılmadı! Zəhmət olmasa Setup keçin.");
                }
            })
            .catch(err => {
                console.error(err);
                setStatus("Profil xətası");
            });

        // Təmizlik
        return () => {
            if (socketRef.current) socketRef.current.close();
        };
    }, [router]);

    // WebSocket Bağlantı Funksiyası
    const connectWebSocket = (groupId: number, myName: string) => {
        setStatus("Bağlanır...");

        // DİNAMİK URL: /ws/chat/5/ (ID-yə görə)
        const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${groupId}/`);

        ws.onopen = () => {
            console.log(`✅ Qrup ${groupId} Çatına qoşuldu!`);
            setStatus("Onlayn");
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            // Əgər mesajı mən yazmamışamsa, siyahıya əlavə et
            // (Backend-dən gələn sender_name ilə mənim adımı yoxlaya bilərik, 
            // amma sadəlik üçün hələlik hər şeyi 'other' kimi qəbul edib, 
            // göndərəndə 'me' kimi yazırıq. Real sistemdə user_id ilə yoxlanmalıdır)

            if (data.sender_name !== myName) {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now(),
                        text: data.message,
                        sender: "other",
                        senderName: data.sender_name,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                ]);
            }
        };

        ws.onclose = () => setStatus("Bağlantı kəsildi");
        socketRef.current = ws;
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !socketRef.current || !myProfile) return;

        const msgData = {
            message: input,
            sender_name: myProfile.first_name // Adımızı da göndəririk
        };

        socketRef.current.send(JSON.stringify(msgData));

        // Öz ekranımızda
        setMessages((prev) => [
            ...prev,
            {
                id: Date.now(),
                text: input,
                sender: "me",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
        ]);

        setInput("");
    };

    if (!groupInfo && status.includes("tapılmadı")) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white flex-col gap-4">
                <p className="text-red-400 text-xl">{status}</p>
                <button onClick={() => router.push("/setup")} className="bg-[#FF6B00] px-6 py-2 rounded">Qrup Seç</button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0F172A] flex flex-col">

            {/* HEADER */}
            <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center shadow-md fixed top-0 w-full z-10">
                <div>
                    <h1 className="text-[#FF6B00] font-bold text-lg flex items-center gap-2">
                        {groupInfo ? `${groupInfo.name} Qrupu` : "Yüklənir..."} 💬
                    </h1>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${status === "Onlayn" ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
                        {status}
                    </p>
                </div>
                <button onClick={() => router.push("/dashboard")} className="px-3 py-1 bg-slate-700 rounded text-xs text-white border border-slate-600">Geri</button>
            </div>

            {/* CHAT AREA */}
            <div className="flex-1 overflow-y-auto p-4 mt-20 mb-24 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"}`}>
                        {/* Mesajı yazan adamın adı (Mən deyilsə) */}
                        {msg.sender !== "me" && <span className="text-[10px] text-slate-400 mb-1 ml-2">{msg.senderName}</span>}

                        <div className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-md ${msg.sender === "me" ? "bg-[#FF6B00] text-white rounded-tr-none" : "bg-slate-700 text-white rounded-tl-none"
                            }`}>
                            <p>{msg.text}</p>
                            <p className={`text-[10px] mt-1 text-right ${msg.sender === "me" ? "text-orange-100" : "text-slate-400"}`}>{msg.time}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="fixed bottom-0 w-full bg-slate-800 p-4 border-t border-slate-700">
                <form onSubmit={sendMessage} className="flex gap-2 max-w-4xl mx-auto">
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Mesaj yazın..." className="flex-1 bg-slate-900 text-white p-4 rounded-full border border-slate-600 focus:border-[#FF6B00] outline-none pl-6" />
                    <button type="submit" disabled={status !== "Onlayn"} className="bg-[#FF6B00] text-white p-4 rounded-full w-14 h-14 flex items-center justify-center">➤</button>
                </form>
            </div>
        </div>
    );
}