"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "./language-context";
import { Language } from "@/lib/translations";
import { Globe, ChevronDown, Check } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string; flag: string; nativeName: string }[] = [
    { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩", nativeName: "Indonesia" },
    { code: "en", label: "English", flag: "🇬🇧", nativeName: "English" },
    { code: "ja", label: "日本語", flag: "🇯🇵", nativeName: "日本語" },
  ];

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-xs font-semibold text-slate-200 transition-all shadow-sm"
        aria-label="Pilih Bahasa / Switch Language"
      >
        <span className="text-sm">{currentLangObj.flag}</span>
        <span className="font-bold hidden sm:inline">{currentLangObj.code.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-[#090e18] border border-slate-800 shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
          <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 mb-1">
            Pilih Bahasa / Language
          </div>
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLanguage(l.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                language === l.code
                  ? "bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-900/80"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{l.flag}</span>
                <span>{l.label}</span>
              </div>
              {language === l.code && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
