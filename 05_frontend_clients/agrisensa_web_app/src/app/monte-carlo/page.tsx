"use client";

import React, { useState } from "react";
import { runMonteCarloSimulation } from "@/lib/api-client";
import { MonteCarloInput, MonteCarloResult } from "@/lib/types";
import {
  TrendingUp,
  ShieldAlert,
  Coins,
  Percent,
  RefreshCw,
  Sparkles,
  BarChart3,
  HelpCircle,
} from "lucide-react";

export default function MonteCarloPage() {
  const [input, setInput] = useState<MonteCarloInput>({
    crop_type: "Padi Sawah",
    land_area_ha: 1.0,
    initial_capital: 15000000,
    seed_cost_per_ha: 1200000,
    fertilizer_cost_per_ha: 4500000,
    labor_cost_per_ha: 5500000,
    expected_yield_ton_per_ha: 6.5,
    min_market_price_per_kg: 5800,
    max_market_price_per_kg: 7200,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MonteCarloResult | null>(null);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await runMonteCarloSimulation(input);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-amber-500/20 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2 font-['Plus_Jakarta_Sans']">
              <span>Simulasi Risiko Monte Carlo</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-semibold border border-amber-500/30">
                10,000 Iterasi
              </span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300">
              Kalkulasi probabilitas keuntungan, potensi kerugian (*Value at Risk*), dan sensitivitas harga pasar
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Parameter (5 Cols) */}
        <form onSubmit={handleSimulate} className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Parameter Biaya & Hasil Panen</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 font-semibold">Komoditas Tanaman</label>
              <select
                value={input.crop_type}
                onChange={(e) => setInput({ ...input, crop_type: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Padi Sawah">Padi Sawah (Ciherang/Inpari)</option>
                <option value="Jagung Hibrida">Jagung Hibrida</option>
                <option value="Cabai Merah">Cabai Merah Keriting</option>
                <option value="Bawang Merah">Bawang Merah</option>
                <option value="Kedelai">Kedelai</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold">Luas Lahan (Hektar)</label>
                <input
                  type="number"
                  step="0.1"
                  value={input.land_area_ha}
                  onChange={(e) => setInput({ ...input, land_area_ha: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold">Target Hasil (Ton/Ha)</label>
                <input
                  type="number"
                  step="0.1"
                  value={input.expected_yield_ton_per_ha}
                  onChange={(e) => setInput({ ...input, expected_yield_ton_per_ha: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold">Biaya Benih / Bibit (Rp/Ha)</label>
              <input
                type="number"
                value={input.seed_cost_per_ha}
                onChange={(e) => setInput({ ...input, seed_cost_per_ha: Number(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold">Biaya Pupuk & Nutrisi (Rp/Ha)</label>
              <input
                type="number"
                value={input.fertilizer_cost_per_ha}
                onChange={(e) => setInput({ ...input, fertilizer_cost_per_ha: Number(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold">Biaya Tenaga Kerja & Olah Tanah (Rp/Ha)</label>
              <input
                type="number"
                value={input.labor_cost_per_ha}
                onChange={(e) => setInput({ ...input, labor_cost_per_ha: Number(e.target.value) })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold">Harga Jual Min (Rp/kg)</label>
                <input
                  type="number"
                  value={input.min_market_price_per_kg}
                  onChange={(e) => setInput({ ...input, min_market_price_per_kg: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold">Harga Jual Max (Rp/kg)</label>
                <input
                  type="number"
                  value={input.max_market_price_per_kg}
                  onChange={(e) => setInput({ ...input, max_market_price_per_kg: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 hover:opacity-95 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] mt-4"
          >
            {loading ? (
              <span className="animate-pulse">Menghitung 10.000 Iterasi...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Jalankan 10.000 Simulasi Monte Carlo</span>
              </>
            )}
          </button>
        </form>

        {/* Results Visuals (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Hasil Analisis Risiko Finansial
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold font-mono">
                  Probabilitas Untung: {result.probability_of_profit}%
                </span>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Estimasi Laba Bersih</span>
                  <p className="text-lg font-bold text-emerald-400 font-['Outfit'] mt-1">
                    {formatIDR(result.expected_profit)}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Proyeksi ROI</span>
                  <p className="text-lg font-bold text-amber-400 font-['Outfit'] mt-1">
                    +{result.roi_percentage}%
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Tingkat Risiko</span>
                  <p className="text-lg font-bold text-white font-['Outfit'] mt-1">
                    {result.risk_level}
                  </p>
                </div>
              </div>

              {/* Distribution Bins Bar Chart */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span>Distribusi Probabilitas Rentang Laba (10.000 Run):</span>
                </p>
                <div className="space-y-2">
                  {result.distribution_bins.map((bin) => (
                    <div key={bin.range} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>{bin.range}</span>
                        <span className="font-mono text-amber-400">{bin.probability}% ({bin.count} run)</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${bin.probability}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Insights */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  💡 Rekomendasi Mitigasi Risiko:
                </span>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="leading-relaxed">{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-4 flex flex-col items-center justify-center min-h-[360px]">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Siap Menjalankan Simulasi</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Masukkan asumsi biaya benih, pupuk, dan rentang harga jual di sebelah kiri untuk menghitung 10.000 skenario probabilitas keuntungan.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
