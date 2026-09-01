"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export default function MLOpsPage() {
  const [input, setInput] = useState<CropPredictionInput>({
    nitrogen: 65,
    phosphorus: 45,
    potassium: 40,
    temperature: 26.5,
    humidity: 78,
    ph: 6.5,
    rainfall: 180,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CropPredictionResult | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await predictCrop(input);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInput({
      nitrogen: 65,
      phosphorus: 45,
      potassium: 40,
      temperature: 26.5,
      humidity: 78,
      ph: 6.5,
      rainfall: 180,
    });
    setResult(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-cyan-500/20 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2 font-['Plus_Jakarta_Sans']">
              <span>Laboratorium MLOps</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-semibold border border-cyan-500/30">
                Port 8000
              </span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300">
              Inferensi Model Random Forest & XGBoost untuk Rekomendasi Tanaman dan Analisis Kesuburan Tanah
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors w-fit"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Default</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Inputs (7 Cols) */}
        <form onSubmit={handlePredict} className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sprout className="w-4 h-4 text-emerald-400" />
            <span>Parameter Sensor Tanah & Agroklimat</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Nitrogen */}
            <div className="space-y-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-300">Nitrogen (N)</label>
                <span className="font-mono text-emerald-400 font-bold">{input.nitrogen} mg/kg</span>
              </div>
              <input
                type="range"
                min="0"
                max="140"
                value={input.nitrogen}
                onChange={(e) => setInput({ ...input, nitrogen: Number(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Phosphorus */}
            <div className="space-y-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-300">Fosfat (P)</label>
                <span className="font-mono text-cyan-400 font-bold">{input.phosphorus} mg/kg</span>
              </div>
              <input
                type="range"
                min="0"
                max="145"
                value={input.phosphorus}
                onChange={(e) => setInput({ ...input, phosphorus: Number(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Potassium */}
            <div className="space-y-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-300">Kalium (K)</label>
                <span className="font-mono text-purple-400 font-bold">{input.potassium} mg/kg</span>
              </div>
              <input
                type="range"
                min="0"
                max="205"
                value={input.potassium}
                onChange={(e) => setInput({ ...input, potassium: Number(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* pH Tanah */}
            <div className="space-y-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-300">Derajat Keasaman (pH)</label>
                <span className="font-mono text-amber-400 font-bold">{input.ph}</span>
              </div>
              <input
                type="range"
                min="3.5"
                max="9.5"
                step="0.1"
                value={input.ph}
                onChange={(e) => setInput({ ...input, ph: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Curah Hujan */}
            <div className="space-y-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-300">Curah Hujan (Rainfall)</label>
                <span className="font-mono text-blue-400 font-bold">{input.rainfall} mm</span>
              </div>
              <input
                type="range"
                min="20"
                max="300"
                value={input.rainfall}
                onChange={(e) => setInput({ ...input, rainfall: Number(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Suhu */}
            <div className="space-y-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-300">Suhu Lingkungan</label>
                <span className="font-mono text-rose-400 font-bold">{input.temperature} °C</span>
              </div>
              <input
                type="range"
                min="10"
                max="45"
                step="0.5"
                value={input.temperature}
                onChange={(e) => setInput({ ...input, temperature: Number(e.target.value) })}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* Kelembaban */}
            <div className="space-y-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-300">Kelembaban Udara (Humidity)</label>
                <span className="font-mono text-teal-400 font-bold">{input.humidity} %</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={input.humidity}
                onChange={(e) => setInput({ ...input, humidity: Number(e.target.value) })}
                className="w-full accent-teal-500 cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:opacity-95 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.01]"
          >
            {loading ? (
              <span className="animate-pulse">Menjalankan Inferensi Model MLOps...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analisis & Rekomendasikan Tanaman</span>
              </>
            )}
          </button>
        </form>

        {/* Results Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Hasil Inferensi Model
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold font-mono">
                  {(result.confidence * 100).toFixed(1)}% Confidence
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-400">Tanaman Paling Direkomendasikan:</p>
                <h3 className="text-2xl font-black text-white font-['Plus_Jakarta_Sans'] text-emerald-300 mt-0.5">
                  {result.recommended_crop}
                </h3>
              </div>

              {/* Status Tanah */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Kategori pH:</span>
                  <span className="font-semibold text-white">{result.soil_status.ph_category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Keseimbangan NPK:</span>
                  <span className="font-semibold text-emerald-400 capitalize">{result.soil_status.npk_balance}</span>
                </div>
                <p className="pt-2 border-t border-slate-800 text-slate-300 leading-relaxed text-[11px]">
                  💡 <strong>Saran Tindakan:</strong> {result.soil_status.actionable_advice}
                </p>
              </div>

              {/* SHAP Explainability Factors */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-300">Faktor Penentu Keputusan (SHAP Values):</p>
                <div className="space-y-2">
                  {result.shap_factors.map((f) => (
                    <div key={f.factor} className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 text-xs">
                      <div className="flex justify-between font-semibold text-slate-200">
                        <span>{f.factor}</span>
                        <span className="text-cyan-400">{(f.impact * 100).toFixed(0)}% Bobot</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{f.interpretation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-4 flex flex-col items-center justify-center min-h-[360px]">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Belum Ada Hasil Uji</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Atur slider parameter NPK, pH, dan curah hujan di sebelah kiri lalu klik tombol analisis untuk melihat rekomendasi model AI.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
