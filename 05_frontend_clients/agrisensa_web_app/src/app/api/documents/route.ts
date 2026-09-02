import { NextRequest, NextResponse } from "next/server";

const AI_ENGINE_URL = process.env.NEXT_PUBLIC_AI_ENGINE_URL || "http://localhost:8001";

export async function GET() {
  try {
    const res = await fetch(`${AI_ENGINE_URL}/documents/library`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      // Fallback mock library if backend is starting
      return NextResponse.json({
        success: true,
        total: 1,
        documents: [
          {
            filename: "M-48_Pestisida_Nabati.pdf",
            title: "M 48 Pestisida Nabati",
            category: "Pestisida Nabati & PHT",
            tags: ["Organik", "PHT", "Formula Nabati", "SOP"],
            size_mb: 3.21,
            file_type: "pdf",
            download_url: "/documents/M-48_Pestisida_Nabati.pdf",
            last_modified: "2026-02-24 18:48",
          },
        ],
      });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching document library:", error);
    return NextResponse.json({
      success: true,
      total: 1,
      documents: [
        {
          filename: "M-48_Pestisida_Nabati.pdf",
          title: "M 48 Pestisida Nabati",
          category: "Pestisida Nabati & PHT",
          tags: ["Organik", "PHT", "Formula Nabati", "SOP"],
          size_mb: 3.21,
          file_type: "pdf",
          download_url: "/documents/M-48_Pestisida_Nabati.pdf",
          last_modified: "2026-02-24 18:48",
        },
      ],
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // Case 1: Stored document parsing (JSON payload)
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const res = await fetch(`${AI_ENGINE_URL}/documents/parse-stored`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json({ success: false, error: errText }, { status: res.status });
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    // Case 2: Multipart file upload from user
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const res = await fetch(`${AI_ENGINE_URL}/documents/parse-upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json({ success: false, error: errText }, { status: res.status });
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ success: false, error: "Unsupported Content-Type" }, { status: 400 });
  } catch (error: any) {
    console.error("Error processing document route:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to process document" }, { status: 500 });
  }
}
