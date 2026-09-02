"use client";

import React, { useState } from "react";
import { Send, Check, Loader2 } from "lucide-react";

interface SendTelegramButtonProps {
  message: string;
  label?: string;
  className?: string;
}

export function SendTelegramButton({
  message,
  label = "Kirim ke Telegram",
  className = "",
}: SendTelegramButtonProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!message || loading) return;
    setLoading(true);
    setSent(false);

    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          parse_mode: "Markdown",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSent(true);
        setTimeout(() => setSent(false), 4000);
      } else {
        alert("Gagal mengirim ke Telegram: " + (data.error || "Terjadi kesalahan"));
      }
    } catch (err: any) {
      console.error("Telegram send error:", err);
      alert("Error mengirim ke Telegram: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSend}
      disabled={loading || !message}
      className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
        sent
          ? "bg-emerald-500 text-slate-950 shadow-emerald-500/30"
          : "bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#229ED9] border border-[#229ED9]/40 hover:border-[#229ED9]/70"
      } ${className}`}
      title="Kirim ringkasan laporan ini langsung ke Bot Telegram Anda"
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#229ED9]" />
          <span>Mengirim...</span>
        </>
      ) : sent ? (
        <>
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>Terkirim ke Telegram! ✅</span>
        </>
      ) : (
        <>
          <Send className="w-3.5 h-3.5" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
