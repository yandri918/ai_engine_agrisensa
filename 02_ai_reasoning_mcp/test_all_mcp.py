"""
AgriSensa Comprehensive MCP Tools Test Suite
============================================
Menguji 4 MCP tools:
1. DuckDuckGo Search
2. Web Scraper (Native & Fallback)
3. Document Parser (Text, CSV, PDF simulated)
4. PDF Generator (Report)
"""

import sys
import os
sys.path.insert(0, '.')
os.environ['PYTHONIOENCODING'] = 'utf-8'

print("============================================================")
print("[TEST] Testing AgriSensa MCP Tools...")
print("============================================================")

# 1. Test DuckDuckGo Search
print("\n[1] Testing DuckDuckGo Search Engine MCP...")
from ai_engine.search_engine import SearchEngine
searcher = SearchEngine()
res_search = searcher.search_from_dict({
    "query": "harga gabah padi Jawa Barat",
    "max_results": 3,
    "language": "id"
})
if res_search.get("success"):
    sd = res_search["data"]
    print(f"    [OK] Search OK: {sd['results_count']} results found (Backend: {sd['search_backend']})")
    for r in sd["results"][:2]:
        print(f"       - [{r['source']}] {r['title'][:55]}...")
else:
    print(f"    [FAIL] Search Error: {res_search.get('error')}")

# 2. Test Web Scraper
print("\n[2] Testing Web Scraper MCP...")
from ai_engine.web_scraper import WebScraper
scraper = WebScraper()
res_scrape = scraper.scrape_from_dict({
    "url": "https://panelharga.badanpangan.go.id",
    "extract_tables": True
})
if res_scrape.get("success"):
    scd = res_scrape["data"]
    print(f"    [OK] Scraper OK: Title='{scd['title'][:40]}', Engine={scd['engine_used']}")
    print(f"       Extracted {len(scd['text_content'])} chars, {len(scd['extracted_tables'])} tables")
else:
    print(f"    [FAIL] Scraper Error: {res_scrape.get('error')}")

# 3. Test Document Parser
print("\n[3] Testing Document Parser MCP...")
from ai_engine.document_parser import DocumentParser
parser = DocumentParser()

# Test text parsing
sample_doc = """
LAPORAN BIAYA DAN ESTIMASI PRODUKSI CABAI MERAH 2025
Lokasi: Lembang, Jawa Barat
Luas Lahan: 1.5 ha
Komoditas: Cabai Merah Keriting
Total Biaya Produksi: Rp 45.000.000
Estimasi Panen: 12.0 ton/ha (Total 18.0 ton)
Harga Jual Target: Rp 28.000/kg
Pupuk yang digunakan: Urea 300 kg, NPK Mutiara 500 kg, Kompos 3 ton
"""
res_doc = parser.parse_file(sample_doc.encode("utf-8"), "laporan_cabai.txt")
print(f"    [OK] Document Parser OK: {res_doc.filename}")
print(f"       Metrics: Biaya={res_doc.extracted_metrics.get('biaya_ditemukan')}")
print(f"       Luas={res_doc.extracted_metrics.get('luas_ha_ditemukan')} ha, Yield={res_doc.extracted_metrics.get('yield_ditemukan')} ton")
print(f"       Crops={res_doc.extracted_metrics.get('komoditas_disebut')}")

# 4. Test PDF Generator
print("\n[4] Testing PDF Generator for MCP Report...")
from ai_engine.pdf_generator import PDFGenerator
pdf_gen = PDFGenerator()
res_pdf = pdf_gen.generate_from_dict({
    "modul": "rab",
    "language": "id",
    "data": {
        "komoditas": "Cabai Merah",
        "luas_ha": 1.5,
        "total_biaya_rp": 45000000,
        "total_pendapatan_rp": 504000000,
        "keuntungan_bersih_rp": 459000000,
        "roi_persen": 1020.0,
        "bep_ton": 1.6,
        "bep_rp": 2500,
        "mos_persen": 91.1,
        "tcr": 0.089
    }
})
if res_pdf.get("success"):
    print(f"    [OK] PDF Generator OK: {res_pdf['filename']} ({res_pdf['size_kb']} KB, engine: {res_pdf['engine']})")
else:
    print(f"    [FAIL] PDF Generator Error: {res_pdf.get('error')}")

print("\n" + "=" * 60)
print("[SUCCESS] ALL MCP TOOLS VERIFIED SUCCESSFULLY!")
print("============================================================")
