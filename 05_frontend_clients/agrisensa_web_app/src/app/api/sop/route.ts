import { NextRequest, NextResponse } from "next/server";

const AI_ENGINE_URL =
  process.env.AI_ENGINE_URL ||
  process.env.NEXT_PUBLIC_AI_ENGINE_URL ||
  "https://ai-engine-production-cc99.up.railway.app";

export async function GET() {
  try {
    const res = await fetch(`${AI_ENGINE_URL}/sop/commodities`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    throw new Error(`SOP Backend error: ${res.status}`);
  } catch (error: any) {
    console.warn("Falling back to local SOP commodities catalog:", error);
    return NextResponse.json({
      success: true,
      total: 7,
      commodities: [
        { name: "Padi Sawah", scientific_name: "Oryza sativa L.", varieties: ["Inpari 32 HDB", "Ciherang", "Inpari 42 GSR"], duration_hst: 115, potential_yield_ton_ha: 7.5 },
        { name: "Cabai Merah", scientific_name: "Capsicum annuum L.", varieties: ["Kencana", "Ori 212", "TM 99", "Laba F1"], duration_hst: 120, potential_yield_ton_ha: 14.0 },
        { name: "Bawang Merah", scientific_name: "Allium cepa var. aggregatum", varieties: ["Bima Brebes", "Tajuk", "Bauji"], duration_hst: 65, potential_yield_ton_ha: 12.5 },
        { name: "Jagung Hibrida", scientific_name: "Zea mays L.", varieties: ["Bisi 18", "Pioneer P35", "NK 212"], duration_hst: 105, potential_yield_ton_ha: 9.5 },
        { name: "Tomat", scientific_name: "Solanum lycopersicum L.", varieties: ["Servo F1", "Gustavi F1", "Tymoti F1"], duration_hst: 90, potential_yield_ton_ha: 35.0 },
        { name: "Melon", scientific_name: "Cucumis melo L.", varieties: ["Golden Aroma", "Action 434", "Alisha F1"], duration_hst: 70, potential_yield_ton_ha: 30.0 },
        { name: "Kopi", scientific_name: "Coffea arabica / canephora", varieties: ["Sigarar Utang", "Gayo 1", "BP 42"], duration_hst: 365, potential_yield_ton_ha: 2.2 },
      ],
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const res = await fetch(`${AI_ENGINE_URL}/sop/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    const errText = await res.text();
    return NextResponse.json({ success: false, error: errText }, { status: res.status });
  } catch (error: any) {
    console.error("Error generating SOP:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghasilkan SOP" },
      { status: 500 }
    );
  }
}
