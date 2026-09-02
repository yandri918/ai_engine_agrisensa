"use client";

import React, { useState, useMemo } from "react";
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
  Scale,
  TrendingUp,
  TrendingDown,
  Info,
  ShieldCheck,
  Award,
  Sprout,
  Users,
  Briefcase,
  FileSpreadsheet,
  RotateCcw,
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
  PieChart,
  Pie,
} from "recharts";

interface BudgetItem {
  id: string;
  category: "Benih & Bibit" | "Pupuk & Pembenah" | "Pestisida & Hayati" | "Tenaga Kerja (HOK)" | "Sarana Penunjang" | "Sewa Lahan & Lainnya";
  name: string;
  unit: string;
  qtyPerHa: number;
  unitPrice: number;
  notes?: string;
}

interface CropTemplate {
  id: string;
  name: string;
  category: string;
  defaultYieldTonHa: number;
  defaultPriceRpKg: number;
  durationMonths: number;
  description: string;
  items: BudgetItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 🌾 STANDAR BAKU AGRISENSA CROP TEMPLATES DATABASE
// ─────────────────────────────────────────────────────────────────────────────
const CROP_RAB_TEMPLATES: CropTemplate[] = [
  {
    id: "padi-sawah",
    name: "Padi Sawah (Inpari / Ciherang)",
    category: "Pangan Pokok",
    defaultYieldTonHa: 6.5,
    defaultPriceRpKg: 6500,
    durationMonths: 4,
    description: "Standar baku budidaya padi sawah irigasi teknis dengan sistem tanam Jajar Legowo 2:1.",
    items: [
      { id: "p-1", category: "Benih & Bibit", name: "Benih Padi Bersertifikat Inpari 32", unit: "kg", qtyPerHa: 25, unitPrice: 18000, notes: "Kebutuhan per hektar" },
      { id: "p-2", category: "Pupuk & Pembenah", name: "Pupuk Urea Granul Non-Subsidi", unit: "kg", qtyPerHa: 250, unitPrice: 7500, notes: "Dasar & 2x susulan" },
      { id: "p-3", category: "Pupuk & Pembenah", name: "Pupuk NPK Phonska Plus 15-15-15", unit: "kg", qtyPerHa: 300, unitPrice: 9500, notes: "Dasar & susulan" },
      { id: "p-4", category: "Pupuk & Pembenah", name: "Kapur Pertanian Dolomit (CaMg)", unit: "kg", qtyPerHa: 1000, unitPrice: 1200, notes: "Koreksi pH tanah" },
      { id: "p-5", category: "Pupuk & Pembenah", name: "Pupuk Organik Bokashi Matang", unit: "kg", qtyPerHa: 2000, unitPrice: 1000, notes: "Pembenah biologi tanah" },
      { id: "p-6", category: "Pestisida & Hayati", name: "Insektisida Fipronil (Wereng & Sundep)", unit: "liter", qtyPerHa: 2.0, unitPrice: 185000, notes: "Pengendalian preventif" },
      { id: "p-7", category: "Pestisida & Hayati", name: "Fungisida Azoksistrobin & Difenokonazol", unit: "liter", qtyPerHa: 1.5, unitPrice: 240000, notes: "Blast & patah leher" },
      { id: "p-8", category: "Pestisida & Hayati", name: "Agensia Hayati Trichoderma harzianum", unit: "kg", qtyPerHa: 5.0, unitPrice: 45000, notes: "Imunisasi persemaian" },
      { id: "p-9", category: "Tenaga Kerja (HOK)", name: "Olah Tanah Bajak & Garu (Traktor R2)", unit: "HOK", qtyPerHa: 6, unitPrice: 180000, notes: "Olah tanah sempurna" },
      { id: "p-10", category: "Tenaga Kerja (HOK)", name: "Tanam Jajar Legowo 2:1", unit: "HOK", qtyPerHa: 25, unitPrice: 85000, notes: "Tenaga tanam regu" },
      { id: "p-11", category: "Tenaga Kerja (HOK)", name: "Matun Gulma & Aplikasi Pupuk", unit: "HOK", qtyPerHa: 15, unitPrice: 80000, notes: "Pemeliharaan 14 & 35 HST" },
      { id: "p-12", category: "Tenaga Kerja (HOK)", name: "Panen & Perontokan (Power Thresher)", unit: "HOK", qtyPerHa: 20, unitPrice: 95000, notes: "Panen potong & rontok" },
      { id: "p-13", category: "Sewa Lahan & Lainnya", name: "Sewa Lahan Sawah Irigasi", unit: "ha", qtyPerHa: 1, unitPrice: 5000000, notes: "Per musim tanam" },
      { id: "p-14", category: "Sewa Lahan & Lainnya", name: "BBM & Operasional Pompa Irigasi", unit: "paket", qtyPerHa: 4, unitPrice: 250000, notes: "Kebutuhan air suplisi" },
    ],
  },
  {
    id: "cabai-merah-keriting",
    name: "Cabai Merah Keriting (Mulsa Plastik)",
    category: "Hortikultura",
    defaultYieldTonHa: 16.0,
    defaultPriceRpKg: 38000,
    durationMonths: 6,
    description: "SOP budidaya cabai intensif bedengan mulsa MPHP dengan tiang ajir bambu.",
    items: [
      { id: "c-1", category: "Benih & Bibit", name: "Benih Cabai Hibrida F1 (10 Sachet)", unit: "sachet", qtyPerHa: 10, unitPrice: 165000, notes: "Populasi 18.000 btg" },
      { id: "c-2", category: "Pupuk & Pembenah", name: "Kotoran Ayam Fermentasi Matang", unit: "kg", qtyPerHa: 10000, unitPrice: 800, notes: "Pupuk dasar bedengan" },
      { id: "c-3", category: "Pupuk & Pembenah", name: "Pupuk NPK 16-16-16 Mutiara / Yara", unit: "kg", qtyPerHa: 800, unitPrice: 14500, notes: "Pupuk dasar & kocor" },
      { id: "c-4", category: "Pupuk & Pembenah", name: "KNO3 Putih / Merah (Kalium Nitrat)", unit: "kg", qtyPerHa: 200, unitPrice: 24000, notes: "Fase generatif pembungaan" },
      { id: "c-5", category: "Pupuk & Pembenah", name: "Pupuk MKP (Mono Kalium Fosfat)", unit: "kg", qtyPerHa: 100, unitPrice: 38000, notes: "Penguat bunga & buah" },
      { id: "c-6", category: "Pupuk & Pembenah", name: "Kalsium Nitrat (CNG/Calcinit)", unit: "kg", qtyPerHa: 150, unitPrice: 18000, notes: "Cegah busuk pantat (BER)" },
      { id: "c-7", category: "Pupuk & Pembenah", name: "Kapur Pertanian Dolomit Super", unit: "kg", qtyPerHa: 2000, unitPrice: 1200, notes: "Menaikkan pH ke 6.5" },
      { id: "c-8", category: "Sarana Penunjang", name: "Mulsa Plastik Hitam Perak (MPHP)", unit: "roll", qtyPerHa: 8, unitPrice: 650000, notes: "Ukuran 120cm x 500m" },
      { id: "c-9", category: "Sarana Penunjang", name: "Ajir Bambu Belah (Panjang 1.5m)", unit: "batang", qtyPerHa: 18000, unitPrice: 250, notes: "Penyangga tanaman" },
      { id: "c-10", category: "Sarana Penunjang", name: "Tali Salaran / Tali Pertanian", unit: "roll", qtyPerHa: 10, unitPrice: 45000, notes: "Pengikat ajir ganda" },
      { id: "c-11", category: "Pestisida & Hayati", name: "Insektisida Abamektin & Spinetoram", unit: "liter", qtyPerHa: 4.0, unitPrice: 280000, notes: "Thrips & Kutu Kebul" },
      { id: "c-12", category: "Pestisida & Hayati", name: "Fungisida Mankozeb & Azoksistrobin", unit: "kg", qtyPerHa: 8.0, unitPrice: 120000, notes: "Antraknosa / Patek" },
      { id: "c-13", category: "Tenaga Kerja (HOK)", name: "Olah Tanah, Bedengan & Tabur Pupuk", unit: "HOK", qtyPerHa: 40, unitPrice: 90000, notes: "Pembuatan bedeng rapi" },
      { id: "c-14", category: "Tenaga Kerja (HOK)", name: "Pasang Mulsa, Pelubangan & Tanam", unit: "HOK", qtyPerHa: 25, unitPrice: 85000, notes: "Pindah tanam bibit" },
      { id: "c-15", category: "Tenaga Kerja (HOK)", name: "Tancap Ajir & Tali Pengikat", unit: "HOK", qtyPerHa: 30, unitPrice: 85000, notes: "Pemasangan ajir 18k" },
      { id: "c-16", category: "Tenaga Kerja (HOK)", name: "Perawatan Rutin & Kocor Pupuk", unit: "HOK", qtyPerHa: 50, unitPrice: 85000, notes: "Kocor berkala tiap 7 hari" },
      { id: "c-17", category: "Tenaga Kerja (HOK)", name: "Pemetikan Panen Bertahap (15x Petik)", unit: "HOK", qtyPerHa: 80, unitPrice: 85000, notes: "Tenaga petik panen" },
      { id: "c-18", category: "Sewa Lahan & Lainnya", name: "Sewa Lahan Darat Tegal", unit: "ha", qtyPerHa: 1, unitPrice: 7000000, notes: "Masa sewa 8 bulan" },
    ],
  },
  {
    id: "bawang-merah-brebes",
    name: "Bawang Merah (Sentra Brebes / Nganjuk)",
    category: "Hortikultura",
    defaultYieldTonHa: 12.0,
    defaultPriceRpKg: 28000,
    durationMonths: 3,
    description: "Budidaya bawang merah umbi varietas Tajuk / Super Cross sistem bedengan guludan.",
    items: [
      { id: "b-1", category: "Benih & Bibit", name: "Umbi Bibit Bawang Merah Siap Tanam", unit: "kg", qtyPerHa: 1200, unitPrice: 35000, notes: "Bibit simpanan 2 bulan" },
      { id: "b-2", category: "Pupuk & Pembenah", name: "Pupuk NPK 16-16-16 Mutiara", unit: "kg", qtyPerHa: 500, unitPrice: 14500, notes: "Pupuk dasar & susulan" },
      { id: "b-3", category: "Pupuk & Pembenah", name: "Pupuk ZA (Sulfur & Nitrogen)", unit: "kg", qtyPerHa: 300, unitPrice: 4500, notes: "Pemicu aroma & umbi" },
      { id: "b-4", category: "Pupuk & Pembenah", name: "Pupuk SP-36 (Fosfat Cepat Larut)", unit: "kg", qtyPerHa: 200, unitPrice: 5500, notes: "Penguat perakaran" },
      { id: "b-5", category: "Pupuk & Pembenah", name: "Kompos Organik Kascing / Bokashi", unit: "kg", qtyPerHa: 5000, unitPrice: 800, notes: "Struktur tanah gembur" },
      { id: "b-6", category: "Pestisida & Hayati", name: "Insektisida Emamektin (Ulat Grayak)", unit: "liter", qtyPerHa: 6.0, unitPrice: 220000, notes: "Hama spodoptera" },
      { id: "b-7", category: "Pestisida & Hayati", name: "Fungisida Difenokonazol (Moler / Inul)", unit: "liter", qtyPerHa: 4.0, unitPrice: 260000, notes: "Penyakit layu fusarium" },
      { id: "b-8", category: "Tenaga Kerja (HOK)", name: "Olah Tanah Guludan & Pemupukan Dasar", unit: "HOK", qtyPerHa: 35, unitPrice: 90000, notes: "Guludan tinggi 30cm" },
      { id: "b-9", category: "Tenaga Kerja (HOK)", name: "Tanam Umbi Bawang (Potong Pucuk)", unit: "HOK", qtyPerHa: 30, unitPrice: 85000, notes: "Jarak tanam 15x15cm" },
      { id: "b-10", category: "Tenaga Kerja (HOK)", name: "Penyiraman Tiap Hari & Matun", unit: "HOK", qtyPerHa: 45, unitPrice: 85000, notes: "Siram gembor pagi sore" },
      { id: "b-11", category: "Tenaga Kerja (HOK)", name: "Panen, Rogol & Jemur Angin", unit: "HOK", qtyPerHa: 40, unitPrice: 90000, notes: "Ikat gantung di para" },
      { id: "b-12", category: "Sewa Lahan & Lainnya", name: "Sewa Lahan Sawah Bawang", unit: "ha", qtyPerHa: 1, unitPrice: 6000000, notes: "Per musim 70 hari" },
    ],
  },
  {
    id: "jagung-hibrida",
    name: "Jagung Hibrida (Tongkol Dua / Pakan)",
    category: "Pangan Pokok",
    defaultYieldTonHa: 8.5,
    defaultPriceRpKg: 5500,
    durationMonths: 4,
    description: "Budidaya jagung pipil pakan varietas hibrida tahan bulai & ulat grayak.",
    items: [
      { id: "j-1", category: "Benih & Bibit", name: "Benih Jagung Hibrida (NK / Bisi / Pioneer)", unit: "kg", qtyPerHa: 20, unitPrice: 95000, notes: "Kebutuhan per hektar" },
      { id: "j-2", category: "Pupuk & Pembenah", name: "Pupuk Urea Granul", unit: "kg", qtyPerHa: 350, unitPrice: 7500, notes: "Pupuk susulan 1 & 2" },
      { id: "j-3", category: "Pupuk & Pembenah", name: "Pupuk NPK Phonska Plus", unit: "kg", qtyPerHa: 300, unitPrice: 9500, notes: "Pupuk dasar & pengisi biji" },
      { id: "j-4", category: "Pupuk & Pembenah", name: "Pupuk Organik Padat", unit: "kg", qtyPerHa: 1000, unitPrice: 1000, notes: "Pembenah tanah" },
      { id: "j-5", category: "Pestisida & Hayati", name: "Herbisida Selektif Pra & Purna Tumbuh", unit: "liter", qtyPerHa: 4.0, unitPrice: 95000, notes: "Bebas gulma 40 hari" },
      { id: "j-6", category: "Pestisida & Hayati", name: "Insektisida FAW (Ulat Grayak Jagung)", unit: "liter", qtyPerHa: 3.0, unitPrice: 145000, notes: "Pengendalian pucuk" },
      { id: "j-7", category: "Tenaga Kerja (HOK)", name: "Olah Tanah Ringan / TOT & Tugal Tanam", unit: "HOK", qtyPerHa: 12, unitPrice: 85000, notes: "Tanam tugal 2 biji" },
      { id: "j-8", category: "Tenaga Kerja (HOK)", name: "Pemupukan 1 & 2 (Tugal & Tutup)", unit: "HOK", qtyPerHa: 14, unitPrice: 85000, notes: "Umur 15 & 35 HST" },
      { id: "j-9", category: "Tenaga Kerja (HOK)", name: "Panen, Kupas Tongkol & Angkut", unit: "HOK", qtyPerHa: 25, unitPrice: 90000, notes: "Panen masak fisiologis" },
      { id: "j-10", category: "Sewa Lahan & Lainnya", name: "Sewa Mesin Pemipil Jagung (Corn Sheller)", unit: "paket", qtyPerHa: 1, unitPrice: 1500000, notes: "Pipil bersih" },
      { id: "j-11", category: "Sewa Lahan & Lainnya", name: "Sewa Lahan Tegal / Sawah Tadah Hujan", unit: "ha", qtyPerHa: 1, unitPrice: 3500000, notes: "Per musim" },
    ],
  },
  {
    id: "kentang-granola",
    name: "Kentang Granola (Dataran Tinggi Dieng)",
    category: "Hortikultura",
    defaultYieldTonHa: 22.0,
    defaultPriceRpKg: 14000,
    durationMonths: 4,
    description: "Budidaya kentang sayur konsumsi di dataran tinggi >1.200 mdpl.",
    items: [
      { id: "k-1", category: "Benih & Bibit", name: "Bibit Kentang G2 Bersertifikat", unit: "kg", qtyPerHa: 1800, unitPrice: 24000, notes: "Ukuran umbi M/S" },
      { id: "k-2", category: "Pupuk & Pembenah", name: "Kotoran Ayam Petelur Fermentasi", unit: "kg", qtyPerHa: 15000, unitPrice: 800, notes: "Dasar bedengan melimpah" },
      { id: "k-3", category: "Pupuk & Pembenah", name: "Pupuk NPK 15-15-15", unit: "kg", qtyPerHa: 1000, unitPrice: 14000, notes: "Pupuk utama pembesaran" },
      { id: "k-4", category: "Pupuk & Pembenah", name: "Pupuk SP-36 & KCl", unit: "kg", qtyPerHa: 600, unitPrice: 6000, notes: "Kekuatan batang & pati" },
      { id: "k-5", category: "Pupuk & Pembenah", name: "KNO3 Putih Kalium Murni", unit: "kg", qtyPerHa: 200, unitPrice: 24000, notes: "Fase pengisian umbi" },
      { id: "k-6", category: "Pestisida & Hayati", name: "Fungisida Simoksanil & Mankozeb", unit: "kg", qtyPerHa: 12.0, unitPrice: 160000, notes: "Cegah busuk daun Phytophthora" },
      { id: "k-7", category: "Pestisida & Hayati", name: "Insektisida Penggorok Daun (Liriomyza)", unit: "liter", qtyPerHa: 6.0, unitPrice: 190000, notes: "Hama daun" },
      { id: "k-8", category: "Tenaga Kerja (HOK)", name: "Olah Tanah Bedengan Tinggi & Tabur Kohe", unit: "HOK", qtyPerHa: 50, unitPrice: 90000, notes: "Gembur tanah dalam" },
      { id: "k-9", category: "Tenaga Kerja (HOK)", name: "Tanam Umbi & Pembumbunan 1 & 2", unit: "HOK", qtyPerHa: 40, unitPrice: 85000, notes: "Tutup tanah agar tidak hijau" },
      { id: "k-10", category: "Tenaga Kerja (HOK)", name: "Panen Gali Umbi & Sortir Grading", unit: "HOK", qtyPerHa: 60, unitPrice: 95000, notes: "Grading kelas super/AB" },
      { id: "k-11", category: "Sewa Lahan & Lainnya", name: "Sewa Lahan Dataran Tinggi Dieng", unit: "ha", qtyPerHa: 1, unitPrice: 10000000, notes: "Per musim tanam" },
    ],
  },
  {
    id: "melon-greenhouse",
    name: "Melon Hidroponik Greenhouse (1.000 m²)",
    category: "Buah Premium",
    defaultYieldTonHa: 3.5, // 3.5 ton per 1000m2 greenhouse
    defaultPriceRpKg: 28000,
    durationMonths: 3,
    description: "Budidaya melon premium Golden Inthanon / Hamami sistem irigasi tetes (drip) substrat cocopeat.",
    items: [
      { id: "m-1", category: "Benih & Bibit", name: "Benih Melon Golden Inthanon F1", unit: "biji", qtyPerHa: 2200, unitPrice: 1500, notes: "2.000 polibag aktif" },
      { id: "m-2", category: "Pupuk & Pembenah", name: "Nutrisi AB Mix Hidroponik Buah Khusus", unit: "paket", qtyPerHa: 50, unitPrice: 85000, notes: "Formula EC 1.8 - 2.8" },
      { id: "m-3", category: "Sarana Penunjang", name: "Cocopeat Low EC & Polibag Tebal", unit: "set", qtyPerHa: 2000, unitPrice: 4500, notes: "Media tanam steril" },
      { id: "m-4", category: "Sarana Penunjang", name: "Tali Gantung Buah & Klip Batang", unit: "set", qtyPerHa: 2000, unitPrice: 800, notes: "Gantungan melon brix 14+" },
      { id: "m-5", category: "Pestisida & Hayati", name: "Bio-Fungisida & Minyak Neem Organik", unit: "liter", qtyPerHa: 4.0, unitPrice: 150000, notes: "Tanpa residu kimia (GH)" },
      { id: "m-6", category: "Tenaga Kerja (HOK)", name: "Pruning Wiwil Cabang & Polinasi Manual", unit: "HOK", qtyPerHa: 20, unitPrice: 90000, notes: "Kawin bunga pagi hari" },
      { id: "m-7", category: "Tenaga Kerja (HOK)", name: "Seleksi 1 Buah Terbaik & Gantung", unit: "HOK", qtyPerHa: 15, unitPrice: 90000, notes: "1 pohon 1 buah master" },
      { id: "m-8", category: "Tenaga Kerja (HOK)", name: "Panen, Uji Brix & Packing Jaring", unit: "HOK", qtyPerHa: 15, unitPrice: 90000, notes: "Brix meter minimum 13.5" },
      { id: "m-9", category: "Sewa Lahan & Lainnya", name: "Listrik Pompa Drip Otomatis & Sensor", unit: "bulan", qtyPerHa: 3, unitPrice: 350000, notes: "Timer fertigasi otomatis" },
    ],
  },
];

export default function RABPage() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("cabai-merah-keriting");
  const [landArea, setLandArea] = useState<number>(1.0);
  const [sellingPrice, setSellingPrice] = useState<number>(38000);
  const [estimatedYield, setEstimatedYield] = useState<number>(16.0);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");

  // Active items in the budget
  const [items, setItems] = useState<BudgetItem[]>(CROP_RAB_TEMPLATES[1].items);

  // Switch Crop Template
  const handleSelectTemplate = (templateId: string) => {
    const template = CROP_RAB_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(template.id);
      setSellingPrice(template.defaultPriceRpKg);
      setEstimatedYield(template.defaultYieldTonHa);
      setItems(JSON.parse(JSON.stringify(template.items)));
    }
  };

  // Calculations
  const totalCost = useMemo(() => {
    return items.reduce((acc, item) => acc + item.qtyPerHa * item.unitPrice * landArea, 0);
  }, [items, landArea]);

  const totalHarvestKg = useMemo(() => {
    return estimatedYield * 1000 * landArea;
  }, [estimatedYield, landArea]);

  const totalRevenue = useMemo(() => {
    return totalHarvestKg * sellingPrice;
  }, [totalHarvestKg, sellingPrice]);

  const netProfit = useMemo(() => {
    return totalRevenue - totalCost;
  }, [totalRevenue, totalCost]);

  const roiPercent = useMemo(() => {
    return totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
  }, [netProfit, totalCost]);

  const hppPerKg = useMemo(() => {
    return totalHarvestKg > 0 ? totalCost / totalHarvestKg : 0;
  }, [totalCost, totalHarvestKg]);

  const bepKg = useMemo(() => {
    return sellingPrice > 0 ? totalCost / sellingPrice : 0;
  }, [totalCost, sellingPrice]);

  const marginOfSafety = useMemo(() => {
    return totalHarvestKg > 0 ? ((totalHarvestKg - bepKg) / totalHarvestKg) * 100 : 0;
  }, [totalHarvestKg, bepKg]);

  // Category summary for chart
  const categoriesList = [
    "Benih & Bibit",
    "Pupuk & Pembenah",
    "Pestisida & Hayati",
    "Tenaga Kerja (HOK)",
    "Sarana Penunjang",
    "Sewa Lahan & Lainnya",
  ];

  const categoryTotals = useMemo(() => {
    return categoriesList.map((cat) => {
      const subtotal = items
        .filter((i) => i.category === cat)
        .reduce((acc, item) => acc + item.qtyPerHa * item.unitPrice * landArea, 0);
      return {
        category: cat.split(" (")[0],
        total: Math.round(subtotal),
        percentage: totalCost > 0 ? Number(((subtotal / totalCost) * 100).toFixed(1)) : 0,
      };
    });
  }, [items, landArea, totalCost]);

  // Edit / Add / Remove Item
  const handleItemChange = (id: string, field: "qtyPerHa" | "unitPrice" | "name", value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddItem = () => {
    const newItem: BudgetItem = {
      id: `custom-${Date.now()}`,
      category: "Pupuk & Pembenah",
      name: "Item Biaya Tambahan Kustom",
      unit: "kg",
      qtyPerHa: 10,
      unitPrice: 50000,
      notes: "Input kustom pengguna",
    };
    setItems((prev) => [...prev, newItem]);
  };

  const filteredItems = items.filter((i) =>
    selectedCategoryFilter === "ALL" ? true : i.category === selectedCategoryFilter
  );

  const selectedTemplate = CROP_RAB_TEMPLATES.find((t) => t.id === selectedTemplateId);

  return (
    <div className="space-y-8 pb-16 text-slate-100 print:bg-white print:text-black print:p-0">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* HEADER BANNER                                                      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 border border-purple-500/30 shadow-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-950 backdrop-blur-xl print:hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold tracking-wide uppercase">
              <Calculator className="w-3.5 h-3.5" />
              AgriSensa Enterprise Farm Budgeting & Cost Standard Engine
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Generator RAB Usaha Tani Otomatis
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Penyusunan Rencana Anggaran Biaya standar baku dengan skala luas lahan dinamis, proporsi input pupuk & tenaga kerja HOK, indikator ROI/BEP, dan siap cetak PDF resmi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan PDF Resmi</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* PRINT-ONLY: DOKUMEN RESMI STANDAR BAKU RENCANA ANGGARAN BIAYA (RAB) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="hidden print:block font-serif text-black space-y-6">
        {/* Kop Surat Dokumen */}
        <div className="border-b-2 border-black pb-3 text-center space-y-1">
          <h1 className="text-xl font-extrabold uppercase tracking-wider">
            AGRISENSA FARM BUDGETING & ENGINEERING
          </h1>
          <p className="text-xs font-semibold text-gray-700">
            DOKUMEN RENCANA ANGGARAN BIAYA (RAB) USAHA TANI STANDAR BAKU
          </p>
          <p className="text-[10px] text-gray-500 italic">
            Nomor Dokumen: RAB/{selectedTemplate?.id.toUpperCase()}/{new Date().getFullYear()}/{Math.floor(1000 + Math.random() * 9000)}
          </p>
        </div>

        {/* Tabel Metadata Identitas Proyek */}
        <div className="border border-black p-3 text-xs grid grid-cols-2 gap-x-6 gap-y-1.5 bg-gray-50">
          <div>
            <span className="font-bold">Komoditas Usaha Tani:</span> {selectedTemplate?.name}
          </div>
          <div>
            <span className="font-bold">Skala Luas Lahan:</span> {landArea} Hektar
          </div>
          <div>
            <span className="font-bold">Estimasi Hasil Panen:</span> {estimatedYield} Ton/Ha (Total: {totalHarvestKg.toLocaleString("id-ID")} kg)
          </div>
          <div>
            <span className="font-bold">Asumsi Harga Jual:</span> Rp {sellingPrice.toLocaleString("id-ID")} / kg
          </div>
          <div>
            <span className="font-bold">Durasi Musim Tanam:</span> {selectedTemplate?.durationMonths} Bulan
          </div>
          <div>
            <span className="font-bold">Tanggal Diterbitkan:</span> {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Ringkasan Finansial Eksekutif */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wide border-b border-black pb-0.5">
            I. Ringkasan Kelayakan Finansial & Proyeksi Usaha
          </h3>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="border border-black p-2 bg-gray-50">
              <span className="text-[10px] text-gray-600 block uppercase font-bold">Total Biaya (RAB)</span>
              <strong className="text-sm font-bold">Rp {totalCost.toLocaleString("id-ID")}</strong>
            </div>
            <div className="border border-black p-2 bg-gray-50">
              <span className="text-[10px] text-gray-600 block uppercase font-bold">Estimasi Omset</span>
              <strong className="text-sm font-bold">Rp {totalRevenue.toLocaleString("id-ID")}</strong>
            </div>
            <div className="border border-black p-2 bg-gray-50">
              <span className="text-[10px] text-gray-600 block uppercase font-bold">Proyeksi Laba Bersih</span>
              <strong className="text-sm font-bold">Rp {netProfit.toLocaleString("id-ID")}</strong>
            </div>
            <div className="border border-black p-2 bg-gray-50">
              <span className="text-[10px] text-gray-600 block uppercase font-bold">ROI / MOS</span>
              <strong className="text-sm font-bold">{roiPercent.toFixed(1)}% / {marginOfSafety.toFixed(1)}%</strong>
            </div>
          </div>
          <div className="text-[11px] flex justify-between pt-1 text-gray-700">
            <span>Harga Pokok Produksi (HPP): <strong>Rp {Math.round(hppPerKg).toLocaleString("id-ID")} / kg</strong></span>
            <span>Titik Impas (BEP Volume): <strong>{Math.round(bepKg).toLocaleString("id-ID")} kg</strong></span>
            <span>Titik Impas (BEP Harga): <strong>Rp {Math.round(hppPerKg).toLocaleString("id-ID")} / kg</strong></span>
          </div>
        </div>

        {/* Tabel Detail Rincian Biaya */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wide border-b border-black pb-0.5">
            II. Rincian Komponen Biaya Sarana Produksi & Tenaga Kerja (HOK)
          </h3>
          <table className="w-full text-[10px] border-collapse border border-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black px-2 py-1 text-center w-8">No</th>
                <th className="border border-black px-2 py-1 text-left w-32">Kategori</th>
                <th className="border border-black px-2 py-1 text-left">Deskripsi Komponen Biaya</th>
                <th className="border border-black px-2 py-1 text-right w-20">Volume/Ha</th>
                <th className="border border-black px-2 py-1 text-right w-24">Total Vol ({landArea} Ha)</th>
                <th className="border border-black px-2 py-1 text-right w-24">Harga Satuan (Rp)</th>
                <th className="border border-black px-2 py-1 text-right w-28">Subtotal (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const scaledVolume = item.qtyPerHa * landArea;
                const subtotal = scaledVolume * item.unitPrice;
                return (
                  <tr key={item.id}>
                    <td className="border border-black px-2 py-1 text-center">{idx + 1}</td>
                    <td className="border border-black px-2 py-1">{item.category}</td>
                    <td className="border border-black px-2 py-1 font-medium">{item.name}</td>
                    <td className="border border-black px-2 py-1 text-right">{item.qtyPerHa} {item.unit}</td>
                    <td className="border border-black px-2 py-1 text-right font-bold">
                      {scaledVolume.toLocaleString("id-ID", { maximumFractionDigits: 1 })} {item.unit}
                    </td>
                    <td className="border border-black px-2 py-1 text-right">
                      {item.unitPrice.toLocaleString("id-ID")}
                    </td>
                    <td className="border border-black px-2 py-1 text-right font-bold">
                      {Math.round(subtotal).toLocaleString("id-ID")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td colSpan={6} className="border border-black px-2 py-1.5 text-right uppercase">
                  TOTAL KEBUTUHAN MODAL USAHA TANI (RAB):
                </td>
                <td className="border border-black px-2 py-1.5 text-right text-xs">
                  Rp {totalCost.toLocaleString("id-ID")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Kolom Tanda Tangan & Pengesahan */}
        <div className="pt-6 grid grid-cols-2 gap-12 text-xs text-center print-page-break">
          <div className="space-y-16">
            <p>Dibuat dan Diajukan Oleh,<br /><span className="font-bold">Agronomis / Pengelola Usaha Tani</span></p>
            <p className="border-t border-black pt-1 w-48 mx-auto font-bold">( ............................................ )</p>
          </div>
          <div className="space-y-16">
            <p>Disetujui dan Disahkan Oleh,<br /><span className="font-bold">Investor / Pemilik Lahan</span></p>
            <p className="border-t border-black pt-1 w-48 mx-auto font-bold">( ............................................ )</p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SCREEN-ONLY: INTERACTIVE DASHBOARD & CONTROLS                       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="print:hidden space-y-8">
        {/* STEP 1: CROP TEMPLATE SELECTOR & PRIMARY CONTROLS */}
        <div className="p-6 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-white text-base">Pilih Standar Baku Komoditas Budidaya</h3>
              </div>
              <p className="text-xs text-slate-400">Pilih template komoditas untuk memuat resep dosis pupuk, benih, dan alokasi HOK teruji.</p>
            </div>

            {/* Template Selector Dropdown */}
            <div className="w-full md:w-80">
              <select
                value={selectedTemplateId}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className="w-full bg-slate-950 border border-purple-500/50 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400 font-bold"
              >
                {CROP_RAB_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Inputs: Land Area, Selling Price, Estimated Yield */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Luas Lahan (Hektar)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0.01"
                  step="0.1"
                  value={landArea}
                  onChange={(e) => setLandArea(Math.max(0.01, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-purple-500"
                />
                <span className="text-xs text-purple-400 font-bold">Ha</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Estimasi Hasil Panen</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={estimatedYield}
                  onChange={(e) => setEstimatedYield(Math.max(0.1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-purple-500"
                />
                <span className="text-xs text-emerald-400 font-bold">ton/Ha</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Asumsi Harga Jual (Rp/kg)</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-mono">Rp</span>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Math.max(500, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Durasi Siklus Budidaya</label>
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-extrabold text-white font-mono">{selectedTemplate?.durationMonths} Bulan</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  {selectedTemplate?.category}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FINANCIAL INTELLIGENCE SUMMARY KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl">
            <p className="text-[10px] text-slate-400 uppercase font-extrabold">Total Biaya Operasional (RAB)</p>
            <p className="text-xl md:text-2xl font-black text-white mt-1 font-mono">
              Rp {totalCost.toLocaleString("id-ID")}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              HPP: <strong className="text-slate-300">Rp {Math.round(hppPerKg).toLocaleString("id-ID")}/kg</strong>
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#090e18] border border-blue-500/30 shadow-xl">
            <p className="text-[10px] text-blue-400 uppercase font-extrabold">Estimasi Total Pendapatan</p>
            <p className="text-xl md:text-2xl font-black text-blue-400 mt-1 font-mono">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Total Panen: <strong className="text-blue-300">{totalHarvestKg.toLocaleString("id-ID")} kg</strong>
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#090e18] border border-emerald-500/30 shadow-xl">
            <p className="text-[10px] text-emerald-400 uppercase font-extrabold">Proyeksi Laba Bersih</p>
            <p className={`text-xl md:text-2xl font-black mt-1 font-mono ${netProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              Rp {netProfit.toLocaleString("id-ID")}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              ROI: <strong className="text-emerald-300">{roiPercent.toFixed(1)}%</strong>
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#090e18] border border-amber-500/30 shadow-xl">
            <p className="text-[10px] text-amber-400 uppercase font-extrabold">Batas Aman BEP (Break-Even)</p>
            <p className="text-xl md:text-2xl font-black text-amber-400 mt-1 font-mono">
              {Math.round(bepKg).toLocaleString("id-ID")} <span className="text-xs font-normal">kg</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Margin of Safety: <strong className="text-amber-300">{marginOfSafety.toFixed(1)}%</strong>
            </p>
          </div>
        </div>

        {/* COST PROPORTIONS CHART & 3 SCENARIOS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 p-6 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Struktur Proporsi Biaya Usaha Tani
            </h4>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryTotals} layout="vertical" margin={{ left: 15, right: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" tickFormatter={(v) => `Rp ${(v / 1e6).toFixed(1)}jt`} />
                  <YAxis dataKey="category" type="category" stroke="#94a3b8" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: 8, color: "#fff" }}
                    formatter={(v: any) => [`Rp ${Number(v).toLocaleString("id-ID")}`, "Total Biaya"]}
                  />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                    {categoryTotals.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={["#8b5cf6", "#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#64748b"][index % 6]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-6 p-6 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Simulasi 3 Skenario Panen & Keuntungan
            </h4>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">Optimis (+20%)</span>
                <p className="text-sm font-black text-white font-mono mt-1">
                  Rp {Math.round(totalRevenue * 1.38 - totalCost * 0.95).toLocaleString("id-ID")}
                </p>
                <p className="text-[10px] text-emerald-300">Panen: {(estimatedYield * 1.2).toFixed(1)} t/Ha</p>
                <p className="text-[10px] text-slate-400">Harga: +15%</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-sky-400 uppercase tracking-wider">Moderat (Sesuai)</span>
                <p className="text-sm font-black text-white font-mono mt-1">
                  Rp {Math.round(netProfit).toLocaleString("id-ID")}
                </p>
                <p className="text-[10px] text-sky-300">Panen: {estimatedYield.toFixed(1)} t/Ha</p>
                <p className="text-[10px] text-slate-400">Harga: Normal</p>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider">Pesimis (-20%)</span>
                <p className="text-sm font-black text-white font-mono mt-1">
                  Rp {Math.round(totalRevenue * 0.68 - totalCost * 1.05).toLocaleString("id-ID")}
                </p>
                <p className="text-[10px] text-rose-300">Panen: {(estimatedYield * 0.8).toFixed(1)} t/Ha</p>
                <p className="text-[10px] text-slate-400">Harga: -15%</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-[11px] text-slate-300">
              <strong>Catatan Analisis:</strong> Dengan BEP sebesar <strong>{Math.round(bepKg).toLocaleString("id-ID")} kg</strong>, usaha tani ini memiliki ketahanan risiko tinggi (Margin of Safety {marginOfSafety.toFixed(1)}%).
            </div>
          </div>
        </div>

        {/* DETAILED BUDGET ITEMS TABLE */}
        <div className="rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedCategoryFilter("ALL")}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedCategoryFilter === "ALL"
                    ? "bg-purple-500 text-slate-950 shadow"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                Semua Kategori ({items.length})
              </button>
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    selectedCategoryFilter === cat
                      ? "bg-purple-500 text-slate-950 font-bold shadow"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={handleAddItem}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all self-start md:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Item Biaya</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] uppercase text-slate-400 bg-slate-900 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Nama Komponen Biaya</th>
                  <th className="px-4 py-3 text-right">Volume / Ha</th>
                  <th className="px-4 py-3 text-right">Total Volume ({landArea} Ha)</th>
                  <th className="px-4 py-3 text-right">Harga Satuan (Rp)</th>
                  <th className="px-4 py-3 text-right">Subtotal Biaya (Rp)</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredItems.map((item, idx) => {
                  const scaledVolume = item.qtyPerHa * landArea;
                  const subtotal = scaledVolume * item.unitPrice;

                  return (
                    <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-4 py-3 text-slate-500 font-mono">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-purple-500 focus:outline-none w-full text-xs font-semibold"
                        />
                        {item.notes && <p className="text-[10px] text-slate-500">{item.notes}</p>}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-300">
                        <input
                          type="number"
                          step="0.1"
                          value={item.qtyPerHa}
                          onChange={(e) => handleItemChange(item.id, "qtyPerHa", Number(e.target.value))}
                          className="w-16 text-right bg-slate-950/60 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                        />{" "}
                        <span className="text-[10px] text-slate-500">{item.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-purple-300">
                        {scaledVolume.toLocaleString("id-ID", { maximumFractionDigits: 1 })} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-300">
                        <input
                          type="number"
                          step="100"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(item.id, "unitPrice", Number(e.target.value))}
                          className="w-24 text-right bg-slate-950/60 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-black text-emerald-400">
                        Rp {Math.round(subtotal).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Hapus baris"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-slate-700 bg-slate-900/90 font-extrabold">
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-right text-xs uppercase text-slate-300">
                    Total Rencana Anggaran Biaya (RAB):
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-emerald-400 font-mono font-black">
                    Rp {totalCost.toLocaleString("id-ID")}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
