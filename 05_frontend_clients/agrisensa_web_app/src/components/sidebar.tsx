"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavigation } from "./navigation-context";
import { X, Sprout } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { isMobileOpen, closeMobile } = useNavigation();

  const navigationSections = [
    {
      title: "Pusat Kontrol",
      items: [
        { name: "Command Center", href: "/" },
        { name: "Data Analyst Eksekutif", href: "/analyst", tag: "AI Strategic" },
      ],
    },
    {
      title: "Laboratorium & Analisis",
      items: [
        { name: "Laboratorium Pupuk", href: "/fertilizer", tag: "Formulasi" },
        { name: "Perpustakaan Riset & SOP", href: "/documents", tag: "PDF AI" },
        { name: "Laboratorium MLOps", href: "/mlops", tag: "16 Komoditas" },
        { name: "Asisten AI Agronomi", href: "/chat" },
      ],
    },
    {
      title: "Simulasi & Perencanaan",
      items: [
        { name: "Generator SOP Komoditas", href: "/sop", tag: "AI + Jurnal" },
        { name: "Simulasi Monte Carlo", href: "/monte-carlo", tag: "10k Runs" },
        { name: "Generator RAB Otomatis", href: "/rab", tag: "Baku" },
        { name: "Intelijen Pasar", href: "/market", tag: "ID / JP" },
      ],
    },
  ];

  const renderNavContent = () => (
    <div className="flex flex-col justify-between h-full">
      <div className="p-4 space-y-6 overflow-y-auto">
        {navigationSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1.5">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {section.title}
            </p>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobile}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 font-bold shadow-sm"
                        : "text-slate-300 hover:text-white hover:bg-slate-900/60"
                    }`}
                  >
                    <span>{item.name}</span>
                    {item.tag && (
                      <span
                        className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                          isActive
                            ? "bg-emerald-500/20 text-emerald-300 font-bold"
                            : "bg-slate-800/80 text-slate-400"
                        }`}
                      >
                        {item.tag}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800/80 mx-3 mb-4 rounded-xl bg-slate-900/50">
        <div className="space-y-0.5">
          <p className="text-[11px] font-bold tracking-wider text-slate-200 uppercase">
            AgriSensa Engine
          </p>
          <p className="text-[10px] font-medium text-emerald-400">
            Sistem Aktif & Terhubung
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ───────────────────────────────────────────────────────────────── */}
      {/* DESKTOP SIDEBAR (Static on >= md screens)                          */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-[#070b14] shrink-0 min-h-[calc(100vh-4rem)] font-sans select-none">
        {renderNavContent()}
      </aside>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* MOBILE SLIDE-IN DRAWER (Rendered on < md screens when open)       */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop blur overlay */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={closeMobile}
          />

          {/* Drawer Panel */}
          <div className="relative w-4/5 max-w-xs bg-[#070b14] border-r border-slate-800/80 h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5">
                  <div className="h-full w-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                    <Sprout className="h-4 w-4 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <span className="font-extrabold text-sm text-white">AgriSensa Menu</span>
                  <p className="text-[10px] text-slate-400 font-medium">Navigasi Terpadu</p>
                </div>
              </div>

              <button
                onClick={closeMobile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
                aria-label="Tutup Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Navigation List */}
            <div className="flex-1 overflow-y-auto pb-6">
              {renderNavContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
