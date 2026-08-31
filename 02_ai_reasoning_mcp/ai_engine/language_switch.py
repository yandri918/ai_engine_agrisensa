"""
AgriSensa Language Switch (MCP — Multi-Context Protocol)
=========================================================
Menangani alih bahasa kontekstual antara:
- Bahasa Indonesia (ID) ← → 日本語 (JA)

Fitur:
- Template bilingual untuk semua modul AgriSensa
- Terjemahan kontekstual via Gemini AI
- Glossary pertanian ID/JA
- Format output laporan bilingual
- Fallback ke template statis jika Gemini tidak tersedia

Digunakan oleh semua modul sebagai post-processor output.
"""

import os
import json
import logging
from dataclasses import dataclass, asdict
from typing import Dict, Any, Optional, List

logger = logging.getLogger("agrisensa.language_switch")

# ─────────────────────────────────────────────────────────────────────────────
# Agricultural Glossary ID ↔ JA
# ─────────────────────────────────────────────────────────────────────────────

GLOSSARY_ID_JA: Dict[str, str] = {
    # Komoditas
    "padi":              "水稲・コメ",
    "cabai":             "とうがらし",
    "jagung":            "とうもろこし",
    "kedelai":           "大豆",
    "wortel":            "にんじん",
    "bawang":            "たまねぎ",
    "tomat":             "トマト",
    "kentang":           "じゃがいも",
    "singkong":          "キャッサバ",
    "kubis":             "キャベツ",
    # Pertanian
    "lahan":             "農地・圃場",
    "pupuk":             "肥料",
    "nitrogen":          "窒素 (N)",
    "fosfor":            "リン (P)",
    "kalium":            "カリウム (K)",
    "pestisida":         "農薬",
    "irigasi":           "灌漑",
    "panen":             "収穫",
    "benih":             "種子",
    "musim tanam":       "作付け期間",
    "hasil panen":       "収量",
    "produktivitas":     "生産性",
    # Analisis keuangan
    "ROI":               "投資収益率 (ROI)",
    "BEP":               "損益分岐点 (BEP)",
    "MOS":               "安全余裕率 (MOS)",
    "TCR":               "費用収益比 (TCR)",
    "HPP":               "製造原価 (HPP)",
    "pendapatan":        "収入",
    "biaya":             "費用",
    "keuntungan":        "利益",
    "kerugian":          "損失",
    "modal":             "投資額",
    # Lingkungan
    "karbon":            "炭素",
    "CO2":               "二酸化炭素 (CO₂)",
    "emisi":             "排出量",
    "carbon offset":     "カーボンオフセット",
    # Pasar
    "harga":             "価格",
    "volatilitas":       "変動性",
    "tren":              "トレンド",
    "pasar":             "市場",
    "ekspor":            "輸出",
    # Risk
    "risiko":            "リスク",
    "rendah":            "低い",
    "sedang":            "中程度",
    "tinggi":            "高い",
    "pesimis":           "悲観的",
    "netral":            "中立",
    "optimis":           "楽観的",
}

GLOSSARY_JA_ID: Dict[str, str] = {v: k for k, v in GLOSSARY_ID_JA.items()}

# ─────────────────────────────────────────────────────────────────────────────
# Bilingual Report Templates
# ─────────────────────────────────────────────────────────────────────────────

RAB_TEMPLATE = {
    "id": {
        "title": "Laporan RAB Pertanian",
        "subtitle": "Rencana Anggaran Biaya",
        "komoditas_label": "Komoditas",
        "luas_label": "Luas Lahan",
        "total_biaya_label": "Total Biaya Produksi",
        "total_pendapatan_label": "Total Pendapatan",
        "keuntungan_label": "Keuntungan Bersih",
        "roi_label": "ROI (Return on Investment)",
        "bep_label": "Break-Even Point",
        "mos_label": "Margin of Safety",
        "tcr_label": "Total Cost Ratio",
        "scenario_label": "Analisis Skenario",
    },
    "ja": {
        "title": "農業予算計画書 (RAB)",
        "subtitle": "収支計算レポート",
        "komoditas_label": "作物",
        "luas_label": "栽培面積",
        "total_biaya_label": "総生産費用",
        "total_pendapatan_label": "総収入",
        "keuntungan_label": "純利益",
        "roi_label": "投資収益率 (ROI)",
        "bep_label": "損益分岐点 (BEP)",
        "mos_label": "安全余裕率 (MOS)",
        "tcr_label": "費用収益比 (TCR)",
        "scenario_label": "シナリオ分析",
    }
}

MARKET_TEMPLATE = {
    "id": {
        "title": "Laporan Intelijen Pasar JA",
        "harga_label": "Harga Pasar",
        "volume_label": "Volume Masuk (入荷量)",
        "trend_label": "Tren Harga",
        "volatilitas_label": "Volatilitas 30 Hari",
        "peluang_label": "Peluang Ekspor",
        "forecast_label": "Prediksi 7 Hari",
    },
    "ja": {
        "title": "JA市場インテリジェンスレポート",
        "harga_label": "市場価格",
        "volume_label": "入荷量",
        "trend_label": "価格トレンド",
        "volatilitas_label": "30日ボラティリティ",
        "peluang_label": "輸出機会",
        "forecast_label": "7日間予測",
    }
}

CARBON_TEMPLATE = {
    "id": {
        "title": "Laporan Jejak Karbon Pertanian",
        "emisi_label": "Total Emisi GHG",
        "per_ha_label": "Emisi per Hektar",
        "sink_label": "Penyerapan Karbon (Sink)",
        "net_label": "Emisi Bersih",
        "credit_label": "Potensi Carbon Credit",
        "rating_label": "Rating Emisi",
    },
    "ja": {
        "title": "農業炭素フットプリントレポート",
        "emisi_label": "総GHG排出量",
        "per_ha_label": "ヘクタールあたり排出量",
        "sink_label": "炭素吸収量（シンク）",
        "net_label": "正味排出量",
        "credit_label": "カーボンクレジット潜在量",
        "rating_label": "排出量評価",
    }
}

FORECAST_TEMPLATE = {
    "id": {
        "title": "Laporan Prediksi Hasil & Harga",
        "yield_label": "Prediksi Hasil Panen",
        "price_label": "Prediksi Harga",
        "risk_label": "Analisis Risiko",
        "confidence_label": "Tingkat Kepercayaan",
    },
    "ja": {
        "title": "収量・価格予測レポート",
        "yield_label": "収量予測",
        "price_label": "価格予測",
        "risk_label": "リスク分析",
        "confidence_label": "信頼水準",
    }
}


# ─────────────────────────────────────────────────────────────────────────────
# Language Switch Engine
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class LanguageSwitchResult:
    source_language: str       # "id" atau "ja"
    target_language: str
    original_text: str
    translated_text: str
    bilingual_report: Dict
    used_gemini: bool
    glossary_hits: List[str]   # Istilah pertanian yang dikenali


class LanguageSwitchEngine:
    """
    MCP (Multi-Context Protocol) Language Switch Engine.
    Mendukung terjemahan kontekstual ID ↔ JA untuk laporan pertanian.
    """

    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")
        self.has_gemini = bool(self.gemini_api_key)
        logger.info(f"LanguageSwitchEngine init, Gemini={'✓' if self.has_gemini else '✗'}")

    # ──────────────────────────────────────
    # Public API
    # ──────────────────────────────────────

    def switch(self, text: str, source_lang: str = "id",
               target_lang: str = "ja", context: str = "general") -> LanguageSwitchResult:
        """
        Terjemahkan text dari source_lang ke target_lang.
        context: "rab" | "market" | "carbon" | "forecast" | "general"
        """
        glossary_hits = self._find_glossary_hits(text, source_lang)

        if self.has_gemini:
            translated = self._translate_with_gemini(text, source_lang, target_lang, context)
            used_gemini = True
        else:
            translated = self._translate_with_template(text, source_lang, target_lang, glossary_hits)
            used_gemini = False

        # Build bilingual template
        template = self._get_template(context, source_lang, target_lang)

        return LanguageSwitchResult(
            source_language=source_lang,
            target_language=target_lang,
            original_text=text,
            translated_text=translated,
            bilingual_report=template,
            used_gemini=used_gemini,
            glossary_hits=glossary_hits,
        )

    def build_bilingual_report(self, modul: str, data: Dict, language: str = "id") -> Dict:
        """
        Build laporan bilingual untuk modul tertentu.
        modul: "rab" | "market" | "carbon" | "forecast"
        language: "id" | "ja" | "both"
        """
        templates = {
            "rab":      RAB_TEMPLATE,
            "market":   MARKET_TEMPLATE,
            "carbon":   CARBON_TEMPLATE,
            "forecast": FORECAST_TEMPLATE,
        }
        tmpl = templates.get(modul, {})

        if language == "both":
            return {
                "id": tmpl.get("id", {}),
                "ja": tmpl.get("ja", {}),
                "data": data,
                "glossary_excerpt": {k: v for k, v in list(GLOSSARY_ID_JA.items())[:10]},
            }
        return {
            "labels": tmpl.get(language, tmpl.get("id", {})),
            "data": data,
            "language": language,
        }

    def switch_from_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """API wrapper."""
        try:
            text        = data.get("text", "")
            source_lang = data.get("source_language", data.get("source_lang", "id"))
            target_lang = data.get("target_language", data.get("target_lang", "ja"))
            context     = data.get("context", "general")
            modul       = data.get("modul", None)
            modul_data  = data.get("data", {})
            language    = data.get("language", "both")

            if modul:
                report = self.build_bilingual_report(modul, modul_data, language)
                return {"success": True, "data": report}

            result = self.switch(text, source_lang, target_lang, context)
            return {"success": True, "data": asdict(result)}
        except Exception as e:
            logger.error(f"Language switch error: {e}")
            return {"success": False, "error": str(e)}

    def get_glossary(self, direction: str = "id_ja") -> Dict[str, Any]:
        """Kembalikan glossary pertanian."""
        if direction == "ja_id":
            return {"direction": "ja→id", "terms": GLOSSARY_JA_ID, "count": len(GLOSSARY_JA_ID)}
        return {"direction": "id→ja", "terms": GLOSSARY_ID_JA, "count": len(GLOSSARY_ID_JA)}

    # ──────────────────────────────────────
    # Private helpers
    # ──────────────────────────────────────

    def _translate_with_gemini(self, text: str, src: str, tgt: str, ctx: str) -> str:
        """Terjemahkan menggunakan Gemini AI API."""
        try:
            import urllib.request
            lang_name = {"id": "Bahasa Indonesia", "ja": "日本語 (Japanese)"}
            ctx_note  = {
                "rab":      "ini adalah laporan keuangan pertanian",
                "market":   "ini adalah laporan harga pasar pertanian Jepang",
                "carbon":   "ini adalah laporan jejak karbon pertanian",
                "forecast": "ini adalah laporan prediksi hasil dan harga pertanian",
                "general":  "ini adalah teks umum pertanian",
            }.get(ctx, "")

            prompt = (
                f"Terjemahkan teks berikut dari {lang_name.get(src, src)} ke {lang_name.get(tgt, tgt)}. "
                f"Konteks: {ctx_note}. Gunakan istilah teknis pertanian yang tepat. "
                f"Jangan tambahkan penjelasan, hanya terjemahan:\n\n{text}"
            )

            payload = json.dumps({
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.1, "maxOutputTokens": 2048}
            }).encode()

            req = urllib.request.Request(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.gemini_api_key}",
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=20) as resp:
                result = json.loads(resp.read())
                return result["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            logger.warning(f"Gemini translation failed: {e}, using template fallback")
            return self._translate_with_template(text, src, tgt, [])

    @staticmethod
    def _translate_with_template(text: str, src: str, tgt: str,
                                  glossary_hits: List[str]) -> str:
        """Template-based translation fallback menggunakan glossary."""
        result = text
        if src == "id" and tgt == "ja":
            for id_term, ja_term in GLOSSARY_ID_JA.items():
                result = result.replace(id_term, ja_term)
            return f"[自動翻訳] {result}"
        elif src == "ja" and tgt == "id":
            for ja_term, id_term in GLOSSARY_JA_ID.items():
                result = result.replace(ja_term, id_term)
            return f"[Auto-terjemah] {result}"
        return text

    @staticmethod
    def _find_glossary_hits(text: str, lang: str) -> List[str]:
        """Temukan istilah pertanian dalam text."""
        hits = []
        glossary = GLOSSARY_ID_JA if lang == "id" else GLOSSARY_JA_ID
        text_lower = text.lower()
        for term in glossary:
            if term.lower() in text_lower:
                hits.append(term)
        return hits

    @staticmethod
    def _get_template(context: str, src: str, tgt: str) -> Dict:
        templates = {"rab": RAB_TEMPLATE, "market": MARKET_TEMPLATE,
                     "carbon": CARBON_TEMPLATE, "forecast": FORECAST_TEMPLATE}
        tmpl = templates.get(context, {})
        return {
            "source": tmpl.get(src, {}),
            "target": tmpl.get(tgt, {}),
        }


# ─────────────────────────────────────────────────────────────────────────────
# Standalone
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    engine = LanguageSwitchEngine()

    # Test glossary
    result = engine.switch_from_dict({
        "text": "Petani membutuhkan pupuk nitrogen untuk meningkatkan hasil panen padi di lahan sawah.",
        "source_language": "id",
        "target_language": "ja",
        "context": "rab",
    })
    print(f"✅ Language Switch ID → JA")
    print(f"   Original: {result['data']['original_text'][:60]}...")
    print(f"   Translated: {result['data']['translated_text'][:80]}")
    print(f"   Glossary hits: {result['data']['glossary_hits']}")
    print(f"   Used Gemini: {result['data']['used_gemini']}")
