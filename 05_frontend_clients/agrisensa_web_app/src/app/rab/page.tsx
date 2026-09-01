"use client";

import React, { useState } from "react";
import {
  Calculator,
  Printer,
  Download,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  CheckCircle2,
  Coins,
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
} from "recharts";

interface BudgetItem {
  id: string;
  category: "Benih & Bibit" | "Pupuk & Pembenah" | "Pestisida & Hayati" | "Tenaga Kerja (HOK)" | "Sewa Alat & Pompa";
  name: string;
  unit: string;
  qtyPerHa: number;
  unitPrice: number;
}

const DEFAULT_ITEMS: BudgetItem[] = [
  { id: "1", category: "Benih & Bibit", name: "Benih Padi Bersertifikat (Inpari 32)", unit: "kg", qtyPerHa: 25, unitPrice: 18000 },
  { id: "2", category: "Pupuk & Pembenah", name: "Pupuk Urea Granul Non-Subsidi", unit: "kg", qtyPerHa: 250, unitPrice: 7500 },
  { id: "3", category: "Pupuk & Pembenah", name: "Pupuk NPK Ponska / Phonska Plus", unit: "kg", qtyPerHa: 300, unitPrice: 9500 },
  { id: "4", category: "Pupuk & Pembenah", name: "Kapur Pertanian Dolomit (CaMg)", unit: "kg", qtyPerHa: 1000, unitPrice: 1200 },
  { id: "5", category: "Pupuk & Pembenah", name: "Pupuk Organik Bokashi Matang", unit: "kg", qtyPerHa: 2000, unitPrice: 1000 },
  { id: "6", category: "Pestisida & Hayati", name: "Insektisida Sistemik Bahan Aktif Fipronil", unit: "liter", qtyPerHa: 2, unitPrice: 185000 },
  { id: "7", category: "Pestisida & Hayati", name: "Fungisida Azoksistrobin & Difenokonazol", unit: "liter", qtyPerHa: 1.5, unitPrice: 240000 },
  { id: "8", category: "Pestisida & Hayati", name: "Agensia Hayati Trichoderma harzianum", unit: "kg", qtyPerHa: 5, unitPrice: 45000 },
  { id: "9", category: "Tenaga Kerja (HOK)", name: "Olah Tanah Bajak & Garu (Traktor Roda 2)", unit: "HOK", qtyPerHa: 6, unitPrice: 180000 },
  { id: "10", category: "Tenaga Kerja (HOK)", name: "Tanam Padi Sistem Jajar Legowo 2:1", unit: "HOK", qtyPerHa: 25, unitPrice: 85000 },
  { id: "11", category: "Tenaga Kerja (HOK)", name: "Penyiangan Gulma (Matun) & Pemupukan", unit: "HOK", qtyPerHa: 15, unitPrice: 80000 },
  { id: "12", category: "Tenaga Kerja (HOK)", name: "Panen & Perontokan Gabah (Power Thresher)", unit: "HOK", qtyPerHa: 20, unitPrice: 95000 },
  { id: "13", category: "Sewa Alat & Pompa", name: "BBM & Sewa Pompa Air Irigasi 3 Inch", unit: "paket", qtyPerHa: 4, unitPrice: 250000 },
];

export default function RABPage() {
  const [landArea, setLandArea] = useState<number>(1.0);
  const [items, setItems] = useState<BudgetItem[]>(DEFAULT_ITEMS);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");

  const totalCost = items.reduce((acc, item) => acc + item.qtyPerHa * item.unitPrice * landArea, 0);

  // Group by category for chart
  const categories = ["Benih & Bibit", "Pupuk & Pembenah", "Pestisida & Hayati", "Tenaga Kerja (HOK)", "Sewa Alat & Pompa"];
  const categoryTotals = categories.map((cat) => {
    const subtotal = items
      .filter((i) => i.category === cat)
      .reduce((acc, item) => acc + item.qtyPerHa * item.unitPrice * landArea, 0);
    return {
      category: cat.split(" (")[0],
      total: Math.round(subtotal),
      percentage: totalCost > 0 ? Number(((subtotal / totalCost) * 100).toFixed(1)) : 0,
    };
  });

  const filteredItems = items.filter((i) =>
    selectedCategoryFilter === "ALL" ? true : i.category === selectedCategoryFilter
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 md:p-8 border border-purple-500/30 shadow-2xl bg-gradient-to-r from-slate-950 via-[#150a22] to-slate-950">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold">
              <Calculator className="w-3.5 h-3.5" />
              <span>Standar Baku Biaya Budidaya Pertanian</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white font-['Plus_Jakarta_Sans'] tracking-tight">
              Generator <span className="text-purple-400">RAB Usaha Tani Otomatis</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Penyusunan Rencana Anggaran Biaya standar baku dengan skala luas lahan dinamis, proporsi input pupuk & tenaga kerja HOK, dan siap cetak PDF.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-400 hover:opacity-90 text-slate-950 font-bold text-sm shadow-xl shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] w-fit shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Summary Cards & Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Luas Lahan Budidaya</span>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="50"
              value={landArea}
              onChange={(e) => setLandArea(Math.max(0.1, Number(e.target.value)))}
              className="w-24 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold font-['Outfit'] text-lg outline-none focus:border-purple-400"
            />
            <span className="text-sm font-semibold text-slate-300">Hektar (Ha)</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Anggaran Biaya (RAB)</span>
          <p className="text-2xl font-black text-purple-300 font-['Outfit'] mt-1">
            Rp {totalCost.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Biaya per Hektar Rerata</span>
          <p className="text-2xl font-black text-emerald-400 font-['Outfit'] mt-1">
            Rp {Math.round(totalCost / landArea).toLocaleString("id-ID")} <span className="text-xs text-slate-400 font-normal">/Ha</span>
          </p>
        </div>
      </div>

      {/* Category Chart */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-200">Proporsi Anggaran Biaya Berdasarkan Komponen</span>
          <span className="text-slate-400">Persentase (%)</span>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryTotals} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="category" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#fff",
                }}
                formatter={(val: any, name: any, item: any) => [
                  `Rp ${Number(val).toLocaleString("id-ID")} (${item.payload.percentage}%)`,
                  "Total Biaya",
                ]}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {categoryTotals.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={["#38bdf8", "#34d399", "#fbbf24", "#a78bfa", "#f472b6"][index % 5]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table of Budget Items */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-bold text-white text-base">Rincian Item Anggaran Biaya Pertanian ({items.length} Item)</h2>
          <div className="flex items-center gap-2">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 outline-none"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Deskripsi Item & Spesifikasi</th>
                <th className="p-3.5 text-center">Satuan</th>
                <th className="p-3.5 text-right">Kebutuhan ({landArea} Ha)</th>
                <th className="p-3.5 text-right">Harga Satuan (Rp)</th>
                <th className="p-3.5 text-right">Subtotal (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredItems.map((item) => {
                const subtotal = item.qtyPerHa * landArea * item.unitPrice;
                return (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-semibold text-purple-300 border border-purple-500/20">
                        {item.category.split(" (")[0]}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-white">{item.name}</td>
                    <td className="p-3.5 text-center text-slate-400">{item.unit}</td>
                    <td className="p-3.5 text-right font-mono font-semibold text-slate-200">
                      {(item.qtyPerHa * landArea).toLocaleString("id-ID")}
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-400">
                      Rp {item.unitPrice.toLocaleString("id-ID")}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-purple-300">
                      Rp {Math.round(subtotal).toLocaleString("id-ID")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-900 font-bold text-white border-t border-slate-700">
              <tr>
                <td colSpan={5} className="p-4 text-right">
                  TOTAL ANGGARAN ({landArea} HEKTAR):
                </td>
                <td className="p-4 text-right text-base font-black font-['Outfit'] text-emerald-400">
                  Rp {totalCost.toLocaleString("id-ID")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
