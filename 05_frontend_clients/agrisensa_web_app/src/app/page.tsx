"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/components/language-context";
import {
  Sprout,
  TrendingUp,
  Cpu,
  FlaskConical,
  MessageSquareCode,
  Calculator,
  LineChart,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Leaf,
  CloudSun,
  AlertTriangle,
  Sparkles,
  Layers,
  FileText,
} from "lucide-react";

export default function DashboardPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 md:p-8 border border-emerald-500/20 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>{t("dash_hero_badge", "DeepSeek AI & MLOps Engine Live")}</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white font-['Plus_Jakarta_Sans']">
              AgriSensa <span className="text-emerald-400">Command Center</span>
            </h1>
            <p className="text-sm md:text-base text-slate-300 max-w-2xl">
              {t("dash_hero_desc", "Pusat kendali pertanian cerdas presisi, inferensi machine learning terpadu, serta orkestrasi otomasi alur kerja tanpa batas.")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/analyst"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-sm font-bold shadow-lg shadow-emerald-500/25 hover:opacity-95 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t("nav_data_analyst", "Data Analyst Eksekutif")}</span>
            </Link>
            <Link
              href="/sop"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-white text-sm font-semibold transition-all hover:bg-slate-800"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>{t("nav_sop_generator", "Generator SOP")}</span>
            </Link>
            <Link
              href="/fertilizer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-white text-sm font-semibold transition-all hover:bg-slate-800"
            >
              <Leaf className="w-4 h-4 text-teal-400" />
              <span>{t("nav_fertilizer_lab", "Laboratorium Pupuk")}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl glass-panel-hover border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t("dash_stat_model_title", "Model Inference")}
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white font-['Outfit']">98.4%</h3>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <span>{t("dash_stat_model_desc", "Akurasi Model Random Forest & XGBoost")}</span>
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl glass-panel-hover border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t("dash_stat_risk_title", "Simulasi Risiko")}
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white font-['Outfit']">10,000 Runs</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
              <span>{t("dash_stat_risk_desc", "Stokastik Box-Muller Distribution")}</span>
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl glass-panel-hover border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t("dash_stat_n8n_title", "Orkestrasi n8n")}
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white font-['Outfit']">14 Workflows</h3>
            <p className="text-xs text-purple-400 flex items-center gap-1 mt-1 font-medium">
              <span>{t("dash_stat_n8n_desc", "Otomasi Alur Data & Webhook Live")}</span>
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl glass-panel-hover border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t("dash_stat_ai_title", "AI Reasoning")}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white font-['Outfit']">DeepSeek-V3</h3>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <span>{t("dash_stat_ai_desc", "Injeksi Konteks Agronomi & Pasar")}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Module Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">
              {t("dash_modules_title", "Pusat Modul & Laboratorium Unggulan")}
            </h2>
            <p className="text-xs text-slate-400">
              {t("dash_modules_subtitle", "Pilih modul analitik pertanian untuk memulai simulasi dan optimasi usaha tani Anda.")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: SOP Generator */}
          <Link
            href="/sop"
            className="group relative overflow-hidden rounded-2xl glass-panel p-6 border border-slate-800/80 hover:border-emerald-500/40 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  AI + Jurnal
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {t("nav_sop_generator", "Generator SOP Komoditas")}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  SOP budidaya presisi GAP, Modul M-48 pestisida nabati, dan rujukan jurnal peer-reviewed (IPB, BRIN, FAO).
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Buka Generator SOP</span>
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </Link>

          {/* Card 2: Fertilizer Lab */}
          <Link
            href="/fertilizer"
            className="group relative overflow-hidden rounded-2xl glass-panel p-6 border border-slate-800/80 hover:border-teal-500/40 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-teal-500/10 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20 group-hover:scale-110 transition-transform">
                  <Leaf className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                  Subsidi HET & Majemuk
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">
                  {t("nav_fertilizer_lab", "Laboratorium Pupuk")}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Kalkulator pupuk majemuk (Phonska, Mutiara, Mahkota), komparasi subsidi HET, dan SOP pembuatan POC ROTAN.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-teal-400 group-hover:translate-x-1 transition-transform">
              <span>Buka Lab Pupuk</span>
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </Link>

          {/* Card 3: Executive Analyst */}
          <Link
            href="/analyst"
            className="group relative overflow-hidden rounded-2xl glass-panel p-6 border border-slate-800/80 hover:border-blue-500/40 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-500/10 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <LineChart className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                  AI Strategic
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                  {t("nav_data_analyst", "Data Analyst Eksekutif")}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Advisory makro-mikro, prediksi harga panen, dan perhitungan jejak karbon (Scope 1-3) usaha tani.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
              <span>Buka Data Analyst</span>
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </Link>

          {/* Card 4: Research Library */}
          <Link
            href="/documents"
            className="group relative overflow-hidden rounded-2xl glass-panel p-6 border border-slate-800/80 hover:border-amber-500/40 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                  <Layers className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  PDF & Data AI
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  {t("nav_research_library", "Perpustakaan Riset & SOP")}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Parsing dokumen cerdas (PDF, Word, Excel, CSV) dan pustaka riset agronomi terintegrasi.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Buka Perpustakaan</span>
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </Link>

          {/* Card 5: Monte Carlo */}
          <Link
            href="/monte-carlo"
            className="group relative overflow-hidden rounded-2xl glass-panel p-6 border border-slate-800/80 hover:border-purple-500/40 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-purple-500/10 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                  10k Iterasi
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                  {t("nav_monte_carlo", "Simulasi Monte Carlo")}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Pemodelan probabilitas keuntungan, ketahanan anomali cuaca, dan Value at Risk (VaR 95%).
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
              <span>Buka Simulasi Risiko</span>
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </Link>

          {/* Card 6: AI Chat */}
          <Link
            href="/chat"
            className="group relative overflow-hidden rounded-2xl glass-panel p-6 border border-slate-800/80 hover:border-cyan-500/40 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-cyan-500/10 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                  <MessageSquareCode className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                  DeepSeek-V3
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {t("nav_ai_assistant", "Asisten AI Agronomi")}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Konsultasi interaktif dosis pupuk, pengendalian hama & penyakit (PHT), dan analisis tanah presisi.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>Buka Chatbot AI</span>
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
