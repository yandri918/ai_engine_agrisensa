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
} from "recharts";

export default function MLOpsPage() {
  const [input, setInput] = useState<CropPredictionInput>({
    nitrogen: 85,
    phosphorus: 50,
    potassium: 45,
    temperature: 27.0,
    humidity: 80,
    ph: 6.2,
    rainfall: 210,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CropPredictionResult | null>(null);

  const presets = [
    { label: "🌾 Padi Sawah Lahan Basah", n: 85, p: 45, k: 45, ph: 6.2, rain: 220, temp: 27.5, hum: 82 },
    { label: "🌽 Jagung Lahan Kering", n: 110, p: 65, k: 60, ph: 6.5, rain: 130, temp: 28.0, hum: 65 },
    { label: "🌶️ Cabai Dataran Rendah", n: 90, p: 75, k: 80, ph: 6.3, rain: 110, temp: 26.5, hum: 70 },
    { label: "🧅 Bawang Merah Intensif", n: 80, p: 70, k: 70, ph: 6.4, rain: 90, temp: 29.0, hum: 60 },
    { label: "🌴 Lahan Kelapa Sawit", n: 120, p: 50, k: 120, ph: 5.2, rain: 240, temp: 28.5, hum: 85 },
    { label: "☕ Kopi Arabika Dataran Tinggi", n: 65, p: 35, k: 70, ph: 5.8, rain: 180, temp: 19.5, hum: 80 },
  ];

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

  const runInference = async (dataToPredict = input) => {
    setLoading(true);
    try {
      const data = await predictCrop(dataToPredict);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runInference();
  }, []);

  const radarData = [
    { subject: "Nitrogen (N)", actual: (input.nitrogen / 140) * 100, ideal: 70 },
    { subject: "Fosfat (P)", actual: (input.phosphorus / 140) * 100, ideal: 60 },
    { subject: "Kalium (K)", actual: (input.potassium / 140) * 100, ideal: 65 },
    { subject: "pH Tanah", actual: (input.ph / 9) * 100, ideal: 72 },
    { subject: "Curah Hujan", actual: (input.rainfall / 300) * 100, ideal: 65 },
    { subject: "Suhu Lingkungan", actual: (input.temperature / 40) * 100, ideal: 68 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 md:p-8 border border-cyan-500/30 shadow-2xl bg-gradient-to-r from-slate-950 via-[#0a1322] to-slate-950">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Machine Learning Crop Recommendation Model</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white font-['Plus_Jakarta_Sans'] tracking-tight">
              Laboratorium <span className="text-cyan-400">MLOps & Sensor Tanah</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Algoritma klasifikasi presisi multi-parameter yang menghitung kecocokan komoditas, dosis pupuk baku Balitbangtan, dan analisis kontribusi SHAP.
            </p>
          </div>

          <button
            onClick={() => runInference()}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:opacity-90 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] w-fit shrink-0"
          >
            <Sparkles className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Menghitung Model..." : "Jalankan Prediksi Ulang"}</span>
          </button>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Pilih Profil Tanah Cepat (1-Klik):</span>
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="px-3 py-2.5 rounded-xl bg-slate-900/90 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold text-slate-300 hover:text-cyan-300 transition-all text-left truncate shadow-sm"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Inputs (6 Cols) */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-400" />
              <span>Input Parameter Fisik & Kimia Tanah</span>
            </h2>
            <button
              onClick={() => applyPreset(presets[0])}
              className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Nitrogen */}
            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-200">Kadar Nitrogen (N) Tanah</label>
                <span className="font-mono text-emerald-400 font-bold text-sm bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                  {input.nitrogen} mg/kg
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="140"
                value={input.nitrogen}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setInput({ ...input, nitrogen: val });
                }}
                onMouseUp={() => runInference()}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Phosphorus & Potassium */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-200">Fosfat (P₂O₅)</label>
                  <span className="font-mono text-cyan-400 font-bold text-sm bg-cyan-950/40 px-2 py-0.5 rounded-lg border border-cyan-500/30">
                    {input.phosphorus} mg/kg
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="145"
                  value={input.phosphorus}
                  onChange={(e) => setInput({ ...input, phosphorus: Number(e.target.value) })}
                  onMouseUp={() => runInference()}
                  className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-200">Kalium (K₂O)</label>
                  <span className="font-mono text-purple-400 font-bold text-sm bg-purple-950/40 px-2 py-0.5 rounded-lg border border-purple-500/30">
                    {input.potassium} mg/kg
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="160"
                  value={input.potassium}
                  onChange={(e) => setInput({ ...input, potassium: Number(e.target.value) })}
                  onMouseUp={() => runInference()}
                  className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>
            </div>

            {/* pH & Rainfall */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-200">Derajat Keasaman (pH)</label>
                  <span className="font-mono text-amber-400 font-bold text-sm bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-500/30">
                    {input.ph}
                  </span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="8.5"
                  step="0.1"
                  value={input.ph}
                  onChange={(e) => setInput({ ...input, ph: Number(e.target.value) })}
                  onMouseUp={() => runInference()}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-200">Curah Hujan (Rainfall)</label>
                  <span className="font-mono text-blue-400 font-bold text-sm bg-blue-950/40 px-2 py-0.5 rounded-lg border border-blue-500/30">
                    {input.rainfall} mm
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="320"
                  value={input.rainfall}
                  onChange={(e) => setInput({ ...input, rainfall: Number(e.target.value) })}
                  onMouseUp={() => runInference()}
                  className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>
            </div>

            {/* Temperature & Humidity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-200">Suhu Udara Rerata</label>
                  <span className="font-mono text-rose-400 font-bold text-sm bg-rose-950/40 px-2 py-0.5 rounded-lg border border-rose-500/30">
                    {input.temperature} °C
                  </span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="38"
                  step="0.5"
                  value={input.temperature}
                  onChange={(e) => setInput({ ...input, temperature: Number(e.target.value) })}
                  onMouseUp={() => runInference()}
                  className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-200">Kelembaban Relatif (RH)</label>
                  <span className="font-mono text-teal-400 font-bold text-sm bg-teal-950/40 px-2 py-0.5 rounded-lg border border-teal-500/30">
                    {input.humidity} %
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="98"
                  value={input.humidity}
                  onChange={(e) => setInput({ ...input, humidity: Number(e.target.value) })}
                  onMouseUp={() => runInference()}
                  className="w-full accent-teal-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel with Radar Chart (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {result && (
            <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 space-y-6 bg-gradient-to-b from-[#0c1524] to-[#070d17] shadow-2xl">
              {/* Winner Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    Rekomendasi Utama (Confidence {(result.confidence * 100).toFixed(0)}%)
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white font-['Plus_Jakarta_Sans'] text-emerald-300 mt-1">
                    {result.recommended_crop}
                  </h3>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-right">
                  <span className="text-[10px] font-bold block uppercase text-slate-400">Potensi Panen</span>
                  <span className="text-sm font-black font-['Outfit']">{result.yield_potential || "6.8 Ton/Ha"}</span>
                </div>
              </div>

              {/* Radar Chart: Soil Balance vs Optimal */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">Radar Keseimbangan Hara & Iklim</span>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span> Kondisi Aktual
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-slate-600 inline-block"></span> Standar Optimal
                    </span>
                  </div>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="#1e293b" />
                      <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" tick={false} />
                      <Radar name="Aktual" dataKey="actual" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
                      <Radar name="Ideal" dataKey="ideal" stroke="#64748b" fill="#64748b" fillOpacity={0.1} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dosis Pupuk & Tindakan Ilmiah */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Rekomendasi Paket Pemupukan Presisi:</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-mono text-[11px] bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  {result.fertilizer_recommendation || "Urea 250 kg/ha + NPK 15-15-15 300 kg/ha + SP-36 100 kg/ha"}
                </p>
                <p className="text-slate-300 leading-relaxed text-[11px] pt-1">
                  💡 <strong>Koreksi Tanah:</strong> {result.soil_status.actionable_advice}
                </p>
              </div>

              {/* SHAP Decision Factors */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-300">Explainability Factors (Interpretasi Nilai SHAP):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.shap_factors.map((f) => (
                    <div key={f.factor} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                      <div className="flex justify-between font-semibold text-slate-200">
                        <span>{f.factor.split(" (")[0]}</span>
                        <span className="text-cyan-400 font-mono">{(f.impact * 100).toFixed(0)}%</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">{f.interpretation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
