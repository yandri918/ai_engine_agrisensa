import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "sk-5a35944842a3436cabdac136a694549d";

const SYSTEM_PROMPT = `Anda adalah "AgriSensa AI Master Agronomist" — asisten pakar kecerdasan buatan pertanian presisi kelas dunia khusus agroklimat tropis dan komoditas Indonesia & Asia.

PEDOMAN KETAT:
1. Berikan analisis ilmiah, realistis, dan praktis yang bisa langsung diterapkan petani atau agronomis di lapangan.
2. Saat membahas dosis pupuk, sebutkan angka pasti (misal: "Urea 250 kg/ha, SP-36 100 kg/ha, KCl 100 kg/ha"), fase aplikasinya (HST - Hari Setelah Tanam), serta cara penempatan (tugal/kocor/sebar).
3. Untuk hama dan penyakit, jelaskan:
   - Gejala visual khas pada daun/batang/akar.
   - Ambang kendali ekonomi.
   - Solusi hayati (agensia hayati seperti Trichoderma, Beauveria) dan solusi kimiawi terdaftar bila mendesak (bahan aktif, bukan sekadar merk).
4. Gunakan format Markdown yang rapi dengan heading (###), tabel komparasi, daftar poin tebal, dan kotak sorotan tips praktis.
5. Jawaban harus mendalam, logis, terstruktur, dan tidak template/statis.`;

export async function POST(req: NextRequest) {
  try {
    const { message, history = [], cropContext } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-6).map((h: { role: string; content: string }) => ({
        role: h.role === "user" ? "user" : "assistant",
        content: h.content,
      })),
      {
        role: "user",
        content: cropContext ? `[Konteks Lahan: ${cropContext}]\n\nPertanyaan: ${message}` : message,
      },
    ];

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("DeepSeek API error:", response.status, errText);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Maaf, respon tidak dapat diproses.";

    return NextResponse.json({
      response: reply,
      model: "DeepSeek-V3",
      usage: data.usage,
    });
  } catch (err: any) {
    console.error("Chat API Route Error:", err);
    return NextResponse.json(
      {
        response: `### 🌾 Analisis Agronomi Mandiri (Fallback AI Engine)\n\nTerjadi kendala koneksi ke server DeepSeek (${err.message}). Namun berikut panduan umum teknis budidaya:\n\n1. **Keseimbangan Hara NPK**: Pastikan aplikasi pupuk dasar organik 2 ton/ha sebelum tanam.\n2. **Manajemen pH**: Jika pH < 6.0, taburkan kapur dolomit 1.5 - 2 ton/ha minimal 2 minggu sebelum tanam.\n3. **Proteksi Tanaman**: Lakukan monitoring OPT (Organisme Pengganggu Tanaman) setiap 3 hari sekali.`,
        model: "AgriSensa Standalone Engine",
      },
      { status: 200 }
    );
  }
}
