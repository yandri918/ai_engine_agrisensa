"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Sprout,
  BookOpen,
  Calendar,
  Layers,
  Leaf,
  Bug,
  Droplets,
  Award,
  CheckCircle2,
  ExternalLink,
  Printer,
  RotateCcw,
  Sliders,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Clock,
  Compass,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useLanguage } from "@/components/language-context";

interface SOPCommodity {
  name: string;
  scientific_name: string;
  varieties: string[];
  duration_hst: number;
  potential_yield_ton_ha: number;
  optimal_climate?: {
    ph?: string;
    temp_c?: string;
    rainfall_mm?: string;
    elevation_mdpl?: string;
  };
}

interface CultivationPhase {
  phase_name: string;
  timing: string;
  description: string;
  tasks: string[];
}

interface FertilizerPlan {
  timing: string;
  fertilizer: string;
  dose_kg_ha: number;
  total_dosis_kg: number;
  method: string;
  focus: string;
}

interface PHTRecipe {
  target_pest: string;
  botanical_formula: string;
  ingredients?: string;
  application_method?: string;
  application?: string;
  efficacy_notes?: string;
}

interface ScientificJournalCitation {
  title: string;
  authors: string;
  year: string;
  journal: string;
  doi: string;
  key_finding: string;
}

interface SOPResultData {
  komoditas: string;
  scientific_name: string;
  varietas_unggulan: string[];
  luas_ha: number;
  elevasi_mdpl: number;
  musim: string;
  sistem_budidaya: string;
  total_durasi_hst: number;
  estimasi_yield_ton: number;
  total_kebutuhan_benih_kg: number;
  fase_budidaya: CultivationPhase[];
  jadwal_pemupukan_presisi: FertilizerPlan[];
  sop_pht_pestisida_nabati: PHTRecipe[];
  ai_strategic_insights: string;
  ai_actionable_checklist: string[];
  referensi_jurnal_ilmiah: ScientificJournalCitation[];
  timestamp: string;
  sop_code: string;
}

export default function SOPGeneratorPage() {
  const { t } = useLanguage();
  const [commodities, setCommodities] = useState<SOPCommodity[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState<string>("Cabai Merah");
  const [luasHa, setLuasHa] = useState<number>(1.0);
  const [elevasiMdpl, setElevasiMdpl] = useState<number>(450);
  const [musim, setMusim] = useState<string>("Kemarau");
  const [sistemBudidaya, setSistemBudidaya] = useState<string>("GAP Standar");
  const [targetPasar, setTargetPasar] = useState<string>("Domestik Premium");

  const [loading, setLoading] = useState<boolean>(false);
  const [sopResult, setSopResult] = useState<SOPResultData | null>(null);
  const [activePhaseIdx, setActivePhaseIdx] = useState<number>(0);

  // Fetch supported commodities list
  useEffect(() => {
    fetchCommodities();
  }, []);

  const fetchCommodities = async () => {
    try {
      const res = await fetch("/api/sop");
      const data = await res.json();
      if (data.success && data.commodities) {
        setCommodities(data.commodities);
      }
    } catch (err) {
      console.error("Failed to load commodities:", err);
    }
  };

  // Generate SOP on demand
  const handleGenerateSOP = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          komoditas: selectedCommodity,
          luas_ha: Number(luasHa),
          elevasi_mdpl: Number(elevasiMdpl),
          musim,
          sistem_budidaya: sistemBudidaya,
          target_pasar: targetPasar,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setSopResult(data.data);
        setActivePhaseIdx(0);
      }
    } catch (err) {
      console.error("Error generating SOP:", err);
    } finally {
      setLoading(false);
    }
  };

  // Generate default on first load
  useEffect(() => {
    handleGenerateSOP();
  }, []);

  const currentCropMeta = commodities.find((c) => c.name === selectedCommodity);

  return (
    <div className="space-y-8 pb-16 text-slate-100 max-w-7xl mx-auto font-sans">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* HEADER BANNER                                                      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 border border-emerald-500/30 shadow-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              {t("sop_hero_badge", "AgriSensa Precision SOP Generator • AI & Scientific Citations")}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {t("sop_hero_title", "Generator SOP Budidaya Presisi")}
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              {t("sop_hero_desc", "Penyusunan Standard Operating Procedure (SOP) budidaya per komoditas berbasis logika agronomi baku AgriSensa, modul Pestisida Nabati M-48, sintesis AI Agent adaptif, dan rujukan sitasi jurnal ilmiah peer-reviewed (BRIN, IPB, FAO, Springer).")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              disabled={!sopResult}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-md"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Cetak / Ekspor PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* CONFIGURATION PANEL                                                */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-2 text-emerald-400">
          <Sliders className="w-4 h-4" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Konfigurasi Parameter Lahan & Agroklimat
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Commodity Select */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Komoditas
            </label>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-emerald-500"
            >
              {commodities.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Luas Lahan (Ha) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Luas Lahan (Ha)
            </label>
            <input
              type="number"
              min="0.1"
              max="500"
              step="0.1"
              value={luasHa}
              onChange={(e) => setLuasHa(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Elevasi (mdpl) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Elevasi (mdpl)
            </label>
            <input
              type="number"
              min="0"
              max="3000"
              step="50"
              value={elevasiMdpl}
              onChange={(e) => setElevasiMdpl(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Musim */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Musim Tanam
            </label>
            <select
              value={musim}
              onChange={(e) => setMusim(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-emerald-500"
            >
              <option value="Kemarau">Kemarau (MK)</option>
              <option value="Penghujan">Penghujan (MH)</option>
              <option value="Pancaroba">Pancaroba / Peralihan</option>
            </select>
          </div>

          {/* Sistem Budidaya */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Sistem Budidaya
            </label>
            <select
              value={sistemBudidaya}
              onChange={(e) => setSistemBudidaya(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-emerald-500"
            >
              <option value="GAP Standar">GAP Standar Nasional</option>
              <option value="Organik Murni">Organik Murni (Non-Kimia)</option>
              <option value="Semi-Organik">Semi-Organik Presisi</option>
              <option value="Smart Farming IoT">Smart Farming & Sensor IoT</option>
            </select>
          </div>

          {/* Generate Button */}
          <div className="space-y-1.5 flex flex-col justify-end">
            <button
              onClick={handleGenerateSOP}
              disabled={loading}
              className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Generate SOP</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* GENERATED SOP RESULTS VIEW                                         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {sopResult && (
        <div className="space-y-8">
          {/* METRIC BADGES BAR */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                Nomor Registrasi SOP
              </span>
              <p className="text-xs font-mono font-bold text-white truncate">
                {sopResult.sop_code}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-teal-400" />
                Varietas Unggulan
              </span>
              <p className="text-xs font-bold text-white truncate">
                {sopResult.varietas_unggulan.slice(0, 2).join(", ")}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Siklus Tanam
              </span>
              <p className="text-sm font-extrabold text-white">
                {sopResult.total_durasi_hst} <span className="text-xs font-normal text-slate-400">HST</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Target Produksi
              </span>
              <p className="text-sm font-extrabold text-emerald-400">
                {sopResult.estimasi_yield_ton} <span className="text-xs font-normal text-slate-400">Ton</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Kebutuhan Benih
              </span>
              <p className="text-sm font-extrabold text-white">
                {sopResult.total_kebutuhan_benih_kg} <span className="text-xs font-normal text-slate-400">kg</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                Agroklimat
              </span>
              <p className="text-xs font-bold text-white truncate">
                {sopResult.elevasi_mdpl} mdpl • {sopResult.musim}
              </p>
            </div>
          </div>

          {/* AI AGENT STRATEGIC SYNTHESIS CARD */}
          <div className="p-6 rounded-2xl bg-[#090e18] border border-emerald-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">
                  Wawasan & Sintesis Agronomi AI Agent
                </h3>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                DEEPSEEK REASONING ACTIVE
              </span>
            </div>

            <div className="prose prose-invert prose-xs max-w-none text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {sopResult.ai_strategic_insights}
              </ReactMarkdown>
            </div>

            {/* Actionable Checklist */}
            <div className="pt-2 space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Checklist Eksekusi Kunci Lapangan
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {sopResult.ai_actionable_checklist.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="mt-0.5">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* STEP-BY-STEP CULTIVATION PHASES (TIMELINE / GANTT) */}
          <div className="p-6 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Calendar className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">
                  Tahapan Fase Budidaya & Rencana Kerja (SOP Gantt Timeline)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Pilih fase di bawah untuk meninjau instruksi kerja spesifik
              </span>
            </div>

            {/* Phase Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80">
              {sopResult.fase_budidaya.map((phase, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhaseIdx(idx)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                    activePhaseIdx === idx
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <span>{phase.timing}</span>
                  <span className="text-[10px] opacity-80">({phase.phase_name.split(":")[0]})</span>
                </button>
              ))}
            </div>

            {/* Active Phase Details */}
            {sopResult.fase_budidaya[activePhaseIdx] && (
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <h4 className="text-base font-extrabold text-white">
                    {sopResult.fase_budidaya[activePhaseIdx].phase_name}
                  </h4>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                    Rentang Waktu: {sopResult.fase_budidaya[activePhaseIdx].timing}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {sopResult.fase_budidaya[activePhaseIdx].description}
                </p>

                <div className="space-y-2 pt-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                    Instruksi Kerja & Tindakan Teknis:
                  </p>
                  <div className="space-y-2">
                    {sopResult.fase_budidaya[activePhaseIdx].tasks.map((task, tIdx) => (
                      <div
                        key={tIdx}
                        className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-200 flex items-start gap-3"
                      >
                        <span className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PRECISION FERTILIZATION TIMETABLE */}
          <div className="p-6 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <Droplets className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">
                Jadwal Pemupukan Presisi & Kebutuhan Nutrisi ({sopResult.luas_ha} Ha)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Waktu Aplikasi</th>
                    <th className="px-4 py-3">Formula / Jenis Pupuk</th>
                    <th className="px-4 py-3 text-right">Dosis (Kg/Ha)</th>
                    <th className="px-4 py-3 text-right">Total Kebutuhan ({sopResult.luas_ha} Ha)</th>
                    <th className="px-4 py-3">Metode Aplikasi</th>
                    <th className="px-4 py-3">Tujuan Fisiologis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {sopResult.jadwal_pemupukan_presisi.map((f, fIdx) => (
                    <tr key={fIdx} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3 font-bold text-white">{f.timing}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-300">{f.fertilizer}</td>
                      <td className="px-4 py-3 text-right font-mono">{f.dose_kg_ha} kg</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-white bg-slate-900/30">
                        {f.total_dosis_kg} kg
                      </td>
                      <td className="px-4 py-3 text-slate-400">{f.method}</td>
                      <td className="px-4 py-3 text-slate-300">{f.focus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PHT & BOTANICAL PESTICIDES (MODUL M-48) */}
          <div className="p-6 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400">
                <Bug className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">
                  Pengendalian Hama Terpadu (PHT) & Formula Pestisida Nabati Baku (Modul M-48)
                </h3>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 uppercase tracking-wide">
                MODUL M-48 TERINTEGRASI
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sopResult.sop_pht_pestisida_nabati.map((pht, pIdx) => (
                <div
                  key={pIdx}
                  className="p-5 rounded-2xl bg-slate-950/70 border border-rose-500/20 hover:border-rose-500/40 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-rose-400">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <h4 className="text-xs font-bold text-white">{pht.target_pest}</h4>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase">
                        Formula Bahan Nabati Baku:
                      </p>
                      <p className="text-slate-200 font-semibold">{pht.botanical_formula}</p>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 leading-relaxed">
                    <strong className="text-slate-300">Cara Aplikasi:</strong> {pht.application}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PEER-REVIEWED SCIENTIFIC JOURNAL CITATIONS */}
          <div className="p-6 rounded-2xl bg-[#090e18] border border-sky-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-400">
                <BookOpen className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">
                  Rujukan & Sitasi Jurnal Ilmiah Peer-Reviewed Terpercaya
                </h3>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30 uppercase tracking-wide">
                BRIN • IPB • FAO • SPRINGER
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sopResult.referensi_jurnal_ilmiah.map((journal, jIdx) => (
                <div
                  key={jIdx}
                  className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-sky-500/40 transition-all space-y-3 flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20">
                        {journal.year} • {journal.journal.split("(")[0]}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors leading-snug">
                      {journal.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 italic">{journal.authors}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      <strong className="text-emerald-400">Temuan Kunci:</strong> {journal.key_finding}
                    </p>

                    <a
                      href={journal.doi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] text-sky-400 hover:text-sky-300 font-bold transition-colors pt-1"
                    >
                      <span>Buka Sitasi Jurnal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
