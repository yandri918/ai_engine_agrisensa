"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, UserButton } from "@clerk/nextjs";
import { useNavigation } from "./navigation-context";
import { useLanguage } from "./language-context";
import { X, Sprout } from "lucide-react";


export function Sidebar() {
  const pathname = usePathname();
  const { isMobileOpen, closeMobile } = useNavigation();
  const { t } = useLanguage();

  const navigationSections = [
    {
      title: t("nav_control_center", "Pusat Kontrol"),
      items: [
        { name: t("nav_command_center", "Command Center"), href: "/" },
        { name: t("nav_data_analyst", "Data Analyst Eksekutif"), href: "/analyst", tag: "AI Strategic" },
      ],
    },
    {
      title: t("nav_lab_analysis", "Laboratorium & Analisis"),
      items: [
        { name: t("nav_fertilizer_lab", "Laboratorium Pupuk"), href: "/fertilizer", tag: "Formulasi" },
        { name: t("nav_research_library", "Perpustakaan Riset & SOP"), href: "/documents", tag: "PDF AI" },
        { name: t("nav_mlops_lab", "Laboratorium MLOps"), href: "/mlops", tag: "16 Komoditas" },
        { name: t("nav_ai_assistant", "Asisten AI Agronomi"), href: "/chat" },
      ],
    },
    {
      title: t("nav_sim_planning", "Simulasi & Perencanaan"),
      items: [
        { name: t("nav_sop_generator", "Generator SOP Komoditas"), href: "/sop", tag: "AI + Jurnal" },
        { name: t("nav_monte_carlo", "Simulasi Monte Carlo"), href: "/monte-carlo", tag: "10k Runs" },
        { name: t("nav_rab_generator", "Generator RAB Otomatis"), href: "/rab", tag: "Baku" },
        { name: t("nav_market_intel", "Intelijen Pasar"), href: "/market", tag: "ID / JP" },
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

      <div className="p-3 border-t border-slate-800/80 mx-3 mb-4 rounded-xl bg-slate-900/50 space-y-2">
        <Show when="signed-in">
          <div className="flex items-center gap-2.5 px-1 py-1">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-7 w-7 ring-2 ring-emerald-500/40",
                  userButtonOuterIdentifier: "text-xs font-semibold text-slate-200",
                },
              }}
              showName
            />
          </div>
        </Show>

        <Show when="signed-out">
          <Link
            href="/sign-in"
            onClick={closeMobile}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/20 transition-all"
          >
            <span>{t("auth_sign_in", "Masuk ke Akun")}</span>
            <span className="text-[10px] bg-emerald-500/30 px-1.5 py-0.5 rounded text-emerald-200">Auth</span>
          </Link>
        </Show>

        <div className="space-y-0.5 px-1 pt-1 border-t border-slate-800/60">
          <p className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">
            AgriSensa Engine
          </p>
          <p className="text-[9px] font-medium text-emerald-400">
            {t("status_online", "Sistem Aktif & Terhubung")}
          </p>
        </div>
      </div>
    </div>
  );


  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-[#070b14] shrink-0 min-h-[calc(100vh-4rem)] font-sans select-none">
        {renderNavContent()}
      </aside>

      {/* MOBILE SLIDE-IN DRAWER */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={closeMobile}
          />

          <div className="relative w-4/5 max-w-xs bg-[#070b14] border-r border-slate-800/80 h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
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

            <div className="flex-1 overflow-y-auto pb-6">
              {renderNavContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
