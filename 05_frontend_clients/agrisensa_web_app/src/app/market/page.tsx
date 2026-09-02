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
  Search,
  Scale,
  Coins,
  Plane,
  Ship,
  CheckCircle2,
  AlertCircle,
  Tag,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";

interface Commodity {
  id: string;
  name: string;
  jaName?: string;
  category: "Pangan" | "Hortikultura" | "Buah-buahan" | "Perkebunan";
  country: "ID" | "JP" | "Bilateral";
  currentPriceIDR: number;
  currentPriceJPY: number;
  unit: string;
  change7d: number;
  change30d: number;
  trend: "up" | "down";
  volatility: number;
  arrivalVolumeTon?: number;
  exportArbitrageMargin?: number;
  arbitrageRating?: "SANGAT MENGUNTUNGKAN" | "POTENSIAL" | "DOMESTIK";
  history: Array<{ day: string; priceIDR: number; priceJPY: number }>;
  analysis: string;
}

const JPY_IDR_RATE = 105.0;

const COMMODITY_DATABASE: Commodity[] = [
  // 1. Pangan Pokok
  {
    id: "beras-ciherang",
    name: "Beras Premium Ciherang",
    jaName: "こめ (コシヒカリ)",
    category: "Pangan",
    country: "Bilateral",
    currentPriceIDR: 15500,
    currentPriceJPY: 420,
    unit: "kg",
    change7d: 2.1,
    change30d: 4.8,
    trend: "up",
    volatility: 4.2,
    arrivalVolumeTon: 450,
    exportArbitrageMargin: 115,
    arbitrageRating: "POTENSIAL",
    history: [
      { day: "H-6", priceIDR: 14900, priceJPY: 410 },
      { day: "H-5", priceIDR: 15000, priceJPY: 412 },
      { day: "H-4", priceIDR: 15150, priceJPY: 415 },
      { day: "H-3", priceIDR: 15200, priceJPY: 416 },
      { day: "H-2", priceIDR: 15300, priceJPY: 418 },
      { day: "H-1", priceIDR: 15350, priceJPY: 419 },
      { day: "Hari Ini", priceIDR: 15500, priceJPY: 420 },
    ],
    analysis: "Harga beras di Jepang stabil tinggi (¥420/kg ≈ Rp 44.100/kg) membuka potensi pasar bagi beras organik berbutir khusus.",
  },
  {
    id: "jagung-pipil",
    name: "Jagung Pipil Pakan",
    jaName: "とうもろこし",
    category: "Pangan",
    country: "Bilateral",
    currentPriceIDR: 6500,
    currentPriceJPY: 260,
    unit: "kg",
    change7d: -1.5,
    change30d: 3.2,
    trend: "down",
    volatility: 6.8,
    arrivalVolumeTon: 620,
    exportArbitrageMargin: 180,
    arbitrageRating: "POTENSIAL",
    history: [
      { day: "H-6", priceIDR: 6700, priceJPY: 255 },
      { day: "H-5", priceIDR: 6650, priceJPY: 256 },
      { day: "H-4", priceIDR: 6600, priceJPY: 258 },
      { day: "H-3", priceIDR: 6550, priceJPY: 259 },
      { day: "H-2", priceIDR: 6520, priceJPY: 260 },
      { day: "H-1", priceIDR: 6500, priceJPY: 260 },
      { day: "Hari Ini", priceIDR: 6500, priceJPY: 260 },
    ],
    analysis: "Kebutuhan pakan ternak domestik stabil; pasar Jepang menyerap jagung manis olahan siap saji dengan harga premium.",
  },
  {
    id: "edamame-jepang",
    name: "Kedelai Sayur (Edamame)",
    jaName: "えだまめ",
    category: "Pangan",
    country: "Bilateral",
    currentPriceIDR: 18000,
    currentPriceJPY: 480,
    unit: "kg",
    change7d: 4.5,
    change30d: 12.0,
    trend: "up",
    volatility: 8.5,
    arrivalVolumeTon: 180,
    exportArbitrageMargin: 145,
    arbitrageRating: "SANGAT MENGUNTUNGKAN",
    history: [
      { day: "H-6", priceIDR: 16800, priceJPY: 450 },
      { day: "H-5", priceIDR: 17000, priceJPY: 455 },
      { day: "H-4", priceIDR: 17200, priceJPY: 462 },
      { day: "H-3", priceIDR: 17500, priceJPY: 470 },
      { day: "H-2", priceIDR: 17700, priceJPY: 475 },
      { day: "H-1", priceIDR: 17900, priceJPY: 478 },
      { day: "Hari Ini", priceIDR: 18000, priceJPY: 480 },
    ],
    analysis: "Komoditas ekspor primadona ke izakaya dan ritel supermarket Jepang dengan selisih harga mencapai Rp 50.400/kg di Tokyo.",
  },
  {
    id: "ubi-jalar-cilembu",
    name: "Ubi Jalar Cilembu / Satsumaimo",
    jaName: "さつまいも",
    category: "Pangan",
    country: "Bilateral",
    currentPriceIDR: 9000,
    currentPriceJPY: 280,
    unit: "kg",
    change7d: 3.2,
    change30d: 7.4,
    trend: "up",
    volatility: 5.5,
    arrivalVolumeTon: 240,
    exportArbitrageMargin: 165,
    arbitrageRating: "SANGAT MENGUNTUNGKAN",
    history: [
      { day: "H-6", priceIDR: 8500, priceJPY: 265 },
      { day: "H-5", priceIDR: 8600, priceJPY: 268 },
      { day: "H-4", priceIDR: 8700, priceJPY: 272 },
      { day: "H-3", priceIDR: 8800, priceJPY: 275 },
      { day: "H-2", priceIDR: 8900, priceJPY: 278 },
      { day: "H-1", priceIDR: 8950, priceJPY: 279 },
      { day: "Hari Ini", priceIDR: 9000, priceJPY: 280 },
    ],
    analysis: "Permintaan tinggi untuk produk panggang (Yakiimo) di musim gugur/dingin Jepang.",
  },

  // 2. Hortikultura & Sayuran
  {
    id: "cabai-merah",
    name: "Cabai Merah Keriting",
    jaName: "とうがらし",
    category: "Hortikultura",
    country: "ID",
    currentPriceIDR: 42000,
    currentPriceJPY: 850,
    unit: "kg",
    change7d: 5.2,
    change30d: 18.5,
    trend: "up",
    volatility: 14.5,
    arrivalVolumeTon: 320,
    exportArbitrageMargin: 78,
    arbitrageRating: "POTENSIAL",
    history: [
      { day: "H-6", priceIDR: 38000, priceJPY: 820 },
      { day: "H-5", priceIDR: 39000, priceJPY: 825 },
      { day: "H-4", priceIDR: 39500, priceJPY: 830 },
      { day: "H-3", priceIDR: 40500, priceJPY: 838 },
      { day: "H-2", priceIDR: 41200, priceJPY: 842 },
      { day: "H-1", priceIDR: 41800, priceJPY: 848 },
      { day: "Hari Ini", priceIDR: 42000, priceJPY: 850 },
    ],
    analysis: "Tren harga domestik menguat akibat transisi musim tanam; pasar ekspor restoran Asia di Jepang menyerap cabai segar dan bubuk kering.",
  },
  {
    id: "cabai-rawit",
    name: "Cabai Rawit Merah",
    jaName: "バードアイチリ",
    category: "Hortikultura",
    country: "ID",
    currentPriceIDR: 46000,
    currentPriceJPY: 1200,
    unit: "kg",
    change7d: -4.2,
    change30d: 12.8,
    trend: "down",
    volatility: 16.2,
    arrivalVolumeTon: 280,
    exportArbitrageMargin: 120,
    arbitrageRating: "SANGAT MENGUNTUNGKAN",
    history: [
      { day: "H-6", priceIDR: 49000, priceJPY: 1180 },
      { day: "H-5", priceIDR: 48500, priceJPY: 1185 },
      { day: "H-4", priceIDR: 47800, priceJPY: 1190 },
      { day: "H-3", priceIDR: 47200, priceJPY: 1192 },
      { day: "H-2", priceIDR: 46800, priceJPY: 1195 },
      { day: "H-1", priceIDR: 46400, priceJPY: 1198 },
      { day: "Hari Ini", priceIDR: 46000, priceJPY: 1200 },
    ],
    analysis: "Koreksi wajar pasca panen Jawa Timur; harga ekspor Jepang (¥1.200/kg ≈ Rp 126.000) memberikan margin arbitrase tinggi.",
  },
  {
    id: "bawang-merah",
    name: "Bawang Merah Brebes",
    jaName: "赤たまねぎ",
    category: "Hortikultura",
    country: "ID",
    currentPriceIDR: 34000,
    currentPriceJPY: 520,
    unit: "kg",
    change7d: 3.8,
    change30d: 8.5,
    trend: "up",
    volatility: 9.4,
    arrivalVolumeTon: 410,
    exportArbitrageMargin: 52,
    arbitrageRating: "POTENSIAL",
    history: [
      { day: "H-6", priceIDR: 32500, priceJPY: 500 },
      { day: "H-5", priceIDR: 32800, priceJPY: 505 },
      { day: "H-4", priceIDR: 33000, priceJPY: 510 },
      { day: "H-3", priceIDR: 33400, priceJPY: 512 },
      { day: "H-2", priceIDR: 33700, priceJPY: 515 },
      { day: "H-1", priceIDR: 33900, priceJPY: 518 },
      { day: "Hari Ini", priceIDR: 34000, priceJPY: 520 },
    ],
    analysis: "Pasokan dari sentra Brebes dan Nganjuk terkonsumsi kuat oleh industri bumbu olahan dan konsumsi rumah tangga.",
  },
  {
    id: "bawang-putih",
    name: "Bawang Putih Honan / Kating",
    jaName: "にんにく",
    category: "Hortikultura",
    country: "Bilateral",
    currentPriceIDR: 38000,
    currentPriceJPY: 650,
    unit: "kg",
    change7d: 1.2,
    change30d: 3.5,
    trend: "up",
    volatility: 4.8,
    arrivalVolumeTon: 350,
    exportArbitrageMargin: 65,
    arbitrageRating: "POTENSIAL",
    history: [
      { day: "H-6", priceIDR: 37200, priceJPY: 635 },
      { day: "H-5", priceIDR: 37400, priceJPY: 638 },
      { day: "H-4", priceIDR: 37600, priceJPY: 640 },
      { day: "H-3", priceIDR: 37700, priceJPY: 642 },
      { day: "H-2", priceIDR: 37850, priceJPY: 646 },
      { day: "H-1", priceIDR: 37900, priceJPY: 648 },
      { day: "Hari Ini", priceIDR: 38000, priceJPY: 650 },
    ],
    analysis: "Harga impor stabil; Jepang memiliki permintaan khusus untuk bawang putih tunggal dan produk fermentasi Black Garlic.",
  },
  {
    id: "tomat-servo",
    name: "Tomat Servo / Momotaro",
    jaName: "トマト (桃太郎)",
    category: "Hortikultura",
    country: "Bilateral",
    currentPriceIDR: 16000,
    currentPriceJPY: 320,
    unit: "kg",
    change7d: -2.0,
    change30d: 6.2,
    trend: "down",
    volatility: 11.2,
    arrivalVolumeTon: 520,
    exportArbitrageMargin: 88,
    arbitrageRating: "POTENSIAL",
    history: [
      { day: "H-6", priceIDR: 16800, priceJPY: 310 },
      { day: "H-5", priceIDR: 16600, priceJPY: 312 },
      { day: "H-4", priceIDR: 16400, priceJPY: 315 },
      { day: "H-3", priceIDR: 16300, priceJPY: 316 },
      { day: "H-2", priceIDR: 16150, priceJPY: 318 },
      { day: "H-1", priceIDR: 16100, priceJPY: 319 },
      { day: "Hari Ini", priceIDR: 16000, priceJPY: 320 },
    ],
    analysis: "Varietas Momotaro di Jepang bernilai Rp 33.600/kg; di Indonesia pasokan dataran tinggi Lembang & Garut stabil.",
  },
  {
    id: "kentang-granola",
    name: "Kentang Granola L",
    jaName: "じゃがいも (男爵)",
    category: "Hortikultura",
    country: "Bilateral",
    currentPriceIDR: 18000,
    currentPriceJPY: 160,
    unit: "kg",
    change7d: 1.8,
    change30d: 4.2,
    trend: "up",
    volatility: 5.1,
    arrivalVolumeTon: 610,
    exportArbitrageMargin: -8,
    arbitrageRating: "DOMESTIK",
    history: [
      { day: "H-6", priceIDR: 17400, priceJPY: 155 },
      { day: "H-5", priceIDR: 17500, priceJPY: 156 },
      { day: "H-4", priceIDR: 17650, priceJPY: 157 },
      { day: "H-3", priceIDR: 17700, priceJPY: 158 },
      { day: "H-2", priceIDR: 17850, priceJPY: 159 },
      { day: "H-1", priceIDR: 17950, priceJPY: 160 },
      { day: "Hari Ini", priceIDR: 18000, priceJPY: 160 },
    ],
    analysis: "Pasar domestik lebih menguntungkan karena pasokan Hokkaido mencukupi kebutuhan dalam negeri Jepang.",
  },
  {
    id: "jamur-shiitake",
    name: "Jamur Shiitake Segar",
    jaName: "しいたけ",
    category: "Hortikultura",
    country: "JP",
    currentPriceIDR: 45000,
    currentPriceJPY: 850,
    unit: "kg",
    change7d: 3.5,
    change30d: 9.0,
    trend: "up",
    volatility: 7.2,
    arrivalVolumeTon: 140,
    exportArbitrageMargin: 85,
    arbitrageRating: "SANGAT MENGUNTUNGKAN",
    history: [
      { day: "H-6", priceIDR: 42000, priceJPY: 810 },
      { day: "H-5", priceIDR: 42500, priceJPY: 820 },
      { day: "H-4", priceIDR: 43000, priceJPY: 825 },
      { day: "H-3", priceIDR: 43800, priceJPY: 835 },
      { day: "H-2", priceIDR: 44200, priceJPY: 840 },
      { day: "H-1", priceIDR: 44800, priceJPY: 845 },
      { day: "Hari Ini", priceIDR: 45000, priceJPY: 850 },
    ],
    analysis: "Jamur bernilai ekonomi tinggi di pasar kuliner Jepang dan hotel bintang lima Jakarta.",
  },

  // 3. Buah-buahan Premium
  {
    id: "melon-golden",
    name: "Melon Golden Inthanon / Crown",
    jaName: "マスクメロン (クラウン)",
    category: "Buah-buahan",
    country: "Bilateral",
    currentPriceIDR: 28000,
    currentPriceJPY: 1800,
    unit: "kg",
    change7d: 6.2,
    change30d: 15.4,
    trend: "up",
    volatility: 12.0,
    arrivalVolumeTon: 95,
    exportArbitrageMargin: 420,
    arbitrageRating: "SANGAT MENGUNTUNGKAN",
    history: [
      { day: "H-6", priceIDR: 25000, priceJPY: 1680 },
      { day: "H-5", priceIDR: 25800, priceJPY: 1700 },
      { day: "H-4", priceIDR: 26200, priceJPY: 1720 },
      { day: "H-3", priceIDR: 26900, priceJPY: 1750 },
      { day: "H-2", priceIDR: 27400, priceJPY: 1770 },
      { day: "H-1", priceIDR: 27800, priceJPY: 1790 },
      { day: "Hari Ini", priceIDR: 28000, priceJPY: 1800 },
    ],
    analysis: "Disparitas harga spektakuler: Di Jepang melon jaring premium berharga ¥1.800/kg (Rp 189.000/kg), margin ekspor >400%.",
  },
  {
    id: "anggur-muscat",
    name: "Anggur Shine Muscat",
    jaName: "シャインマスカット",
    category: "Buah-buahan",
    country: "JP",
    currentPriceIDR: 120000,
    currentPriceJPY: 2800,
    unit: "kg",
    change7d: 4.8,
    change30d: 11.2,
    trend: "up",
    volatility: 15.0,
    arrivalVolumeTon: 75,
    exportArbitrageMargin: 110,
    arbitrageRating: "SANGAT MENGUNTUNGKAN",
    history: [
      { day: "H-6", priceIDR: 112000, priceJPY: 2650 },
      { day: "H-5", priceIDR: 114000, priceJPY: 2680 },
      { day: "H-4", priceIDR: 115500, priceJPY: 2710 },
      { day: "H-3", priceIDR: 117000, priceJPY: 2750 },
      { day: "H-2", priceIDR: 118500, priceJPY: 2770 },
      { day: "H-1", priceIDR: 119200, priceJPY: 2790 },
      { day: "Hari Ini", priceIDR: 120000, priceJPY: 2800 },
    ],
    analysis: "Buah sultan asal Yamanashi/Nagano Jepang dengan rasa manis renyah tanpa biji, sangat diminati pasar premium Indonesia.",
  },
  {
    id: "durian-musang-king",
    name: "Durian Musang King",
    jaName: "ドリアン",
    category: "Buah-buahan",
    country: "Bilateral",
    currentPriceIDR: 180000,
    currentPriceJPY: 3200,
    unit: "kg",
    change7d: 7.5,
    change30d: 22.0,
    trend: "up",
    volatility: 18.5,
    arrivalVolumeTon: 45,
    exportArbitrageMargin: 75,
    arbitrageRating: "POTENSIAL",
    history: [
      { day: "H-6", priceIDR: 165000, priceJPY: 2950 },
      { day: "H-5", priceIDR: 168000, priceJPY: 3000 },
      { day: "H-4", priceIDR: 172000, priceJPY: 3050 },
      { day: "H-3", priceIDR: 175000, priceJPY: 3100 },
      { day: "H-2", priceIDR: 177000, priceJPY: 3140 },
      { day: "H-1", priceIDR: 179000, priceJPY: 3180 },
      { day: "Hari Ini", priceIDR: 180000, priceJPY: 3200 },
    ],
    analysis: "Permintaan ekspor beku (*nitrogen freezing*) ke komunitas Asia di Tokyo dan Osaka meningkat pesat.",
  },
  {
    id: "pisang-cavendish",
    name: "Pisang Cavendish",
    jaName: "バナナ",
    category: "Buah-buahan",
    country: "Bilateral",
    currentPriceIDR: 16000,
    currentPriceJPY: 240,
    unit: "kg",
    change7d: 0.5,
    change30d: 2.0,
    trend: "up",
    volatility: 3.5,
    arrivalVolumeTon: 1200,
    exportArbitrageMargin: 45,
    arbitrageRating: "POTENSIAL",
    history: [
      { day: "H-6", priceIDR: 15800, priceJPY: 238 },
      { day: "H-5", priceIDR: 15850, priceJPY: 238 },
      { day: "H-4", priceIDR: 15900, priceJPY: 239 },
      { day: "H-3", priceIDR: 15950, priceJPY: 239 },
      { day: "H-2", priceIDR: 16000, priceJPY: 240 },
      { day: "H-1", priceIDR: 16000, priceJPY: 240 },
      { day: "Hari Ini", priceIDR: 16000, priceJPY: 240 },
    ],
    analysis: "Volume perdagangan masif; Jepang mengimpor 1 juta ton pisang per tahun melalui jalur logistik kontainer pendingin.",
  },

  // 4. Perkebunan, Rempah & Ekspor
  {
    id: "vanili-gourmet",
    name: "Vanili Gourmet Organik Papua",
    jaName: "バニラビーンズ",
    category: "Perkebunan",
    country: "Bilateral",
    currentPriceIDR: 950000,
    currentPriceJPY: 18000,
    unit: "kg",
    change7d: 8.5,
    change30d: 28.0,
    trend: "up",
    volatility: 22.4,
    arrivalVolumeTon: 15,
    exportArbitrageMargin: 85,
    arbitrageRating: "SANGAT MENGUNTUNGKAN",
    history: [
      { day: "H-6", priceIDR: 860000, priceJPY: 16500 },
      { day: "H-5", priceIDR: 880000, priceJPY: 16800 },
      { day: "H-4", priceIDR: 900000, priceJPY: 17200 },
      { day: "H-3", priceIDR: 915000, priceJPY: 17400 },
      { day: "H-2", priceIDR: 930000, priceJPY: 17700 },
      { day: "H-1", priceIDR: 945000, priceJPY: 17900 },
      { day: "Hari Ini", priceIDR: 950000, priceJPY: 18000 },
    ],
    analysis: "Emas hitam perkebunan: Harga di Jepang mencapai ¥18.000/kg (Rp 1.890.000/kg) untuk industri kue & parfum premium.",
  },
  {
    id: "kopi-arabika-gayo",
    name: "Kopi Arabika Gayo (Specialty)",
    jaName: "アラビカコーヒー (ガヨ)",
    category: "Perkebunan",
    country: "Bilateral",
    currentPriceIDR: 115000,
    currentPriceJPY: 2200,
    unit: "kg",
    change7d: 4.2,
    change30d: 14.5,
    trend: "up",
    volatility: 8.5,
    arrivalVolumeTon: 85,
    exportArbitrageMargin: 88,
    arbitrageRating: "SANGAT MENGUNTUNGKAN",
    history: [
      { day: "H-6", priceIDR: 108000, priceJPY: 2050 },
      { day: "H-5", priceIDR: 109500, priceJPY: 2080 },
      { day: "H-4", priceIDR: 111000, priceJPY: 2110 },
      { day: "H-3", priceIDR: 112500, priceJPY: 2140 },
      { day: "H-2", priceIDR: 113800, priceJPY: 2170 },
      { day: "H-1", priceIDR: 114500, priceJPY: 2190 },
      { day: "Hari Ini", priceIDR: 115000, priceJPY: 2200 },
    ],
    analysis: "Permintaan kafe specialty Jepang sangat konsisten; sertifikasi Single Origin & Organik memberikan premium harga +25%.",
  },
  {
    id: "teh-matcha-uji",
    name: "Teh Hijau / Uji Matcha",
    jaName: "宇治抹茶",
    category: "Perkebunan",
    country: "JP",
    currentPriceIDR: 220000,
    currentPriceJPY: 4500,
    unit: "kg",
    change7d: 2.8,
    change30d: 6.5,
    trend: "up",
    volatility: 6.0,
    arrivalVolumeTon: 60,
    exportArbitrageMargin: 95,
    arbitrageRating: "SANGAT MENGUNTUNGKAN",
    history: [
      { day: "H-6", priceIDR: 212000, priceJPY: 4350 },
      { day: "H-5", priceIDR: 214000, priceJPY: 4380 },
      { day: "H-4", priceIDR: 215500, priceJPY: 4410 },
      { day: "H-3", priceIDR: 217000, priceJPY: 4440 },
      { day: "H-2", priceIDR: 218500, priceJPY: 4470 },
      { day: "H-1", priceIDR: 219200, priceJPY: 4490 },
      { day: "Hari Ini", priceIDR: 220000, priceJPY: 4500 },
    ],
    analysis: "Matcha grade ceremonial Kyoto diminati jaringan bakery dan tea shop modern di seluruh Asia Tenggara.",
  },
  {
    id: "cengkeh-maluku",
    name: "Cengkeh Kering Maluku",
    jaName: "クローブ (丁子)",
    category: "Perkebunan",
    country: "ID",
    currentPriceIDR: 125000,
    currentPriceJPY: 2400,
    unit: "kg",
    change7d: 3.0,
    change30d: 9.8,
    trend: "up",
    volatility: 7.4,
    arrivalVolumeTon: 110,
    exportArbitrageMargin: 85,
    arbitrageRating: "SANGAT MENGUNTUNGKAN",
    history: [
      { day: "H-6", priceIDR: 119000, priceJPY: 2280 },
      { day: "H-5", priceIDR: 120500, priceJPY: 2310 },
      { day: "H-4", priceIDR: 121800, priceJPY: 2340 },
      { day: "H-3", priceIDR: 123000, priceJPY: 2360 },
      { day: "H-2", priceIDR: 124000, priceJPY: 2380 },
      { day: "H-1", priceIDR: 124500, priceJPY: 2390 },
      { day: "Hari Ini", priceIDR: 125000, priceJPY: 2400 },
    ],
    analysis: "Kandungan minyak atsiri eugenol tinggi diserap industri farmasi dan rokok kretek domestik maupun ekspor herbal.",
  },
];

export default function MarketPage() {
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currencyMode, setCurrencyMode] = useState<"IDR" | "JPY">("IDR");
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity>(COMMODITY_DATABASE[0]);
  const [viewMode, setViewMode] = useState<"overview" | "arbitrage">("overview");

  const categories = ["Semua", "Pangan", "Hortikultura", "Buah-buahan", "Perkebunan", "🇯🇵 Jepang", "🇮🇩 Indonesia"];

  const filteredCommodities = COMMODITY_DATABASE.filter((c) => {
    // Category match
    let matchesCategory = true;
    if (activeCategory === "🇯🇵 Jepang") matchesCategory = c.country === "JP" || c.country === "Bilateral";
    else if (activeCategory === "🇮🇩 Indonesia") matchesCategory = c.country === "ID" || c.country === "Bilateral";
    else if (activeCategory !== "Semua") matchesCategory = c.category === activeCategory;

    // Search query match
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      (c.jaName && c.jaName.toLowerCase().includes(q)) ||
      c.id.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const chartData = selectedCommodity.history.map((h) => ({
    day: h.day,
    price: currencyMode === "IDR" ? h.priceIDR : h.priceJPY,
    priceFormatted:
      currencyMode === "IDR"
        ? `Rp ${h.priceIDR.toLocaleString("id-ID")}`
        : `¥ ${h.priceJPY.toLocaleString("ja-JP")}`,
  }));

  // Arbitrage spread comparison data
  const arbitrageSpreadData = COMMODITY_DATABASE.filter((c) => c.exportArbitrageMargin && c.exportArbitrageMargin > 0)
    .sort((a, b) => (b.exportArbitrageMargin || 0) - (a.exportArbitrageMargin || 0))
    .slice(0, 8)
    .map((c) => ({
      name: c.name.split(" ")[0] + " " + (c.name.split(" ")[1] || ""),
      margin: c.exportArbitrageMargin || 0,
      domesticPrice: c.currentPriceIDR,
      japanEquivalent: Math.round(c.currentPriceJPY * JPY_IDR_RATE),
    }));

  return (
    <div className="space-y-8 pb-16 text-slate-100">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 border border-sky-500/30 shadow-2xl bg-gradient-to-r from-sky-950/80 via-slate-900 to-slate-950 backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold tracking-wide uppercase">
              <Globe className="w-3.5 h-3.5" />
              Bilateral Market Intelligence (BAPANAS 🇮🇩 × JA Group 🇯🇵)
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Intelijen Pasar Komoditas Indonesia & Jepang
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Monitoring harga pasar real-time, volume lelang harian (入荷量), analisis tren 30 hari, dan pemindai peluang arbitrase ekspor bilateral.
            </p>
          </div>

          {/* Controls: Currency Toggle & Arbitrage View */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setCurrencyMode("IDR")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  currencyMode === "IDR" ? "bg-sky-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                IDR (Rp)
              </button>
              <button
                onClick={() => setCurrencyMode("JPY")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  currencyMode === "JPY" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                JPY (¥)
              </button>
            </div>

            <button
              onClick={() => setViewMode(viewMode === "overview" ? "arbitrage" : "overview")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-white font-semibold text-xs border border-slate-700 shadow transition-all"
            >
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>{viewMode === "overview" ? "Peluang Arbitrase Ekspor" : "Tampilan Grafik Harga"}</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-sky-500 text-slate-950 font-bold shadow"
                    : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari komoditas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODE 1: OVERVIEW & TIME-SERIES CHARTS                               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {viewMode === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Commodity Cards List (5 cols) */}
          <div className="lg:col-span-5 space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {filteredCommodities.map((item) => {
              const isSelected = selectedCommodity.id === item.id;
              const displayPrice =
                currencyMode === "IDR"
                  ? `Rp ${item.currentPriceIDR.toLocaleString("id-ID")}`
                  : `¥ ${item.currentPriceJPY.toLocaleString("ja-JP")}`;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedCommodity(item)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                    isSelected
                      ? "bg-sky-950/40 border-sky-500 shadow-lg shadow-sky-500/10 scale-[1.01]"
                      : "bg-[#090e18] border-slate-800 hover:bg-slate-900/80 hover:border-slate-700"
                  }`}
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{item.name}</span>
                      {item.jaName && (
                        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline truncate">
                          ({item.jaName})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px]">
                        {item.category}
                      </span>
                      <span>Vol: {item.arrivalVolumeTon || 150} ton</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold text-white">{displayPrice} <span className="text-xs font-normal text-slate-400">/{item.unit}</span></p>
                    <div className="flex items-center justify-end gap-1 text-xs mt-0.5">
                      {item.change7d >= 0 ? (
                        <span className="text-emerald-400 flex items-center font-bold">
                          <TrendingUp className="w-3 h-3 mr-0.5" /> +{item.change7d}%
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center font-bold">
                          <TrendingDown className="w-3 h-3 mr-0.5" /> {item.change7d}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Selected Commodity Deep Dive Chart (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl bg-[#090e18] border border-slate-800 p-6 shadow-xl space-y-6">
              {/* Selected Commodity Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {selectedCommodity.category}
                    </span>
                    {selectedCommodity.jaName && (
                      <span className="text-xs text-amber-400 font-mono font-semibold">
                        {selectedCommodity.jaName}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-extrabold text-white">{selectedCommodity.name}</h2>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-extrabold text-sky-400">
                    {currencyMode === "IDR"
                      ? `Rp ${selectedCommodity.currentPriceIDR.toLocaleString("id-ID")}`
                      : `¥ ${selectedCommodity.currentPriceJPY.toLocaleString("ja-JP")}`}
                    <span className="text-xs font-normal text-slate-400"> /{selectedCommodity.unit}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Konversi: {currencyMode === "IDR"
                      ? `≈ ¥${selectedCommodity.currentPriceJPY} (Rate 105)`
                      : `≈ Rp ${selectedCommodity.currentPriceIDR.toLocaleString("id-ID")}`}
                  </p>
                </div>
              </div>

              {/* Price Metric Highlights */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Tren 7 Hari</p>
                  <p className={`text-base font-extrabold mt-0.5 ${selectedCommodity.change7d >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {selectedCommodity.change7d >= 0 ? "+" : ""}{selectedCommodity.change7d}%
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Volatilitas 30D</p>
                  <p className="text-base font-extrabold text-amber-400 mt-0.5">{selectedCommodity.volatility}%</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Volume Harian</p>
                  <p className="text-base font-extrabold text-teal-400 mt-0.5">{selectedCommodity.arrivalVolumeTon || 180} ton</p>
                </div>
              </div>

              {/* Price Trend Area Chart */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-sky-400" /> Grafik Tren Harga 7 Hari Terakhir
                </h4>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284c7" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="day" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} domain={["auto", "auto"]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: 8, color: "#fff" }}
                        formatter={(v: any) => [
                          currencyMode === "IDR" ? `Rp ${Number(v).toLocaleString("id-ID")}` : `¥ ${Number(v).toLocaleString("ja-JP")}`,
                          "Harga",
                        ]}
                      />
                      <Area type="monotone" dataKey="price" stroke="#38bdf8" strokeWidth={2.5} fillOpacity={1} fill="url(#priceGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Market Commentary Card */}
              <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-500/30 space-y-1 text-xs">
                <div className="flex items-center gap-2 text-sky-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analisis Pasar & Prospek Arbitrase</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{selectedCommodity.analysis}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODE 2: BILATERAL ARBITRAGE & EXPORT MARGIN MATRIX                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {viewMode === "arbitrage" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  Matriks Peluang Arbitrase Ekspor (Indonesia ➔ Jepang)
                </h3>
                <p className="text-xs text-slate-400">
                  Perbandingan harga pasar domestik Indonesia vs ekuivalen harga lelang Jepang (JA Tokyo Wholesale) setelah estimasi biaya kargo logistik.
                </p>
              </div>
              <div className="text-xs text-emerald-400 font-mono bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                Kurs Acuan: 1 JPY = Rp 105.0
              </div>
            </div>

            {/* Arbitrage Top Margin Bar Chart */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300">Top Potensi Net Export Margin (%)</h4>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={arbitrageSpreadData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <YAxis stroke="#64748b" tickFormatter={(v) => `+${v}%`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: 8, color: "#fff" }}
                      formatter={(v: any) => [`+${v}%`, "Net Export Margin"]}
                    />
                    <Bar dataKey="margin" radius={[4, 4, 0, 0]}>
                      {arbitrageSpreadData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.margin >= 100 ? "#10b981" : entry.margin >= 50 ? "#38bdf8" : "#f59e0b"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Arbitrage Table Breakdown */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] uppercase text-slate-400 bg-slate-900 border-y border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Komoditas</th>
                    <th className="px-4 py-3">Harga Domestik (IDR/kg)</th>
                    <th className="px-4 py-3">Harga Lelang Jepang (JPY/kg)</th>
                    <th className="px-4 py-3">Ekuivalen IDR di Jepang</th>
                    <th className="px-4 py-3">Net Spread Margin (%)</th>
                    <th className="px-4 py-3">Kelayakan Ekspor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {COMMODITY_DATABASE.filter((c) => c.exportArbitrageMargin).map((c) => {
                    const jpyInIdr = Math.round(c.currentPriceJPY * JPY_IDR_RATE);
                    return (
                      <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                          <span>{c.name}</span>
                          {c.jaName && <span className="text-[10px] text-slate-500 font-mono">({c.jaName})</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-300 font-mono">Rp {c.currentPriceIDR.toLocaleString("id-ID")}</td>
                        <td className="px-4 py-3 text-amber-400 font-mono font-bold">¥ {c.currentPriceJPY.toLocaleString("ja-JP")}</td>
                        <td className="px-4 py-3 text-emerald-400 font-mono">Rp {jpyInIdr.toLocaleString("id-ID")}</td>
                        <td className="px-4 py-3 font-extrabold text-emerald-400 font-mono">
                          {c.exportArbitrageMargin && c.exportArbitrageMargin > 0 ? `+${c.exportArbitrageMargin}%` : `${c.exportArbitrageMargin}%`}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              c.arbitrageRating === "SANGAT MENGUNTUNGKAN"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : c.arbitrageRating === "POTENSIAL"
                                ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                          >
                            {c.arbitrageRating}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
