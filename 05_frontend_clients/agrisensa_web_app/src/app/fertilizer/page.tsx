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

export default function FertilizerPage() {
  const [activeTab, setActiveTab] = useState<"organic" | "combination" | "recipes">("organic");
  const [loading, setLoading] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // TAB 1: Organic Mix Calculator State
  // ─────────────────────────────────────────────────────────────────────────
  const defaultOrganicMaterials = [
    { name: "Kotoran Sapi", weight: 100, N: 1.0, P: 0.5, K: 1.0, C_N: 18, desc: "Dingin, pembenah fisik tanah" },
    { name: "Dedak Padi (Katul Halus)", weight: 20, N: 2.0, P: 1.0, K: 1.0, C_N: 20, desc: "Makanan mikroba pengurai" },
    { name: "Abu Dapur (Kayu Keras)", weight: 10, N: 0.0, P: 1.5, K: 7.0, C_N: 0, desc: "Sangat kaya Kalium & menaikkan pH" },
  ];

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
  // TAB 2: Combination / Blending Calculator State
  // ─────────────────────────────────────────────────────────────────────────
  const [targetN, setTargetN] = useState<number>(100);
  const [targetP, setTargetP] = useState<number>(50);
  const [targetK, setTargetK] = useState<number>(60);
  const [landAreaHa, setLandAreaHa] = useState<number>(1.0);
  const [bufferPct, setBufferPct] = useState<number>(5.0);
  const [combinationResult, setCombinationResult] = useState<any>(null);

  const cropPresets = [
    { label: "🌾 Padi Sawah (1 Ha)", n: 90, p: 45, k: 50 },
    { label: "🌽 Jagung Hibrida (1 Ha)", n: 120, p: 60, k: 60 },
    { label: "🌶️ Cabai Merah (1 Ha)", n: 100, p: 80, k: 90 },
    { label: "🧅 Bawang Merah (1 Ha)", n: 80, p: 70, k: 70 },
    { label: "🍈 Melon Golden (1 Ha)", n: 110, p: 70, k: 100 },
  ];

  const applyCropPreset = (p: typeof cropPresets[0]) => {
    setTargetN(p.n);
    setTargetP(p.p);
    setTargetK(p.k);
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

  // ─────────────────────────────────────────────────────────────────────────
  // TAB 3: Recipes Database State
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
    calculateOrganic();
    calculateCombination();
    fetchRecipes();
  }, []);

  // Visualizations Transforms
  const npkBarData = organicResult?.metrics
    ? [
        { name: "Nitrogen (N)", persentase: organicResult.metrics.n_percent, real_kg: organicResult.metrics.total_n_kg, fill: "#3b82f6" },
        { name: "Fosfor (P)", persentase: organicResult.metrics.p_percent, real_kg: organicResult.metrics.total_p_kg, fill: "#10b981" },
        { name: "Kalium (K)", persentase: organicResult.metrics.k_percent, real_kg: organicResult.metrics.total_k_kg, fill: "#f59e0b" },
      ]
    : [];

  const weightPieData = (organicResult?.details || []).map((d: any, idx: number) => ({
    name: d.material.split(" ")[0],
    value: d.weight_kg,
    fill: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"][idx % 6],
  }));

  return (
    <div className="space-y-8 pb-16 text-slate-100">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 border border-emerald-500/30 shadow-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
              <FlaskConical className="w-3.5 h-3.5" />
              AgriSensa Fertilizer Engineering & Formulation Lab
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Laboratorium Formulasi Pupuk Organik & Kombinasi NPK
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Kalkulasi saintifik kadar hara NPK, C/N rasio kompos, formulasi substitusi kimia-organik terpadu, dan ensiklopedia resep SOP pembuatan pupuk hayati mandiri.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("organic")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "organic" ? "bg-emerald-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <Beaker className="w-4 h-4" />
              <span>Formulasi Pupuk Organik</span>
            </button>
            <button
              onClick={() => setActiveTab("combination")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "combination" ? "bg-emerald-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Kombinasi NPK & Blending</span>
            </button>
            <button
              onClick={() => setActiveTab("recipes")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "recipes" ? "bg-emerald-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Ensiklopedia Resep SOP</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: KALKULATOR FORMULASI PUPUK ORGANIK                           */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "organic" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Material Selector & Weight Inputs (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl bg-[#090e18] border border-slate-800 p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-white text-base">Racikan Bahan Baku Organik</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">{selectedMaterials.length} Bahan Terpilih</span>
              </div>

              {/* Dynamic Materials List */}
              <div className="space-y-3">
                {selectedMaterials.map((item, idx) => (
                  <div key={item.material} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate max-w-[200px]">{item.material}</span>
                      <button
                        onClick={() => handleRemoveMaterial(idx)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Hapus bahan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0.1"
                        step="1"
                        value={item.weight_kg}
                        onChange={(e) => handleWeightChange(idx, Number(e.target.value))}
                        className="w-28 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                      <span className="text-xs text-slate-400 font-semibold">kg / Liter</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Material Dropdown */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Tambahkan Bahan Baku Baru:</label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddMaterial(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Pilih dari 15+ Bahan Baku Ilmiah --</option>
                  {availableMaterials.map((mat) => (
                    <option key={mat} value={mat}>
                      {mat}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={calculateOrganic}
                disabled={loading || selectedMaterials.length === 0}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Menghitung..." : "Hitung Estimasi NPK Campuran"}
              </button>
            </div>
          </div>

          {/* Right Column: Calculations & Visual Results (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {organicResult?.success && (
              <>
                {/* Result KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-[#090e18] border border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Total Biomassa</p>
                    <p className="text-xl font-extrabold text-white mt-1">{organicResult.total_weight_kg} kg</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#090e18] border border-blue-500/30">
                    <p className="text-[10px] text-blue-400 uppercase font-bold">Nitrogen (N)</p>
                    <p className="text-xl font-extrabold text-blue-400 mt-1">{organicResult.metrics.n_percent}%</p>
                    <span className="text-[10px] text-slate-400 font-mono">({organicResult.metrics.total_n_kg} kg N)</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#090e18] border border-emerald-500/30">
                    <p className="text-[10px] text-emerald-400 uppercase font-bold">Fosfor (P)</p>
                    <p className="text-xl font-extrabold text-emerald-400 mt-1">{organicResult.metrics.p_percent}%</p>
                    <span className="text-[10px] text-slate-400 font-mono">({organicResult.metrics.total_p_kg} kg P)</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#090e18] border border-amber-500/30">
                    <p className="text-[10px] text-amber-400 uppercase font-bold">Kalium (K)</p>
                    <p className="text-xl font-extrabold text-amber-400 mt-1">{organicResult.metrics.k_percent}%</p>
                    <span className="text-[10px] text-slate-400 font-mono">({organicResult.metrics.total_k_kg} kg K)</span>
                  </div>
                </div>

                {/* NPK Mix Formula Banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Formula Estimasi NPK Racikan</span>
                    <h3 className="text-2xl font-extrabold text-white mt-0.5">
                      NPK {organicResult.npk_composition}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Rasio C/N:</span>
                    <p className="text-lg font-bold text-teal-400 font-mono">{organicResult.metrics.estimated_cn_ratio} : 1</p>
                  </div>
                </div>

                {/* Bar Chart & Pie Chart */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl">
                    <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                      <BarChart className="w-3.5 h-3.5 text-emerald-400" /> Kandungan Hara Real (kg)
                    </h4>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={npkBarData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="name" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                          <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                          <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: 8, color: "#fff" }} />
                          <Bar dataKey="real_kg" radius={[4, 4, 0, 0]}>
                            {npkBarData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl">
                    <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                      <PieChart className="w-3.5 h-3.5 text-cyan-400" /> Proporsi Berat Bahan
                    </h4>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={weightPieData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={4}>
                            {weightPieData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: 8, color: "#fff" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Diagnostic Notes */}
                <div className="p-5 rounded-2xl bg-[#090e18] border border-slate-800 space-y-2.5">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" /> Diagnosa & Panduan Penggunaan
                  </span>
                  {organicResult.recommendations.map((note: string, i: number) => (
                    <div key={i} className="text-xs text-slate-300 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                      {note}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: KALKULATOR KOMBINASI NPK & NUTRIENT BLENDING                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "combination" && (
        <div className="space-y-6">
          {/* Target Nutrient Inputs */}
          <div className="p-6 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">Target Kebutuhan Hara Tanaman (kg N-P-K)</h3>
                <p className="text-xs text-slate-400">Tentukan target hara per hektar atau pilih rekomendasi komoditas.</p>
              </div>

              {/* Crop Preset Chips */}
              <div className="flex flex-wrap gap-1.5">
                {cropPresets.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyCropPreset(p)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 font-medium transition-all"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-semibold text-blue-400 mb-1">Target Nitrogen (kg N)</label>
                <input
                  type="number"
                  value={targetN}
                  onChange={(e) => setTargetN(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-400 mb-1">Target Fosfor (kg P)</label>
                <input
                  type="number"
                  value={targetP}
                  onChange={(e) => setTargetP(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-amber-400 mb-1">Target Kalium (kg K)</label>
                <input
                  type="number"
                  value={targetK}
                  onChange={(e) => setTargetK(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Luas Lahan (Ha)</label>
                <input
                  type="number"
                  step="0.1"
                  value={landAreaHa}
                  onChange={(e) => setLandAreaHa(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-slate-500 font-mono"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={calculateCombination}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
                >
                  {loading ? "Menghitung..." : "Hitung 3 Skenario"}
                </button>
              </div>
            </div>
          </div>

          {/* 3 Skenario Cards */}
          {combinationResult?.options && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {combinationResult.options.map((opt: any, idx: number) => (
                <div
                  key={opt.name}
                  className={`rounded-2xl border p-6 shadow-xl flex flex-col justify-between space-y-4 ${
                    idx === 2
                      ? "bg-gradient-to-b from-emerald-950/40 to-[#090e18] border-emerald-500/50"
                      : "bg-[#090e18] border-slate-800"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {opt.category}
                      </span>
                      {idx === 2 && (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" /> Direkomendasikan (ESG)
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-white text-sm leading-snug">{opt.name}</h4>

                    <p className="text-2xl font-extrabold text-emerald-400">
                      Rp {opt.total_cost_rp.toLocaleString("id-ID")}
                    </p>

                    {/* Items Breakdown Table */}
                    <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                      {opt.items.map((item: any) => (
                        <div key={item.fertilizer} className="flex justify-between items-center text-slate-300">
                          <span>{item.fertilizer}</span>
                          <span className="font-mono font-bold text-white">
                            {item.weight_kg} kg <span className="text-slate-500 font-normal">({item.sacks_50kg} sak)</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <strong className="text-slate-200">Keunggulan:</strong> {opt.pros}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: ENSIKLOPEDIA RESEP & SOP PEMBUATAN PUPUK ORGANIK              */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "recipes" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Kumpulan SOP teruji laboratorium dan petani praktisi AgriSensa untuk pembuatan pupuk organik hayati mandiri.</span>
          </div>

          <div className="space-y-4">
            {recipes.map((rec) => {
              const isExpanded = expandedRecipe === rec.id;
              return (
                <div
                  key={rec.id}
                  className="rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl overflow-hidden transition-all"
                >
                  <div
                    onClick={() => setExpandedRecipe(isExpanded ? null : rec.id)}
                    className="p-6 cursor-pointer flex items-center justify-between hover:bg-slate-900/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {rec.type}
                        </span>
                        <span className="text-xs text-slate-400">Fase: {rec.phase}</span>
                      </div>
                      <h3 className="text-base font-bold text-white">{rec.title}</h3>
                      <p className="text-xs text-slate-400">{rec.description}</p>
                    </div>

                    <button className="text-slate-400 p-2">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="p-6 pt-0 border-t border-slate-800/80 space-y-6 animate-in fade-in duration-200">
                      {/* Ingredients Grid */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Beaker className="w-3.5 h-3.5" /> Komposisi Bahan & Takaran
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                          {rec.ingredients.map((ing: any, i: number) => (
                            <div key={i} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between">
                              <span className="text-slate-300">{ing.item}</span>
                              <strong className="text-emerald-400">{ing.amount}</strong>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Steps List */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Langkah-Langkah Pembuatan (SOP)
                        </h4>
                        <div className="space-y-2 text-xs text-slate-300">
                          {rec.steps.map((step: string, i: number) => (
                            <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60">
                              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                                {i + 1}
                              </span>
                              <span className="leading-relaxed">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Success Indicators */}
                      <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs">
                        <strong className="text-emerald-400">Indikator Keberhasilan:</strong>
                        <p className="text-slate-300 mt-1">{rec.success_indicators}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
