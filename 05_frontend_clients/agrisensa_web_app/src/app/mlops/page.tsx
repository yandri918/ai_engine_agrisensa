"use client";

import React, { useState, useEffect } from "react";
import { predictCrop } from "@/lib/api-client";
import { CropPredictionInput, CropPredictionResult } from "@/lib/types";
import {
  FlaskConical,
  Sprout,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  TrendingUp,
  RotateCcw,
  Layers,
  ChevronRight,
  ShieldCheck,
  Award,
  Sliders,
  Scale,
  Cpu,
  Activity,
  Zap,
  Leaf,
  Droplets,
  Thermometer,
  CloudRain,
  Flame,
  ArrowRight,
  Filter,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  Legend,
} from "recharts";

interface ExtendedCropResult extends CropPredictionResult {
  variety?: string;
  all_crops_ranked?: Array<{
    crop: string;
    category: string;
    variety: string;
    score: number;
    yield_potential: string;
    fertilizer: string;
    factor_scores: Record<string, number>;
  }>;
}

export default function MLOpsPage() {
  const [input, setInput] = useState<CropPredictionInput>({
    nitrogen: 85,
    phosphorus: 50,
    potassium: 55,
    temperature: 26.5,
    humidity: 78,
    ph: 6.3,
    rainfall: 160,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtendedCropResult | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [selectedCompareCrop, setSelectedCompareCrop] = useState<string | null>(null);
  const [autoPredict, setAutoPredict] = useState<boolean>(true);

  const presets = [
    { label: "🌾 Padi Sawah Irigasi", n: 85, p: 45, k: 50, ph: 6.2, rain: 220, temp: 27.5, hum: 82 },
    { label: "🌽 Jagung Lahan Kering", n: 110, p: 65, k: 60, ph: 6.5, rain: 130, temp: 28.0, hum: 65 },
    { label: "🌶️ Cabai Dataran Rendah", n: 90, p: 75, k: 85, ph: 6.4, rain: 120, temp: 26.5, hum: 70 },
    { label: "🧅 Bawang Merah Intensif", n: 80, p: 70, k: 70, ph: 6.4, rain: 90, temp: 29.0, hum: 60 },
    { label: "🍈 Melon Inthanon", n: 105, p: 65, k: 95, ph: 6.5, rain: 100, temp: 28.0, hum: 65 },
    { label: "🥔 Kentang Dataran Tinggi", n: 90, p: 80, k: 105, ph: 5.8, rain: 160, temp: 18.5, hum: 80 },
    { label: "☕ Kopi Arabika Specialty", n: 70, p: 40, k: 75, ph: 5.8, rain: 180, temp: 19.5, hum: 80 },
    { label: "🌴 Kelapa Sawit Produktif", n: 120, p: 55, k: 125, ph: 5.2, rain: 240, temp: 28.5, hum: 85 },
  ];

  const categories = ["Semua", "Pangan Pokok", "Hortikultura Sayur", "Buah-buahan", "Perkebunan"];

  const runInference = async (dataToPredict = input) => {
    setLoading(true);
    try {
      const data = await predictCrop(dataToPredict);
      setResult(data as ExtendedCropResult);
      if (!selectedCompareCrop && (data as any)?.all_crops_ranked?.[1]) {
        setSelectedCompareCrop((data as any).all_crops_ranked[1].crop);
      }
    } catch (err) {
      console.error("MLOps inference error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (field: keyof CropPredictionInput, value: number) => {
    const updated = { ...input, [field]: value };
    setInput(updated);
    if (autoPredict) {
      runInference(updated);
    }
  };

  const applyPreset = (p: (typeof presets)[0]) => {
    const newInput = {
      nitrogen: p.n,
      phosphorus: p.p,
      potassium: p.k,
      ph: p.ph,
      rainfall: p.rain,
      temperature: p.temp,
      humidity: p.hum,
    };
    setInput(newInput);
    runInference(newInput);
  };

  useEffect(() => {
    runInference();
  }, []);

  // Filter ranked crops based on selected category tab
  const rankedList = result?.all_crops_ranked || [];
  const filteredCrops = activeCategory === "Semua"
    ? rankedList
    : rankedList.filter((c) => c.category === activeCategory);

  // Compare candidate crop
  const compareCropData = rankedList.find((c) => c.crop === selectedCompareCrop) || rankedList[1] || rankedList[0];

  // Multi-Commodity Radar Chart Data
  const radarComparisonData = [
    {
      subject: "Nitrogen (N)",
      "Kondisi Lahan": Math.min(100, Math.round((input.nitrogen / 140) * 100)),
      "Juara 1 (Rekomendasi)": rankedList[0]?.factor_scores?.nitrogen || 85,
      [compareCropData?.crop ? compareCropData.crop.split(" ")[0] : "Pembanding"]: compareCropData?.factor_scores?.nitrogen || 70,
    },
    {
      subject: "Fosfor (P)",
      "Kondisi Lahan": Math.min(100, Math.round((input.phosphorus / 100) * 100)),
      "Juara 1 (Rekomendasi)": rankedList[0]?.factor_scores?.phosphorus || 80,
      [compareCropData?.crop ? compareCropData.crop.split(" ")[0] : "Pembanding"]: compareCropData?.factor_scores?.phosphorus || 65,
    },
    {
      subject: "Kalium (K)",
      "Kondisi Lahan": Math.min(100, Math.round((input.potassium / 140) * 100)),
      "Juara 1 (Rekomendasi)": rankedList[0]?.factor_scores?.potassium || 88,
      [compareCropData?.crop ? compareCropData.crop.split(" ")[0] : "Pembanding"]: compareCropData?.factor_scores?.potassium || 72,
    },
    {
      subject: "pH Tanah",
      "Kondisi Lahan": Math.min(100, Math.round((input.ph / 8.5) * 100)),
      "Juara 1 (Rekomendasi)": rankedList[0]?.factor_scores?.ph || 95,
      [compareCropData?.crop ? compareCropData.crop.split(" ")[0] : "Pembanding"]: compareCropData?.factor_scores?.ph || 75,
    },
    {
      subject: "Curah Hujan",
      "Kondisi Lahan": Math.min(100, Math.round((input.rainfall / 300) * 100)),
      "Juara 1 (Rekomendasi)": rankedList[0]?.factor_scores?.rainfall || 90,
      [compareCropData?.crop ? compareCropData.crop.split(" ")[0] : "Pembanding"]: compareCropData?.factor_scores?.rainfall || 60,
    },
    {
      subject: "Suhu Udara",
      "Kondisi Lahan": Math.min(100, Math.round((input.temperature / 38) * 100)),
      "Juara 1 (Rekomendasi)": rankedList[0]?.factor_scores?.temperature || 92,
      [compareCropData?.crop ? compareCropData.crop.split(" ")[0] : "Pembanding"]: compareCropData?.factor_scores?.temperature || 80,
    },
  ];

  // SHAP Feature Attribution Data
  const shapChartData = (result?.shap_factors || []).map((f) => ({
    name: f.factor,
    impact: Math.round(f.impact * 100),
    fill: f.impact >= 0.2 ? "#10b981" : f.impact >= 0.15 ? "#38bdf8" : "#f59e0b",
  }));

  return (
    <div className="space-y-8 pb-16 text-slate-100">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 border border-cyan-500/30 shadow-2xl bg-gradient-to-r from-slate-950 via-[#0a1426] to-slate-950 backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide uppercase">
              <FlaskConical className="w-3.5 h-3.5" />
              MLOps Inference Engine & Multi-Commodity Classifier
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Laboratorium AI & Komparasi Multi-Komoditas
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Uji kesesuaian lahan secara real-time terhadap 16+ komoditas pertanian nasional menggunakan ensemble model (LightGBM, XGBoost, CatBoost) dengan fitur Explainable AI (SHAP).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Model v2.4 (Ensemble)</span>
            </div>
            <button
              onClick={() => runInference(input)}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Menganalisis..." : "Jalankan Inferensi"}</span>
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Preset Profil Lahan Cepat:
          </span>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 font-medium transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Multi-Parameter Sliders (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl bg-[#090e18] border border-slate-800 p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Parameter Tanah & Iklim Lahan</h3>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={autoPredict}
                  onChange={(e) => setAutoPredict(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span>Auto-Inferensi</span>
              </label>
            </div>

            {/* Slider 1: Nitrogen */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" /> Nitrogen (N)
                </span>
                <span className="font-mono font-bold text-emerald-400">{input.nitrogen} mg/kg</span>
              </div>
              <input
                type="range"
                min="0"
                max="140"
                value={input.nitrogen}
                onChange={(e) => handleSliderChange("nitrogen", Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0 (Defisit)</span>
                <span>70-100 (Optimal)</span>
                <span>140 (Tinggi)</span>
              </div>
            </div>

            {/* Slider 2: Phosphorus */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400" /> Fosfor (P)
                </span>
                <span className="font-mono font-bold text-amber-400">{input.phosphorus} mg/kg</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={input.phosphorus}
                onChange={(e) => handleSliderChange("phosphorus", Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0</span>
                <span>45-75 (Optimal)</span>
                <span>100</span>
              </div>
            </div>

            {/* Slider 3: Potassium */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-teal-400" /> Kalium (K)
                </span>
                <span className="font-mono font-bold text-teal-400">{input.potassium} mg/kg</span>
              </div>
              <input
                type="range"
                min="0"
                max="140"
                value={input.potassium}
                onChange={(e) => handleSliderChange("potassium", Number(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0</span>
                <span>50-90 (Optimal)</span>
                <span>140</span>
              </div>
            </div>

            {/* Slider 4: pH */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-purple-400" /> Derajat Keasaman (pH)
                </span>
                <span className="font-mono font-bold text-purple-400">{input.ph}</span>
              </div>
              <input
                type="range"
                min="4.0"
                max="8.5"
                step="0.1"
                value={input.ph}
                onChange={(e) => handleSliderChange("ph", Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>4.0 (Asam)</span>
                <span>6.0-6.8 (Ideal)</span>
                <span>8.5 (Alkali)</span>
              </div>
            </div>

            {/* Slider 5: Rainfall */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-sky-400" /> Curah Hujan Bulanan
                </span>
                <span className="font-mono font-bold text-sky-400">{input.rainfall} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="350"
                value={input.rainfall}
                onChange={(e) => handleSliderChange("rainfall", Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0 (Kering)</span>
                <span>120-200 (Sedang)</span>
                <span>350 (Basah)</span>
              </div>
            </div>

            {/* Slider 6 & 7: Temperature & Humidity in 2 cols */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Suhu (°C)</span>
                  <span className="font-mono font-bold text-rose-400">{input.temperature}°C</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="38"
                  step="0.5"
                  value={input.temperature}
                  onChange={(e) => handleSliderChange("temperature", Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Kelembaban (%)</span>
                  <span className="font-mono font-bold text-cyan-400">{input.humidity}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={input.humidity}
                  onChange={(e) => handleSliderChange("humidity", Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Soil Status & Prescription Advice Card */}
          {result && (
            <div className="rounded-2xl bg-[#090e18] border border-emerald-500/30 p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Diagnostik & Remediasi Lahan
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {result.soil_status.ph_category}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {result.soil_status.actionable_advice}
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                <span>Keseimbangan NPK: <strong className="text-emerald-400">{result.soil_status.npk_balance.toUpperCase()}</strong></span>
                <span>pH Target: <strong className="text-white">6.2 - 6.8</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Multi-Commodity Ranking & Comparison Matrix (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Recommendation Winner Card */}
          {result && (
            <div className="relative rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/40 p-6 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500 text-slate-950 shadow-sm">
                    <Award className="w-3.5 h-3.5" /> REKOMENDASI JUARA 1 (OPTIMAL)
                  </span>
                  <h2 className="text-2xl font-extrabold text-white mt-1">
                    {result.recommended_crop}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Varietas Rekomendasi: <strong className="text-slate-200">{result.variety || "Unggul Nasional"}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-emerald-400">{result.confidence}%</span>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Skor Kecocokan</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Potensi Hasil Panen</p>
                  <p className="font-bold text-white mt-0.5">{result.yield_potential || "12 - 18 Ton/Ha"}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Rencana Pemupukan Spesifik</p>
                  <p className="font-medium text-emerald-300 mt-0.5 line-clamp-2">{result.fertilizer_recommendation || "NPK Berimbang + Dolomit"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Multi-Commodity Category Filter & Comparison List */}
          <div className="rounded-2xl bg-[#090e18] border border-slate-800 p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Matriks Kecocokan Multi-Komoditas</h3>
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      activeCategory === cat ? "bg-cyan-500 text-slate-950 font-bold shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Ranked Crops Progress List */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {filteredCrops.map((crop, idx) => {
                const isSelectedForCompare = selectedCompareCrop === crop.crop;
                const isTopWinner = idx === 0 && activeCategory === "Semua";

                return (
                  <div
                    key={crop.crop}
                    onClick={() => setSelectedCompareCrop(crop.crop)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                      isSelectedForCompare
                        ? "bg-cyan-950/40 border-cyan-500 shadow-md"
                        : isTopWinner
                        ? "bg-emerald-950/30 border-emerald-500/50"
                        : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 w-4">#{idx + 1}</span>
                        <h4 className="text-sm font-bold text-white truncate">{crop.crop}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          {crop.category}
                        </span>
                      </div>

                      {/* Suitability Progress Bar */}
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/60">
                        <div
                          className={`h-full rounded-full transition-all ${
                            crop.score >= 85
                              ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                              : crop.score >= 70
                              ? "bg-gradient-to-r from-cyan-500 to-blue-400"
                              : "bg-gradient-to-r from-amber-500 to-rose-400"
                          }`}
                          style={{ width: `${crop.score}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-sm font-extrabold ${
                          crop.score >= 85 ? "text-emerald-400" : crop.score >= 70 ? "text-cyan-400" : "text-amber-400"
                        }`}
                      >
                        {crop.score}%
                      </span>
                      <p className="text-[10px] text-slate-500">
                        {isSelectedForCompare ? "✓ Terpilih di Radar" : "Klik Bandingkan"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Multi-Commodity Head-to-Head Radar Comparison */}
          <div className="rounded-2xl bg-[#090e18] border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Head-to-Head Radar Kesesuaian Lahan</h3>
              </div>
              <span className="text-xs text-cyan-300 font-mono">
                Bandingkan: <strong>{rankedList[0]?.crop.split(" ")[0]}</strong> vs{" "}
                <strong>{compareCropData?.crop.split(" ")[0]}</strong>
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarComparisonData}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" />
                  <Radar name="Kondisi Lahan" dataKey="Kondisi Lahan" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.25} />
                  <Radar name="Juara 1 (Rekomendasi)" dataKey="Juara 1 (Rekomendasi)" stroke="#10b981" fill="#10b981" fillOpacity={0.35} />
                  {compareCropData?.crop && (
                    <Radar
                      name={compareCropData.crop.split(" ")[0]}
                      dataKey={compareCropData.crop.split(" ")[0]}
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.2}
                    />
                  )}
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: 8, color: "#fff" }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Explainable AI (SHAP Feature Importance) */}
          <div className="rounded-2xl bg-[#090e18] border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Explainable AI (SHAP Factor Attribution)</h3>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shapChartData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: 8, color: "#fff" }} formatter={(v: any) => [`${v}%`, "Kontribusi Bobot"]} />
                  <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                    {shapChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              {result?.shap_factors?.map((f, i) => (
                <div key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{f.interpretation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
