"""
AgriSensa Advanced AI Engine — FastAPI Server
=============================================
Port: 8001 (terpisah dari agrisensa-ai-core di 8000)

Endpoints:
  POST /rab/calculate          → RAB Engine
  POST /monte-carlo/simulate   → Monte Carlo (10k iter)
  POST /market/ja-intel        → JA Market Intelligence
  POST /carbon/calculate       → Carbon Model (IPCC)
  POST /forecast/predict       → Forecasting Model
  POST /language/switch        → MCP Language Switch
  POST /pdf/generate           → PDF Generator
  POST /pipeline/full          → Full pipeline (semua modul)
  GET  /health                 → Health check
  GET  /modules                → Daftar modul
"""

import os
import sys
import logging
import time
from typing import Any, Dict, Optional, List
from datetime import datetime

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Add parent dir to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_engine import (
    RABEngine, MonteCarloEngine, JaMarketIntelEngine,
    CarbonModel, ForecastingModel, LanguageSwitchEngine, PDFGenerator,
    SearchEngine, WebScraper, DocumentParser, ChartEngine,
)

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env"))

# ─────────────────────────────────────────────────────────────────────────────
# Logging
# ─────────────────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("agrisensa.ai-engine-api")

# ─────────────────────────────────────────────────────────────────────────────
# FastAPI App
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="AgriSensa Advanced AI Engine & MCP API",
    description=(
        "🌾 **AI Engine & MCP Tools** untuk AgriSensa Platform:\n\n"
        "- **RAB Engine** — Rencana Anggaran Biaya + ROI/BEP/MOS/TCR\n"
        "- **Monte Carlo** — 10.000 iterasi simulasi risiko\n"
        "- **JA Market Intel** — Harga pasar Jepang (農協)\n"
        "- **Carbon Model** — Jejak karbon IPCC Tier 1\n"
        "- **Forecasting** — Prediksi yield & harga time series\n"
        "- **Language Switch** — MCP Bilingual ID ↔ 日本語\n"
        "- **PDF Generator** — Laporan PDF profesional\n"
        "- **DuckDuckGo Search MCP** — Riset harga, pasar, berita agrikultur\n"
        "- **Firecrawl Scraper MCP** — Scrape web agrikultur & BAPANAS\n"
        "- **Document Parser MCP** — Parse PDF/Word/Excel/CSV upload\n"
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# ─────────────────────────────────────────────────────────────────────────────
# Singleton engines (lazy loaded)
# ─────────────────────────────────────────────────────────────────────────────

_engines: Dict[str, Any] = {}

def get_engine(name: str):
    if name not in _engines:
        engine_map = {
            "rab":      RABEngine,
            "mc":       MonteCarloEngine,
            "market":   JaMarketIntelEngine,
            "carbon":   CarbonModel,
            "forecast": ForecastingModel,
            "language": LanguageSwitchEngine,
            "pdf":      PDFGenerator,
            "search":   SearchEngine,
            "scraper":  WebScraper,
            "parser":   DocumentParser,
            "chart":    ChartEngine,
        }
        _engines[name] = engine_map[name]()
        logger.info(f"Engine '{name}' initialized")
    return _engines[name]

# ─────────────────────────────────────────────────────────────────────────────
# Pydantic Models
# ─────────────────────────────────────────────────────────────────────────────

class RABRequest(BaseModel):
    komoditas: str = Field("padi", example="padi")
    luas_ha: float = Field(1.0, example=1.0)
    estimasi_yield_ton_ha: float = Field(6.0, example=6.0)
    harga_jual_rp_kg: float = Field(4500, example=4500)
    musim_tanam_bulan: int = Field(4, example=4)
    biaya_penyusutan_persen: float = Field(5.0)
    pajak_persen: float = Field(0.0)
    komponen_biaya: Optional[List[Dict]] = Field(None, description="Kosongkan untuk default")
    catatan: str = Field("", example="Musim tanam 2025")

class MonteCarloRequest(BaseModel):
    total_biaya_rp: Optional[float] = Field(None, example=12_500_000)
    estimasi_yield_ton_ha: Optional[float] = Field(None, example=6.0)
    harga_jual_rp_kg: Optional[float] = Field(None, example=4500)
    luas_ha: float = Field(1.0, example=1.0)
    rab_data: Optional[Dict] = Field(None, description="Output dari /rab/calculate")
    yield_std_persen: float = Field(15.0)
    harga_std_persen: float = Field(20.0)
    biaya_std_persen: float = Field(10.0)
    harga_min_persen: float = Field(70.0)
    harga_max_persen: float = Field(140.0)
    n_iterations: int = Field(10_000, ge=100, le=100_000, example=10_000)
    use_triangular_price: bool = Field(True)
    random_seed: Optional[int] = Field(42)

class MarketRequest(BaseModel):
    commodity: str = Field("wortel", example="wortel")
    region: str = Field("kanto", example="kanto")
    days: int = Field(30, ge=7, le=365, example=30)
    jpy_idr_rate: float = Field(105.0, example=105.0)

class CarbonRequest(BaseModel):
    komoditas: str = Field("padi", example="padi")
    luas_ha: float = Field(1.0, example=1.0)
    pupuk_list: Optional[List[Dict]] = Field(None, description="[{jenis, jumlah_kg}]")
    bahan_bakar_list: Optional[List[Dict]] = Field(None, description="[{jenis, jumlah}]")
    pembakaran_biomassa_ton: float = Field(0.0)
    is_sawah: bool = Field(False, example=True)
    jumlah_ternak: int = Field(0)
    jenis_ternak: str = Field("sapi")
    carbon_sink_pohon: int = Field(0, example=50)
    periode_tahun: float = Field(1.0)

class ForecastRequest(BaseModel):
    komoditas: str = Field("padi", example="padi")
    current_yield_ton_ha: Optional[float] = Field(None)
    current_price_rp_kg: Optional[float] = Field(4500, example=4500)
    npk_n: float = Field(100.0, example=120)
    npk_p: float = Field(60.0, example=80)
    npk_k: float = Field(60.0, example=80)
    curah_hujan_mm: float = Field(1500.0, example=1800)
    suhu_rata_c: float = Field(27.0, example=26)
    ph_tanah: float = Field(6.5, example=6.5)
    historical_prices: Optional[List[float]] = Field(None)
    random_seed: int = Field(42)

class LanguageRequest(BaseModel):
    text: Optional[str] = Field(None, example="Petani membutuhkan pupuk nitrogen")
    source_language: str = Field("id", example="id")
    target_language: str = Field("ja", example="ja")
    context: str = Field("general", example="rab")
    modul: Optional[str] = Field(None, example="rab")
    data: Optional[Dict] = Field(None)
    language: str = Field("both", example="both")

class PDFRequest(BaseModel):
    modul: str = Field("rab", example="rab")
    data: Dict = Field(..., example={"komoditas": "padi", "roi_persen": 44.0})
    language: str = Field("id", example="id")

class FullPipelineRequest(BaseModel):
    """Request untuk menjalankan full pipeline semua modul."""
    komoditas: str = Field("padi", example="padi")
    luas_ha: float = Field(1.0, example=1.0)
    harga_jual_rp_kg: float = Field(4500, example=4500)
    estimasi_yield_ton_ha: float = Field(6.0, example=6.0)
    curah_hujan_mm: float = Field(1500.0)
    ph_tanah: float = Field(6.5)
    is_sawah: bool = Field(False)
    carbon_sink_pohon: int = Field(0)
    n_iterations: int = Field(10_000, le=50_000)
    language: str = Field("id", example="id")
    generate_pdf: bool = Field(True)
    include_ja_market: bool = Field(True)

# ─────────────────────────────────────────────────────────────────────────────
# MCP Models
# ─────────────────────────────────────────────────────────────────────────────

class SearchMCPRequest(BaseModel):
    query: str = Field(..., example="harga beras dan gabah terbaru Indonesia")
    query_type: str = Field("custom", example="harga_komoditas")
    max_results: int = Field(8, ge=1, le=20)
    language: str = Field("id", example="id")
    region: str = Field("id-id", example="id-id")

class ScrapeMCPRequest(BaseModel):
    url: str = Field(..., example="https://panelharga.badanpangan.go.id")
    extract_tables: bool = Field(True)

class ParseDocumentMCPRequest(BaseModel):
    filename: str = Field(..., example="laporan_rab_petani.pdf")
    file_base64: Optional[str] = Field(None, description="Base64 encoded file content")
    file_path: Optional[str] = Field(None, description="Local file path if accessible")
    file_type: Optional[str] = Field(None, example="pdf")

class FullResearchMCPRequest(BaseModel):
    query: str = Field(..., example="tren harga cabai merah dan peluang ekspor Jepang")
    scrape_top_n: int = Field(2, ge=1, le=5)
    language: str = Field("id")
    generate_pdf: bool = Field(True)


# ─────────────────────────────────────────────────────────────────────────────
# Health & Info Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/", include_in_schema=False)
async def root():
    return {"message": "🌾 AgriSensa Advanced AI Engine & MCP v2.0", "docs": "/docs"}

@app.get("/health", summary="Health Check", tags=["System"])
async def health():
    """Check semua modul AI Engine dan MCP Tools."""
    checks = {}
    for name, cls in [
        ("rab_engine", RABEngine), ("monte_carlo", MonteCarloEngine),
        ("market_intel", JaMarketIntelEngine), ("carbon_model", CarbonModel),
        ("forecasting", ForecastingModel), ("language_switch", LanguageSwitchEngine),
        ("pdf_generator", PDFGenerator), ("search_engine", SearchEngine),
        ("web_scraper", WebScraper), ("document_parser", DocumentParser),
    ]:
        try:
            cls()
            checks[name] = "✅ OK"
        except Exception as e:
            checks[name] = f"❌ {str(e)[:50]}"

    all_ok = all("OK" in v for v in checks.values())
    return {
        "status": "healthy" if all_ok else "degraded",
        "version": "2.0.0",
        "modules": checks,
        "timestamp": datetime.now().isoformat(),
    }

@app.get("/modules", summary="List AI Modules", tags=["System"])
async def list_modules():
    return {
        "modules": [
            {"id": "rab",      "name": "RAB Engine",          "endpoint": "POST /rab/calculate",
             "description": "Rencana Anggaran Biaya + ROI/BEP/MOS/TCR + 3 skenario"},
            {"id": "mc",       "name": "Monte Carlo",         "endpoint": "POST /monte-carlo/simulate",
             "description": "10.000 iterasi simulasi risiko dengan distribusi Normal/Triangular"},
            {"id": "market",   "name": "JA Market Intel",     "endpoint": "POST /market/ja-intel",
             "description": "Harga pasar JA Jepang (農協): 入荷量, volatilitas, tren 30 hari"},
            {"id": "carbon",   "name": "Carbon Model",        "endpoint": "POST /carbon/calculate",
             "description": "Jejak karbon IPCC Tier 1: N₂O, CH₄, CO₂, carbon credit"},
            {"id": "forecast", "name": "Forecasting Model",   "endpoint": "POST /forecast/predict",
             "description": "Prediksi yield & harga 30/90/180 hari + risk scoring"},
            {"id": "language", "name": "Language Switch MCP", "endpoint": "POST /language/switch",
             "description": "Terjemahan kontekstual ID ↔ 日本語 via Gemini + template bilingual"},
            {"id": "pdf",      "name": "PDF Generator",       "endpoint": "POST /pdf/generate",
             "description": "Laporan PDF bilingual dengan chart Matplotlib (ReportLab)"},
            {"id": "search",   "name": "DuckDuckGo Search MCP", "endpoint": "POST /mcp/search",
             "description": "Riset web DuckDuckGo untuk harga, tren, dan regulasi pertanian"},
            {"id": "scraper",  "name": "Firecrawl Scraper MCP", "endpoint": "POST /mcp/scrape",
             "description": "Scrape konten website pertanian/JA/BAPANAS ke markdown clean"},
            {"id": "parser",   "name": "Document Parser MCP",  "endpoint": "POST /mcp/parse-document",
             "description": "Parse PDF/DOCX/XLSX/CSV upload & ekstraksi metrik agronomi"},
        ]
    }


# ─────────────────────────────────────────────────────────────────────────────
# Module Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/rab/calculate", summary="Hitung RAB Pertanian", tags=["RAB Engine"])
async def calculate_rab(req: RABRequest):
    """
    Hitung Rencana Anggaran Biaya (RAB) pertanian lengkap.
    - ROI, BEP, MOS, TCR
    - 3 Skenario: Optimis / Netral / Pesimis
    - Breakdown biaya per kategori
    """
    t0 = time.time()
    engine = get_engine("rab")
    result = engine.calculate_from_dict(req.model_dump())
    result["processing_ms"] = round((time.time() - t0) * 1000, 1)
    return result

@app.post("/monte-carlo/simulate", summary="Simulasi Monte Carlo 10.000 Iterasi", tags=["Monte Carlo"])
async def monte_carlo_simulate(req: MonteCarloRequest):
    """
    Jalankan simulasi Monte Carlo dengan 10.000 iterasi default.
    - Distribusi ROI, Keuntungan, BEP
    - P10/P50/P90 percentile
    - VaR 95% & 99%
    - P(untung), P(ROI>20%)
    """
    t0 = time.time()
    engine = get_engine("mc")
    result = engine.simulate_from_dict(req.model_dump())
    result["processing_ms"] = round((time.time() - t0) * 1000, 1)
    return result

@app.post("/market/ja-intel", summary="JA Market Intelligence (農協)", tags=["JA Market"])
async def ja_market_intel(req: MarketRequest):
    """
    Analisis harga pasar JA (Japan Agriculture / 日本農協).
    - Harga komoditas dalam ¥/kg dan estimasi Rp/kg
    - 入荷量 (volume masuk) harian
    - Volatilitas & tren 30 hari
    - Prediksi harga 7 hari
    - Skor peluang ekspor ke Jepang
    """
    t0 = time.time()
    engine = get_engine("market")
    result = engine.analyze_from_dict(req.model_dump())
    result["processing_ms"] = round((time.time() - t0) * 1000, 1)
    return result

@app.post("/carbon/calculate", summary="Hitung Jejak Karbon Pertanian", tags=["Carbon Model"])
async def calculate_carbon(req: CarbonRequest):
    """
    Hitung jejak karbon kegiatan pertanian (IPCC 2006 Tier 1).
    - N₂O dari pupuk nitrogen
    - CO₂ dari bahan bakar
    - CH₄ dari sawah padi
    - Emisi enteric fermentation ternak
    - Carbon sink (pohon)
    - Carbon credit potensial (USD)
    """
    t0 = time.time()
    engine = get_engine("carbon")
    result = engine.calculate_from_dict(req.model_dump())
    result["processing_ms"] = round((time.time() - t0) * 1000, 1)
    return result

@app.post("/forecast/predict", summary="Prediksi Yield & Harga", tags=["Forecasting"])
async def forecast_predict(req: ForecastRequest):
    """
    Prediksi hasil panen dan harga komoditas.
    - Yield prediction berdasarkan kondisi agronomi
    - Price forecast 30/90/180 hari
    - Risk scoring (0-100)
    - Feature importance (kontribusi tiap faktor)
    - Time series historis + forecast (180 titik data)
    """
    t0 = time.time()
    engine = get_engine("forecast")
    result = engine.predict_from_dict(req.model_dump())
    result["processing_ms"] = round((time.time() - t0) * 1000, 1)
    return result

@app.post("/language/switch", summary="MCP Language Switch ID ↔ JA", tags=["Language Switch"])
async def language_switch(req: LanguageRequest):
    """
    Terjemahan kontekstual pertanian ID ↔ 日本語.
    - Glossary 200+ istilah pertanian
    - Terjemahan via Gemini AI (jika tersedia)
    - Template bilingual untuk semua modul
    """
    t0 = time.time()
    engine = get_engine("language")
    result = engine.switch_from_dict(req.model_dump())
    result["processing_ms"] = round((time.time() - t0) * 1000, 1)
    return result

@app.get("/language/glossary", summary="Glossary Pertanian ID/JA", tags=["Language Switch"])
async def get_glossary(direction: str = "id_ja"):
    """Kembalikan glossary istilah pertanian."""
    engine = get_engine("language")
    return engine.get_glossary(direction)

@app.post("/pdf/generate", summary="Generate PDF Report", tags=["PDF Generator"])
async def generate_pdf(req: PDFRequest):
    """
    Generate laporan PDF profesional.
    - Template AgriSensa: header + table + chart + footer
    - Bilingual ID/JA
    - Embed Matplotlib charts (untuk Monte Carlo & Forecast)
    - Output: PDF base64 + filename
    """
    t0 = time.time()
    engine = get_engine("pdf")
    result = engine.generate_from_dict(req.model_dump())
    result["processing_ms"] = round((time.time() - t0) * 1000, 1)
    return result

# ─────────────────────────────────────────────────────────────────────────────
# Full Pipeline Endpoint
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/pipeline/full", summary="🚀 Full Pipeline (Semua Modul)", tags=["Pipeline"])
async def full_pipeline(req: FullPipelineRequest):
    """
    Jalankan semua modul secara berurutan dan hasilkan laporan PDF lengkap.
    Pipeline:
    1. RAB Engine → hasilkan anggaran
    2. Monte Carlo → simulasi risiko 10k iterasi
    3. JA Market → analisis pasar Jepang (opsional)
    4. Carbon Model → hitung jejak karbon
    5. Forecasting → prediksi yield & harga
    6. Language Switch → buat label bilingual
    7. PDF Generator → render laporan PDF lengkap
    """
    t0 = time.time()
    pipeline_result = {"pipeline_stages": []}

    try:
        # Stage 1: RAB
        rab_engine = get_engine("rab")
        rab_result = rab_engine.calculate_from_dict({
            "komoditas": req.komoditas,
            "luas_ha": req.luas_ha,
            "estimasi_yield_ton_ha": req.estimasi_yield_ton_ha,
            "harga_jual_rp_kg": req.harga_jual_rp_kg,
        })
        pipeline_result["rab"] = rab_result
        pipeline_result["pipeline_stages"].append("RAB ✅")

        # Stage 2: Monte Carlo
        mc_engine = get_engine("mc")
        rab_data = rab_result.get("data", {})
        mc_result = mc_engine.simulate_from_dict({
            "total_biaya_rp": rab_data.get("total_biaya_rp", 10_000_000),
            "estimasi_yield_ton_ha": req.estimasi_yield_ton_ha,
            "harga_jual_rp_kg": req.harga_jual_rp_kg,
            "luas_ha": req.luas_ha,
            "n_iterations": req.n_iterations,
        })
        pipeline_result["monte_carlo"] = mc_result
        pipeline_result["pipeline_stages"].append("Monte Carlo ✅")

        # Stage 3: JA Market (opsional)
        if req.include_ja_market:
            mkt_engine = get_engine("market")
            mkt_result = mkt_engine.analyze_from_dict({
                "commodity": req.komoditas,
                "days": 30,
            })
            pipeline_result["ja_market"] = mkt_result
            pipeline_result["pipeline_stages"].append("JA Market ✅")

        # Stage 4: Carbon
        carbon_engine = get_engine("carbon")
        carbon_result = carbon_engine.calculate_from_dict({
            "komoditas": req.komoditas,
            "luas_ha": req.luas_ha,
            "is_sawah": req.is_sawah,
            "carbon_sink_pohon": req.carbon_sink_pohon,
        })
        pipeline_result["carbon"] = carbon_result
        pipeline_result["pipeline_stages"].append("Carbon ✅")

        # Stage 5: Forecast
        fc_engine = get_engine("forecast")
        fc_result = fc_engine.predict_from_dict({
            "komoditas": req.komoditas,
            "current_price_rp_kg": req.harga_jual_rp_kg,
            "curah_hujan_mm": req.curah_hujan_mm,
            "ph_tanah": req.ph_tanah,
        })
        pipeline_result["forecast"] = fc_result
        pipeline_result["pipeline_stages"].append("Forecasting ✅")

        # Stage 6: Language Switch
        lang_engine = get_engine("language")
        bilingual = lang_engine.build_bilingual_report("rab", rab_data, "both")
        pipeline_result["bilingual_labels"] = bilingual
        pipeline_result["pipeline_stages"].append("Language Switch ✅")

        # Stage 7: PDF (opsional)
        if req.generate_pdf:
            pdf_engine = get_engine("pdf")
            combined_data = {**rab_data}  # Use RAB data as base
            pdf_result = pdf_engine.generate("full", combined_data, req.language)
            pipeline_result["pdf"] = {
                "filename": pdf_result.get("filename"),
                "size_kb": pdf_result.get("size_kb"),
                "pdf_base64": pdf_result.get("pdf_base64"),
                "engine": pdf_result.get("engine"),
            }
            pipeline_result["pipeline_stages"].append("PDF ✅")

        pipeline_result["success"] = True
        pipeline_result["processing_ms"] = round((time.time() - t0) * 1000, 1)
        pipeline_result["timestamp"] = datetime.now().isoformat()
        return pipeline_result

    except Exception as e:
        logger.error(f"Pipeline error at stage {len(pipeline_result['pipeline_stages'])}: {e}")
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")


# ─────────────────────────────────────────────────────────────────────────────
# MCP Tool Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/mcp/search", summary="DuckDuckGo Search MCP", tags=["MCP Tools"])
async def mcp_search(req: SearchMCPRequest):
    """
    Tool Pencarian Web DuckDuckGo (MCP).
    - Mencari harga komoditas terkini, regulasi, berita pertanian.
    - Dilengkapi ekstraksi harga dan ringkasan otomatis via Gemini AI.
    """
    t0 = time.time()
    engine = get_engine("search")
    result = engine.search_from_dict(req.model_dump())
    result["processing_ms"] = round((time.time() - t0) * 1000, 1)
    return result

@app.post("/mcp/scrape", summary="Firecrawl / Native Scraper MCP", tags=["MCP Tools"])
async def mcp_scrape(req: ScrapeMCPRequest):
    """
    Tool Web Scraping (Firecrawl / BeautifulSoup) (MCP).
    - Mengambil halaman web pertanian (JA, BAPANAS, Kementan) menjadi markdown & teks bersih.
    - Mengekstrak tabel data harga dan angka metrik secara otomatis.
    """
    t0 = time.time()
    scraper = get_engine("scraper")
    result = scraper.scrape_from_dict(req.model_dump())
    result["processing_ms"] = round((time.time() - t0) * 1000, 1)
    return result

@app.post("/mcp/parse-document", summary="Document Fetcher & Parser MCP", tags=["MCP Tools"])
async def mcp_parse_document(req: ParseDocumentMCPRequest):
    """
    Tool Ekstraksi & Analisis Dokumen (PDF, Word, Excel, CSV) (MCP).
    - Parsing dokumen upload (base64 / path)
    - Ekstraksi otomatis biaya (Rp), luas lahan (ha), yield (ton/ha), komoditas
    - Ringkasan eksekutif & temuan kunci oleh Gemini AI
    """
    t0 = time.time()
    parser = get_engine("parser")
    if req.file_base64:
        result = parser.parse_base64(req.file_base64, req.filename)
    elif req.file_path:
        result = parser.parse_from_path(req.file_path)
    else:
        raise HTTPException(status_code=400, detail="file_base64 atau file_path wajib disertakan")
    result["processing_ms"] = round((time.time() - t0) * 1000, 1)
    return result

@app.post("/mcp/full-research", summary="Full Research Pipeline (Search + Scrape + AI Synth + PDF)", tags=["MCP Tools"])
async def mcp_full_research(req: FullResearchMCPRequest):
    """
    Pipeline Riset Otomatis End-to-End:
    1. Search DuckDuckGo sesuai topik/query
    2. Scrape top N URL yang relevan
    3. Sintesis hasil & insight oleh Gemini AI
    4. Render laporan PDF siap unduh
    """
    t0 = time.time()
    search_engine = get_engine("search")
    scraper       = get_engine("scraper")
    pdf_engine    = get_engine("pdf")
    lang_engine   = get_engine("language")

    # 1. Search
    search_res = search_engine.search_from_dict({
        "query": req.query,
        "max_results": 6,
        "language": req.language,
    })
    results_list = search_res.get("data", {}).get("results", [])

    # 2. Scrape top N URLs
    scraped_data = []
    for item in results_list[:req.scrape_top_n]:
        url = item.get("url", "")
        if url.startswith("http"):
            sc_res = scraper.scrape_from_dict({"url": url, "extract_tables": True})
            if sc_res.get("success"):
                scraped_data.append(sc_res["data"])

    # 3. AI Synthesize
    synthesized_notes = search_res.get("data", {}).get("ai_summary", "")
    key_facts = search_res.get("data", {}).get("key_facts", [])

    # 4. Generate PDF jika diminta
    pdf_info = None
    if req.generate_pdf:
        report_data = {
            "komoditas": req.query,
            "query": req.query,
            "ai_summary": synthesized_notes,
            "key_facts": key_facts,
            "search_results_count": len(results_list),
            "sources": [r.get("source", "") for r in results_list[:5]],
            "scraped_sources_count": len(scraped_data),
        }
        pdf_res = pdf_engine.generate("full", report_data, req.language)
        if pdf_res.get("success"):
            pdf_info = {
                "filename": pdf_res.get("filename"),
                "size_kb": pdf_res.get("size_kb"),
                "pdf_base64": pdf_res.get("pdf_base64"),
            }

    return {
        "success": True,
        "query": req.query,
        "search_results": results_list,
        "scraped_pages": scraped_data,
        "ai_synthesis": synthesized_notes,
        "key_facts": key_facts,
        "pdf": pdf_info,
        "processing_ms": round((time.time() - t0) * 1000, 1),
        "timestamp": datetime.now().isoformat(),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Run
# ─────────────────────────────────────────────────────────────────────────────



class VisualizeMCPRequest(BaseModel):
    chart_type: str = Field("soil_npk", description="Tipe chart: soil_npk/radar, market_trend, yield_benchmark, feature_importance")
    format: str = Field("echarts", description="Format output: echarts atau plotly")
    payload: Dict[str, Any] = Field(default_factory=dict, description="Parameter data untuk grafik")

@app.post("/mcp/visualize", summary="Industry Standard Chart Visualizer MCP", tags=["MCP Tools"])
async def mcp_visualize(req: VisualizeMCPRequest):
    """Generate spesifikasi grafik standar industri (Apache ECharts / Plotly)."""
    try:
        engine: ChartEngine = get_engine("chart")
        chart_result = engine.generate_chart(
            chart_type=req.chart_type,
            payload=req.payload,
            format=req.format
        )
        return {
            "success": True,
            "chart_type": req.chart_type,
            "format": req.format,
            "spec": chart_result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Chart visualizer error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    logger.info("🌾 Starting AgriSensa Advanced AI Engine API on port 8001")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info",
    )
