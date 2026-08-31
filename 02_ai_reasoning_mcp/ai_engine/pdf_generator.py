"""
AgriSensa PDF Generator
========================
Menghasilkan laporan PDF profesional untuk semua modul AgriSensa:
- RAB + Monte Carlo Report
- JA Market Intelligence Report
- Carbon Footprint Report
- Forecasting Report

Engine: ReportLab (primary) + Matplotlib untuk charts
Template: Header AgriSensa + Section + Tables + Charts + Footer

Output: PDF sebagai bytes (untuk API response) atau file (save to disk)
"""

import io
import os
import logging
import base64
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Any, Optional, List

logger = logging.getLogger("agrisensa.pdf_generator")

# ─────────────────────────────────────────────────────────────────────────────
# Check ReportLab availability
# ─────────────────────────────────────────────────────────────────────────────

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                     Table, TableStyle, Image, HRFlowable)
    from reportlab.platypus.flowables import KeepTogether
    from reportlab.pdfgen import canvas
    from reportlab.graphics.shapes import Drawing
    REPORTLAB_AVAILABLE = True
    logger.info("ReportLab available")
except ImportError:
    REPORTLAB_AVAILABLE = False
    logger.warning("ReportLab not available — PDF generation will use HTML fallback")

try:
    import matplotlib
    matplotlib.use("Agg")  # Non-interactive backend
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    import numpy as np
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False

# ─────────────────────────────────────────────────────────────────────────────
# Design constants
# ─────────────────────────────────────────────────────────────────────────────

COLOR_GREEN_DARK  = (22/255, 101/255, 52/255)   # #166534
COLOR_GREEN_LIGHT = (134/255, 239/255, 172/255) # #86efac
COLOR_AMBER       = (217/255, 119/255, 6/255)    # #d97706
COLOR_RED         = (220/255, 38/255, 38/255)    # #dc2626
COLOR_GRAY        = (75/255, 85/255, 99/255)     # #4b5563

AGRISENSA_LOGO_TEXT = "🌾 AgriSensa"


# ─────────────────────────────────────────────────────────────────────────────
# PDF Generator Engine
# ─────────────────────────────────────────────────────────────────────────────

class PDFGenerator:
    """
    PDF Report Generator untuk AgriSensa.
    Mendukung: RAB, Monte Carlo, JA Market, Carbon, Forecasting.
    """

    def __init__(self):
        logger.info(f"PDFGenerator init, ReportLab={REPORTLAB_AVAILABLE}, Matplotlib={MATPLOTLIB_AVAILABLE}")

    # ──────────────────────────────────────
    # Public API
    # ──────────────────────────────────────

    def generate(self, modul: str, data: Dict[str, Any],
                 language: str = "id", save_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate PDF report.
        modul: "rab" | "monte_carlo" | "market" | "carbon" | "forecast" | "full"
        Returns: {"success": True, "pdf_base64": "...", "filename": "...", "size_kb": ...}
        """
        try:
            if REPORTLAB_AVAILABLE:
                pdf_bytes = self._generate_reportlab(modul, data, language)
            else:
                pdf_bytes = self._generate_html_fallback(modul, data, language)

            if save_path:
                with open(save_path, "wb") as f:
                    f.write(pdf_bytes)

            pdf_b64  = base64.b64encode(pdf_bytes).decode("utf-8")
            filename = f"agrisensa_{modul}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"

            logger.info(f"PDF generated: {filename} ({len(pdf_bytes)//1024} KB)")
            return {
                "success": True,
                "pdf_base64": pdf_b64,
                "filename": filename,
                "size_kb": round(len(pdf_bytes) / 1024, 1),
                "modul": modul,
                "language": language,
                "engine": "reportlab" if REPORTLAB_AVAILABLE else "html-fallback",
                "generated_at": datetime.now().isoformat(),
            }
        except Exception as e:
            logger.error(f"PDF generation error: {e}")
            return {"success": False, "error": str(e)}

    def generate_from_dict(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """API wrapper."""
        modul    = request.get("modul", "rab")
        data     = request.get("data", {})
        language = request.get("language", "id")
        save     = request.get("save_path", None)
        return self.generate(modul, data, language, save)

    # ──────────────────────────────────────
    # ReportLab PDF Builder
    # ──────────────────────────────────────

    def _generate_reportlab(self, modul: str, data: Dict, language: str) -> bytes:
        """Build PDF menggunakan ReportLab."""
        buf = io.BytesIO()
        doc = SimpleDocTemplate(
            buf, pagesize=A4,
            leftMargin=2*cm, rightMargin=2*cm,
            topMargin=2.5*cm, bottomMargin=2.5*cm,
        )
        styles  = getSampleStyleSheet()
        story   = []

        # Styles
        title_style = ParagraphStyle("AgriTitle",
            parent=styles["Heading1"],
            fontSize=18, textColor=colors.HexColor("#166534"),
            spaceAfter=6, spaceBefore=4, leading=22)
        subtitle_style = ParagraphStyle("AgriSubtitle",
            parent=styles["Normal"],
            fontSize=11, textColor=colors.HexColor("#4b5563"),
            spaceAfter=12)
        section_style = ParagraphStyle("AgriSection",
            parent=styles["Heading2"],
            fontSize=13, textColor=colors.HexColor("#15803d"),
            spaceBefore=14, spaceAfter=6)
        body_style = ParagraphStyle("AgriBody",
            parent=styles["Normal"],
            fontSize=10, textColor=colors.HexColor("#1f2937"),
            leading=14, spaceAfter=4)

        # ── Header ────────────────────────────────────────────────────────
        story.append(Paragraph("🌾 AgriSensa AI Engine", title_style))
        story.append(HRFlowable(width="100%", thickness=2,
                                color=colors.HexColor("#16a34a"), spaceAfter=8))

        report_titles = {
            "rab":         ("Laporan RAB Pertanian", "農業予算計画書"),
            "monte_carlo": ("Analisis Monte Carlo",  "モンテカルロ分析"),
            "market":      ("JA Market Intelligence","JA市場インテリジェンス"),
            "carbon":      ("Laporan Jejak Karbon",  "炭素フットプリントレポート"),
            "forecast":    ("Prediksi Hasil & Harga","収量・価格予測レポート"),
            "full":        ("Laporan Lengkap AgriSensa", "AgriSensa総合レポート"),
        }
        title_id, title_ja = report_titles.get(modul, ("AgriSensa Report", "AgriSensaレポート"))

        if language == "both":
            story.append(Paragraph(f"{title_id} / {title_ja}", subtitle_style))
        elif language == "ja":
            story.append(Paragraph(title_ja, subtitle_style))
        else:
            story.append(Paragraph(title_id, subtitle_style))

        story.append(Paragraph(
            f"Dibuat: {datetime.now().strftime('%d %B %Y, %H:%M')} WIB | "
            f"作成日時: {datetime.now().strftime('%Y年%m月%d日 %H:%M')}",
            body_style))
        story.append(Spacer(1, 0.4*cm))

        # ── Content per modul ─────────────────────────────────────────────
        if modul in ("rab", "full") and data:
            story.extend(self._build_rab_section(data, styles, section_style, body_style, language))

        if modul in ("monte_carlo", "full") and data:
            story.extend(self._build_mc_section(data, styles, section_style, body_style))

        if modul in ("market", "full") and data:
            story.extend(self._build_market_section(data, styles, section_style, body_style, language))

        if modul in ("carbon", "full") and data:
            story.extend(self._build_carbon_section(data, styles, section_style, body_style, language))

        if modul in ("forecast", "full") and data:
            story.extend(self._build_forecast_section(data, styles, section_style, body_style, language))

        # ── Chart (jika Matplotlib tersedia) ─────────────────────────────
        if MATPLOTLIB_AVAILABLE and modul in ("monte_carlo", "forecast"):
            chart_img = self._build_chart_image(modul, data)
            if chart_img:
                story.append(Spacer(1, 0.3*cm))
                story.append(chart_img)

        # ── Footer ───────────────────────────────────────────────────────
        story.append(Spacer(1, 1*cm))
        story.append(HRFlowable(width="100%", thickness=1,
                                color=colors.HexColor("#d1fae5"), spaceAfter=6))
        story.append(Paragraph(
            "🌾 AgriSensa AI Engine | Platform AI Pertanian Indonesia | "
            "Powered by Google Gemini + n8n Orchestrator",
            ParagraphStyle("Footer", parent=styles["Normal"],
                           fontSize=8, textColor=colors.HexColor("#6b7280"),
                           alignment=1)  # center
        ))

        doc.build(story)
        return buf.getvalue()

    def _build_rab_section(self, data: Dict, styles, ss, bs, lang: str) -> list:
        items = []
        label_set = {
            "id": ("Rincian RAB", "Komoditas", "Luas Lahan", "Total Biaya",
                   "Total Pendapatan", "Keuntungan Bersih", "ROI", "BEP", "MOS", "TCR"),
            "ja": ("RAB詳細", "作物", "栽培面積", "総費用", "総収入",
                   "純利益", "投資収益率", "損益分岐点", "安全余裕率", "費用収益比"),
        }
        l = label_set.get(lang, label_set["id"])

        items.append(Paragraph(l[0], ss))
        table_data = [
            [l[1], data.get("komoditas", "-")],
            [l[2], f"{data.get('luas_ha', '-')} ha"],
            [l[3], f"Rp {data.get('total_biaya_rp', 0):,.0f}"],
            [l[4], f"Rp {data.get('total_pendapatan_rp', 0):,.0f}"],
            [l[5], f"Rp {data.get('keuntungan_bersih_rp', 0):,.0f}"],
            [l[6], f"{data.get('roi_persen', 0):.2f}%"],
            [l[7], f"{data.get('bep_ton', 0):.2f} ton / Rp {data.get('bep_rp', 0):,.0f}/kg"],
            [l[8], f"{data.get('mos_persen', 0):.2f}%"],
            [l[9], f"{data.get('tcr', 0):.4f}"],
        ]
        t = Table(table_data, colWidths=[7*cm, 10*cm])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f0fdf4")),
            ("TEXTCOLOR",  (0, 0), (0, -1), colors.HexColor("#15803d")),
            ("FONTNAME",   (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTSIZE",   (0, 0), (-1, -1), 10),
            ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#f9fafb")]),
            ("GRID",       (0, 0), (-1, -1), 0.5, colors.HexColor("#d1fae5")),
            ("PADDING",    (0, 0), (-1, -1), 6),
        ]))
        items.append(t)
        items.append(Spacer(1, 0.4*cm))
        return items

    def _build_mc_section(self, data: Dict, styles, ss, bs) -> list:
        items = [Paragraph("Analisis Monte Carlo / モンテカルロ分析", ss)]
        roi_dist = data.get("roi_distribution", {})
        mc_data = [
            ["Metrik / 指標", "P10 (Pesimis)", "P50 (Netral)", "P90 (Optimis)", "Rata-rata"],
            ["ROI (%)", f"{roi_dist.get('p10',0):.1f}%", f"{roi_dist.get('p50',0):.1f}%",
             f"{roi_dist.get('p90',0):.1f}%", f"{roi_dist.get('mean',0):.1f}%"],
        ]
        profit_dist = data.get("profit_distribution", {})
        mc_data.append([
            "Keuntungan (Jt Rp)",
            f"{profit_dist.get('p10',0)/1e6:.1f}",
            f"{profit_dist.get('p50',0)/1e6:.1f}",
            f"{profit_dist.get('p90',0)/1e6:.1f}",
            f"{profit_dist.get('mean',0)/1e6:.1f}",
        ])
        t = Table(mc_data, colWidths=[5.5*cm, 3.5*cm, 3.5*cm, 3.5*cm, 3.5*cm])
        t.setStyle(TableStyle([
            ("BACKGROUND",  (0, 0), (-1, 0), colors.HexColor("#166534")),
            ("TEXTCOLOR",   (0, 0), (-1, 0), colors.white),
            ("FONTNAME",    (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE",    (0, 0), (-1, -1), 9),
            ("GRID",        (0, 0), (-1, -1), 0.5, colors.HexColor("#d1fae5")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f0fdf4")]),
            ("PADDING",     (0, 0), (-1, -1), 5),
            ("ALIGN",       (1, 0), (-1, -1), "CENTER"),
        ]))
        items.append(t)

        prob_text = (f"P(Untung): {data.get('prob_untung_persen',0):.1f}% | "
                     f"P(ROI>20%): {data.get('prob_roi_gt_20_persen',0):.1f}% | "
                     f"VaR 95%: Rp {data.get('var_95_rp',0):,.0f} | "
                     f"Iterasi: {data.get('n_iterations', 10000):,}")
        items.append(Spacer(1, 0.2*cm))
        items.append(Paragraph(prob_text, bs))
        return items

    def _build_market_section(self, data: Dict, styles, ss, bs, lang: str) -> list:
        items = []
        title = "JA Market Intelligence" if lang != "ja" else "JA市場インテリジェンス"
        items.append(Paragraph(title, ss))

        mkt_data = [
            ["Komoditas / 作物", f"{data.get('commodity_id_name','-')} ({data.get('commodity_ja','-')})"],
            ["Harga / 価格", f"¥{data.get('current_price_jpy',0)}/kg ≈ Rp{data.get('price_idr_estimate',0):,.0f}/kg"],
            ["入荷量 (Volume)", f"{data.get('current_arrival_ton',0):.1f} ton/hari"],
            ["Volatilitas 30d", f"{data.get('volatility_30d_pct',0):.1f}%"],
            ["Tren / トレンド", f"{data.get('trend_direction','-')} ({data.get('trend_strength','-')})"],
            ["Peluang Ekspor", data.get("export_opportunity", "-")],
        ]
        t = Table(mkt_data, colWidths=[5.5*cm, 12*cm])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#fefce8")),
            ("TEXTCOLOR",  (0, 0), (0, -1), colors.HexColor("#92400e")),
            ("FONTNAME",   (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTSIZE",   (0, 0), (-1, -1), 9),
            ("GRID",       (0, 0), (-1, -1), 0.5, colors.HexColor("#fde68a")),
            ("PADDING",    (0, 0), (-1, -1), 5),
        ]))
        items.append(t)
        return items

    def _build_carbon_section(self, data: Dict, styles, ss, bs, lang: str) -> list:
        items = []
        title = "Jejak Karbon / 炭素フットプリント"
        items.append(Paragraph(title, ss))
        cb_data = [
            ["Total Emisi / 総排出量", f"{data.get('total_co2e_ton',0):.4f} ton CO₂e"],
            ["Per Hektar / ha当たり", f"{data.get('co2e_per_ha',0):.4f} ton CO₂e/ha"],
            ["Carbon Sink", f"{data.get('carbon_sink_pohon_ton',0):.4f} ton CO₂e"],
            ["Emisi Bersih / 正味排出量", f"{data.get('net_co2e_ton',0):.4f} ton CO₂e"],
            ["Carbon Credit", f"${data.get('carbon_credit_usd',0):.2f} USD"],
            ["Setara Pohon / 相当木数", f"{data.get('equivalent_trees',0):,} pohon/tahun"],
            ["Rating", data.get("rating", "-")],
        ]
        t = Table(cb_data, colWidths=[5.5*cm, 12*cm])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#ecfdf5")),
            ("FONTNAME",   (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTSIZE",   (0, 0), (-1, -1), 9),
            ("GRID",       (0, 0), (-1, -1), 0.5, colors.HexColor("#a7f3d0")),
            ("PADDING",    (0, 0), (-1, -1), 5),
        ]))
        items.append(t)
        return items

    def _build_forecast_section(self, data: Dict, styles, ss, bs, lang: str) -> list:
        items = [Paragraph("Prediksi Hasil & Harga / 収量・価格予測", ss)]
        fc_data = [
            ["Komoditas / 作物", data.get("komoditas", "-")],
            ["Prediksi Yield", f"{data.get('yield_forecast_ton_ha',0):.3f} ton/ha "
                              f"[{data.get('yield_ci_lower',0):.2f} - {data.get('yield_ci_upper',0):.2f}]"],
            ["Potensi Maksimum", f"{data.get('yield_potential_ton_ha',0)} ton/ha"],
            ["Yield Gap",  f"{data.get('yield_gap_pct',0):.1f}%"],
            ["Harga Saat Ini", f"Rp {data.get('price_current_rp_kg',0):,.0f}/kg"],
            ["Prediksi 30 hari", f"Rp {data.get('price_forecast_30d',{}).get('value',0):,.0f}/kg"],
            ["Prediksi 90 hari", f"Rp {data.get('price_forecast_90d',{}).get('value',0):,.0f}/kg"],
            ["Prediksi 180 hari", f"Rp {data.get('price_forecast_180d',{}).get('value',0):,.0f}/kg"],
            ["Risiko", f"{data.get('risk',{}).get('level','-')} ({data.get('risk',{}).get('score',0)}/100)"],
        ]
        t = Table(fc_data, colWidths=[5.5*cm, 12*cm])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#eff6ff")),
            ("FONTNAME",   (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTSIZE",   (0, 0), (-1, -1), 9),
            ("GRID",       (0, 0), (-1, -1), 0.5, colors.HexColor("#bfdbfe")),
            ("PADDING",    (0, 0), (-1, -1), 5),
        ]))
        items.append(t)
        return items

    def _build_chart_image(self, modul: str, data: Dict) -> Optional[object]:
        """Build chart image menggunakan Matplotlib."""
        if not MATPLOTLIB_AVAILABLE:
            return None
        try:
            buf = io.BytesIO()
            fig, axes = plt.subplots(1, 2, figsize=(12, 4))
            fig.patch.set_facecolor("#f0fdf4")

            if modul == "monte_carlo":
                # ROI histogram
                hist = data.get("histogram_roi", {})
                if hist:
                    centers = hist.get("bin_centers", [])
                    counts  = hist.get("counts", [])
                    axes[0].bar(centers, counts, color="#16a34a", alpha=0.8,
                                edgecolor="#166534", linewidth=0.5)
                    axes[0].set_title("Distribusi ROI — Monte Carlo (10,000 iterasi)",
                                      fontsize=10, color="#166534")
                    axes[0].set_xlabel("ROI (%)")
                    axes[0].set_ylabel("Frekuensi")
                    axes[0].axvline(x=0, color="red", linestyle="--", alpha=0.7)

                # Profit histogram
                hist2 = data.get("histogram_profit", {})
                if hist2:
                    centers2 = hist2.get("bin_centers", [])
                    counts2  = hist2.get("counts", [])
                    axes[1].bar(centers2, counts2, color="#2563eb", alpha=0.8,
                                edgecolor="#1d4ed8", linewidth=0.5)
                    axes[1].set_title("Distribusi Keuntungan (Juta Rp)",
                                      fontsize=10, color="#1d4ed8")
                    axes[1].set_xlabel("Keuntungan (Juta Rp)")
                    axes[1].set_ylabel("Frekuensi")
                    axes[1].axvline(x=0, color="red", linestyle="--", alpha=0.7)

            elif modul == "forecast":
                series = data.get("price_series", [])
                if series:
                    hist_d = [s["date"]  for s in series if s.get("type") == "historical"]
                    hist_p = [s["price"] for s in series if s.get("type") == "historical"]
                    fcast_d = [s["date"]  for s in series if s.get("type") == "forecast"]
                    fcast_p = [s["price"] for s in series if s.get("type") == "forecast"]
                    axes[0].plot(range(len(hist_p)), hist_p, color="#166534", linewidth=1.5, label="Historis")
                    axes[0].plot(range(len(hist_p), len(hist_p)+len(fcast_p)),
                                 fcast_p, color="#d97706", linewidth=1.5, linestyle="--", label="Forecast")
                    axes[0].set_title("Prediksi Harga", fontsize=10)
                    axes[0].legend()
                    axes[0].set_xlabel("Hari")
                    axes[0].set_ylabel("Harga (Rp/kg)")

                # Feature importance
                fi = data.get("feature_importance", [])
                if fi:
                    labels = [f["faktor"] for f in fi]
                    values = [f["kontribusi_pct"] for f in fi]
                    axes[1].barh(labels, values, color="#16a34a", alpha=0.8)
                    axes[1].set_title("Feature Importance (Kontribusi Faktor)", fontsize=10)
                    axes[1].set_xlabel("%")

            plt.tight_layout()
            plt.savefig(buf, format="png", dpi=150, bbox_inches="tight")
            plt.close(fig)
            buf.seek(0)
            return Image(buf, width=16*cm, height=6*cm)
        except Exception as e:
            logger.warning(f"Chart generation failed: {e}")
            return None

    # ──────────────────────────────────────
    # HTML Fallback (jika ReportLab tidak ada)
    # ──────────────────────────────────────

    def _generate_html_fallback(self, modul: str, data: Dict, language: str) -> bytes:
        """Generate simple HTML report sebagai fallback."""
        now = datetime.now().strftime("%d %B %Y, %H:%M")
        html = f"""<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>AgriSensa {modul.upper()} Report</title>
<style>
  body {{ font-family: Arial, sans-serif; max-width: 900px; margin: auto; padding: 20px; }}
  h1 {{ color: #166534; border-bottom: 3px solid #16a34a; padding-bottom: 8px; }}
  h2 {{ color: #15803d; }}
  table {{ width: 100%; border-collapse: collapse; margin: 16px 0; }}
  th {{ background: #166534; color: white; padding: 8px 12px; text-align: left; }}
  td {{ padding: 7px 12px; border-bottom: 1px solid #d1fae5; }}
  tr:nth-child(even) {{ background: #f0fdf4; }}
  .footer {{ color: #6b7280; font-size: 12px; text-align: center; margin-top: 40px; }}
</style>
</head>
<body>
<h1>🌾 AgriSensa AI Engine — {modul.upper()} Report</h1>
<p>Dibuat: {now} | Modul: {modul} | Bahasa: {language}</p>
<h2>Data</h2>
<table><tr><th>Field</th><th>Value</th></tr>
{"".join(f"<tr><td>{k}</td><td>{v}</td></tr>" for k, v in data.items() if not isinstance(v, (list, dict)))}
</table>
<div class="footer">AgriSensa AI Engine | Platform AI Pertanian Indonesia 🇮🇩<br>
Note: Install 'reportlab' untuk PDF berkualitas tinggi: pip install reportlab</div>
</body></html>"""
        return html.encode("utf-8")


# ─────────────────────────────────────────────────────────────────────────────
# Standalone
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    gen = PDFGenerator()
    result = gen.generate_from_dict({
        "modul": "rab",
        "language": "id",
        "data": {
            "komoditas": "Padi",
            "luas_ha": 1.0,
            "total_biaya_rp": 12_500_000,
            "total_pendapatan_rp": 18_000_000,
            "keuntungan_bersih_rp": 5_500_000,
            "roi_persen": 44.0,
            "bep_ton": 2.78,
            "bep_rp": 2083,
            "mos_persen": 53.7,
            "tcr": 0.694,
        }
    })
    print(f"✅ PDF Generated: {result.get('filename')}, {result.get('size_kb')} KB")
    print(f"   Engine: {result.get('engine')}")
