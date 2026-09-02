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
  MapPin,
  Building2,
  ShoppingBag,
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

const JPY_IDR_RATE = 105.0;

interface CommodityItem {
  id: string;
  name: string;
  localName?: string;
  kanjiName?: string;
  country: "ID" | "JP";
  category: "pangan" | "hortikultura" | "buah" | "perkebunan";
  marketLocation: string; // e.g., "Pasar Induk Kramat Jati" or "東京都中央卸売市場 (Ota Market)"
  priceIDR: number;
  priceJPY: number;
  unit: string;
  change7d: number;
  change30d: number;
  trend: "up" | "down";
  volatility: number;
  volumeTon: number;
  exportArbitrageMargin?: number;
  arbitrageRating?: "SANGAT MENGUNTUNGKAN" | "POTENSIAL" | "DOMESTIK";
  history: Array<{ day: string; priceIDR: number; priceJPY: number }>;
  analysis: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🇮🇩 DATABASE KOMODITAS INDONESIA (BAPANAS & PASAR INDUK)
// ─────────────────────────────────────────────────────────────────────────────
const INDONESIA_COMMODITIES: CommodityItem[] = [
  // Pangan Pokok
  {
    id: "id-beras-ciherang",
    name: "Beras Premium Ciherang",
    localName: "Setra Ramos / Ciherang",
    country: "ID",
    category: "pangan",
    marketLocation: "Pasar Induk Beras Cipinang, Jakarta",
    priceIDR: 15500,
    priceJPY: 148,
    unit: "kg",
    change7d: 2.1,
    change30d: 4.8,
    trend: "up",
    volatility: 4.2,
    volumeTon: 850,
    exportArbitrageMargin: 115,
    arbitrageRating: "POTENSIAL",
    history: [
      { day: "H-6", priceIDR: 14900, priceJPY: 142 },
      { day: "H-5", priceIDR: 15000, priceJPY: 143 },
      { day: "H-4", priceIDR: 15150, priceJPY: 144 },
      { day: "H-3", priceIDR: 15200, priceJPY: 145 },
      { day: "H-2", priceIDR: 15300, priceJPY: 146 },
      { day: "H-1", priceIDR: 15350, priceJPY: 146 },
      { day: "Hari Ini", priceIDR: 15500, priceJPY: 148 },
    ],
    analysis: "Harga beras premium nasional stabil tinggi dengan serapan pasar induk lancar jelang panen gadu.",
  },
  {
    id: "id-jagung-pipil",
    name: "Jagung Pipil Kering (Pakan)",
    localName: "Jagung Pipil Kadar Air 14%",
    country: "ID",
    category: "pangan",
    marketLocation: "Sentra Grobogan & Lamongan",
    priceIDR: 6500,
    priceJPY: 62,
    unit: "kg",
    change7d: -1.5,
    change30d: 3.2,
    trend: "down",
    volatility: 6.8,
    volumeTon: 1200,
    exportArbitrageMargin: 180,
    arbitrageRating: "POTENSIAL",
    history: [
      { day: "H-6", priceIDR: 6700, priceJPY: 64 },
      { day: "H-5", priceIDR: 6650, priceJPY: 63 },
      { day: "H-4", priceIDR: 6600, priceJPY: 63 },
      { day: "H-3", priceIDR: 6550, priceJPY: 62 },
      { day: "H-2", priceIDR: 6520, priceJPY: 62 },
      { day: "H-1", priceIDR: 6500, priceJPY: 62 },
      { day: "Hari Ini", priceIDR: 6500, priceJPY: 62 },
    ],
    analysis: "Permintaan pabrik pakan unggas Jawa Timur dan Banten menyerap pasokan panen dengan harga acuan BAPANAS.",
  },
  {
    id: "id-kedelai-lokal",
    name: "Kedelai Biji Lokal",
    localName: "Kedelai Biji Kering Anjasmoro",
    country: "ID",
    category: "pangan",
    marketLocation: "Sentra Grobogan & Jember",
    priceIDR: 12500,
    priceJPY: 119,
    unit: "kg",
    change7d: 1.0,
    change30d: 2.5,
    trend: "up",
    volatility: 4.5,
    volumeTon: 340,
    exportArbitrageMargin: 95,
    arbitrageRating: "POTENSIAL",
    history: [
      { day: "H-6", priceIDR: 12200, priceJPY: 116 },
      { day: "H-5", priceIDR: 12300, priceJPY: 117 },
      { day: "H-4", priceIDR: 12350, priceJPY: 118 },
      { day: "H-3", priceIDR: 12400, priceJPY: 118 },
      { day: "H-2", priceIDR: 12450, priceJPY: 119 },
      { day: "H-1", priceIDR: 12500, priceJPY: 119 },
      { day: "Hari Ini", priceIDR: 12500, priceJPY: 119 },
    ],
    analysis: "Kedelai lokal non-GMO diminati produsen tahu-tempe higienis dan industri susu nabati.",
  },
  {
    id: "id-ubi-kayu",
    name: "Ubi Kayu / Singkong Gajah",
    localName: "Singkong Basah Olahan Tapioka",
    country: "ID",
    category: "pangan",
    marketLocation: "Sentra Lampung Tengah & Pati",
    priceIDR: 4500,
    priceJPY: 43,
    unit: "kg",
    change7d: 2.5,
    change30d: 5.0,
    trend: "up",
    volatility: 5.2,
    volumeTon: 1800,
    exportArbitrageMargin: 220,
    arbitrageRating: "SANGAT MENGUNTUNGKAN",
    history: [
      { day: "H-6", priceIDR: 4300, priceJPY: 41 },
      { day: "H-5", priceIDR: 4350, priceJPY: 41 },
      { day: "H-4", priceIDR: 4400, priceJPY: 42 },
      { day: "H-3", priceIDR: 4420, priceJPY: 42 },
      { day: "H-2", priceIDR: 4450, priceJPY: 42 },
      { day: "H-1", priceIDR: 4480, priceJPY: 43 },
      { day: "Hari Ini", priceIDR: 4500, priceJPY: 43 },
    ],
    analysis: "Permintaan industri tapioka dan bioetanol domestik stabil kuat.",
  },

  // Hortikultura & Bumbu
  {
    id: "id-cabai-merah-keriting",
    name: "Cabai Merah Keriting",
    localName: "CMK Lembang & Muntilan",
    country: "ID",
    category: "hortikultura",
    marketLocation: "Pasar Induk Kramat Jati, Jakarta",
    priceIDR: 42000,
    priceJPY: 400,
    unit: "kg",
    change7d: 5.2,
    change30d: 18.5,
    trend: "up",
    volatility: 14.5,
    volumeTon: 320,
    exportArbitrageMargin: 78,
    arbitrageRating: "POTENSIAL",
    history: [
      { day: "H-6", priceIDR: 38000, priceJPY: 362 },
      { day: "H-5", priceIDR: 39000, priceJPY: 371 },
      { day: "H-4", priceIDR: 39500, priceJPY: 376 },
      { day: "H-3", priceIDR: 40500, priceJPY: 385 },
      { day: "H-2", priceIDR: 41200, priceJPY: 392 },
      { day: "H-1", priceIDR: 41800, priceJPY: 398 },
      { day: "Hari Ini", priceIDR: 42000, priceJPY: 400 },
    ],
    analysis: "Tren harga domestik menguat dipicu penurunan suplai akibat pergeseran musim tanam di Jawa Barat.",
  },
  {
    id: "id-cabai-rawit-merah",
    name: "Cabai Rawit Merah",
    localName: "Cabai Rawit Merah Ori 212",
    country: "ID",
    category: "hortikultura",
    marketLocation: "Pasar Induk Jakabaring & Kramat Jati",
    priceIDR: 46000,
    priceJPY: 438,
    unit: "kg",
    change7d: -4.2,
    change30d: 12.8,
    trend: "down",
    volatility: 16.2,
    volumeTon: 280,
    exportArbitrageMargin: 120,
    arbitrageRating: "SANGAT MENGUNTUNGKAN",
    history: [
      { day: "H-6", priceIDR: 49000, priceJPY: 466 },
      { day: "H-5", priceIDR: 48500, priceJPY: 461 },
      { day: "H-4", priceIDR: 47800, priceJPY: 455 },
      { day: "H-3", priceIDR: 47200, priceJPY: 449 },
      { day: "H-2", priceIDR: 46800, priceJPY: 445 },
      { day: "H-1", priceIDR: 46400, priceJPY: 441 },
      { day: "Hari Ini", priceIDR: 46000, priceJPY: 438 },
    ],
    analysis: "Koreksi harga wajar karena pasokan panen raya dari Kediri dan Blitar membanjiri pasar induk.",
  },
  {
    id: "id-bawang-merah-brebes",
    name: "Bawang Merah Brebes",
    localName: "Bawang Merah Super Cross Brebes",
    country: "ID",
    category: "hortikultura",
    marketLocation: "Pasar Bawang Klampok & Kramat Jati",
    priceIDR: 34000,
    priceJPY: 324,
    unit: "kg",
    change7d: 3.8,
    change30d: 8.5,
    trend: "up",
    volatility: 9.4,
    volumeTon: 410,
    exportArbitrageMargin: 52,
    arbitrageRating: "POTENSIAL",
    history: [
      { day: "H-6", priceIDR: 32500, priceJPY: 309 },
      { day: "H-5", priceIDR: 32800, priceJPY: 312 },
      { day: "H-4", priceIDR: 33000, priceJPY: 314 },
      { day: "H-3", priceIDR: 33400, priceJPY: 318 },
      { day: "H-2", priceIDR: 33700, priceJPY: 320 },
      { day: "H-1", priceIDR: 33900, priceJPY: 322 },
      { day: "Hari Ini", priceIDR: 34000, priceJPY: 324 },
    ],
    analysis: "Kualitas umbi kering Brebes sangat diminati industri bumbu dan ritel modern nasional.",
  },
  {
    id: "id-bawang-putih-honan",
    name: "Bawang Putih Honan / Kating",
    localName: "Bawang Putih Impor Kating",
    country: "ID",
    category: "hortikultura",
    marketLocation: "Pasar Induk Kramat Jati & Pasar Turi",
    priceIDR: 38000,
    priceJPY: 362,
    unit: "kg",
    change7d: 1.2,
    change30d: 3.5,
    trend: "up",
    volatility: 4.8,
    volumeTon: 520,
    exportArbitrageMargin: 65,
    arbitrageRating: "POTENSIAL",
    history: [
      { day: "H-6", priceIDR: 37200, priceJPY: 354 },
      { day: "H-5", priceIDR: 37400, priceJPY: 356 },
      { day: "H-4", priceIDR: 37600, priceJPY: 358 },
      { day: "H-3", priceIDR: 37700, priceJPY: 359 },
      { day: "H-2", priceIDR: 37850, priceJPY: 360 },
      { day: "H-1", priceIDR: 37900, priceJPY: 361 },
      { day: "Hari Ini", priceIDR: 38000, priceJPY: 362 },
    ],
    analysis: "Harga terkendali dengan distribusi pasokan pelabuhan Tanjung Priok dan Tanjung Perak yang lancar.",
  },
  {
    id: "id-tomat-servo",
    name: "Tomat Servo Dataran Rendah/Tinggi",
    localName: "Tomat Buah Servo F1",
    country: "ID",
    category: "hortikultura",
    marketLocation: "Pasar Caringin Bandung & Kramat Jati",
    priceIDR: 16000,
    priceJPY: 152,
    unit: "kg",
    change7d: -2.0,
    change30d: 6.2,
    trend: "down",
    volatility: 11.2,
    volumeTon: 480,
    exportArbitrageMargin: 88,
    arbitrageRating: "POTENSIAL",
    history: [
      { day: "H-6", priceIDR: 16800, priceJPY: 160 },
      { day: "H-5", priceIDR: 16600, priceJPY: 158 },
      { day: "H-4", priceIDR: 16400, priceJPY: 156 },
      { day: "H-3", priceIDR: 16300, priceJPY: 155 },
      { day: "H-2", priceIDR: 16150, priceJPY: 153 },
      { day: "H-1", priceIDR: 16100, priceJPY: 153 },
      { day: "Hari Ini", priceIDR: 16000, priceJPY: 152 },
    ],
    analysis: "Panen merata dari wilayah Garut dan Pengalengan menjaga ketersediaan tomat buah segar.",
  },
  {
    id: "id-kentang-granola",
    name: "Kentang Granola L",
    localName: "Kentang Dieng & Pangalengan Super",
    country: "ID",
    category: "hortikultura",
    marketLocation: "Sentra Dieng & Pasar Induk Cibitung",
    priceIDR: 18000,
    priceJPY: 171,
    unit: "kg",
    change7d: 1.8,
    change30d: 4.2,
    trend: "up",
    volatility: 5.1,
    volumeTon: 390,
    exportArbitrageMargin: -8,
    arbitrageRating: "DOMESTIK",
    history: [
      { day: "H-6", priceIDR: 17400, priceJPY: 165 },
      { day: "H-5", priceIDR: 17500, priceJPY: 166 },
      { day: "H-4", priceIDR: 17650, priceJPY: 168 },
      { day: "H-3", priceIDR: 17700, priceJPY: 168 },
      { day: "H-2", priceIDR: 17850, priceJPY: 170 },
      { day: "H-1", priceIDR: 17950, priceJPY: 171 },
      { day: "Hari Ini", priceIDR: 18000, priceJPY: 171 },
    ],
    analysis: "Pasar domestik menyerap kentang Dieng kualitas super untuk restoran dan pabrik keripik kentang.",
  },

  // Buah-buahan Nusantara
  {
    id: "id-melon-golden",
    name: "Melon Golden Inthanon",
    localName: "Melon Hidroponik Greenhouse",
    country: "ID",
    category: "buah",
    marketLocation: "Sentra Greenhouse Blitar & Lembang",
    priceIDR: 28000,
    priceJPY: 266,
    unit: "kg",
    change7d: 6.2,
    change30d: 15.4,
    trend: "up",
    volatility: 12.0,
    volumeTon: 95,
    exportArbitrageMargin: 420,
    arbitrageRating: "SANGAT MENGUNTUNGKAN",
    history: [
      { day: "H-6", priceIDR: 25000, priceJPY: 238 },
      { day: "H-5", priceIDR: 25800, priceJPY: 245 },
      { day: "H-4", priceIDR: 26200, priceJPY: 249 },
      { day: "H-3", priceIDR: 26900, priceJPY: 256 },
      { day: "H-2", priceIDR: 27400, priceJPY: 260 },
      { day: "H-1", priceIDR: 27800, priceJPY: 264 },
      { day: "Hari Ini", priceIDR: 28000, priceJPY: 266 },
    ],
    analysis: "Melon premium dengan kemanisan brix 14+ sangat laris di pasar supermarket modern dan ekspor regional.",
  },
  {
    id: "id-durian-musang-king",
    name: "Durian Musang King / Montong",
    localName: "Durian Premium Musang King",
    country: "ID",
    category: "buah",
    marketLocation: "Sentra Medan & Parigi Moutong",
    priceIDR: 180000,
    priceJPY: 1714,
    unit: "kg",
    change7d: 7.5,
    change30d: 22.0,
    trend: "up",
    volatility: 18.5,
    volumeTon: 45,
    exportArbitrageMargin: 75,
    arbitrageRating: "POTENSIAL",
    history: [
      { day: "H-6", priceIDR: 165000, priceJPY: 1571 },
      { day: "H-5", priceIDR: 168000, priceJPY: 1600 },
      { day: "H-4", priceIDR: 172000, priceJPY: 1638 },
      { day: "H-3", priceIDR: 175000, priceJPY: 1666 },
      { day: "H-2", priceIDR: 177000, priceJPY: 1685 },
      { day: "H-1", priceIDR: 179000, priceJPY: 1704 },
      { day: "Hari Ini", priceIDR: 180000, priceJPY: 1714 },
    ],
    analysis: "Durian beku nitrogen untuk ekspor ke Tiongkok dan Jepang mencatat kenaikan permintaan tinggi.",
  },
  {
    id: "id-pisang-cavendish",
    name: "Pisang Cavendish Super",
    localName: "Pisang Sunpride / Cavendish Lampung",
    country: "ID",
    category: "buah",
    marketLocation: "Sentra Lampung & Blitar",
    priceIDR: 16000,
    priceJPY: 152,
    unit: "kg",
    change7d: 0.5,
    change30d: 2.0,
    trend: "up",
    volatility: 3.5,
    volumeTon: 1100,
    exportArbitrageMargin: 45,
    arbitrageRating: "POTENSIAL",
    history: [
      { day: "H-6", priceIDR: 15800, priceJPY: 150 },
      { day: "H-5", priceIDR: 15850, priceJPY: 150 },
      { day: "H-4", priceIDR: 15900, priceJPY: 151 },
      { day: "H-3", priceIDR: 15950, priceJPY: 151 },
      { day: "H-2", priceIDR: 16000, priceJPY: 152 },
      { day: "H-1", priceIDR: 16000, priceJPY: 152 },
      { day: "Hari Ini", priceIDR: 16000, priceJPY: 152 },
    ],
    analysis: "Standar ekspor konsisten dengan sertifikasi Global GAP untuk pasar Asia Timur.",
  },

  // Perkebunan & Rempah
  {
    id: "id-vanili-papua",
    name: "Vanili Gourmet Organik Papua",
    localName: "Planifolia Vanilla Bean Grade A",
    country: "ID",
    category: "perkebunan",
    marketLocation: "Sentra Jayapura & Alor",
    priceIDR: 950000,
    priceJPY: 9047,
    unit: "kg",
    change7d: 8.5,
    change30d: 28.0,
    trend: "up",
    volatility: 22.4,
    volumeTon: 15,
    exportArbitrageMargin: 85,
    arbitrageRating: "SANGAT MENGUNTUNGKAN",
    history: [
      { day: "H-6", priceIDR: 860000, priceJPY: 8190 },
      { day: "H-5", priceIDR: 880000, priceJPY: 8380 },
      { day: "H-4", priceIDR: 900000, priceJPY: 8571 },
      { day: "H-3", priceIDR: 915000, priceJPY: 8714 },
      { day: "H-2", priceIDR: 930000, priceJPY: 8857 },
      { day: "H-1", priceIDR: 945000, priceJPY: 9000 },
      { day: "Hari Ini", priceIDR: 950000, priceJPY: 9047 },
    ],
    analysis: "Kandungan vanilin alami >2.4% menjadikan vanili Papua incaran industri bakery gourmet Jepang & Eropa.",
  },
  {
    id: "id-kopi-arabika-gayo",
    name: "Kopi Arabika Gayo (Specialty)",
    localName: "Green Bean Arabika Gayo Grade 1",
    country: "ID",
    category: "perkebunan",
    marketLocation: "Takengon, Aceh Tengah",
    priceIDR: 115000,
    priceJPY: 1095,
    unit: "kg",
    change7d: 4.2,
    change30d: 14.5,
    trend: "up",
    volatility: 8.5,
    volumeTon: 85,
    exportArbitrageMargin: 88,
    arbitrageRating: "SANGAT MENGUNTUNGKAN",
    history: [
      { day: "H-6", priceIDR: 108000, priceJPY: 1028 },
      { day: "H-5", priceIDR: 109500, priceJPY: 1042 },
      { day: "H-4", priceIDR: 111000, priceJPY: 1057 },
      { day: "H-3", priceIDR: 112500, priceJPY: 1071 },
      { day: "H-2", priceIDR: 113800, priceJPY: 1083 },
      { day: "H-1", priceIDR: 114500, priceJPY: 1090 },
      { day: "Hari Ini", priceIDR: 115000, priceJPY: 1095 },
    ],
    analysis: "Kopi specialty dengan cupping score 85+ memiliki kontrak beli jangka panjang dengan roasteries Tokyo.",
  },
  {
    id: "id-cengkeh-maluku",
    name: "Cengkeh Kering Maluku",
    localName: "Cengkeh Kering Asalan / Super",
    country: "ID",
    category: "perkebunan",
    marketLocation: "Ambon, Maluku",
    priceIDR: 125000,
    priceJPY: 1190,
    unit: "kg",
    change7d: 3.0,
    change30d: 9.8,
    trend: "up",
    volatility: 7.4,
    volumeTon: 110,
    exportArbitrageMargin: 85,
    arbitrageRating: "SANGAT MENGUNTUNGKAN",
    history: [
      { day: "H-6", priceIDR: 119000, priceJPY: 1133 },
      { day: "H-5", priceIDR: 120500, priceJPY: 1147 },
      { day: "H-4", priceIDR: 121800, priceJPY: 1160 },
      { day: "H-3", priceIDR: 123000, priceJPY: 1171 },
      { day: "H-2", priceIDR: 124000, priceJPY: 1180 },
      { day: "H-1", priceIDR: 124500, priceJPY: 1185 },
      { day: "Hari Ini", priceIDR: 125000, priceJPY: 1190 },
    ],
    analysis: "Kadar minyak atsiri tinggi membuat cengkeh Maluku menjadi komoditas rempah ekspor bernilai premium.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 🇯🇵 DATABASE KOMODITAS JEPANG (JA GROUP & PASAR LELANG TOKYO OTA)
// ─────────────────────────────────────────────────────────────────────────────
const JAPAN_COMMODITIES: CommodityItem[] = [
  // Pangan & Umbi (米・穀物・芋)
  {
    id: "jp-koshihikari-rice",
    name: "Beras Koshihikari Niigata",
    kanjiName: "新潟産 コシヒカリ (こめ)",
    country: "JP",
    category: "pangan",
    marketLocation: "JA Niigata & Pasar Lelang Tokyo Ota",
    priceIDR: 44100,
    priceJPY: 420,
    unit: "kg",
    change7d: 1.8,
    change30d: 3.5,
    trend: "up",
    volatility: 3.2,
    volumeTon: 650,
    history: [
      { day: "H-6", priceIDR: 43050, priceJPY: 410 },
      { day: "H-5", priceIDR: 43260, priceJPY: 412 },
      { day: "H-4", priceIDR: 43575, priceJPY: 415 },
      { day: "H-3", priceIDR: 43680, priceJPY: 416 },
      { day: "H-2", priceIDR: 43890, priceJPY: 418 },
      { day: "H-1", priceIDR: 43995, priceJPY: 419 },
      { day: "Hari Ini", priceIDR: 44100, priceJPY: 420 },
    ],
    analysis: "Beras nomor 1 di Jepang dengan rasa manis pulen alami, harga stabil tinggi di seluruh jaringan JA-NET.",
  },
  {
    id: "jp-satsumaimo",
    name: "Ubi Jalar Satsumaimo (Beni Haruka)",
    kanjiName: "紅はるか さつまいも (茨城産)",
    country: "JP",
    category: "pangan",
    marketLocation: "JA Ibaraki & Pasar Toyosu",
    priceIDR: 29400,
    priceJPY: 280,
    unit: "kg",
    change7d: 3.2,
    change30d: 7.4,
    trend: "up",
    volatility: 5.5,
    volumeTon: 240,
    history: [
      { day: "H-6", priceIDR: 27825, priceJPY: 265 },
      { day: "H-5", priceIDR: 28140, priceJPY: 268 },
      { day: "H-4", priceIDR: 28560, priceJPY: 272 },
      { day: "H-3", priceIDR: 28875, priceJPY: 275 },
      { day: "H-2", priceIDR: 29190, priceJPY: 278 },
      { day: "H-1", priceIDR: 29295, priceJPY: 279 },
      { day: "Hari Ini", priceIDR: 29400, priceJPY: 280 },
    ],
    analysis: "Ubi manis bertekstur madu (*Beni Haruka*) sangat diminati untuk jajanan panggangan Yakiimo musim gugur.",
  },
  {
    id: "jp-edamame-tanba",
    name: "Edamame Hitam Tanba / JA Shizuoka",
    kanjiName: "丹波黒 えだまめ (枝豆)",
    country: "JP",
    category: "pangan",
    marketLocation: "JA Hyogo & Pasar Ota Tokyo",
    priceIDR: 50400,
    priceJPY: 480,
    unit: "kg",
    change7d: 4.5,
    change30d: 12.0,
    trend: "up",
    volatility: 8.5,
    volumeTon: 180,
    history: [
      { day: "H-6", priceIDR: 47250, priceJPY: 450 },
      { day: "H-5", priceIDR: 47775, priceJPY: 455 },
      { day: "H-4", priceIDR: 48510, priceJPY: 462 },
      { day: "H-3", priceIDR: 49350, priceJPY: 470 },
      { day: "H-2", priceIDR: 49875, priceJPY: 475 },
      { day: "H-1", priceIDR: 50190, priceJPY: 478 },
      { day: "Hari Ini", priceIDR: 50400, priceJPY: 480 },
    ],
    analysis: "Camilan wajib izakaya Jepang; pasokan lokal bersaing ketat dengan kedelai sayur impor dari Asia Tenggara.",
  },

  // Sayuran Segar & Tradisional (青果・伝統野菜)
  {
    id: "jp-daikon-radish",
    name: "Lobak Putih Daikon (Chiba/Miura)",
    kanjiName: "三浦だいこん (大根)",
    country: "JP",
    category: "hortikultura",
    marketLocation: "JA Kanagawa & Pasar Ota Tokyo",
    priceIDR: 11550,
    priceJPY: 110,
    unit: "kg",
    change7d: 2.0,
    change30d: 5.0,
    trend: "up",
    volatility: 4.0,
    volumeTon: 890,
    history: [
      { day: "H-6", priceIDR: 11025, priceJPY: 105 },
      { day: "H-5", priceIDR: 11130, priceJPY: 106 },
      { day: "H-4", priceIDR: 11235, priceJPY: 107 },
      { day: "H-3", priceIDR: 11340, priceJPY: 108 },
      { day: "H-2", priceIDR: 11445, priceJPY: 109 },
      { day: "H-1", priceIDR: 11500, priceJPY: 109 },
      { day: "Hari Ini", priceIDR: 11550, priceJPY: 110 },
    ],
    analysis: "Sayuran pokok musim dingin untuk sup oden dan salad parut daikon oroshi.",
  },
  {
    id: "jp-tomat-momotaro",
    name: "Tomat Momotaro (Aichi/Kumamoto)",
    kanjiName: "桃太郎トマト (愛知産)",
    country: "JP",
    category: "hortikultura",
    marketLocation: "JA Aichi & Pasar Ota Tokyo",
    priceIDR: 33600,
    priceJPY: 320,
    unit: "kg",
    change7d: -1.2,
    change30d: 4.8,
    trend: "down",
    volatility: 6.2,
    volumeTon: 420,
    history: [
      { day: "H-6", priceIDR: 34125, priceJPY: 325 },
      { day: "H-5", priceIDR: 33915, priceJPY: 323 },
      { day: "H-4", priceIDR: 33810, priceJPY: 322 },
      { day: "H-3", priceIDR: 33705, priceJPY: 321 },
      { day: "H-2", priceIDR: 33600, priceJPY: 320 },
      { day: "H-1", priceIDR: 33600, priceJPY: 320 },
      { day: "Hari Ini", priceIDR: 33600, priceJPY: 320 },
    ],
    analysis: "Tomat manis berdaging tebal favorit keluarga Jepang dengan kontrol brix greenhouse ketat.",
  },
  {
    id: "jp-jamur-shiitake",
    name: "Jamur Shiitake Segar (Gunma/Shizuoka)",
    kanjiName: "生しいたけ (原木栽培)",
    country: "JP",
    category: "hortikultura",
    marketLocation: "JA Gunma & Pasar Toyosu",
    priceIDR: 89250,
    priceJPY: 850,
    unit: "kg",
    change7d: 3.5,
    change30d: 9.0,
    trend: "up",
    volatility: 7.2,
    volumeTon: 140,
    history: [
      { day: "H-6", priceIDR: 85050, priceJPY: 810 },
      { day: "H-5", priceIDR: 86100, priceJPY: 820 },
      { day: "H-4", priceIDR: 86625, priceJPY: 825 },
      { day: "H-3", priceIDR: 87675, priceJPY: 835 },
      { day: "H-2", priceIDR: 88200, priceJPY: 840 },
      { day: "H-1", priceIDR: 88725, priceJPY: 845 },
      { day: "Hari Ini", priceIDR: 89250, priceJPY: 850 },
    ],
    analysis: "Budidaya kayu log alami (*Genboku*) memberikan aroma umami tajam dan harga lelang tinggi.",
  },
  {
    id: "jp-cabai-shishito",
    name: "Cabai Manis Shishito / Togarashi",
    kanjiName: "ししとうがらし (高知産)",
    country: "JP",
    category: "hortikultura",
    marketLocation: "JA Kochi & Pasar Ota Tokyo",
    priceIDR: 89250,
    priceJPY: 850,
    unit: "kg",
    change7d: 4.8,
    change30d: 14.2,
    trend: "up",
    volatility: 11.5,
    volumeTon: 95,
    history: [
      { day: "H-6", priceIDR: 84000, priceJPY: 800 },
      { day: "H-5", priceIDR: 85050, priceJPY: 810 },
      { day: "H-4", priceIDR: 86100, priceJPY: 820 },
      { day: "H-3", priceIDR: 87150, priceJPY: 830 },
      { day: "H-2", priceIDR: 87990, priceJPY: 838 },
      { day: "H-1", priceIDR: 88725, priceJPY: 845 },
      { day: "Hari Ini", priceIDR: 89250, priceJPY: 850 },
    ],
    analysis: "Cabai hijau kecil untuk tempura dan panggangan yakitori dengan permintaan restoran yang stabil.",
  },

  // Buah-buahan Sultan & Mewah (高級果物)
  {
    id: "jp-crown-melon",
    name: "Mask Melon Crown Shizuoka",
    kanjiName: "静岡産 クラウンメロン (名工)",
    country: "JP",
    category: "buah",
    marketLocation: "JA Shizuoka & Tokyo Ota Luxury Auction",
    priceIDR: 189000,
    priceJPY: 1800,
    unit: "kg",
    change7d: 6.2,
    change30d: 15.4,
    trend: "up",
    volatility: 12.0,
    volumeTon: 45,
    history: [
      { day: "H-6", priceIDR: 176400, priceJPY: 1680 },
      { day: "H-5", priceIDR: 178500, priceJPY: 1700 },
      { day: "H-4", priceIDR: 180600, priceJPY: 1720 },
      { day: "H-3", priceIDR: 183750, priceJPY: 1750 },
      { day: "H-2", priceIDR: 185850, priceJPY: 1770 },
      { day: "H-1", priceIDR: 187950, priceJPY: 1790 },
      { day: "Hari Ini", priceIDR: 189000, priceJPY: 1800 },
    ],
    analysis: "Mahakarya hortikultura Jepang: 1 pohon hanya membesarkan 1 buah melon terbaik (*Ichi-boku Itto*).",
  },
  {
    id: "jp-shine-muscat",
    name: "Anggur Shine Muscat Yamanashi",
    kanjiName: "山梨産 シャインマスカット",
    country: "JP",
    category: "buah",
    marketLocation: "JA Fruit Yamanashi & Pasar Ota",
    priceIDR: 294000,
    priceJPY: 2800,
    unit: "kg",
    change7d: 4.8,
    change30d: 11.2,
    trend: "up",
    volatility: 15.0,
    volumeTon: 60,
    history: [
      { day: "H-6", priceIDR: 278250, priceJPY: 2650 },
      { day: "H-5", priceIDR: 281400, priceJPY: 2680 },
      { day: "H-4", priceIDR: 284550, priceJPY: 2710 },
      { day: "H-3", priceIDR: 288750, priceJPY: 2750 },
      { day: "H-2", priceIDR: 290850, priceJPY: 2770 },
      { day: "H-1", priceIDR: 292950, priceJPY: 2790 },
      { day: "Hari Ini", priceIDR: 294000, priceJPY: 2800 },
    ],
    analysis: "Anggur hijau renyah tanpa biji beraroma muscat yang menjadi komoditas hadiah prestisius (*Ochugen*).",
  },
  {
    id: "jp-strawberry-amaou",
    name: "Stroberi Amaou Fukuoka",
    kanjiName: "博多あまおう (苺)",
    country: "JP",
    category: "buah",
    marketLocation: "JA Fukuoka & Pasar Ota Tokyo",
    priceIDR: 147000,
    priceJPY: 1400,
    unit: "kg",
    change7d: 5.5,
    change30d: 18.0,
    trend: "up",
    volatility: 16.5,
    volumeTon: 75,
    history: [
      { day: "H-6", priceIDR: 136500, priceJPY: 1300 },
      { day: "H-5", priceIDR: 138600, priceJPY: 1320 },
      { day: "H-4", priceIDR: 141750, priceJPY: 1350 },
      { day: "H-3", priceIDR: 143850, priceJPY: 1370 },
      { day: "H-2", priceIDR: 144900, priceJPY: 1380 },
      { day: "H-1", priceIDR: 145950, priceJPY: 1390 },
      { day: "Hari Ini", priceIDR: 147000, priceJPY: 1400 },
    ],
    analysis: "Singkatan dari *Akai, Marui, Ookii, Umai* (Merah, Bulat, Besar, Lezat). Stroberi termahal di Jepang.",
  },
  {
    id: "jp-apel-fuji",
    name: "Apel Sun Fuji Aomori",
    kanjiName: "青森産 サンふじ (林檎)",
    country: "JP",
    category: "buah",
    marketLocation: "JA Aomori & Pasar Ota Tokyo",
    priceIDR: 44100,
    priceJPY: 420,
    unit: "kg",
    change7d: 1.5,
    change30d: 3.8,
    trend: "up",
    volatility: 4.5,
    volumeTon: 550,
    history: [
      { day: "H-6", priceIDR: 43050, priceJPY: 410 },
      { day: "H-5", priceIDR: 43260, priceJPY: 412 },
      { day: "H-4", priceIDR: 43470, priceJPY: 414 },
      { day: "H-3", priceIDR: 43680, priceJPY: 416 },
      { day: "H-2", priceIDR: 43890, priceJPY: 418 },
      { day: "H-1", priceIDR: 43995, priceJPY: 419 },
      { day: "Hari Ini", priceIDR: 44100, priceJPY: 420 },
    ],
    analysis: "Apel madu dengan inti air (*Mitsu-iri*) yang terkenal renyah dan berair dari prefektur Aomori.",
  },

  // Teh, Jamur & Spesialitas (抹茶・茸・特産品)
  {
    id: "jp-uji-matcha",
    name: "Teh Hijau Ceremonial Uji Matcha",
    kanjiName: "京都 宇治抹茶 (一番茶)",
    country: "JP",
    category: "perkebunan",
    marketLocation: "JA Kyoto & Asosiasi Teh Uji",
    priceIDR: 472500,
    priceJPY: 4500,
    unit: "kg",
    change7d: 2.8,
    change30d: 6.5,
    trend: "up",
    volatility: 6.0,
    volumeTon: 35,
    history: [
      { day: "H-6", priceIDR: 456750, priceJPY: 4350 },
      { day: "H-5", priceIDR: 459900, priceJPY: 4380 },
      { day: "H-4", priceIDR: 463050, priceJPY: 4410 },
      { day: "H-3", priceIDR: 466200, priceJPY: 4440 },
      { day: "H-2", priceIDR: 469350, priceJPY: 4470 },
      { day: "H-1", priceIDR: 471450, priceJPY: 4490 },
      { day: "Hari Ini", priceIDR: 472500, priceJPY: 4500 },
    ],
    analysis: "Matcha petikan pertama (*Ichibancha*) untuk upacara minum teh dan bakery eksklusif dunia.",
  },
  {
    id: "jp-jahe-shoga",
    name: "Jahe Segar Shoga Kochi",
    kanjiName: "高知産 囲い生姜 (ショウガ)",
    country: "JP",
    category: "perkebunan",
    marketLocation: "JA Kochi & Pasar Toyosu",
    priceIDR: 44100,
    priceJPY: 420,
    unit: "kg",
    change7d: 3.2,
    change30d: 8.0,
    trend: "up",
    volatility: 5.8,
    volumeTon: 180,
    history: [
      { day: "H-6", priceIDR: 42000, priceJPY: 400 },
      { day: "H-5", priceIDR: 42525, priceJPY: 405 },
      { day: "H-4", priceIDR: 43050, priceJPY: 410 },
      { day: "H-3", priceIDR: 43575, priceJPY: 415 },
      { day: "H-2", priceIDR: 43890, priceJPY: 418 },
      { day: "H-1", priceIDR: 43995, priceJPY: 419 },
      { day: "Hari Ini", priceIDR: 44100, priceJPY: 420 },
    ],
    analysis: "Bumbu dapur aromatik esensial untuk sushi gari dan masakan tradisional washoku.",
  },
];

export default function MarketPage() {
  const [selectedCountryTab, setSelectedCountryTab] = useState<"ID" | "JP" | "ARBITRAGE">("ID");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currencyMode, setCurrencyMode] = useState<"IDR" | "JPY">("IDR");

  // Selected commodity for detailed view
  const [selectedCommodity, setSelectedCommodity] = useState<CommodityItem>(INDONESIA_COMMODITIES[0]);

  // Handle Tab Switch
  const handleCountrySwitch = (tab: "ID" | "JP" | "ARBITRAGE") => {
    setSelectedCountryTab(tab);
    setActiveCategory("all");
    if (tab === "ID") setSelectedCommodity(INDONESIA_COMMODITIES[0]);
    else if (tab === "JP") setSelectedCommodity(JAPAN_COMMODITIES[0]);
  };

  // Get active dataset
  const currentDataset = selectedCountryTab === "ID" ? INDONESIA_COMMODITIES : JAPAN_COMMODITIES;

  // Filter items
  const filteredItems = currentDataset.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(q) ||
      (item.localName && item.localName.toLowerCase().includes(q)) ||
      (item.kanjiName && item.kanjiName.toLowerCase().includes(q)) ||
      item.marketLocation.toLowerCase().includes(q);
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

  // Top arbitrage items
  const arbitrageList = INDONESIA_COMMODITIES.filter((c) => c.exportArbitrageMargin && c.exportArbitrageMargin > 0).sort(
    (a, b) => (b.exportArbitrageMargin || 0) - (a.exportArbitrageMargin || 0)
  );

  return (
    <div className="space-y-8 pb-16 text-slate-100">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* HEADER BANNER & MASTER COUNTRY TABS                                */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 border border-sky-500/30 shadow-2xl bg-gradient-to-r from-sky-950/80 via-slate-900 to-slate-950 backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold tracking-wide uppercase">
              <Globe className="w-3.5 h-3.5" />
              Bilateral Agri-Intelligence Portal (Indonesia 🇮🇩 × Jepang 🇯🇵)
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Intelijen Pasar Komoditas Terintegrasi
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Pemisahan terstruktur pasar pangan & komoditas Indonesia (BAPANAS) dan pasar lelang Jepang (JA Group / 日本農協), dilengkapi pemindai selisih harga arbitrase ekspor.
            </p>
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs self-start md:self-auto">
            <span className="text-[10px] text-slate-400 uppercase font-bold px-2">Mata Uang:</span>
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
        </div>

        {/* Master Section Tabs */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap gap-2">
          <button
            onClick={() => handleCountrySwitch("ID")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              selectedCountryTab === "ID"
                ? "bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg shadow-red-500/20"
                : "bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800"
            }`}
          >
            <span className="text-base">🇮🇩</span>
            <span>Pasar Indonesia (BAPANAS & Pasar Induk)</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full bg-black/30 text-[10px]">{INDONESIA_COMMODITIES.length}</span>
          </button>

          <button
            onClick={() => handleCountrySwitch("JP")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              selectedCountryTab === "JP"
                ? "bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-lg shadow-indigo-500/20"
                : "bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800"
            }`}
          >
            <span className="text-base">🇯🇵</span>
            <span>Pasar Jepang (JA Group / 日本農協)</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full bg-black/30 text-[10px]">{JAPAN_COMMODITIES.length}</span>
          </button>

          <button
            onClick={() => handleCountrySwitch("ARBITRAGE")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              selectedCountryTab === "ARBITRAGE"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-lg shadow-emerald-500/20"
                : "bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800"
            }`}
          >
            <Scale className="w-4 h-4 text-emerald-400" />
            <span>Matriks Arbitrase Ekspor (ID ➔ JP)</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB CONTENT: INDONESIA OR JAPAN MARKET                             */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {selectedCountryTab !== "ARBITRAGE" && (
        <div className="space-y-6">
          {/* Subcategory Filter & Search Bar */}
          <div className="p-4 rounded-2xl bg-[#090e18] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveCategory("all")}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                  activeCategory === "all"
                    ? "bg-sky-500 text-slate-950 shadow"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {selectedCountryTab === "ID" ? "Semua Komoditas ID" : "全品目 (Semua JP)"}
              </button>
              <button
                onClick={() => setActiveCategory("pangan")}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeCategory === "pangan"
                    ? "bg-sky-500 text-slate-950 font-bold shadow"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {selectedCountryTab === "ID" ? "🌾 Pangan Pokok" : "🌾 米・穀物・芋 (Pangan)"}
              </button>
              <button
                onClick={() => setActiveCategory("hortikultura")}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeCategory === "hortikultura"
                    ? "bg-sky-500 text-slate-950 font-bold shadow"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {selectedCountryTab === "ID" ? "🌶️ Hortikultura Sayur" : "🥬 青果・伝統野菜 (Sayuran)"}
              </button>
              <button
                onClick={() => setActiveCategory("buah")}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeCategory === "buah"
                    ? "bg-sky-500 text-slate-950 font-bold shadow"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {selectedCountryTab === "ID" ? "🍈 Buah-buahan" : "🍓 高級果物 (Buah Sultan)"}
              </button>
              <button
                onClick={() => setActiveCategory("perkebunan")}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeCategory === "perkebunan"
                    ? "bg-sky-500 text-slate-950 font-bold shadow"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {selectedCountryTab === "ID" ? "☕ Perkebunan & Rempah" : "🍵 抹茶・特産品 (Teh & Spesial)"}
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={selectedCountryTab === "ID" ? "Cari komoditas Indonesia..." : "Cari komoditas Jepang..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Grid Layout: Left List (5 cols) & Right Detail Deep Dive (7 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Commodity Cards List */}
            <div className="lg:col-span-5 space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {filteredItems.map((item) => {
                const isSelected = selectedCommodity.id === item.id;
                const displayPrice =
                  currencyMode === "IDR"
                    ? `Rp ${item.priceIDR.toLocaleString("id-ID")}`
                    : `¥ ${item.priceJPY.toLocaleString("ja-JP")}`;

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
                        {item.kanjiName && (
                          <span className="text-[10px] text-amber-400 font-mono hidden sm:inline truncate">
                            {item.kanjiName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px]">
                          {item.category.toUpperCase()}
                        </span>
                        <span className="truncate max-w-[150px]">{item.marketLocation.split(",")[0]}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-extrabold text-white">
                        {displayPrice} <span className="text-xs font-normal text-slate-400">/{item.unit}</span>
                      </p>
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

            {/* Selected Commodity Deep Dive Chart */}
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-2xl bg-[#090e18] border border-slate-800 p-6 shadow-xl space-y-6">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase">
                        {selectedCommodity.category}
                      </span>
                      {selectedCommodity.kanjiName && (
                        <span className="text-xs text-amber-400 font-mono font-semibold">
                          {selectedCommodity.kanjiName}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-extrabold text-white">{selectedCommodity.name}</h2>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{selectedCommodity.marketLocation}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-sky-400">
                      {currencyMode === "IDR"
                        ? `Rp ${selectedCommodity.priceIDR.toLocaleString("id-ID")}`
                        : `¥ ${selectedCommodity.priceJPY.toLocaleString("ja-JP")}`}
                      <span className="text-xs font-normal text-slate-400"> /{selectedCommodity.unit}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Ekuivalen:{" "}
                      {currencyMode === "IDR"
                        ? `≈ ¥${selectedCommodity.priceJPY} (Rate 105)`
                        : `≈ Rp ${selectedCommodity.priceIDR.toLocaleString("id-ID")}`}
                    </p>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Tren 7 Hari</p>
                    <p
                      className={`text-base font-extrabold mt-0.5 ${
                        selectedCommodity.change7d >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {selectedCommodity.change7d >= 0 ? "+" : ""}
                      {selectedCommodity.change7d}%
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Volatilitas 30D</p>
                    <p className="text-base font-extrabold text-amber-400 mt-0.5">{selectedCommodity.volatility}%</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      {selectedCommodity.country === "JP" ? "入荷量 (Volume Lelang)" : "Volume Pasar"}
                    </p>
                    <p className="text-base font-extrabold text-teal-400 mt-0.5">{selectedCommodity.volumeTon} ton</p>
                  </div>
                </div>

                {/* Historical Chart */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-sky-400" /> Tren Pergerakan Harga 7 Hari Terakhir
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
                            currencyMode === "IDR"
                              ? `Rp ${Number(v).toLocaleString("id-ID")}`
                              : `¥ ${Number(v).toLocaleString("ja-JP")}`,
                            "Harga Pasar",
                          ]}
                        />
                        <Area type="monotone" dataKey="price" stroke="#38bdf8" strokeWidth={2.5} fillOpacity={1} fill="url(#priceGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Analysis Commentary */}
                <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-500/30 space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-sky-400 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analisis Dinamika & Prospek Pasar</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{selectedCommodity.analysis}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB CONTENT: BILATERAL ARBITRAGE SCANNER                           */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {selectedCountryTab === "ARBITRAGE" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  Peluang Arbitrase Komparasi Harga (Indonesia ➔ Jepang)
                </h3>
                <p className="text-xs text-slate-400">
                  Perhitungan selisih harga domestik (BAPANAS) vs harga jual lelang Jepang (JA Tokyo Wholesale) setelah estimasi biaya freight & perizinan ekspor.
                </p>
              </div>
              <div className="text-xs text-emerald-400 font-mono bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                Kurs Acuan: 1 JPY = Rp 105.0
              </div>
            </div>

            {/* Arbitrage Bar Chart */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300">Top Komoditas Potensi Net Margin Ekspor (%)</h4>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={arbitrageList.map((c) => ({
                      name: c.name.split(" ")[0] + " " + (c.name.split(" ")[1] || ""),
                      margin: c.exportArbitrageMargin || 0,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <YAxis stroke="#64748b" tickFormatter={(v) => `+${v}%`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: 8, color: "#fff" }}
                      formatter={(v: any) => [`+${v}%`, "Net Export Margin"]}
                    />
                    <Bar dataKey="margin" radius={[4, 4, 0, 0]}>
                      {arbitrageList.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={(entry.exportArbitrageMargin || 0) >= 100 ? "#10b981" : "#38bdf8"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Arbitrage Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] uppercase text-slate-400 bg-slate-900 border-y border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Komoditas Indonesia</th>
                    <th className="px-4 py-3">Harga Domestik (IDR)</th>
                    <th className="px-4 py-3">Harga di Jepang (JPY)</th>
                    <th className="px-4 py-3">Nilai Rupiah di Jepang</th>
                    <th className="px-4 py-3">Net Spread Margin (%)</th>
                    <th className="px-4 py-3">Rating Kelayakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {arbitrageList.map((c) => {
                    // Match japan price if available or use estimate
                    const matchingJp = JAPAN_COMMODITIES.find((j) => j.category === c.category);
                    const jpyPrice = matchingJp ? matchingJp.priceJPY : Math.round(c.priceIDR / 60);
                    const jpyInIdr = Math.round(jpyPrice * JPY_IDR_RATE);

                    return (
                      <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="px-4 py-3 font-bold text-white">
                          <p>{c.name}</p>
                          <span className="text-[10px] text-slate-500">{c.localName}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-300 font-mono">Rp {c.priceIDR.toLocaleString("id-ID")}</td>
                        <td className="px-4 py-3 text-amber-400 font-mono font-bold">¥ {jpyPrice.toLocaleString("ja-JP")}</td>
                        <td className="px-4 py-3 text-emerald-400 font-mono">Rp {jpyInIdr.toLocaleString("id-ID")}</td>
                        <td className="px-4 py-3 font-extrabold text-emerald-400 font-mono">
                          +{c.exportArbitrageMargin}%
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              c.arbitrageRating === "SANGAT MENGUNTUNGKAN"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
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
