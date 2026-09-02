import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message || body.text;
    const chatId = body.chat_id || process.env.TELEGRAM_ADMIN_CHAT_ID || "6350008299";
    const token = process.env.TELEGRAM_BOT_TOKEN || "8833555127:AAEJMkWwEuLT49cDz1Kx0dccU92Jqo4Wmqs";

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Pesan tidak boleh kosong" },
        { status: 400 }
      );
    }

    const telegramApiUrl = `https://api.telegram.org/bot${token}/sendMessage`;

    const telegramRes = await fetch(telegramApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: body.parse_mode || "Markdown",
        disable_web_page_preview: true,
      }),
    });

    const telegramData = await telegramRes.json();

    if (!telegramData.ok) {
      return NextResponse.json(
        { success: false, error: telegramData.description || "Gagal mengirim ke Telegram" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message_id: telegramData.result?.message_id,
      chat_id: chatId,
    });
  } catch (error: any) {
    console.error("Telegram API Route Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
