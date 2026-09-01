"use client";

import React, { useState, useEffect } from "react";
import { runMonteCarloSimulation } from "@/lib/api-client";
import { MonteCarloInput, MonteCarloResult } from "@/lib/types";
import {
  TrendingUp,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Percent,
  Coins,
  Layers,
  HelpCircle,
  BarChart3,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

export default function MonteCarloPage() {
  const [input, setInput] = useState<MonteCarloInput>({
    crop_type: "Padi Sawah (Ciherang)",
    land_area_ha: 1.0,
    initial_capital: 15000000,
    seed_cost_per_ha: 1200000,
    fertilizer_cost_per_ha: 3800000,
    labor_cost_per_ha: 5500000,
    expected_yield_ton_per_ha: 6.5,
    min_market_price_per_kg: 5800,
    max_market_price_per_kg: 7200,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MonteCarloResult | null>(null);

  const presets = [
    {
      name: "🌾 Padi Sawah (1 Ha)",
      crop: "Padi Sawah (Ciherang)",
      area: 1.0,
      cap: 15000000,
      seed: 1200000,
      fert: 3800000,
      labor: 5500000,
      yield: 6.5,
      minP: 5800,
      maxP: 7200,
    },
    {
      name: "🌽 Jagung Hibrida (2 Ha)",
      crop: "Jagung Hibrida (Bisi 18)",
      area: 2.0,
      cap: 25000000,
      seed: 2200000,
      fert: 5500000,
      labor: 4800000,
      yield: 8.5,
      minP: 4200,
      maxP: 5600,
    },
    {
      name: "🌶️ Cabai Merah Keriting (0.5 Ha)",
      crop: "Cabai Merah (Laba F1)",
      area: 0.5,
      cap: 35000000,
      seed: 4500000,
      fert: 14000000,
      labor: 16000000,
      yield: 14.0,
      minP: 22000,
      maxP: 55000,
    },
    {
      name: "🧅 Bawang Merah (0.5 Ha)",
      crop: "Bawang Merah (Tajuk)",
      area: 0.5,
      cap: 40000000,
      seed: 18000000,
      fert: 12000000,
      labor: 12000000,
      yield: 11.5,
      minP: 18000,
      maxP: 38000,
    },
  ];

  const applyPreset = (p: (typeof presets)[0]) => {
    const updated: MonteCarloInput = {
      crop_type: p.crop,
      land_area_ha: p.area,
      initial_capital: p.cap,
      seed_cost_per_ha: p.seed,
      fertilizer_cost_per_ha: p.fert,
      labor_cost_per_ha: p.labor,
      expected_yield_ton_per_ha: p.yield,
      min_market_price_per_kg: p.minP,
      max_market_price_per_kg: p.maxP,
    };
    setInput(updated);
    runSim(updated);
  };

  const runSim = async (data = input) => {
    setLoading(true);
    try {
      const res = await runMonteCarloSimulation(data);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSim();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 md:p-8 border border-amber-500/30 shadow-2xl bg-gradient-to-r from-slate-950 via-[#161208] to-slate-950">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>10,000 Iterasi Stokastik Kuat-Koreksi</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white font-['Plus_Jakarta_Sans'] tracking-tight">
              Simulasi Risiko <span className="text-amber-400">Monte Carlo & VaR</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Kalkulasi probabilitas laba/rugi, estimasi Return on Investment (ROI), dan Value at Risk (VaR 95%) berdasarkan ketidakpastian iklim dan fluktuasi harga pasar.
            </p>
          </div>

          <button
            onClick={() => runSim()}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-400 hover:opacity-90 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] w-fit shrink-0"
          >
            <Sparkles className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Menjalankan 10.000 Iterasi..." : "Jalankan Simulasi"}</span>
          </button>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Contoh Model Komoditas Cepat:</span>
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="px-3 py-2.5 rounded-xl bg-slate-900/90 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/40 text-xs font-semibold text-slate-300 hover:text-amber-300 transition-all text-left truncate shadow-sm"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Parameters (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Parameter Finansial Usaha Tani</span>
            </h2>
            <button
              onClick={() => applyPreset(presets[0])}
              className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nama Komoditas / Varietas</label>
              <input
                type="text"
                value={input.crop_type}
                onChange={(e) => setInput({ ...input, crop_type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:border-amber-400 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Luas Lahan (Ha)</label>
                <input
                  type="number"
                  step="0.1"
                  value={input.land_area_ha}
                  onChange={(e) => setInput({ ...input, land_area_ha: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:border-amber-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Potensi Hasil (Ton/Ha)</label>
                <input
                  type="number"
                  step="0.5"
                  value={input.expected_yield_ton_per_ha}
                  onChange={(e) => setInput({ ...input, expected_yield_ton_per_ha: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:border-amber-400 outline-none"
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <span className="font-bold text-amber-300 block">Biaya Produksi Pokok per Hektar (Rp):</span>
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Biaya Benih / Bibit:</span>
                  <span className="font-mono text-white">Rp {input.seed_cost_per_ha.toLocaleString("id-ID")}</span>
                </div>
                <input
                  type="range"
                  min="500000"
                  max="25000000"
                  step="500000"
                  value={input.seed_cost_per_ha}
                  onChange={(e) => setInput({ ...input, seed_cost_per_ha: Number(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Biaya Pupuk & Nutrisi:</span>
                  <span className="font-mono text-white">Rp {input.fertilizer_cost_per_ha.toLocaleString("id-ID")}</span>
                </div>
                <input
                  type="range"
                  min="1000000"
                  max="25000000"
                  step="500000"
                  value={input.fertilizer_cost_per_ha}
                  onChange={(e) => setInput({ ...input, fertilizer_cost_per_ha: Number(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Tenaga Kerja (HOK) & Alsintan:</span>
                  <span className="font-mono text-white">Rp {input.labor_cost_per_ha.toLocaleString("id-ID")}</span>
                </div>
                <input
                  type="range"
                  min="1000000"
                  max="25000000"
                  step="500000"
                  value={input.labor_cost_per_ha}
                  onChange={(e) => setInput({ ...input, labor_cost_per_ha: Number(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Harga Min Pasar (Rp/kg)</label>
                <input
                  type="number"
                  value={input.min_market_price_per_kg}
                  onChange={(e) => setInput({ ...input, min_market_price_per_kg: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:border-amber-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Harga Maks Pasar (Rp/kg)</label>
                <input
                  type="number"
                  value={input.max_market_price_per_kg}
                  onChange={(e) => setInput({ ...input, max_market_price_per_kg: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:border-amber-400 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results & Distribution Chart (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {result && (
            <>
              {/* Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Ekspektasi Laba</span>
                  <p className="text-lg font-bold text-emerald-400 font-['Outfit'] mt-1">
                    Rp {(result.expected_profit / 1000000).toFixed(1)} Juta
                  </p>
                </div>
                <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Peluang Profit</span>
                  <p className="text-lg font-bold text-cyan-400 font-['Outfit'] mt-1">
                    {result.probability_of_profit}%
                  </p>
                </div>
                <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Estimasi ROI</span>
                  <p className="text-lg font-bold text-purple-400 font-['Outfit'] mt-1">
                    {result.roi_percentage}%
                  </p>
                </div>
                <div className="glass-panel p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Tingkat Risiko</span>
                  <p
                    className={`text-lg font-bold font-['Outfit'] mt-1 ${
                      result.risk_level === "Rendah"
                        ? "text-emerald-400"
                        : result.risk_level === "Moderat"
                        ? "text-amber-400"
                        : "text-rose-400"
                    }`}
                  >
                    {result.risk_level}
                  </p>
                </div>
              </div>

              {/* Distribution Bar Chart */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                    Distribusi Probabilitas Keuntungan (10.000 Run)
                  </span>
                  <span className="text-slate-400">Frekuensi Kejadian</span>
                </div>

                <div className="h-60 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.distribution_bins} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="range" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                      <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "12px",
                          fontSize: "12px",
                          color: "#fff",
                        }}
                        formatter={(val: any) => [`${val} Iterasi`, "Frekuensi"]}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {result.distribution_bins.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === 0 ? "#f43f5e" : index === 4 ? "#10b981" : "#f59e0b"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 bg-amber-950/10 space-y-2.5 text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Rekomendasi Manajemen Risiko Finansial:
                </span>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="leading-relaxed">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
