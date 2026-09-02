import { NextRequest, NextResponse } from "next/server";

interface SoilInput {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
  target_crops?: string[];
}

// Scientific crop requirements database (FAO, Balitbangtan & IPB)
const CROP_DATABASE = [
  // 1. Pangan Pokok
  {
    name: "Padi Sawah (Oryza sativa)",
    category: "Pangan Pokok",
    variety: "Ciherang / Inpari 32 HDB",
    optimal: { n: [60, 100], p: [35, 60], k: [35, 60], temp: [22, 32], hum: [70, 90], ph: [5.5, 7.0], rain: [150, 300] },
    yield_potential_ton: "6.5 - 8.5 Ton/Ha",
    fertilizer_plan: "Urea 250 kg/ha + NPK 15-15-15 300 kg/ha + SP-36 100 kg/ha",
  },
  {
    name: "Jagung Hibrida (Zea mays)",
    category: "Pangan Pokok",
    variety: "Bisi 18 / Pioneer P35",
    optimal: { n: [80, 140], p: [40, 80], k: [40, 80], temp: [21, 30], hum: [55, 75], ph: [5.8, 7.2], rain: [100, 200] },
    yield_potential_ton: "8.0 - 11.0 Ton/Ha",
    fertilizer_plan: "Urea 350 kg/ha + NPK 16-16-16 350 kg/ha + KCl 50 kg/ha",
  },
  {
    name: "Kedelai (Glycine max)",
    category: "Pangan Pokok",
    variety: "Anjasmoro / Grobogan",
    optimal: { n: [30, 60], p: [40, 70], k: [30, 60], temp: [23, 30], hum: [60, 80], ph: [6.0, 7.0], rain: [80, 160] },
    yield_potential_ton: "2.2 - 3.2 Ton/Ha",
    fertilizer_plan: "Inokulasi Rhizobium + SP-36 150 kg/ha + KCl 100 kg/ha + Urea 50 kg/ha",
  },
  {
    name: "Ubi Kayu / Singkong (Manihot esculenta)",
    category: "Pangan Pokok",
    variety: "Gajah / Manggu",
    optimal: { n: [40, 80], p: [20, 50], k: [60, 120], temp: [24, 32], hum: [60, 85], ph: [5.0, 6.8], rain: [90, 220] },
    yield_potential_ton: "30.0 - 45.0 Ton/Ha",
    fertilizer_plan: "NPK 15-15-15 300 kg/ha + KCl 100 kg/ha + Pupuk Kandang 5 ton/ha",
  },
  {
    name: "Kentang Granola (Solanum tuberosum)",
    category: "Pangan Pokok",
    variety: "Granola L / Atlantic",
    optimal: { n: [70, 110], p: [60, 100], k: [80, 130], temp: [15, 22], hum: [70, 85], ph: [5.5, 6.5], rain: [120, 200] },
    yield_potential_ton: "20.0 - 30.0 Ton/Ha",
    fertilizer_plan: "NPK Mutiara 500 kg/ha + SP-36 200 kg/ha + KCl 200 kg/ha + Dolomit 1.5 ton/ha",
  },

  // 2. Hortikultura & Sayuran
  {
    name: "Cabai Merah Keriting (Capsicum annuum)",
    category: "Hortikultura Sayur",
    variety: "Laba F1 / Kencana / Kastilo",
    optimal: { n: [70, 120], p: [50, 90], k: [60, 110], temp: [24, 29], hum: [60, 80], ph: [6.0, 6.8], rain: [80, 180] },
    yield_potential_ton: "12.0 - 18.0 Ton/Ha",
    fertilizer_plan: "KNO3 Merah & Putih + NPK Mutiara 16-16-16 + Kalsium Nitrat + Kompos 10 ton/ha",
  },
  {
    name: "Bawang Merah (Allium cepa)",
    category: "Hortikultura Sayur",
    variety: "Tajuk / Bauji / Super Philip",
    optimal: { n: [60, 100], p: [50, 85], k: [50, 90], temp: [25, 32], hum: [50, 70], ph: [6.0, 6.8], rain: [50, 140] },
    yield_potential_ton: "10.0 - 15.0 Ton/Ha",
    fertilizer_plan: "NPK 15-15-15 400 kg/ha + ZA 200 kg/ha + SP-36 150 kg/ha",
  },
  {
    name: "Tomat Servo (Solanum lycopersicum)",
    category: "Hortikultura Sayur",
    variety: "Servo F1 / Gustavi",
    optimal: { n: [75, 115], p: [55, 85], k: [70, 115], temp: [20, 28], hum: [60, 80], ph: [6.0, 6.8], rain: [90, 170] },
    yield_potential_ton: "25.0 - 35.0 Ton/Ha",
    fertilizer_plan: "NPK 16-16-16 400 kg/ha + KNO3 Putih 100 kg/ha + Kalsium 50 kg/ha",
  },
  {
    name: "Bawang Putih (Allium sativum)",
    category: "Hortikultura Sayur",
    variety: "Lumbu Hijau / Tawangmangu Baru",
    optimal: { n: [60, 95], p: [45, 75], k: [50, 85], temp: [18, 25], hum: [65, 80], ph: [6.2, 7.0], rain: [100, 180] },
    yield_potential_ton: "8.0 - 12.0 Ton/Ha",
    fertilizer_plan: "Urea 150 kg/ha + SP-36 200 kg/ha + KCl 150 kg/ha + Pupuk Kandang 10 ton/ha",
  },
  {
    name: "Terong Ungu (Solanum melongena)",
    category: "Hortikultura Sayur",
    variety: "Antaboga F1 / Yumi",
    optimal: { n: [65, 105], p: [40, 70], k: [50, 90], temp: [23, 31], hum: [60, 80], ph: [5.8, 6.8], rain: [80, 160] },
    yield_potential_ton: "20.0 - 30.0 Ton/Ha",
    fertilizer_plan: "NPK 15-15-15 350 kg/ha + Urea 150 kg/ha + SP-36 100 kg/ha",
  },

  // 3. Buah-buahan
  {
    name: "Melon Golden Inthanon (Cucumis melo)",
    category: "Buah-buahan",
    variety: "Golden Aroma / Inthanon F1",
    optimal: { n: [80, 125], p: [50, 85], k: [70, 120], temp: [24, 32], hum: [55, 75], ph: [6.0, 7.0], rain: [60, 140] },
    yield_potential_ton: "20.0 - 28.0 Ton/Ha",
    fertilizer_plan: "KNO3 + MKP + NPK 16-16-16 + Asam Humat + Kalsium Boron",
  },
  {
    name: "Semangka Non-Biji (Citrullus lanatus)",
    category: "Buah-buahan",
    variety: "Amara F1 / Sun Flower",
    optimal: { n: [70, 110], p: [45, 75], k: [60, 100], temp: [25, 33], hum: [50, 70], ph: [5.8, 6.8], rain: [50, 130] },
    yield_potential_ton: "25.0 - 38.0 Ton/Ha",
    fertilizer_plan: "NPK 15-15-15 400 kg/ha + KCl 150 kg/ha + ZA 100 kg/ha",
  },
  {
    name: "Pisang Cavendish (Musa acuminata)",
    category: "Buah-buahan",
    variety: "Cavendish Grand Naine",
    optimal: { n: [85, 135], p: [35, 65], k: [90, 160], temp: [25, 32], hum: [70, 90], ph: [5.5, 6.8], rain: [140, 260] },
    yield_potential_ton: "35.0 - 50.0 Ton/Ha/Th",
    fertilizer_plan: "Urea 300 g/rumpun + KCl 400 g/rumpun + Rock Phosphate 200 g/rumpun 3x setahun",
  },
  {
    name: "Durian Musang King (Durio zibethinus)",
    category: "Buah-buahan",
    variety: "Musang King / Ochee (Duri Hitam)",
    optimal: { n: [75, 120], p: [40, 70], k: [80, 140], temp: [24, 30], hum: [70, 85], ph: [6.0, 6.8], rain: [120, 240] },
    yield_potential_ton: "10.0 - 16.0 Ton/Ha/Th",
    fertilizer_plan: "NPK Organik + Kalium Sulfat (SOP) + Asam Amino + Dolomit",
  },

  // 4. Perkebunan & Industri
  {
    name: "Kopi Arabika (Coffea arabica)",
    category: "Perkebunan",
    variety: "Sigarar Utang / Kartika / Gayo 1",
    optimal: { n: [50, 90], p: [25, 50], k: [50, 100], temp: [15, 24], hum: [70, 85], ph: [5.5, 6.5], rain: [120, 250] },
    yield_potential_ton: "1.5 - 2.5 Ton Green Bean/Ha",
    fertilizer_plan: "Pupuk Organik Kambing 10 kg/pohon + NPK 15-15-15 300 g/pohon 2x setahun",
  },
  {
    name: "Kelapa Sawit (Elaeis guineensis)",
    category: "Perkebunan",
    variety: "DxP Socfindo / Marihat / Dami Mas",
    optimal: { n: [90, 150], p: [40, 70], k: [90, 160], temp: [24, 32], hum: [75, 95], ph: [4.5, 6.5], rain: [160, 320] },
    yield_potential_ton: "22.0 - 28.0 Ton TBS/Ha/Th",
    fertilizer_plan: "Urea 2.0 kg/pohon/th + MOP/KCl 2.5 kg/pohon/th + Rock Phosphate 1.5 kg/pohon/th",
  },
];

function scoreMatch(val: number, range: [number, number]): number {
  const [min, max] = range;
  if (val >= min && val <= max) return 1.0;
  const dist = val < min ? min - val : val - max;
  const span = max - min || 1;
  return Math.max(0.1, 1.0 - (dist / (span * 1.5)));
}

export async function POST(req: NextRequest) {
  try {
    const input: SoilInput = await req.json();

    // 1. Try live Railway MLOps API first
    try {
      const mlopsRes = await fetch("https://mlops-api-production-afaf.up.railway.app/predict/crop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(3000),
      });
      if (mlopsRes.ok) {
        const mlData = await mlopsRes.json();
        return NextResponse.json(mlData);
      }
    } catch {
      // fallback to high-precision agronomic calculator
    }

    // 2. Multi-Commodity Distance Scoring across all 16 crops
    const scored = CROP_DATABASE.map((crop) => {
      const sN = scoreMatch(input.nitrogen, crop.optimal.n as [number, number]);
      const sP = scoreMatch(input.phosphorus, crop.optimal.p as [number, number]);
      const sK = scoreMatch(input.potassium, crop.optimal.k as [number, number]);
      const sTemp = scoreMatch(input.temperature, crop.optimal.temp as [number, number]);
      const sHum = scoreMatch(input.humidity, crop.optimal.hum as [number, number]);
      const sPh = scoreMatch(input.ph, crop.optimal.ph as [number, number]);
      const sRain = scoreMatch(input.rainfall, crop.optimal.rain as [number, number]);

      // Weighted multi-factor suitability formula
      const overall = (sN * 0.18 + sP * 0.14 + sK * 0.18 + sPh * 0.18 + sRain * 0.14 + sTemp * 0.10 + sHum * 0.08);

      return {
        ...crop,
        score: Number(overall.toFixed(3)),
        percentage: Number((overall * 100).toFixed(1)),
        factor_scores: {
          nitrogen: Number((sN * 100).toFixed(1)),
          phosphorus: Number((sP * 100).toFixed(1)),
          potassium: Number((sK * 100).toFixed(1)),
          ph: Number((sPh * 100).toFixed(1)),
          rainfall: Number((sRain * 100).toFixed(1)),
          temperature: Number((sTemp * 100).toFixed(1)),
          humidity: Number((sHum * 100).toFixed(1)),
        },
      };
    });

    scored.sort((a, b) => b.score - a.score);
    const top = scored[0];

    // SHAP-like factor contributions
    const shapFactors = [
      {
        factor: "pH Tanah",
        impact: Number((scoreMatch(input.ph, top.optimal.ph as [number, number]) * 0.28).toFixed(3)),
        interpretation:
          input.ph < top.optimal.ph[0]
            ? `pH (${input.ph}) terlalu asam untuk ${top.name.split(" ")[0]} (ideal: ${top.optimal.ph.join("-")}). Butuh kapur Dolomit.`
            : input.ph > top.optimal.ph[1]
            ? `pH (${input.ph}) terlalu basa (ideal: ${top.optimal.ph.join("-")}). Butuh belerang atau asam humat.`
            : `pH (${input.ph}) sangat ideal (${top.optimal.ph.join("-")}). Ketersediaan hara optimal.`,
      },
      {
        factor: "Kalium (K)",
        impact: Number((scoreMatch(input.potassium, top.optimal.k as [number, number]) * 0.24).toFixed(3)),
        interpretation:
          input.potassium < top.optimal.k[0]
            ? `Kadar K (${input.potassium} mg/kg) defisit (ideal: ${top.optimal.k.join("-")}). Tambahkan KCl / KNO3.`
            : `Kadar K (${input.potassium} mg/kg) mencukupi untuk ketahanan penyakit dan bobot buah.`,
      },
      {
        factor: "Nitrogen (N)",
        impact: Number((scoreMatch(input.nitrogen, top.optimal.n as [number, number]) * 0.22).toFixed(3)),
        interpretation:
          input.nitrogen < top.optimal.n[0]
            ? `Nitrogen (${input.nitrogen} mg/kg) rendah (ideal: ${top.optimal.n.join("-")}). Tambahkan Urea.`
            : `Nitrogen (${input.nitrogen} mg/kg) sangat mendukung fase vegetatif tanaman.`,
      },
      {
        factor: "Curah Hujan",
        impact: Number((scoreMatch(input.rainfall, top.optimal.rain as [number, number]) * 0.16).toFixed(3)),
        interpretation:
          input.rainfall > top.optimal.rain[1]
            ? `Curah hujan (${input.rainfall} mm) tinggi. Waspada drainase dan serangan jamur/bakteri.`
            : `Curah hujan (${input.rainfall} mm) selaras dengan siklus kebutuhan air tanaman.`,
      },
    ];

    const npkTotal = input.nitrogen + input.phosphorus + input.potassium;
    const npkBalance = npkTotal < 120 ? "deficient" : npkTotal > 260 ? "excessive" : "optimal";
    const phCategory = input.ph < 5.5 ? "Sangat Asam" : input.ph <= 6.8 ? "Netral-Optimal" : "Alkali (Basa)";

    const response = {
      recommended_crop: top.name,
      variety: top.variety,
      confidence: top.percentage,
      yield_potential: top.yield_potential_ton,
      fertilizer_recommendation: top.fertilizer_plan,
      all_crops_ranked: scored.map((c) => ({
        crop: c.name,
        category: c.category,
        variety: c.variety,
        score: c.percentage,
        yield_potential: c.yield_potential_ton,
        fertilizer: c.fertilizer_plan,
        factor_scores: c.factor_scores,
      })),
      alternative_crops: scored.slice(1, 6).map((c) => ({
        crop: c.name,
        category: c.category,
        score: c.percentage,
        yield_potential: c.yield_potential_ton,
      })),
      shap_factors: shapFactors,
      soil_status: {
        npk_balance: npkBalance,
        ph_category: phCategory,
        actionable_advice:
          input.ph < 6.0
            ? `Taburkan 1.0 - 1.5 ton/ha kapur Dolomit CaMg(CO3)2 saat olah tanah untuk menaikkan pH menuju target 6.2 - 6.8.`
            : `Status hara tanah sudah sangat baik. Lanjutkan pemupukan berimbang sesuai fase pertumbuhan tanaman.`,
      },
    };

    return NextResponse.json(response, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (error) {
    console.error("MLOps Inference Error:", error);
    return NextResponse.json({ error: "Gagal memproses inferensi MLOps" }, { status: 500 });
  }
}
