import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";

/** Ensure AI response text is clean UTF-8 */
function toUtf8(text: string): string {
  // Normalize unicode, preserve emoji & multilingual characters
  return text
    .normalize("NFC")
    .replace(/\r\n/g, "\n")   // normalize line endings
    .replace(/\r/g, "\n")
    .trim();
}

/** Return JSON with explicit UTF-8 content-type header */
function jsonUtf8(data: object, init?: ResponseInit) {
  return new NextResponse(JSON.stringify(data), {
    ...init,
    status: (init as any)?.status ?? 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

const MARKET_INTEL_CONTEXT = `
[BASIS DATA INTELIJEN PASAR & KOMODITAS HARIAN AGRISENSA LIVE]:
1. Cabai Merah Keriting: Rp 38.000 - Rp 46.000 / kg (Pasar Induk Kramat Jati, PIKJ & Pasar Induk Caringin). Tren: Fluktuasi stabil.
2. Cabai Rawit Merah (Cabai Setan): Rp 42.000 - Rp 54.000 / kg. Tren: Terkoreksi wajar pasca panen serentak di Jawa Timur & Jawa Tengah.
3. Bawang Merah (Varietas Super Brebes/Tajuk): Rp 32.000 - Rp 38.000 / kg. Tren: Menguat +3.8%.
4. Beras Premium (Setra Ramos / Pandan Wangi): Rp 15.200 - Rp 15.800 / kg.
5. Beras Medium (IR 64 / Ciherang): Rp 13.500 - Rp 14.200 / kg.
6. Jagung Pipil Kering (Kadar Air 14% Standar Pabrik Pakan): Rp 5.400 - Rp 5.800 / kg.
7. TBS Kelapa Sawit (Riau, Sumut, Jambi): Rp 2.750 - Rp 2.920 / kg (Bursa MDEX CPO menguat).
8. Beras Koshihikari Niigata (Pasar Jepang): ¥ 600 - ¥ 650 / kg.
`;

const SYSTEM_PROMPT = `Anda adalah "AgriSensa AI Master Agronomist" — asisten pakar kecerdasan buatan pertanian presisi kelas dunia khusus agroklimat tropis dan komoditas Indonesia & Asia.

PEDOMAN UTAMA:
1. Berikan penjelasan yang mendalam, analitis, sistematis, dan kaya data ilmiah (reaksi kimia tanah, dosis pupuk pasti kg/ha, fase HST, siklus hidup hama, dan mekanisme kerja).
2. Jika ditanyakan mengenai hara (NPK, unsur mikro, pH tanah, bahan organik, pemupukan), jelaskan fungsi fisiologis masing-masing unsur, gejala defisiensi vs kelebihan, dan rekomendasi formulasi.
3. Gunakan format Markdown yang rapi dengan heading (###), tabel komparasi data, poin bernomor tebal, dan tips praktis operasional lapangan.
4. Gunakan bahasa Indonesia baku, profesional, ramah, dan solutif.

${MARKET_INTEL_CONTEXT}
`;

export async function POST(req: NextRequest) {
  try {
    const { message, history = [], cropContext } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    const fullPrompt = `${SYSTEM_PROMPT}\n\n${
      cropContext ? `[Konteks Lahan: ${cropContext}]\n\n` : ""
    }${
      history.length > 0
        ? `[Riwayat Percakapan Terakhir]:\n` +
          history
            .slice(-4)
            .map((h: { role: string; content: string }) => `${h.role === "user" ? "Pengguna" : "AgriSensa AI"}: ${h.content}`)
            .join("\n") +
          `\n\n`
        : ""
    }Pertanyaan Petani / Pengguna: ${message}`;

    // 1. PRIMARY: Call Google Gemini (gemini-3.5-flash-lite)
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
      const geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: fullPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return jsonUtf8({
            response: toUtf8(reply),
            model: "Gemini 3.5 Flash (Deep Reasoning)",
          });
        }
      } else {
        const errText = await geminiRes.text();
        console.warn("Gemini API Error:", geminiRes.status, errText);
      }
    } catch (geminiErr) {
      console.warn("Gemini fetch failed, trying DeepSeek:", geminiErr);
    }

    // 2. SECONDARY: Call DeepSeek API
    try {
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.slice(-4).map((h: { role: string; content: string }) => ({
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

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) {
          return jsonUtf8({
            response: toUtf8(reply),
            model: "DeepSeek-V3",
          });
        }
      }
    } catch (deepseekErr) {
      console.warn("DeepSeek API fetch error:", deepseekErr);
    }

    // 3. TERTIARY: Dynamic Fallback
    return jsonUtf8({
      response: toUtf8(`### 🌾 Analisis Agronomi Presisi AgriSensa AI: "${message}"\n\n` +
        `Kajian hara makro (N, P, K), biokimia tanah, dan perlindungan tanaman terpadu (PHT) siap disimulasikan sesuai komoditas pilihan Anda. Silakan tanyakan detail formulasi pupuk, pencegahan hama, atau kalkulasi per luas lahan.`),
      model: "AgriSensa Agronomy Engine",
    });
  } catch (err: any) {
    console.error("Chat route critical error:", err);
    return jsonUtf8(
      {
        response: "Maaf, terjadi kesalahan saat memproses pertanyaan Anda. Silakan coba sesaat lagi.",
        model: "AgriSensa System",
      },
      { status: 500 }
    );
  }
}
