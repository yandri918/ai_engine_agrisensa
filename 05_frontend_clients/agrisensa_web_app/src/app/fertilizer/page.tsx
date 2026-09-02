"use client";

import React, { useState, useEffect } from "react";
import {
  FlaskConical,
  Sprout,
  Sparkles,
  Scale,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Layers,
  Leaf,
  Droplets,
  Coins,
  ShieldCheck,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Info,
  Beaker,
  Truck,
  Flame,
  Award,
  Tag,
  DollarSign,
  Edit3,
  Sliders,
  TrendingDown,
  Check,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  PieChart,
  Pie,
  Legend,
} from "recharts";

import { useLanguage } from "@/components/language-context";

interface InorganicFertilizer {
  name: string;
  type: string;
  n_pct: number;
  p_pct: number;
  k_pct: number;
  s_pct?: number;
  mg_pct?: number;
  is_subsidi: boolean;
  subsidi_price_per_kg: number;
  nonsubsidi_price_per_kg: number;
  desc: string;
  color: string;
}

export default function FertilizerPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"combination" | "organic" | "catalog" | "recipes">("combination");
  const [loading, setLoading] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // TAB 1: Combination / Blending Calculator & Custom Pricing State
  // ─────────────────────────────────────────────────────────────────────────
  const [targetN, setTargetN] = useState<number>(100);
  const [targetP, setTargetP] = useState<number>(50);
  const [targetK, setTargetK] = useState<number>(60);
  const [landAreaHa, setLandAreaHa] = useState<number>(1.0);
  const [bufferPct, setBufferPct] = useState<number>(5.0);

  // Pricing mode: 'subsidi' | 'nonsubsidi' | 'custom'
  const [priceMode, setPriceMode] = useState<"subsidi" | "nonsubsidi" | "custom">("subsidi");
  const [compoundChoice, setCompoundChoice] = useState<string>("NPK Phonska Subsidi (15-10-12)");
  const [customPrices, setCustomPrices] = useState<{ [key: string]: number }>({});
  const [combinationResult, setCombinationResult] = useState<any>(null);

  // Catalog State
  const [inorganicCatalog, setInorganicCatalog] = useState<InorganicFertilizer[]>([]);

  const cropPresets = [
    { label: "🌾 Padi Sawah (1 Ha)", n: 90, p: 45, k: 50 },
    { label: "🌽 Jagung Hibrida (1 Ha)", n: 120, p: 60, k: 60 },
    { label: "🌶️ Cabai Merah (1 Ha)", n: 100, p: 80, k: 90 },
    { label: "🧅 Bawang Merah (1 Ha)", n: 80, p: 70, k: 70 },
    { label: "🍈 Melon Golden (1 Ha)", n: 110, p: 70, k: 100 },
  ];

  const applyCropPreset = (p: (typeof cropPresets)[0]) => {
    setTargetN(p.n);
    setTargetP(p.p);
    setTargetK(p.k);
  };

  const fetchInorganicCatalog = async () => {
    try {
      const res = await fetch("/api/fertilizer?type=inorganic");
      if (res.ok) {
        const data = await res.json();
        if (data.fertilizers) {
          setInorganicCatalog(data.fertilizers);
          // initialize custom prices defaults
          const initPrices: { [key: string]: number } = {};
          data.fertilizers.forEach((f: InorganicFertilizer) => {
            initPrices[f.name] = f.is_subsidi ? f.subsidi_price_per_kg : f.nonsubsidi_price_per_kg;
          });
          setCustomPrices(initPrices);
        }
      }
    } catch (err) {
      console.error("Inorganic catalog fetch error:", err);
    }
  };

  const calculateCombination = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/fertilizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "combination",
          payload: {
            target_n_kg: targetN,
            target_p_kg: targetP,
            target_k_kg: targetK,
            land_area_ha: landAreaHa,
            buffer_pct: bufferPct,
            price_mode: priceMode,
            custom_prices: customPrices,
            compound_choice: compoundChoice,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCombinationResult(data);
      }
    } catch (err) {
      console.error("Combination calc error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomPriceChange = (fertName: string, newPrice: number) => {
    setCustomPrices((prev) => ({
      ...prev,
      [fertName]: newPrice,
    }));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // TAB 2: Organic Mix Calculator State
  // ─────────────────────────────────────────────────────────────────────────
  const availableMaterials = [
    "Kotoran Ayam (Murni)",
    "Kotoran Kambing / Domba",
    "Kotoran Sapi",
    "Kotoran Kelinci (Padat)",
    "Guano Kelelawar",
    "Urine Kelinci",
    "Urine Sapi (Fermentasi)",
    "Dedak Padi (Katul Halus)",
    "Sekam Padi (Mentah)",
    "Arang Sekam Padi",
    "Jerami Padi",
    "Hijauan Leguminosa (Gamal / Lamtoro)",
    "Abu Dapur (Kayu Keras)",
    "Cangkang Telur (Tepung)",
    "Kapur Pertanian (Dolomit)",
  ];

  const [selectedMaterials, setSelectedMaterials] = useState<Array<{ material: string; weight_kg: number }>>([
    { material: "Kotoran Sapi", weight_kg: 100 },
    { material: "Dedak Padi (Katul Halus)", weight_kg: 20 },
    { material: "Abu Dapur (Kayu Keras)", weight_kg: 10 },
  ]);

  const [organicResult, setOrganicResult] = useState<any>(null);

  const calculateOrganic = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/fertilizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "organic",
          payload: { items: selectedMaterials },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrganicResult(data);
      }
    } catch (err) {
      console.error("Organic calc error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = (materialName: string) => {
    if (!selectedMaterials.some((m) => m.material === materialName)) {
      setSelectedMaterials([...selectedMaterials, { material: materialName, weight_kg: 10 }]);
    }
  };

  const handleRemoveMaterial = (index: number) => {
    setSelectedMaterials(selectedMaterials.filter((_, i) => i !== index));
  };

  const handleWeightChange = (index: number, val: number) => {
    const updated = [...selectedMaterials];
    updated[index].weight_kg = val;
    setSelectedMaterials(updated);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // TAB 4: Recipes Database State
  // ─────────────────────────────────────────────────────────────────────────
  const [recipes, setRecipes] = useState<any[]>([]);
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>("poc-rotan-super");

  const fetchRecipes = async () => {
    try {
      const res = await fetch("/api/fertilizer?type=recipes");
      if (res.ok) {
        const data = await res.json();
        setRecipes(data.recipes || []);
      }
    } catch (err) {
      console.error("Recipes fetch error:", err);
    }
  };

  useEffect(() => {
    fetchInorganicCatalog();
    calculateOrganic();
    fetchRecipes();
  }, []);

  useEffect(() => {
    calculateCombination();
  }, [priceMode, compoundChoice]);

  return (
    <div className="space-y-8 pb-16 text-slate-100 max-w-7xl mx-auto font-sans">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* HEADER HERO BANNER                                                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 border border-emerald-500/30 shadow-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
              <FlaskConical className="w-3.5 h-3.5" />
              {t("fert_hero_badge", "Nutrient-to-Weight Solver • Subsidi & Non-Subsidi • Custom Pricing")}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {t("fert_hero_title", "Laboratorium Pupuk Majemuk & Formulasi Presisi")}
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              {t("fert_hero_desc", "Kalkulator pemenuhan hara N-P-K terpadu dengan opsi pupuk majemuk (Phonska, Mutiara, Mahkota, Pelangi), komparasi harga subsidi (HET Pemerintah) vs non-subsidi komersial, fitur penyesuaian harga kios daerah, dan racikan organik.")}
            </p>
          </div>

          {/* Quick Tabs */}
          <div className="flex flex-wrap items-center bg-slate-950/90 p-1.5 rounded-xl border border-slate-800 gap-1">
            <button
              onClick={() => setActiveTab("combination")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "combination"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{t("fert_tab_combination", "Pupuk Majemuk & Kombinasi")}</span>
            </button>
            <button
              onClick={() => setActiveTab("catalog")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "catalog"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{t("fert_tab_catalog", "Katalog & Harga Pupuk")}</span>
            </button>
            <button
              onClick={() => setActiveTab("organic")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "organic"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>{t("fert_tab_organic", "Kalkulator Organik")}</span>
            </button>
            <button
              onClick={() => setActiveTab("recipes")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "recipes"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t("fert_tab_recipes", "SOP Resep POC")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: COMPOUND & COMBINATION BLENDING CALCULATOR                  */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "combination" && (
        <div className="space-y-8">
          {/* Main Control Panel */}
          <div className="p-6 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <Sliders className="w-4 h-4" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  Target Hara & Konfigurasi Pupuk Majemuk
                </h2>
              </div>

              {/* Price Mode Selector */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Skema Harga:</span>
                <button
                  onClick={() => setPriceMode("subsidi")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    priceMode === "subsidi"
                      ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  🟢 Subsidi (HET)
                </button>
                <button
                  onClick={() => setPriceMode("nonsubsidi")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    priceMode === "nonsubsidi"
                      ? "bg-sky-500 text-slate-950 shadow-sm shadow-sky-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  🔵 Non-Subsidi (Pasar)
                </button>
                <button
                  onClick={() => setPriceMode("custom")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    priceMode === "custom"
                      ? "bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  ⚙️ Kustom Sendiri
                </button>
              </div>
            </div>

            {/* Presets Bar */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                Preset Kebutuhan Hara Komoditas Standar:
              </label>
              <div className="flex flex-wrap gap-2">
                {cropPresets.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyCropPreset(p)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-all hover:border-emerald-500/40"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Parameters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Target N */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-blue-400 uppercase tracking-wide">
                  Target N (kg/ha)
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={targetN}
                  onChange={(e) => setTargetN(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Target P */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">
                  Target P₂O₅ (kg/ha)
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={targetP}
                  onChange={(e) => setTargetP(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Target K */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                  Target K₂O (kg/ha)
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={targetK}
                  onChange={(e) => setTargetK(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Luas Lahan */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                  Luas Lahan (Ha)
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="500"
                  step="0.1"
                  value={landAreaHa}
                  onChange={(e) => setLandAreaHa(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Pilihan Pupuk Majemuk */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-purple-400 uppercase tracking-wide">
                  Pilihan Pupuk Majemuk
                </label>
                <select
                  value={compoundChoice}
                  onChange={(e) => setCompoundChoice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-purple-500"
                >
                  <option value="NPK Phonska Subsidi (15-10-12)">NPK Phonska (15-10-12) [Subsidi]</option>
                  <option value="NPK Mutiara 16-16-16 (Komersial)">NPK Mutiara (16-16-16) [Komersial]</option>
                  <option value="NPK Phonska Plus 15-15-15+Zn">NPK Phonska Plus (15-15-15+Zn)</option>
                  <option value="NPK Mahkota 13-6-27 (Buah/Sawit)">NPK Mahkota (13-6-27) [Buah/Sawit]</option>
                  <option value="NPK Pelangi 20-10-10 (Vegetatif)">NPK Pelangi (20-10-10) [Vegetatif]</option>
                  <option value="NPK Formula Khusus / Kakao Subsidi (14-12-16+4Mg)">NPK Khusus Kakao (14-12-16+4Mg)</option>
                </select>
              </div>

              {/* Action Button */}
              <div className="space-y-1.5 flex flex-col justify-end">
                <button
                  onClick={calculateCombination}
                  disabled={loading}
                  className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Hitung Formulasi</span>
                </button>
              </div>
            </div>

            {/* Custom Pricing Live Adjustment Drawer (Visible if custom mode) */}
            {priceMode === "custom" && (
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Edit3 className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase">
                      Penyesuaian Harga Kustom per Kg (Toko Tani / Kios Lokal)
                    </h3>
                  </div>
                  <span className="text-[10px] text-amber-300 font-medium">
                    Ketik harga riil di wilayah Anda untuk kalkulasi akurat
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Object.keys(customPrices).slice(0, 6).map((fert) => (
                    <div key={fert} className="space-y-1 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                      <p className="text-[10px] font-bold text-slate-300 truncate">{fert}</p>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-slate-500">Rp</span>
                        <input
                          type="number"
                          value={customPrices[fert] || 0}
                          onChange={(e) => handleCustomPriceChange(fert, Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-amber-300 font-bold focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3 SCENARIO COMPARISON CARDS */}
          {combinationResult?.options && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {combinationResult.options.map((opt: any, oIdx: number) => (
                <div
                  key={oIdx}
                  className={`p-6 rounded-2xl border shadow-xl flex flex-col justify-between space-y-6 transition-all ${
                    oIdx === 0
                      ? "bg-[#090e18] border-purple-500/40 hover:border-purple-500/70"
                      : oIdx === 1
                      ? "bg-[#090e18] border-blue-500/40 hover:border-blue-500/70"
                      : "bg-[#090e18] border-emerald-500/40 hover:border-emerald-500/70"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Option Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 uppercase">
                          {opt.category}
                        </span>
                        <h3 className="text-sm font-bold text-white pt-1">{opt.name}</h3>
                      </div>
                    </div>

                    {/* Total Cost Badge */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Total Biaya ({landAreaHa} Ha):</span>
                        <span className="text-lg font-extrabold text-emerald-400 font-mono">
                          Rp {opt.total_cost_rp.toLocaleString("id-ID")}
                        </span>
                      </div>

                      {/* Subsidy Savings Indicator */}
                      {opt.savings_subsidi_rp > 0 && (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                          <span className="text-slate-400 flex items-center gap-1">
                            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                            Hemat Skema Subsidi:
                          </span>
                          <span className="font-bold text-emerald-400">
                            Rp {opt.savings_subsidi_rp.toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Breakdown Table */}
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                        Komposisi Karung & Kebutuhan:
                      </p>
                      <div className="space-y-1.5">
                        {opt.items.map((item: any, iIdx: number) => (
                          <div
                            key={iIdx}
                            className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs flex items-center justify-between text-slate-300"
                          >
                            <div>
                              <p className="font-bold text-white text-[11px]">{item.fertilizer}</p>
                              <p className="text-[10px] text-slate-400">
                                {item.weight_kg} kg • <strong className="text-slate-200">{item.sacks_50kg} karung (50kg)</strong>
                              </p>
                            </div>
                            <div className="text-right font-mono text-[11px]">
                              <p className="font-bold text-slate-200">Rp {item.cost_rp.toLocaleString("id-ID")}</p>
                              <p className="text-[10px] text-slate-500">@Rp {item.price_per_kg}/kg</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pros & Agronomy Advantage */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase">Keunggulan Agronomi:</p>
                    <p className="text-[11px] leading-relaxed">{opt.pros}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: COMPLETE FERTILIZER CATALOG & SUBSIDY PRICE MANAGER         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Tag className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">
                  Katalog & Standar Harga Pupuk Tunggal & Majemuk (Subsidi HET & Komersial)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Pemerintah RI Permentan No. 01/2024 & Harga Pasar Terkini
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Nama Pupuk</th>
                    <th className="px-4 py-3">Tipe</th>
                    <th className="px-4 py-3">Kandungan Hara (N-P-K)</th>
                    <th className="px-4 py-3">Status Subsidi</th>
                    <th className="px-4 py-3 text-right">Harga Subsidi (HET)</th>
                    <th className="px-4 py-3 text-right">Harga Non-Subsidi</th>
                    <th className="px-4 py-3 text-right">Harga Kustom Anda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {inorganicCatalog.map((f, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: f.color }}
                          />
                          <span>{f.name}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-normal pl-4.5">{f.desc}</p>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-400">{f.type}</td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-300">
                        {f.n_pct}-{f.p_pct}-{f.k_pct}
                        {f.s_pct ? `+${f.s_pct}S` : ""}
                        {f.mg_pct ? `+${f.mg_pct}Mg` : ""}
                      </td>
                      <td className="px-4 py-3">
                        {f.is_subsidi ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
                            <Check className="w-3 h-3" />
                            Bersubsidi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold uppercase">
                            Non-Subsidi
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                        Rp {f.subsidi_price_per_kg.toLocaleString("id-ID")}/kg
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-300">
                        Rp {f.nonsubsidi_price_per_kg.toLocaleString("id-ID")}/kg
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 font-mono">
                          <span className="text-slate-500 text-[10px]">Rp</span>
                          <input
                            type="number"
                            value={customPrices[f.name] ?? (f.is_subsidi ? f.subsidi_price_per_kg : f.nonsubsidi_price_per_kg)}
                            onChange={(e) => handleCustomPriceChange(f.name, Number(e.target.value))}
                            className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-right text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: ORGANIC FERTILIZER MIX CALCULATOR                           */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "organic" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input Selection */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Leaf className="w-4 h-4" />
                  <h3 className="text-sm font-bold uppercase text-white">Racikan Bahan Baku Organik</h3>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  {selectedMaterials.length} Bahan Terpilih
                </span>
              </div>

              {/* Selected Ingredients List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {selectedMaterials.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-white">{item.material}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={item.weight_kg}
                        onChange={(e) => handleWeightChange(idx, Number(e.target.value))}
                        className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-right font-mono focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-slate-400 text-[11px]">kg</span>
                      <button
                        onClick={() => handleRemoveMaterial(idx)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Material Dropdown */}
              <div className="pt-2 border-t border-slate-800/80 flex gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddMaterial(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  defaultValue=""
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="" disabled>
                    + Tambah Bahan Baku Ilmiah...
                  </option>
                  {availableMaterials.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                <button
                  onClick={calculateOrganic}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shrink-0"
                >
                  {loading ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : "Hitung NPK"}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Results View */}
          <div className="lg:col-span-7 space-y-4">
            {organicResult && (
              <div className="p-6 rounded-2xl bg-[#090e18] border border-emerald-500/30 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">
                      Hasil Analisis Formulasi Organik
                    </span>
                    <h3 className="text-xl font-extrabold text-white">
                      NPK {organicResult.npk_composition}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Total Berat Campuran</p>
                    <p className="text-lg font-mono font-extrabold text-emerald-400">
                      {organicResult.total_weight_kg} kg
                    </p>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-center">
                    <span className="text-[10px] text-blue-400 font-bold uppercase">Nitrogen (N)</span>
                    <p className="text-base font-extrabold text-white">{organicResult.metrics.n_percent}%</p>
                    <p className="text-[10px] text-slate-500 font-mono">({organicResult.metrics.total_n_kg} kg)</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-center">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Fosfor (P)</span>
                    <p className="text-base font-extrabold text-white">{organicResult.metrics.p_percent}%</p>
                    <p className="text-[10px] text-slate-500 font-mono">({organicResult.metrics.total_p_kg} kg)</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-center">
                    <span className="text-[10px] text-amber-400 font-bold uppercase">Kalium (K)</span>
                    <p className="text-base font-extrabold text-white">{organicResult.metrics.k_percent}%</p>
                    <p className="text-[10px] text-slate-500 font-mono">({organicResult.metrics.total_k_kg} kg)</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-center">
                    <span className="text-[10px] text-purple-400 font-bold uppercase">C/N Rasio</span>
                    <p className="text-base font-extrabold text-white">{organicResult.metrics.estimated_cn_ratio}</p>
                    <p className="text-[10px] text-slate-500">Estimasi</p>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Diagnosa & Karakteristik Racikan:
                  </h4>
                  <div className="space-y-2">
                    {organicResult.recommendations.map((rec: string, rIdx: number) => (
                      <div
                        key={rIdx}
                        className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 4: ENCYCLOPEDIA OF ORGANIC RECIPES (SOP)                       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "recipes" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="p-6 rounded-2xl bg-[#090e18] border border-slate-800 hover:border-emerald-500/40 shadow-xl transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 uppercase">
                      {recipe.type} • {recipe.phase}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{recipe.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{recipe.description}</p>

                  {/* Ingredients */}
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                      Bahan Utama:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {recipe.ingredients.map((ing: any, iIdx: number) => (
                        <div
                          key={iIdx}
                          className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300 flex justify-between"
                        >
                          <span className="truncate pr-1">{ing.item}</span>
                          <span className="font-bold text-emerald-400 shrink-0">{ing.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <p className="text-[11px] text-slate-300">
                    <strong className="text-emerald-400">Ciri Keberhasilan:</strong> {recipe.success_indicators}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
