"use client";

import React, { useState } from "react";
import { RABItem } from "@/lib/types";
import {
  Calculator,
  Plus,
  Trash2,
  Printer,
  Coins,
  FileSpreadsheet,
  CheckCircle2,
} from "lucide-react";

export default function RABPage() {
  const [landArea, setLandArea] = useState<number>(1.0);
  const [commodity, setCommodity] = useState<string>("Padi Sawah (Oryza sativa)");

  const [items, setItems] = useState<RABItem[]>([
    { id: "1", category: "Bibit", name: "Benih Padi Bersertifikasi (Inpari 32)", volume: 25, unit: "kg", unit_price: 18000, total_price: 450000 },
    { id: "2", category: "Pupuk & Nutrisi", name: "Pupuk Urea Granul Non-Subsidi", volume: 200, unit: "kg", unit_price: 6500, total_price: 1300000 },
    { id: "3", category: "Pupuk & Nutrisi", name: "Pupuk NPK Phonska Plus", volume: 300, unit: "kg", unit_price: 11000, total_price: 3300000 },
    { id: "4", category: "Pupuk & Nutrisi", name: "Pupuk Organik / Kompos Matang", volume: 2000, unit: "kg", unit_price: 800, total_price: 1600000 },
    { id: "5", category: "Pestisida & Proteksi", name: "Insektisida Proteksi Wereng & Penggerek", volume: 4, unit: "botol", unit_price: 125000, total_price: 500000 },
    { id: "6", category: "Pestisida & Proteksi", name: "Fungisida Pencegah Blas & Hawar Daun", volume: 3, unit: "botol", unit_price: 110000, total_price: 330000 },
    { id: "7", category: "Tenaga Kerja", name: "Olah Tanah (Traktor Roda 2)", volume: 1, unit: "paket/ha", unit_price: 1800000, total_price: 1800000 },
    { id: "8", category: "Tenaga Kerja", name: "Tanam & Pindah Bibit (Transplanting)", volume: 20, unit: "HOK", unit_price: 90000, total_price: 1800000 },
    { id: "9", category: "Tenaga Kerja", name: "Penyiangan Gulma & Pemupukan", volume: 15, unit: "HOK", unit_price: 85000, total_price: 1275000 },
    { id: "10", category: "Tenaga Kerja", name: "Pemanenan & Perontokan (Combine/Manual)", volume: 1, unit: "paket/ha", unit_price: 2500000, total_price: 2500000 },
  ]);

  const [newItem, setNewItem] = useState<Omit<RABItem, "id" | "total_price">>({
    category: "Pupuk & Nutrisi",
    name: "",
    volume: 1,
    unit: "kg",
    unit_price: 0,
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;

    const item: RABItem = {
      id: Date.now().toString(),
      ...newItem,
      total_price: newItem.volume * newItem.unit_price,
    };

    setItems([...items, item]);
    setNewItem({
      category: "Pupuk & Nutrisi",
      name: "",
      volume: 1,
      unit: "kg",
      unit_price: 0,
    });
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const totalBudget = items.reduce((acc, curr) => acc + curr.total_price * landArea, 0);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const categories = ["Bibit", "Pupuk & Nutrisi", "Pestisida & Proteksi", "Tenaga Kerja", "Peralatan / Lainnya"] as const;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-purple-500/20 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2 font-['Plus_Jakarta_Sans']">
              <span>Generator RAB Budidaya Otomatis</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-semibold border border-purple-500/30">
                Standard Standar Usaha Tani
              </span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300">
              Penyusunan Rencana Anggaran Biaya standar baku pertanian presisi dengan kalkulasi dinamis per hektar
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] w-fit"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Simpan PDF</span>
        </button>
      </div>

      {/* Overview & Total Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Komoditas Terpilih</span>
          <p className="text-base font-bold text-white">{commodity}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-semibold">Faktor Luas Lahan</span>
            <span className="text-xs font-mono font-bold text-purple-400">{landArea} Hektar</span>
          </div>
          <input
            type="range"
            min="0.25"
            max="10"
            step="0.25"
            value={landArea}
            onChange={(e) => setLandArea(Number(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer mt-1"
          />
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-purple-950/20 space-y-1">
          <span className="text-xs text-purple-300 font-semibold">Total Estimasi Anggaran (RAB)</span>
          <p className="text-2xl font-black text-white font-['Outfit'] text-purple-400">
            {formatIDR(totalBudget)}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-purple-400" />
            <span>Rincian Komponen Anggaran</span>
          </h2>
          <span className="text-xs text-slate-400">{items.length} Komponen Input</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Kategori</th>
                <th className="p-3">Nama Kebutuhan</th>
                <th className="p-3 text-right">Volume (1 Ha)</th>
                <th className="p-3 text-right">Harga Satuan</th>
                <th className="p-3 text-right">Total Sub-Biaya</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3 text-white font-semibold">{item.name}</td>
                  <td className="p-3 text-right font-mono text-slate-300">
                    {(item.volume * landArea).toLocaleString("id-ID")} {item.unit}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-300">
                    {formatIDR(item.unit_price)}
                  </td>
                  <td className="p-3 text-right font-mono text-emerald-400 font-bold">
                    {formatIDR(item.total_price * landArea)}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1 rounded"
                      title="Hapus Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Item Form */}
        <form onSubmit={handleAddItem} className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-6 gap-3 items-end">
          <div>
            <label className="text-[11px] text-slate-400">Kategori</label>
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
              className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] text-slate-400">Nama Kebutuhan</label>
            <input
              type="text"
              placeholder="Contoh: Pupuk NPK Tambahan..."
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400">Volume & Satuan</label>
            <div className="flex gap-1 mt-1">
              <input
                type="number"
                min="1"
                value={newItem.volume}
                onChange={(e) => setNewItem({ ...newItem, volume: Number(e.target.value) })}
                className="w-16 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
              />
              <input
                type="text"
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                className="w-14 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400">Harga Satuan (Rp)</label>
            <input
              type="number"
              placeholder="0"
              value={newItem.unit_price || ""}
              onChange={(e) => setNewItem({ ...newItem, unit_price: Number(e.target.value) })}
              className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </form>
      </div>
    </div>
  );
}
