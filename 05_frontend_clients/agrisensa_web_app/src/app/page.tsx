"use client";

import React from "react";
import Link from "next/link";
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
} from "lucide-react";

export default function DashboardPage() {
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
              <span>DeepSeek AI & MLOps Engine Live</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white font-['Plus_Jakarta_Sans']">
              AgriSensa <span className="text-emerald-400">Command Center</span>
            </h1>
            <p className="text-sm md:text-base text-slate-300 max-w-2xl">
              Pusat kendali pertanian cerdas presisi, inferensi machine learning terpadu, serta orkestrasi otomasi alur kerja tanpa batas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-sm font-bold shadow-lg shadow-emerald-500/25 hover:opacity-95 transition-all hover:scale-[1.02]"
            >
              <MessageSquareCode className="w-4 h-4" />
              <span>Tanya AI Agronomi</span>
            </Link>
            <Link
              href="/mlops"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-white text-sm font-semibold transition-all hover:bg-slate-800"
            >
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              <span>Uji Parameter Tanah</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl glass-panel-hover border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Model Inference
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white font-['Outfit']">98.4%</h3>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <span>Akurasi Model Random Forest & XGBoost</span>
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl glass-panel-hover border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Simulasi Risiko
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white font-['Outfit']">10,000 Runs</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
              <span>Monte Carlo Precision Algorithm</span>
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl glass-panel-hover border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Orkestrasi n8n
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white font-['Outfit']">14 Workflows</h3>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <span>24/7 Auto Webhook & Cron Active</span>
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl glass-panel-hover border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Koneksi AI Engine
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white font-['Outfit']">DeepSeek-V3</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
              <span>Low Latency & High Reasoning</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Main Core Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Feature Modules */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-400" />
            <span>Modul Analisis & Simulasi Cerdas</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: AI Chat */}
            <Link
              href="/chat"
              className="glass-panel p-5 rounded-2xl glass-panel-hover border border-slate-800/80 flex flex-col justify-between group"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <MessageSquareCode className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mt-4 group-hover:text-emerald-400 transition-colors">
                  Asisten AI Agronomi
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Konsultasi penanganan hama, formulasi dosis pupuk NPK berimbang, dan manajemen budidaya tanaman presisi.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 mt-4">
                <span>Buka Percakapan</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>

            {/* Card 2: MLOps Lab */}
            <Link
              href="/mlops"
              className="glass-panel p-5 rounded-2xl glass-panel-hover border border-slate-800/80 flex flex-col justify-between group"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mt-4 group-hover:text-cyan-400 transition-colors">
                  Laboratorium MLOps
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Prediksi kecocokan komoditas berdasarkan sensor tanah (NPK, pH) dan analisis faktor penentu SHAP.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400 mt-4">
                <span>Mulai Uji Tanah</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>

            {/* Card 3: Monte Carlo */}
            <Link
              href="/monte-carlo"
              className="glass-panel p-5 rounded-2xl glass-panel-hover border border-slate-800/80 flex flex-col justify-between group"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mt-4 group-hover:text-amber-400 transition-colors">
                  Simulasi Monte Carlo
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Hitung 10.000 skenario risiko cuaca & fluktuasi harga pasar untuk mengetahui batas aman modal usaha tani.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-amber-400 mt-4">
                <span>Jalankan Simulasi</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>

            {/* Card 4: RAB Generator */}
            <Link
              href="/rab"
              className="glass-panel p-5 rounded-2xl glass-panel-hover border border-slate-800/80 flex flex-col justify-between group"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <Calculator className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mt-4 group-hover:text-purple-400 transition-colors">
                  Generator RAB Otomatis
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Susun Rencana Anggaran Biaya pertanian per hektar dengan rincian benih, pupuk, pestisida, dan tenaga kerja.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-purple-400 mt-4">
                <span>Buat Anggaran</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Right Col: Live Agro-Intel & Weather Alert */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-amber-400" />
            <span>Agro-Klimat & Peringatan Dini</span>
          </h2>

          <div className="glass-panel p-5 rounded-2xl space-y-4 border border-slate-800/80">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <p className="text-xs text-slate-400">Wilayah Pantauan</p>
                <p className="text-sm font-bold text-white">Jawa Barat & Jawa Tengah</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                Normal
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Suhu Udara</span>
                <p className="text-base font-bold text-white font-['Outfit'] mt-0.5">27.4 °C</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Kelembaban</span>
                <p className="text-base font-bold text-white font-['Outfit'] mt-0.5">78 %</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Curah Hujan</span>
                <p className="text-base font-bold text-white font-['Outfit'] mt-0.5">185 mm/bln</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Radiasi Surya</span>
                <p className="text-base font-bold text-white font-['Outfit'] mt-0.5">18.2 MJ/m²</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-300">Rekomendasi Musim:</span>
                <p className="mt-0.5 text-amber-200/80 leading-relaxed">
                  Mendekati masa peralihan musim tanam, optimalkan drainase guludan untuk menghindari kelembaban berlebih pada perakaran.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
