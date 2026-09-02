import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "organic"; // "organic" or "combination"
    const aiEngineUrl =
      process.env.AI_ENGINE_URL ||
      process.env.NEXT_PUBLIC_AI_ENGINE_URL ||
      "http://localhost:8001";

    const endpoint =
      action === "combination"
        ? `${aiEngineUrl}/fertilizer/combination-calculator`
        : `${aiEngineUrl}/fertilizer/organic-calculator`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body.payload || body),
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, {
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    throw new Error(`AI Engine error: ${res.status}`);
  } catch (err: any) {
    console.warn("Fertilizer API fallback:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memproses perhitungan pupuk" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "recipes";
    const aiEngineUrl =
      process.env.AI_ENGINE_URL ||
      process.env.NEXT_PUBLIC_AI_ENGINE_URL ||
      "http://localhost:8001";

    const endpoint =
      type === "materials"
        ? `${aiEngineUrl}/fertilizer/materials`
        : `${aiEngineUrl}/fertilizer/recipes`;

    const res = await fetch(endpoint, {
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, {
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    throw new Error(`AI Engine error: ${res.status}`);
  } catch (err: any) {
    console.warn("Fertilizer GET fallback:", err);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data resep pupuk" },
      { status: 500 }
    );
  }
}
