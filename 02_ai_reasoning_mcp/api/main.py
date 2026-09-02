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

from fastapi import FastAPI, HTTPException, BackgroundTasks, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Add parent dir to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_engine import (
    RABEngine, MonteCarloEngine, JaMarketIntelEngine,
    CarbonModel, ForecastingModel, LanguageSwitchEngine, PDFGenerator,
    SearchEngine, WebScraper, DocumentParser, ChartEngine, SupplyChainEngine,
    DataAnalystEngine, FertilizerEngine, SOPEngine, SOPRequestPayload,
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
        "- **Data Analyst & Strategic Insights** — Sintesis eksekutif multi-workflow\n"
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
    version="2.3.0",
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
            "supply_chain": SupplyChainEngine,
            "analyst":  DataAnalystEngine,
            "fertilizer": FertilizerEngine,
            "sop":      SOPEngine,
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

class DataAnalystRequest(BaseModel):
    komoditas: Optional[str] = Field("Cabai Merah Keriting", example="Cabai Merah Keriting")
    lokasi: Optional[str] = Field("Lembang, Jawa Barat", example="Lembang, Jawa Barat")
    luas_ha: Optional[float] = Field(1.0, ge=0.01, example=1.5)
    predicted_yield: Optional[float] = Field(14.5, description="Estimasi hasil panen (ton/ha)")
    chart_format: Optional[str] = Field("echarts", example="echarts")
    soil_data: Optional[Dict[str, Any]] = Field(default_factory=dict, description="NPK, pH, Kelembaban")
    market_data: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Historical prices, current price")
    weather_data: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Rainfall mm, temp")
    financial_data: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Cost breakdown")
    urea_kg: Optional[float] = None
    npk_kg: Optional[float] = None
    organik_kg: Optional[float] = None


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



# ─────────────────────────────────────────────────────────────────────────────
# Supply Chain & QR Passport Endpoints (AgriSensa Biz)
# ─────────────────────────────────────────────────────────────────────────────

class TraceabilityPassportRequest(BaseModel):
    komoditas: str = Field("Cabai Merah", example="Cabai Merah")
    farmer_name: str = Field("Pak Joko (Poktan Sumber Makmur)", example="Pak Joko")
    lokasi_lahan: str = Field("Desa Cibodas, Lembang, Jawa Barat", example="Lembang, Jawa Barat")
    luas_ha: float = Field(0.5, example=0.5)
    tanggal_panen: Optional[str] = Field(None, example="2026-08-31")
    varietas_benih: str = Field("Cabai Hibrida F1", example="Cabai Hibrida F1")
    grade_kualitas: str = Field("Grade A Super (Standar Resto & Pasar Induk)", example="Grade A Super")
    volume_kg: float = Field(1500.0, example=1500.0)
    perlakuan_pupuk: str = Field("NPK Presisi + Trichoderma Hayati", example="NPK Presisi")
    perlakuan_pestisida: str = Field("Pestisida Nabati (Aman Residu)", example="Pestisida Nabati")
    gps_coordinates: Optional[Dict[str, float]] = Field(default_factory=lambda: {"lat": -6.8167, "lon": 107.6167})
    sertifikasi_list: Optional[List[str]] = Field(None)

class QRGenerateRequest(BaseModel):
    data: str = Field("https://trace.agrisensa.com/passport/LOT-CABAI-20260831-01", description="URL atau teks data paspor")
    fill_color: str = Field("#064e3b", example="#064e3b")
    box_size: int = Field(10, example=10)

class ShelfLifeLossRequest(BaseModel):
    komoditas: str = Field("cabai_merah", example="cabai_merah")
    volume_kg: float = Field(1000.0, example=1000.0)
    transit_hours: float = Field(24.0, example=24.0)
    use_cold_chain: bool = Field(False, example=False)

@app.post("/supply-chain/traceability", summary="Generate Complete Traceability Digital Passport", tags=["Supply Chain & AgriSensa Biz"])
async def generate_traceability_passport(req: TraceabilityPassportRequest):
    """Menghasilkan paspor digital ketertelusuran rantai pasok lengkap beserta QR Code dan digital signature hash."""
    try:
        engine: SupplyChainEngine = get_engine("supply_chain")
        passport = engine.create_traceability_passport(
            komoditas=req.komoditas,
            farmer_name=req.farmer_name,
            lokasi_lahan=req.lokasi_lahan,
            luas_ha=req.luas_ha,
            tanggal_panen=req.tanggal_panen,
            varietas_benih=req.varietas_benih,
            grade_kualitas=req.grade_kualitas,
            volume_kg=req.volume_kg,
            perlakuan_pupuk=req.perlakuan_pupuk,
            perlakuan_pestisida=req.perlakuan_pestisida,
            gps_coordinates=req.gps_coordinates,
            sertifikasi_list=req.sertifikasi_list
        )
        return {
            "success": True,
            "data": passport,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Traceability passport error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/qr/generate-passport", summary="Generate High Resolution QR Code Image", tags=["Supply Chain & AgriSensa Biz"])
async def generate_qr_passport(req: QRGenerateRequest):
    """Menghasilkan gambar QR Code Base64 untuk pencetakan label stiker produk/kemasan."""
    try:
        engine: SupplyChainEngine = get_engine("supply_chain")
        qr_result = engine.generate_qr_code(
            data=req.data,
            fill_color=req.fill_color,
            box_size=req.box_size
        )
        return {
            "success": True,
            "data": qr_result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"QR generator error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/supply-chain/shelf-life", summary="Calculate Postharvest Loss & Shelf-Life", tags=["Supply Chain & AgriSensa Biz"])
async def calculate_shelf_life(req: ShelfLifeLossRequest):
    """Menghitung estimasi susut bobot saat pengiriman dan sisa umur simpan komoditas."""
    try:
        engine: SupplyChainEngine = get_engine("supply_chain")
        loss_result = engine.calculate_shelf_life_and_loss(
            komoditas=req.komoditas,
            volume_kg=req.volume_kg,
            transit_hours=req.transit_hours,
            use_cold_chain=req.use_cold_chain
        )
        return {
            "success": True,
            "data": loss_result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Shelf life calculation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyst/synthesize", summary="AgriSensa Advanced Data Analyst & Strategic Synthesis", tags=["Executive Intelligence"])
async def synthesize_data_analyst(req: DataAnalystRequest):
    """
    Sintesis Lintas-Workflow Data Analyst Eksekutif:
    Mengintegrasikan data pasar, cuaca, agronomi, finansial/Monte Carlo, dan jejak karbon ESG.
    Menghasilkan skor kelayakan 5-pilar, rekomendasi preskriptif, serta spesifikasi visualisasi modern.
    """
    try:
        engine: DataAnalystEngine = get_engine("analyst")
        payload = req.model_dump()
        result = engine.synthesize_from_dict(payload)
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Data synthesis failed"))
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Data Analyst Synthesis error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# ─────────────────────────────────────────────────────────────────────────────
# Fertilizer Engineering & Recipe Endpoints
# ─────────────────────────────────────────────────────────────────────────────

class OrganicMaterialItem(BaseModel):
    material: str = Field(..., example="Kotoran Sapi")
    weight_kg: float = Field(..., example=100.0)

class OrganicCalculatorRequest(BaseModel):
    items: List[OrganicMaterialItem] = Field(
        ...,
        example=[
            {"material": "Kotoran Sapi", "weight_kg": 100.0},
            {"material": "Dedak Padi (Katul Halus)", "weight_kg": 20.0},
            {"material": "Abu Dapur (Kayu Keras)", "weight_kg": 10.0}
        ]
    )

class CombinationCalculatorRequest(BaseModel):
    target_n_kg: float = Field(100.0, example=100.0)
    target_p_kg: float = Field(50.0, example=50.0)
    target_k_kg: float = Field(60.0, example=60.0)
    land_area_ha: float = Field(1.0, example=1.0)
    buffer_pct: float = Field(5.0, example=5.0)
    price_mode: Optional[str] = Field("subsidi", description="subsidi, nonsubsidi, atau custom")
    custom_prices: Optional[Dict[str, float]] = Field(default_factory=dict, description="Penyesuaian harga kustom per kg")
    compound_choice: Optional[str] = Field("NPK Phonska Subsidi (15-10-12)", description="Pilihan pupuk majemuk utama")

@app.post("/fertilizer/organic-calculator", summary="Hitung Formulasi NPK Pupuk Organik", tags=["Fertilizer Engine"])
async def calculate_organic_fertilizer(req: OrganicCalculatorRequest):
    """
    Menghitung estimasi kandungan N-P-K (%), hara real (kg), rasio C/N, dan diagnosa kegunaan
    dari racikan bahan organik berdasarkan referensi ilmiah Balitbangtan & FAO.
    """
    try:
        engine: FertilizerEngine = get_engine("fertilizer")
        items = [i.model_dump() for i in req.items]
        res = engine.calculate_organic_mix(items)
        if not res.get("success"):
            raise HTTPException(status_code=400, detail=res.get("message", "Perhitungan gagal"))
        return res
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Organic fertilizer calculator error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/fertilizer/combination-calculator", summary="Kalkulator Formulasi Pupuk Kombinasi", tags=["Fertilizer Engine"])
async def calculate_fertilizer_combination(req: CombinationCalculatorRequest):
    """
    Nutrient-to-Weight Blending Solver:
    Menghitung rekomendasi 3 skenario pemenuhan hara (Pupuk Tunggal, NPK Majemuk, dan Hybrid Organik-Kimia),
    lengkap dengan komparasi biaya subsidi HET vs non-subsidi komersial vs kustom, jumlah karung 50kg, dan keunggulan agronomi.
    """
    try:
        engine: FertilizerEngine = get_engine("fertilizer")
        res = engine.calculate_combination_blending(
            target_n_kg=req.target_n_kg,
            target_p_kg=req.target_p_kg,
            target_k_kg=req.target_k_kg,
            land_area_ha=req.land_area_ha,
            buffer_pct=req.buffer_pct,
            price_mode=req.price_mode or "subsidi",
            custom_prices=req.custom_prices,
            compound_choice=req.compound_choice or "NPK Phonska Subsidi (15-10-12)",
        )
        return res
    except Exception as e:
        logger.error(f"Combination fertilizer calculator error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/fertilizer/inorganic-catalog", summary="Daftar Katalog Pupuk Tunggal & Majemuk (Subsidi & Non-Subsidi)", tags=["Fertilizer Engine"])
async def get_inorganic_catalog():
    """Mengambil katalog lengkap pupuk tunggal dan majemuk bersubsidi HET dan non-subsidi komersial beserta harga default."""
    engine: FertilizerEngine = get_engine("fertilizer")
    return {"success": True, "fertilizers": engine.get_inorganic_catalog()}

@app.get("/fertilizer/recipes", summary="Daftar SOP & Resep Pupuk Organik Premium", tags=["Fertilizer Engine"])
async def get_fertilizer_recipes():
    """Mengambil ensiklopedia SOP resep POC ROTAN, Bioaktivator Rumen, Biang Trichoderma, dan Bokashi."""
    engine: FertilizerEngine = get_engine("fertilizer")
    return {"success": True, "recipes": engine.get_recipes()}

@app.get("/fertilizer/materials", summary="Daftar Bahan Baku Organik Ilmiah", tags=["Fertilizer Engine"])
async def get_fertilizer_materials():
    """Mengambil database 15+ bahan baku organik ilmiah (kadar NPK, C/N ratio, fungsi)."""
    engine: FertilizerEngine = get_engine("fertilizer")
    return {"success": True, "materials": engine.get_raw_materials()}


# ─────────────────────────────────────────────────────────────────────────────
# Document Intelligence & Library Endpoints (PDF, Word, Excel, CSV)
# ─────────────────────────────────────────────────────────────────────────────

class StoredDocumentParseRequest(BaseModel):
    filename: str = Field(..., description="Nama file dalam knowledge base misal: M-48_Pestisida_Nabati.pdf")

@app.get("/documents/library", summary="Daftar Dokumen Baku Knowledge Base", tags=["Document Intelligence"])
async def get_document_library():
    """Mengambil katalog dokumen riset, SOP, dan regulasi pertanian dalam library AgriSensa."""
    try:
        engine: DocumentParser = get_engine("parser")
        docs = engine.list_library_documents()
        return {"success": True, "total": len(docs), "documents": docs}
    except Exception as e:
        logger.error(f"Error fetching document library: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/documents/parse-upload", summary="Parsing & Ekstraksi Dokumen Upload Eksternal", tags=["Document Intelligence"])
async def parse_uploaded_document(file: UploadFile = File(...)):
    """
    Ekstraksi Dokumen Eksternal:
    Menerima file PDF, DOCX, XLSX, atau CSV yang diunggah pengguna, mengekstrak teks, tabel, metrik pertanian/SOP,
    dan menghasilkan ringkasan wawasan strategis bertenaga AI Engine.
    """
    try:
        engine: DocumentParser = get_engine("parser")
        contents = await file.read()
        res = engine.parse_file(contents, file.filename)
        return {"success": True, "data": res.__dict__}
    except Exception as e:
        logger.error(f"Error parsing uploaded file {file.filename}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/documents/parse-stored", summary="Parsing Dokumen Standar dari Knowledge Base", tags=["Document Intelligence"])
async def parse_stored_document(req: StoredDocumentParseRequest):
    """
    Parsing Dokumen Tersimpan:
    Memproses file PDF baku yang tersimpan di server knowledge base (contoh: M-48_Pestisida_Nabati.pdf)
    dan mengembalikan struktur formula, tabel, dan temuan kunci.
    """
    try:
        engine: DocumentParser = get_engine("parser")
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        file_path = os.path.join(base_dir, "knowledge_base", "pdfs", req.filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"File {req.filename} tidak ditemukan di library")

        res = engine.parse_from_path(file_path)
        return res
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error parsing stored document {req.filename}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# Commodity SOP Precision Generator Endpoints (GAP + M-48 + AI + Journals)
# ─────────────────────────────────────────────────────────────────────────────

class SOPGenerateRequest(BaseModel):
    komoditas: str = Field("Cabai Merah", description="Nama komoditas pertanian")
    luas_ha: float = Field(1.0, ge=0.01, le=1000.0, description="Luas lahan dalam hektar")
    elevasi_mdpl: int = Field(250, ge=0, le=3500, description="Ketinggian lahan dari permukaan laut (mdpl)")
    musim: str = Field("Kemarau", description="Musim tanam: Kemarau, Penghujan, Pancaroba")
    sistem_budidaya: str = Field("GAP Standar", description="Sistem budidaya: Organik Murni, GAP Standar, Semi-Organik, Smart Farming IoT")
    target_pasar: str = Field("Domestik Premium", description="Target pasar: Domestik Premium, Ekspor Jepang, Industri Olahan")

@app.get("/sop/commodities", summary="Daftar Komoditas SOP Presisi", tags=["SOP Engine"])
async def get_sop_commodities():
    """Mengambil katalog komoditas pertanian yang didukung SOP Engine beserta varietas dan parameter default."""
    try:
        engine: SOPEngine = get_engine("sop")
        commodities = engine.get_supported_commodities()
        return {"success": True, "total": len(commodities), "commodities": commodities}
    except Exception as e:
        logger.error(f"Error fetching SOP commodities: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/sop/generate", summary="Generate SOP Budidaya Presisi (AI + Jurnal Ilmiah)", tags=["SOP Engine"])
async def generate_commodity_sop(req: SOPGenerateRequest):
    """
    SOP Budidaya Presisi & PHT Modul M-48:
    Menghasilkan Standard Operating Procedure (SOP) lengkap per komoditi berdasarkan:
    1. Logika Agronomi Baku AgriSensa (Kalender Fase, Jadwal Pemupukan, Resep PHT M-48).
    2. Sintesis AI Reasoning Agent (Kondisi Luas Lahan, Elevasi mdpl, Musim Tanam).
    3. Rujukan Sitasi Jurnal Ilmiah Peer-Reviewed Terpercaya (IPB, BRIN, FAO, Springer).
    """
    try:
        engine: SOPEngine = get_engine("sop")
        payload = SOPRequestPayload(
            komoditas=req.komoditas,
            luas_ha=req.luas_ha,
            elevasi_mdpl=req.elevasi_mdpl,
            musim=req.musim,
            sistem_budidaya=req.sistem_budidaya,
            target_pasar=req.target_pasar,
        )
        result = engine.generate_sop(payload)
        return result
    except Exception as e:
        logger.error(f"Error generating SOP for {req.komoditas}: {e}")
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

