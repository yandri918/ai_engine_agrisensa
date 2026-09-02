"use client";

import React, { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "@/lib/api-client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Sprout,
  Bug,
  ThermometerSun,
  Flame,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `### 🌾 Halo! Saya AgriSensa AI Master Agronomist.
Ditenagai oleh **DeepSeek-V3 — Deep Reasoning Engine**.

Saya siap memberikan kajian teknis mendalam, analitis, dan bervariasi setiap jawaban:
1. **Formulasi Pemupukan Berimbang**: Dosis Urea, NPK, SP-36, KCl, dan pupuk organik per fase vegetatif/generatif (dalam kg/Ha & HST).
2. **Pengendalian Hama & Penyakit (OPT)**: Diagnosa gejala serangan, ambang kendali ekonomi, dan rekomendasi agensia hayati (*Beauveria bassiana*, *Trichoderma*).
3. **Koreksi Kondisi Tanah & pH**: Kebutuhan kapur Dolomit per hektar berdasarkan status pH, KTK, dan antisipasi cekaman iklim.
4. **Intelijen Harga Pasar**: Pemantauan harga komoditas cabai, bawang, jagung, beras, dan sawit secara terkini.

*Silakan ketik pertanyaan Anda atau pilih topik cepat di bawah!*`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    {
      icon: <Sprout className="w-3.5 h-3.5 text-emerald-400" />,
      text: "Berapa dosis pupuk NPK & Urea yang tepat untuk tanaman Jagung Hibrida 1 Hektar per fase HST?",
    },
    {
      icon: <Bug className="w-3.5 h-3.5 text-rose-400" />,
      text: "Bagaimana cara mengatasi serangan Hama Wereng Batang Coklat (WBC) pada padi sawah sebelum ambang ekonomi?",
    },
    {
      icon: <ThermometerSun className="w-3.5 h-3.5 text-amber-400" />,
      text: "Tanah saya memiliki pH 5.1. Berapa ton kapur Dolomit yang harus saya taburkan dan bagaimana teknis aplikasinya?",
    },
    {
      icon: <Flame className="w-3.5 h-3.5 text-purple-400" />,
      text: "Formulasi nutrisi AB Mix dan pencegahan penyakit patek (antraknosa) pada budidaya Cabai Rawit saat musim hujan.",
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend = input) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const reply = await sendChatMessage(textToSend, history);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ Maaf, terjadi gangguan komunikasi: ${err.message}. Silakan coba kirim ulang pertanyaan Anda.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-6.5rem)] space-y-4">
      {/* Chat Top Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl glass-panel border border-emerald-500/20 shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Bot className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-white">Asisten AI Agronomi</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                DeepSeek-V3 ✦
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Penalaran agronomi tropis & manajemen budidaya presisi</p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: "welcome",
                role: "assistant",
                content: "Riwayat obrolan telah dibersihkan. Silakan tanyakan masalah pertanian baru Anda!",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ])
          }
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white text-xs flex items-center gap-1.5 transition-colors border border-slate-800"
          title="Reset Percakapan"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl glass-panel border border-slate-800/80 scroll-smooth">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[92%] md:max-w-[85%] ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            {/* Avatar */}
            <div
              className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-md ${
                msg.role === "user"
                  ? "bg-gradient-to-tr from-cyan-600 to-blue-500 text-white"
                  : "bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950"
              }`}
            >
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Card */}
            <div
              className={`relative p-4 rounded-2xl text-xs sm:text-sm border shadow-lg space-y-2 ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-cyan-950/70 to-blue-950/70 border-cyan-500/30 text-white rounded-tr-none"
                  : "bg-slate-900/90 border-slate-800 text-slate-200 rounded-tl-none"
              }`}
            >
              <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 border-b border-slate-800/60 pb-1 mb-1.5">
                <span className="font-semibold">{msg.role === "user" ? "Anda" : "AgriSensa Master AI"}</span>
                <span className="font-mono">{msg.timestamp}</span>
              </div>

              {/* Native React Markdown Renderer with UTF-8 support */}
              <div className="prose prose-invert prose-xs max-w-none space-y-2 leading-relaxed text-slate-200">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-lg font-bold text-white mt-3 mb-1" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-base font-bold text-emerald-300 mt-3 mb-1" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-sm font-bold text-emerald-400 mt-2 mb-1" {...props} />,
                    p: ({ node, ...props }) => <p className="my-1.5 leading-relaxed text-slate-200" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                    em: ({ node, ...props }) => <em className="italic text-emerald-300" {...props} />,
                    ul: ({ node, ...props }) => <ul className="my-2 ml-4 list-disc space-y-1 text-slate-300" {...props} />,
                    ol: ({ node, ...props }) => <ol className="my-2 ml-4 list-decimal space-y-1 text-slate-200" {...props} />,
                    li: ({ node, ...props }) => <li className="leading-relaxed pl-1" {...props} />,
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto my-3 rounded-xl border border-slate-700">
                        <table className="w-full text-left text-xs divide-y divide-slate-800" {...props} />
                      </div>
                    ),
                    th: ({ node, ...props }) => <th className="bg-slate-800 p-2 font-bold text-emerald-300" {...props} />,
                    td: ({ node, ...props }) => <td className="p-2 border-t border-slate-800 text-slate-300" {...props} />,
                    code: ({ node, ...props }) => (
                      <code className="bg-slate-950 px-1.5 py-0.5 rounded text-emerald-300 font-mono text-[11px]" {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote className="border-l-2 border-emerald-500 pl-3 my-2 text-slate-400 italic" {...props} />
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>

              {msg.role === "assistant" && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => copyToClipboard(msg.id, msg.content)}
                    className="p-1 rounded text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 text-[10px]"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin Jawaban</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-[80%] mr-auto">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shrink-0 text-slate-950">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 text-xs text-slate-300 rounded-tl-none flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-medium text-emerald-300">DeepSeek sedang memproses analisis agronomi mendalam...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Pills */}
      <div className="space-y-1">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q.text)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-[11px] font-medium text-slate-300 hover:text-emerald-300 whitespace-nowrap transition-all shadow-sm shrink-0"
            >
              {q.icon}
              <span className="truncate max-w-[280px]">{q.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Tanyakan masalah pemupukan, hama wereng, pH tanah, atau dosis obat tani..."
          rows={2}
          className="w-full pl-4 pr-24 py-3 rounded-2xl bg-slate-900/95 border border-slate-700/80 focus:border-emerald-400 text-white text-xs sm:text-sm resize-none outline-none shadow-xl focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-slate-500"
        />

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="absolute right-3 bottom-3.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-90 disabled:opacity-30 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
        >
          <span>Kirim</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
