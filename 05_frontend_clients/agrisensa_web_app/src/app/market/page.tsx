"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Globe,
  ArrowUpRight,
  Sparkles,
  BarChart2,
  Calendar,
  Layers,
  Filter,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Commodity {
  id: string;
  name: string;
  category: "Pangan" | "Hortikultura" | "Perkebunan";
  country: "ID" | "JP";
  currentPrice: number;
  unit: string;
  change7d: number;
  change30d: number;
  trend: "up" | "down";
  history: Array<{ day: string; price: number }>;
  analysis: string;
}

const COMMODITY_DATA: Commodity[] = [
  {
    id: "beras-premium",
    name: "Beras Premium (Setra Ramos)",
    category: "Pangan",
    country: "ID",
    currentPrice: 15400,
    unit: "kg",
    change7d: 2.1,
    change30d: 4.8,
    trend: "up",
    history: [
      { day: "H-6", price: 14900 },
      { day: "H-5", price: 15000 },
      { day: "H-4", price: 15150 },
      { day: "H-3", price: 15200 },
      { day: "H-2", price: 15300 },
      { day: "H-1", price: 15350 },
      { day: "Hari Ini", price: 15400 },
    ],
    analysis: "Kenaikan moderat akibat penyesuaian HET dan keterbatasan pasokan gabah kering giling jelang musim panen raya.",
  },
  {
    id: "cabai-rawit",
    name: "Cabai Rawit Merah",
    category: "Hortikultura",
    country: "ID",
    currentPrice: 42500,
    unit: "kg",
    change7d: -6.5,
    change30d: 14.2,
    trend: "down",
    history: [
      { day: "H-6", price: 46000 },
      { day: "H-5", price: 45000 },
      { day: "H-4", price: 44500 },
      { day: "H-3", price: 43800 },
      { day: "H-2", price: 43000 },
      { day: "H-1", price: 42800 },
      { day: "Hari Ini", price: 42500 },
    ],
    analysis: "Koreksi harga harian seiring masuknya pasokan panen serentak dari sentra Jawa Timur dan Jawa Tengah.",
  },
  {
    id: "bawang-merah",
    name: "Bawang Merah Brebes",
    category: "Hortikultura",
    country: "ID",
    currentPrice: 34000,
    unit: "kg",
    change7d: 3.8,
    change30d: 8.5,
    trend: "up",
    history: [
      { day: "H-6", price: 32500 },
      { day: "H-5", price: 32800 },
      { day: "H-4", price: 33000 },
      { day: "H-3", price: 33400 },
      { day: "H-2", price: 33700 },
      { day: "H-1", price: 33900 },
      { day: "Hari Ini", price: 34000 },
    ],
    analysis: "Permintaan pasar stabil tinggi dengan serapan industri olahan bumbu yang terus meningkat.",
  },
  {
    id: "jagung-pipil",
    name: "Jagung Pipil Kering (Kadar Air 14%)",
    category: "Pangan",
    country: "ID",
    currentPrice: 5600,
    unit: "kg",
    change7d: 1.4,
    change30d: -2.1,
    trend: "up",
    history: [
      { day: "H-6", price: 5450 },
      { day: "H-5", price: 5480 },
      { day: "H-4", price: 5500 },
      { day: "H-3", price: 5520 },
      { day: "H-2", price: 5550 },
      { day: "H-1", price: 5580 },
      { day: "Hari Ini", price: 5600 },
    ],
    analysis: "Permintaan dari pabrik pakan ternak (feedmill) stabil dengan ketersediaan stok domestik yang terjaga.",
  },
  {
    id: "sawit-tbs",
    name: "TBS Kelapa Sawit (Riau/Sumut)",
    category: "Perkebunan",
    country: "ID",
    currentPrice: 2850,
    unit: "kg",
    change7d: 4.2,
    change30d: 9.8,
    trend: "up",
    history: [
      { day: "H-6", price: 2710 },
      { day: "H-5", price: 2740 },
      { day: "H-4", price: 2780 },
      { day: "H-3", price: 2800 },
      { day: "H-2", price: 2820 },
      { day: "H-1", price: 2840 },
      { day: "Hari Ini", price: 2850 },
    ],
    analysis: "Didorong oleh penguatan harga minyak sawit mentah (CPO) di bursa komoditas internasional (MDEX).",
  },
  {
    id: "koshihikari-rice",
    name: "Beras Koshihikari (Niigata)",
    category: "Pangan",
    country: "JP",
    currentPrice: 620,
    unit: "kg (¥)",
    change7d: 1.8,
    change30d: 3.5,
    trend: "up",
    history: [
      { day: "H-6", price: 605 },
      { day: "H-5", price: 608 },
      { day: "H-4", price: 610 },
      { day: "H-3", price: 612 },
      { day: "H-2", price: 615 },
      { day: "H-1", price: 618 },
      { day: "Hari Ini", price: 620 },
    ],
    analysis: "Pasar beras premium Jepang stabil dengan preferensi kuat terhadap beras kualitas First Grade (一等米).",
  },
  {
    id: "nagano-apple",
    name: "Apel Fuji (Nagano)",
    category: "Hortikultura",
    country: "JP",
    currentPrice: 480,
    unit: "piece (¥)",
    change7d: 0.5,
    change30d: -1.2,
    trend: "up",
    history: [
      { day: "H-6", price: 475 },
      { day: "H-5", price: 476 },
      { day: "H-4", price: 478 },
      { day: "H-3", price: 478 },
      { day: "H-2", price: 479 },
      { day: "H-1", price: 480 },
      { day: "Hari Ini", price: 480 },
    ],
    analysis: "Permintaan retail stabil didukung oleh sistem cold storage otomatis dan standar kontrol brix tinggi.",
  },
];

export default function MarketPage() {
  const [selectedCountry, setSelectedCountry] = useState<"ALL" | "ID" | "JP">("ALL");
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity>(COMMODITY_DATA[0]);

  const filtered = COMMODITY_DATA.filter((c) =>
    selectedCountry === "ALL" ? true : c.country === selectedCountry
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 md:p-8 border border-emerald-500/30 shadow-2xl bg-gradient-to-r from-slate-950 via-[#091515] to-slate-950">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Globe className="w-3.5 h-3.5" />
              <span>Multi-Region Commodity Analytics</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white font-['Plus_Jakarta_Sans'] tracking-tight">
              Intelijen Pasar <span className="text-emerald-400">Komoditas Pertanian</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pantauan pergerakan harga harian, tren fluktuasi 7 hari, dan analitik volatilitas komoditas strategis Indonesia 🇮🇩 dan Jepang 🇯🇵.
            </p>
          </div>

          {/* Country Tabs */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            <button
              onClick={() => setSelectedCountry("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCountry === "ALL"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Semua Komoditas
            </button>
            <button
              onClick={() => setSelectedCountry("ID")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                selectedCountry === "ID"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🇮🇩 Indonesia</span>
            </button>
            <button
              onClick={() => setSelectedCountry("JP")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                selectedCountry === "JP"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🇯🇵 Jepang</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Commodity List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Daftar Komoditas Pantauan:</p>
          <div className="space-y-2.5">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedCommodity(item)}
                className={`w-full p-4 rounded-2xl text-left transition-all border flex items-center justify-between ${
                  selectedCommodity.id === item.id
                    ? "bg-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                    : "glass-panel border-slate-800/80 hover:border-slate-700 text-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{item.country === "ID" ? "🇮🇩" : "🇯🇵"}</span>
                    <h3 className="font-bold text-sm text-white">{item.name}</h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{item.category}</span>
                </div>

                <div className="text-right">
                  <div className="font-bold text-sm font-['Outfit'] text-white">
                    {item.country === "ID" ? `Rp ${item.currentPrice.toLocaleString("id-ID")}` : `¥ ${item.currentPrice}`}{" "}
                    <span className="text-[10px] text-slate-400 font-normal">/{item.unit}</span>
                  </div>
                  <div
                    className={`flex items-center justify-end gap-1 text-[11px] font-semibold ${
                      item.change7d >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {item.change7d >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{item.change7d >= 0 ? `+${item.change7d}%` : `${item.change7d}%`} (7h)</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Commodity Interactive Chart (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">{selectedCommodity.country === "ID" ? "🇮🇩" : "🇯🇵"}</span>
                <h2 className="text-xl font-bold text-white font-['Plus_Jakarta_Sans']">
                  {selectedCommodity.name}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Grafik Pergerakan Harga 7 Hari Terakhir</p>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-right">
              <span className="text-[10px] font-bold block uppercase text-slate-400">Harga Terkini</span>
              <span className="text-xl font-black font-['Outfit'] text-emerald-300">
                {selectedCommodity.country === "ID"
                  ? `Rp ${selectedCommodity.currentPrice.toLocaleString("id-ID")}`
                  : `¥ ${selectedCommodity.currentPrice}`}{" "}
                <span className="text-xs font-normal text-slate-400">/{selectedCommodity.unit}</span>
              </span>
            </div>
          </div>

          {/* Area Chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={selectedCommodity.history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  domain={["dataMin - 100", "dataMax + 100"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                  formatter={(val: any) => [
                    selectedCommodity.country === "ID"
                      ? `Rp ${Number(val).toLocaleString("id-ID")}`
                      : `¥ ${val}`,
                    "Harga",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#priceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Market Insight Note */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Analisis Fundamental Pasar:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">{selectedCommodity.analysis}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
