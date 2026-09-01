"use client";

import React, { useState } from "react";
import { CommodityPrice } from "@/lib/types";
import {
  LineChart as ChartIcon,
  TrendingUp,
  TrendingDown,
  Globe2,
  ArrowUpRight,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";

export default function MarketPage() {
  const [filterCountry, setFilterCountry] = useState<"All" | "Indonesia" | "Japan">("All");

  const commodities: CommodityPrice[] = [
    {
      commodity: "Gabah Kering Panen (GKP)",
      country: "Indonesia",
      current_price: 6850,
      currency: "IDR/kg",
      change_24h: 2.4,
      trend: "up",
      last_updated: "Hari ini, 08:30 WIB",
      historical_7d: [6400, 6500, 6550, 6600, 6700, 6750, 6850],
    },
    {
      commodity: "Beras Koshihikari Super",
      country: "Japan",
      current_price: 540,
      currency: "JPY/kg",
      change_24h: 1.1,
      trend: "up",
      last_updated: "Hari ini, 10:15 JST",
      historical_7d: [520, 525, 530, 530, 535, 538, 540],
    },
    {
      commodity: "Cabai Merah Keriting",
      country: "Indonesia",
      current_price: 48500,
      currency: "IDR/kg",
      change_24h: -3.8,
      trend: "down",
      last_updated: "Hari ini, 07:45 WIB",
      historical_7d: [52000, 51000, 50500, 50000, 49000, 49500, 48500],
    },
    {
      commodity: "Bawang Merah Brebes Super",
      country: "Indonesia",
      current_price: 36000,
      currency: "IDR/kg",
      change_24h: 4.2,
      trend: "up",
      last_updated: "Hari ini, 09:00 WIB",
      historical_7d: [33000, 33500, 34000, 34500, 35000, 35200, 36000],
    },
    {
      commodity: "Jagung Pipil Kering (Pakan)",
      country: "Indonesia",
      current_price: 5400,
      currency: "IDR/kg",
      change_24h: 0.0,
      trend: "stable",
      last_updated: "Hari ini, 08:00 WIB",
      historical_7d: [5400, 5400, 5350, 5400, 5450, 5400, 5400],
    },
    {
      commodity: "Ubi Jalar Jepang (Beni Haruka)",
      country: "Japan",
      current_price: 420,
      currency: "JPY/kg",
      change_24h: 2.8,
      trend: "up",
      last_updated: "Hari ini, 11:00 JST",
      historical_7d: [390, 395, 400, 405, 410, 415, 420],
    },
  ];

  const filtered = filterCountry === "All" ? commodities : commodities.filter((c) => c.country === filterCountry);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-emerald-500/20 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ChartIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2 font-['Plus_Jakarta_Sans']">
              <span>Intelijen Pasar & Harga Komoditas</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-semibold border border-emerald-500/30">
                Indonesia & Japan Market
              </span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300">
              Pantauan pergerakan harga riil komoditas pertanian, tren fluktuasi 7 hari, dan perbandingan lintas pasar
            </p>
          </div>
        </div>

        {/* Country Filter Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
          {(["All", "Indonesia", "Japan"] as const).map((country) => (
            <button
              key={country}
              onClick={() => setFilterCountry(country)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterCountry === country
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {country === "All" ? "Semua Pasar" : country}
            </button>
          ))}
        </div>
      </div>

      {/* Commodity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <div
            key={item.commodity}
            className="glass-panel p-5 rounded-2xl border border-slate-800 glass-panel-hover flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                  {item.country === "Indonesia" ? "🇮🇩 Pasar Indonesia" : "🇯🇵 Pasar Jepang"}
                </span>
                <div
                  className={`flex items-center gap-1 text-xs font-bold font-mono ${
                    item.trend === "up"
                      ? "text-emerald-400"
                      : item.trend === "down"
                      ? "text-rose-400"
                      : "text-slate-400"
                  }`}
                >
                  {item.trend === "up" && <TrendingUp className="w-3.5 h-3.5" />}
                  {item.trend === "down" && <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{item.change_24h > 0 ? `+${item.change_24h}%` : `${item.change_24h}%`}</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-white mt-3 leading-snug">{item.commodity}</h3>

              <div className="mt-2">
                <span className="text-2xl font-black text-white font-['Outfit']">
                  {item.currency === "IDR/kg"
                    ? `Rp ${item.current_price.toLocaleString("id-ID")}`
                    : `¥ ${item.current_price.toLocaleString("ja-JP")}`}
                </span>
                <span className="text-xs text-slate-400 font-medium ml-1.5">/ kg</span>
              </div>
            </div>

            {/* 7-Day Sparkline simulation bar */}
            <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Tren 7 Hari Terakhir</span>
                <span className="font-mono">{item.last_updated}</span>
              </div>
              <div className="flex items-end gap-1.5 h-8 pt-1">
                {item.historical_7d.map((val, idx) => {
                  const min = Math.min(...item.historical_7d);
                  const max = Math.max(...item.historical_7d);
                  const heightPercent = max === min ? 50 : Math.round(((val - min) / (max - min)) * 75) + 25;
                  return (
                    <div
                      key={idx}
                      className="flex-1 bg-emerald-500/20 hover:bg-emerald-400 rounded-t transition-colors"
                      style={{ height: `${heightPercent}%` }}
                      title={`Hari ${idx + 1}: ${val}`}
                    ></div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
