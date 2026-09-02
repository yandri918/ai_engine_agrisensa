"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

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

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#070b14] flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)] font-sans select-none">
      <div className="p-4 space-y-6">
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
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 font-bold"
                        : "text-slate-300 hover:text-white hover:bg-slate-900/60"
                    }`}
                  >
                    <span>{item.name}</span>
                    {item.tag && (
                      <span
                        className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                          isActive
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-slate-800/80 text-slate-400 group-hover:text-slate-300"
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

      <div className="p-4 border-t border-slate-800/80 mx-3 mb-4 rounded-lg bg-slate-900/40">
        <div className="space-y-0.5">
          <p className="text-[11px] font-bold tracking-wider text-slate-200 uppercase">
            AgriSensa Engine
          </p>
          <p className="text-[10px] font-medium text-emerald-400">
            Sistem Aktif & Terhubung
          </p>
        </div>
      </div>
    </aside>
  );
}


