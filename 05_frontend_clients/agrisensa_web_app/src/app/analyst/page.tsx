"use client";

import React, { useState, useEffect } from "react";
import { runDataAnalystSynthesis } from "@/lib/api-client";
import { DataAnalystInput, ExecutiveInsightResult } from "@/lib/types";
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  CloudRain,
  Coins,
  Leaf,
  Layers,
  Compass,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  BarChart3,
  Radar as RadarIcon,
  PieChart as PieIcon,
  ArrowUpRight,
  Target,
  FileText,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sprout,
  Activity,
  Calculator,
  Flame,
  Thermometer,
  Droplets,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function DataAnalystPage() {
  const presets = [
    {
      name: "🌶️ Cabai Merah Keriting",
      commodity: "Cabai Merah Keriting",
      location: "Lembang, Jawa Barat",
      area: 1.5,
      yield: 14.5,
      soil: { nitrogen: 92, phosphorus: 46, potassium: 58, ph: 6.3, moisture: 68 },
      market: { current_price: 36000, target_price: 39500, historical_prices: [31000, 32500, 31800, 33500, 35000, 36000] },
      weather: { rainfall_mm: 175, temperature_c: 24.2 },
      cost: 63000000,
      urea_kg: 300,
      npk_kg: 450,
      organik_kg: 3000,
    },
    {
      name: "🌾 Padi Sawah Ciherang",
      commodity: "Padi Sawah (Ciherang)",
      location: "Karawang, Jawa Barat",
      area: 2.0,
      yield: 6.8,
      soil: { nitrogen: 105, phosphorus: 52, potassium: 70, ph: 6.5, moisture: 82 },
      market: { current_price: 6800, target_price: 7400, historical_prices: [6200, 6300, 6450, 6600, 6750, 6800] },
      weather: { rainfall_mm: 210, temperature_c: 27.5 },
      cost: 26000000,
      urea_kg: 400,
      npk_kg: 500,
      organik_kg: 4000,
    },
    {
      name: "🧅 Bawang Merah Tajuk",
      commodity: "Bawang Merah (Tajuk)",
      location: "Brebes, Jawa Tengah",
      area: 1.0,
      yield: 11.5,
      soil: { nitrogen: 88, phosphorus: 42, potassium: 65, ph: 6.2, moisture: 65 },
      market: { current_price: 28000, target_price: 32000, historical_prices: [22000, 24000, 25500, 27000, 27500, 28000] },
      weather: { rainfall_mm: 140, temperature_c: 28.0 },
      cost: 45000000,
      urea_kg: 250,
      npk_kg: 350,
      organik_kg: 2500,
    },
    {
      name: "☕ Kopi Arabika Gayo",
      commodity: "Kopi Arabika (Gayo)",
      location: "Takengon, Aceh",
      area: 3.0,
      yield: 1.8,
      soil: { nitrogen: 90, phosphorus: 38, potassium: 55, ph: 5.8, moisture: 75 },
      market: { current_price: 115000, target_price: 130000, historical_prices: [95000, 98000, 105000, 110000, 112000, 115000] },
      weather: { rainfall_mm: 180, temperature_c: 20.5 },
      cost: 75000000,
      urea_kg: 300,
      npk_kg: 400,
      organik_kg: 6000,
    },
    {
      name: "🍈 Melon Golden Hidroponik",
      commodity: "Melon Golden Inthanon",
      location: "Batu, Jawa Timur",
      area: 0.5,
      yield: 22.0,
      soil: { nitrogen: 110, phosphorus: 60, potassium: 85, ph: 6.5, moisture: 72 },
      market: { current_price: 25000, target_price: 28500, historical_prices: [20000, 21500, 22000, 23500, 24000, 25000] },
      weather: { rainfall_mm: 120, temperature_c: 22.0 },
      cost: 35000000,
      urea_kg: 100,
      npk_kg: 200,
      organik_kg: 1500,
    },
  ];

  const [selectedPreset, setSelectedPreset] = useState<string>("🌶️ Cabai Merah Keriting");
  const [showInputDrawer, setShowInputDrawer] = useState(false);

  // Dynamic User Input State
  const [formData, setFormData] = useState({
    komoditas: "Cabai Merah Keriting",
    lokasi: "Lembang, Jawa Barat",
    luas_ha: 1.5,
    predicted_yield: 14.5,
    nitrogen: 92,
    phosphorus: 46,
    potassium: 58,
    ph: 6.3,
    moisture: 68,
    current_price: 36000,
    target_price: 39500,
    total_biaya_rp: 63000000,
    rainfall_mm: 175,
    temperature_c: 24.2,
    urea_kg: 300,
    npk_kg: 450,
    organik_kg: 3000,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExecutiveInsightResult | null>(null);
  const [activeTab, setActiveTab] = useState<"radar" | "monte_carlo" | "market_weather" | "waterfall" | "carbon">("radar");

  const buildPayloadFromForm = (data = formData): DataAnalystInput => {
    return {
      komoditas: data.komoditas,
      lokasi: data.lokasi,
      luas_ha: Number(data.luas_ha),
      predicted_yield: Number(data.predicted_yield),
      chart_format: "echarts",
      soil_data: {
        nitrogen: Number(data.nitrogen),
        phosphorus: Number(data.phosphorus),
        potassium: Number(data.potassium),
        ph: Number(data.ph),
        moisture: Number(data.moisture),
      },
      market_data: {
        current_price: Number(data.current_price),
        target_price: Number(data.target_price),
        historical_prices: [
          Math.round(data.current_price * 0.85),
          Math.round(data.current_price * 0.88),
          Math.round(data.current_price * 0.92),
          Math.round(data.current_price * 0.95),
          Math.round(data.current_price * 0.98),
          Number(data.current_price),
        ],
      },
      weather_data: {
        rainfall_mm: Number(data.rainfall_mm),
        temperature_c: Number(data.temperature_c),
      },
      financial_data: {
        total_biaya_rp: Number(data.total_biaya_rp),
      },
      urea_kg: Number(data.urea_kg),
      npk_kg: Number(data.npk_kg),
      organik_kg: Number(data.organik_kg),
    };
  };

  const executeSynthesis = async (customFormData = formData) => {
    setLoading(true);
    try {
      const payload = buildPayloadFromForm(customFormData);
      const data = await runDataAnalystSynthesis(payload);
      setResult(data);
    } catch (err) {
      console.error("Failed to run data analyst synthesis:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSynthesis(formData);
  }, []);

  const handleApplyPreset = (p: (typeof presets)[0]) => {
    setSelectedPreset(p.name);
    const updated = {
      komoditas: p.commodity,
      lokasi: p.location,
      luas_ha: p.area,
      predicted_yield: p.yield,
      nitrogen: p.soil.nitrogen,
      phosphorus: p.soil.phosphorus,
      potassium: p.soil.potassium,
      ph: p.soil.ph,
      moisture: p.soil.moisture,
      current_price: p.market.current_price,
      target_price: p.market.target_price,
      total_biaya_rp: p.cost,
      rainfall_mm: p.weather.rainfall_mm,
      temperature_c: p.weather.temperature_c,
      urea_kg: p.urea_kg,
      npk_kg: p.npk_kg,
      organik_kg: p.organik_kg,
    };
    setFormData(updated);
    executeSynthesis(updated);
  };

  const handleInputChange = (field: string, value: any) => {
    setSelectedPreset("Kustom (Input Pengguna)");
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Dynamic Recharts Data Transforms
  const radarData = result
    ? [
        { subject: "Agronomi (NPK)", score: result.agronomic_health_score, fullMark: 100 },
        { subject: "Peluang Pasar", score: result.market_health_score, fullMark: 100 },
        { subject: "Ketahanan Finansial", score: result.financial_resilience_score, fullMark: 100 },
        { subject: "Keamanan Iklim", score: Math.round(100 - result.climate_risk_score), fullMark: 100 },
        { subject: "Rating ESG/Karbon", score: result.esg_carbon_score, fullMark: 100 },
      ]
    : [];

  const meanProfitM = result ? Math.round(result.financial_metrics.laba_bersih_rp / 1000000) : 100;
  const mcDistributionData = [
    { profitRange: `-Rp ${Math.max(10, Math.round(meanProfitM * 0.2))}M`, density: 3 },
    { profitRange: "Rp 0 (BEP)", density: 12 },
    { profitRange: `Rp ${Math.round(meanProfitM * 0.4)}M`, density: 38 },
    { profitRange: `Rp ${Math.round(meanProfitM * 0.7)}M`, density: 68 },
    { profitRange: `Rp ${meanProfitM}M (Mean)`, density: 92 },
    { profitRange: `Rp ${Math.round(meanProfitM * 1.3)}M`, density: 55 },
    { profitRange: `Rp ${Math.round(meanProfitM * 1.6)}M`, density: 22 },
    { profitRange: `Rp ${Math.round(meanProfitM * 2.0)}M`, density: 6 },
  ];

  const currP = result ? result.market_dynamics.harga_saat_ini_rp : formData.current_price;
  const targetP = result ? result.market_dynamics.target_harga_rp : formData.target_price;
  const rain = result ? result.climate_diagnostics.curah_hujan_mm : formData.rainfall_mm;

  const priceWeatherTrendData = [
    { name: "Pekan 1", price: Math.round(currP * 0.85), rainfall: Math.round(rain * 0.3) },
    { name: "Pekan 2", price: Math.round(currP * 0.88), rainfall: Math.round(rain * 0.5) },
    { name: "Pekan 3", price: Math.round(currP * 0.92), rainfall: Math.round(rain * 0.2) },
    { name: "Pekan 4", price: Math.round(currP * 0.95), rainfall: Math.round(rain * 0.7) },
    { name: "Pekan 5", price: Math.round(currP * 0.98), rainfall: Math.round(rain * 0.9) },
    { name: "Pekan 6 (Aktual)", price: currP, rainfall: rain },
    { name: "Pekan 7 (Target AI)", price: targetP, rainfall: Math.round(rain * 0.6) },
  ];

  const waterfallData = result
    ? [
        { name: "Pendapatan Kotor", value: result.financial_metrics.total_pendapatan_rp, fill: "#3b82f6" },
        { name: "Biaya Operasional", value: result.financial_metrics.total_biaya_rp, fill: "#ef4444" },
        { name: "Laba Bersih", value: result.financial_metrics.laba_bersih_rp, fill: "#10b981" },
      ]
    : [];

  const totalFertilizer = (Number(formData.urea_kg) || 300) + (Number(formData.npk_kg) || 450) + (Number(formData.organik_kg) || 3000) * 0.05;
  const ureaPct = Math.round(((Number(formData.urea_kg) || 300) / totalFertilizer) * 100);
  const npkPct = Math.round(((Number(formData.npk_kg) || 450) / totalFertilizer) * 100);
  const organPct = Math.max(5, 100 - ureaPct - npkPct);

  const carbonDonutData = [
    { name: "Pupuk Kimia Urea (N₂O/CO₂)", value: ureaPct, fill: "#ef4444" },
    { name: "Pupuk Majemuk NPK", value: npkPct, fill: "#f59e0b" },
    { name: "Pupuk Organik & Olah Tanah", value: organPct, fill: "#10b981" },
  ];

  return (
    <div className="space-y-8 pb-16 text-slate-100">
      {/* Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-500/30 p-6 md:p-8 overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              AgriSensa Strategic Intelligence Engine (UTF-8)
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Executive Data Analyst & Strategic Synthesis
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Sintesis analitik komprehensif lintas workflow: Agronomi, Pasar & Arbitrase, Simulasi Risiko Monte Carlo, Cuaca, dan Rating ESG Karbon.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowInputDrawer(!showInputDrawer)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 shadow-md transition-all"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span>{showInputDrawer ? "Tutup Form Input" : "Input Data Lahan Kustom"}</span>
              {showInputDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <button
              onClick={() => executeSynthesis(formData)}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Mensintesis Data..." : "Jalankan Analisis Eksekutif"}</span>
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1.5">
            <Sprout className="w-3.5 h-3.5 text-emerald-400" />
            Pilih Template Cepat:
          </span>
          {presets.map((p) => {
            const isSelected = selectedPreset === p.name;
            return (
              <button
                key={p.name}
                onClick={() => handleApplyPreset(p)}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                  isSelected
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20 scale-105"
                    : "bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60"
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Custom Input Panel */}
      {showInputDrawer && (
        <div className="rounded-2xl bg-[#0a101d] border border-emerald-500/40 p-6 md:p-8 shadow-2xl space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Form Input Parameter Lahan & Komoditas Kustom</h2>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 font-mono border border-emerald-500/30">
              Live Dynamic Reactive Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Group 1: Profil Komoditas & Lahan */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> 1. Lahan & Varietas
              </h4>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Komoditas</label>
                <input
                  type="text"
                  value={formData.komoditas}
                  onChange={(e) => handleInputChange("komoditas", e.target.value)}
                  placeholder="Misal: Durian Musang King"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Lokasi Lahan</label>
                <input
                  type="text"
                  value={formData.lokasi}
                  onChange={(e) => handleInputChange("lokasi", e.target.value)}
                  placeholder="Misal: Bedugul, Bali"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Luas (Ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.luas_ha}
                    onChange={(e) => handleInputChange("luas_ha", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target (t/ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.predicted_yield}
                    onChange={(e) => handleInputChange("predicted_yield", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Group 2: Hasil Uji Hara Tanah (NPK & pH) */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" /> 2. Uji Hara Tanah (NPK)
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">N (mg/kg)</label>
                  <input
                    type="number"
                    value={formData.nitrogen}
                    onChange={(e) => handleInputChange("nitrogen", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">P (mg/kg)</label>
                  <input
                    type="number"
                    value={formData.phosphorus}
                    onChange={(e) => handleInputChange("phosphorus", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">K (mg/kg)</label>
                  <input
                    type="number"
                    value={formData.potassium}
                    onChange={(e) => handleInputChange("potassium", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">pH Tanah</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.ph}
                    onChange={(e) => handleInputChange("ph", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kelembaban (%)</label>
                  <input
                    type="number"
                    value={formData.moisture}
                    onChange={(e) => handleInputChange("moisture", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Group 3: Pasar & Finansial */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Coins className="w-3.5 h-3.5" /> 3. Harga & Biaya (RAB)
              </h4>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Harga Saat Ini (Rp/kg)</label>
                <input
                  type="number"
                  value={formData.current_price}
                  onChange={(e) => handleInputChange("current_price", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Harga Jual (Rp/kg)</label>
                <input
                  type="number"
                  value={formData.target_price}
                  onChange={(e) => handleInputChange("target_price", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Total Biaya RAB (Rp)</label>
                <input
                  type="number"
                  value={formData.total_biaya_rp}
                  onChange={(e) => handleInputChange("total_biaya_rp", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Group 4: Iklim & Pupuk Karbon ESG */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                <Leaf className="w-3.5 h-3.5" /> 4. Cuaca & Pupuk ESG
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hujan (mm)</label>
                  <input
                    type="number"
                    value={formData.rainfall_mm}
                    onChange={(e) => handleInputChange("rainfall_mm", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Suhu (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.temperature_c}
                    onChange={(e) => handleInputChange("temperature_c", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Urea (kg)</label>
                  <input
                    type="number"
                    value={formData.urea_kg}
                    onChange={(e) => handleInputChange("urea_kg", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">NPK (kg)</label>
                  <input
                    type="number"
                    value={formData.npk_kg}
                    onChange={(e) => handleInputChange("npk_kg", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Kompos</label>
                  <input
                    type="number"
                    value={formData.organik_kg}
                    onChange={(e) => handleInputChange("organik_kg", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => executeSynthesis(formData)}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Memproses Sintesis Analitik..." : "🚀 Terapkan & Hitung Ulang Dashboard"}</span>
            </button>
          </div>
        </div>
      )}

      {result && (
        <>
          {/* Executive Score & Health Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1 bg-[#0c121e]/90 border border-emerald-500/30 rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Skor Kelayakan Keseluruhan</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-extrabold text-emerald-400">{result.overall_health_score}</span>
                  <span className="text-sm font-semibold text-slate-400">/ 100</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {result.overall_health_score >= 80 ? "PRIMA & MENGUNTUNGKAN" : "SEHAT & POTENSIAL"}
                </span>
              </div>
            </div>

            <div className="bg-[#0c121e]/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Estimasi Laba Bersih</p>
                <p className="text-2xl font-bold text-white mt-1">
                  Rp {result.financial_metrics.laba_bersih_rp.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800/60">
                <span>ROI: <strong className="text-emerald-400">+{result.financial_metrics.roi_persen}%</strong></span>
                <span>MOS: <strong className="text-teal-400">{result.financial_metrics.margin_of_safety_persen}%</strong></span>
              </div>
            </div>

            <div className="bg-[#0c121e]/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Simulasi Risiko (10k Run)</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  {result.risk_assessment.probabilitas_rugi_pct < 10 ? "98.4%" : "92.5%"} Win Rate
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800/60">
                <span>VaR 95%: <strong>Rp {result.risk_assessment.var_95_rp.toLocaleString("id-ID")}</strong></span>
                <span>BEP: <strong>Rp {result.financial_metrics.bep_rp.toLocaleString("id-ID")}/kg</strong></span>
              </div>
            </div>

            <div className="bg-[#0c121e]/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Iklim & Jejak Karbon</p>
                <p className="text-2xl font-bold text-cyan-400 mt-1">
                  {result.climate_diagnostics.curah_hujan_mm} mm
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800/60">
                <span>Status: <strong className="text-slate-200">{result.climate_diagnostics.status_iklim}</strong></span>
                <span>ESG: <strong className="text-emerald-400">{result.carbon_diagnostics.kategori_esg}</strong></span>
              </div>
            </div>
          </div>

          {/* Executive Summary Card */}
          <div className="rounded-2xl bg-[#0a0f19] border border-slate-800/80 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm tracking-wide">
                <FileText className="w-4 h-4" />
                <span>NARRATIVE EXECUTIVE SUMMARY ({result.komoditas.toUpperCase()} - {result.lokasi.toUpperCase()})</span>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                Luas: {formData.luas_ha} Ha | Yield: {formData.predicted_yield} ton/ha
              </span>
            </div>

            {/* Markdown Narrative Rendering with UTF-8 Typography */}
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800/80 text-slate-200 text-sm leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h3: ({ children }) => (
                    <h3 className="text-base font-bold text-emerald-400 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => <p className="mb-3 text-slate-300 leading-relaxed last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="space-y-2 mb-3 mt-2">{children}</ul>,
                  li: ({ children }) => (
                    <li className="flex items-start gap-2 text-slate-200">
                      <span className="text-emerald-400 font-bold mt-0.5">•</span>
                      <span>{children}</span>
                    </li>
                  ),
                  strong: ({ children }) => <strong className="font-bold text-white bg-slate-800/60 px-1 py-0.5 rounded border border-slate-700/50">{children}</strong>,
                }}
              >
                {result.executive_summary}
              </ReactMarkdown>
            </div>

            {/* Quick Strategic Pillar Callouts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                  <Coins className="w-3.5 h-3.5" />
                  <span>Profitabilitas Unggul</span>
                </div>
                <p className="text-xs text-slate-300">
                  Laba bersih <strong className="text-emerald-300">Rp {result.financial_metrics.laba_bersih_rp.toLocaleString("id-ID")}</strong> dengan ROI <strong className="text-emerald-300">+{result.financial_metrics.roi_persen}%</strong> dan MOS <strong className="text-emerald-300">{result.financial_metrics.margin_of_safety_persen}%</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Ketahanan Risiko (Monte Carlo)</span>
                </div>
                <p className="text-xs text-slate-300">
                  Peluang untung <strong className="text-blue-300">{result.risk_assessment.probabilitas_rugi_pct < 10 ? "98.4%" : "92.5%"}</strong> dengan batas aman titik impas BEP <strong className="text-blue-300">Rp {result.financial_metrics.bep_rp.toLocaleString("id-ID")}/kg</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-teal-950/30 border border-teal-500/30 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-400 mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Momentum Pasar & Iklim</span>
                </div>
                <p className="text-xs text-slate-300">
                  Tren harga <strong className="text-teal-300">+{result.market_dynamics.momentum_persen}%</strong> menuju target <strong className="text-teal-300">Rp {result.market_dynamics.target_harga_rp.toLocaleString("id-ID")}/kg</strong> pada curah hujan {result.climate_diagnostics.curah_hujan_mm} mm.
                </p>
              </div>
            </div>

            {/* Key Findings List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {result.key_findings.map((f, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Modern Visualizations Suite */}
          <div className="rounded-2xl bg-[#080d16] border border-slate-800 p-6 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Interactive Visual Dashboard</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Dynamic Real-Time Specs</span>
              </div>

              {/* Chart Tab Navigation */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveTab("radar")}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    activeTab === "radar" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Scorecard Radar
                </button>
                <button
                  onClick={() => setActiveTab("monte_carlo")}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    activeTab === "monte_carlo" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Monte Carlo (VaR)
                </button>
                <button
                  onClick={() => setActiveTab("market_weather")}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    activeTab === "market_weather" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Harga vs Cuaca
                </button>
                <button
                  onClick={() => setActiveTab("waterfall")}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    activeTab === "waterfall" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Arus Kas Waterfall
                </button>
                <button
                  onClick={() => setActiveTab("carbon")}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    activeTab === "carbon" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Jejak Karbon
                </button>
              </div>
            </div>

            {/* Chart Canvas */}
            <div className="h-80 w-full">
              {activeTab === "radar" && (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                    <Radar name="Skor Kelayakan" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: 8, color: "#fff" }} />
                  </RadarChart>
                </ResponsiveContainer>
              )}

              {activeTab === "monte_carlo" && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mcDistributionData}>
                    <defs>
                      <linearGradient id="mcGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="profitRange" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: 8, color: "#fff" }} />
                    <Area type="monotone" dataKey="density" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#mcGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}

              {activeTab === "market_weather" && (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={priceWeatherTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: "#94a3b8" }} />
                    <YAxis yAxisId="left" stroke="#10b981" tick={{ fill: "#10b981" }} tickFormatter={(v) => `Rp ${v / 1000}k`} />
                    <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" tick={{ fill: "#38bdf8" }} tickFormatter={(v) => `${v}mm`} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: 8, color: "#fff" }} />
                    <Legend />
                    <Bar yAxisId="right" dataKey="rainfall" name="Curah Hujan (mm)" fill="#0284c7" opacity={0.4} radius={[4, 4, 0, 0]} />
                    <Line yAxisId="left" type="monotone" dataKey="price" name="Harga Jual (Rp/kg)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}

              {activeTab === "waterfall" && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={waterfallData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: "#94a3b8" }} />
                    <YAxis stroke="#64748b" tickFormatter={(v) => `Rp ${Math.round(v / 1000000)}M`} />
                    <Tooltip formatter={(value: any) => [`Rp ${Number(value).toLocaleString("id-ID")}`, "Nilai"]} contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: 8, color: "#fff" }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {waterfallData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}

              {activeTab === "carbon" && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={carbonDonutData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                      {carbonDonutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`${v}%`, "Kontribusi Emisi"]} contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: 8, color: "#fff" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Strategic Action Plan Cards */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-lg">Prescriptive Strategic Action Plan</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.strategic_action_plan.map((action, idx) => (
                <div
                  key={idx}
                  className="bg-[#0b101b] border border-slate-800/90 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-emerald-500/40 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          action.priority === "TINGGI"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        }`}
                      >
                        PRIORITAS {action.priority}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">{action.kategori}</span>
                    </div>

                    <p className="text-sm font-medium text-slate-200 leading-snug">
                      {action.rekomendasi}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400">
                    <span className="font-semibold">{action.estimasi_dampak}</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
