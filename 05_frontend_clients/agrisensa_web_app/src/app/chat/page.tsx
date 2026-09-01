"use client";

import React, { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "@/lib/api-client";
import { ChatMessage } from "@/lib/types";
import {
  Send,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Leaf,
  Bug,
  Droplets,
  DollarSign,
} from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "assistant",
      text: "Halo! Saya adalah **Asisten AI Agronomi AgriSensa** yang ditenagai oleh **DeepSeek AI Engine**.\n\nAda yang bisa saya bantu terkait budidaya, dosis pemupukan presisi, pengendalian hama terpadu, atau analisis kelayakan usaha tani Anda hari ini?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      modelUsed: "DeepSeek-V3",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: "Dosis NPK Jagung", icon: Droplets, text: "Berapa rekomendasi dosis pupuk NPK dan Urea per hektar untuk tanaman jagung hibrida?" },
    { label: "Pencegahan Hama Wereng", icon: Bug, text: "Bagaimana cara pencegahan dan pengendalian terpadu hama wereng coklat pada tanaman padi?" },
    { label: "Kapur Pertanian (Dolomit)", icon: Leaf, text: "Tanah saya memiliki pH 5.2, berapa dosis kapur dolomit yang harus saya aplikasikan sebelum tanam?" },
    { label: "Analisis Pasar Cabai", icon: DollarSign, text: "Bagaimana tren risiko harga cabai merah keriting saat musim hujan dan strategi mitigasinya?" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const reply = await sendChatMessage(textToSend, history);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: "DeepSeek-V3",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
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
    <div className="flex flex-col h-[calc(100vh-7rem)] max-w-5xl mx-auto space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 rounded-2xl glass-panel border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>AI Agronomist Chat</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                DeepSeek-V3
              </span>
            </h2>
            <p className="text-xs text-slate-400">Terhubung langsung dengan Master Orchestrator n8n di Railway</p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: "1",
                sender: "assistant",
                text: "Riwayat chat telah di-reset. Silakan tanyakan masalah pertanian atau konsultasi budidaya baru!",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                modelUsed: "DeepSeek-V3",
              },
            ])
          }
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 transition-colors"
          title="Reset Percakapan"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl glass-panel border border-slate-800/80">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs ${
                msg.sender === "user"
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "bg-slate-800 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`relative group max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-emerald-600 text-white rounded-tr-none shadow-md"
                  : "bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none shadow-md"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-[10px] text-slate-400">
                <span>{msg.timestamp}</span>
                {msg.modelUsed && <span className="font-mono text-emerald-400">{msg.modelUsed}</span>}
              </div>

              {/* Copy button */}
              <button
                onClick={() => copyToClipboard(msg.id, msg.text)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300"
                title="Salin Pesan"
              >
                {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-xs text-slate-400 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span>DeepSeek AI sedang memproses penalaran agronomi...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {quickPrompts.map((q) => {
          const Icon = q.icon;
          return (
            <button
              key={q.label}
              onClick={() => handleSend(q.text)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-emerald-300 hover:border-emerald-500/30 transition-all shrink-0"
            >
              <Icon className="w-3.5 h-3.5 text-emerald-400" />
              <span>{q.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 p-2 rounded-2xl glass-panel border border-slate-700/80 focus-within:border-emerald-500/60 transition-colors"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanyakan rekomendasi budidaya, dosis pupuk, gejala hama..."
          disabled={loading}
          className="flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-90 disabled:opacity-40 text-slate-950 font-bold text-sm flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
        >
          <span>Kirim</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
