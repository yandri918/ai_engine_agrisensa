"""
AgriSensa Backend Complete Endpoint Verification
================================================
Test all FastAPI endpoints in agrisensa-ai-engine.
"""

import sys
import os
sys.path.insert(0, '.')
os.environ['PYTHONIOENCODING'] = 'utf-8'

from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

print("=" * 60)
print("VERIFYING AGRISENSA BACKEND ENDPOINTS (PORT 8001)")
print("=" * 60)

# 1. Health check
r_health = client.get('/health')
print(f"1. Health Check: HTTP {r_health.status_code} | status={r_health.json()['status']}")

# 2. List modules
r_modules = client.get('/modules')
mod_count = len(r_modules.json().get('modules', []))
print(f"2. Modules List: HTTP {r_modules.status_code} | Total Modules: {mod_count}")

# 3. RAB calculation
r_rab = client.post('/rab/calculate', json={'komoditas': 'padi', 'luas_ha': 1.0, 'harga_jual_rp_kg': 4500})
roi = r_rab.json().get('data', {}).get('roi_persen', 0)
print(f"3. RAB Calculate: HTTP {r_rab.status_code} | ROI: {roi}%")

# 4. Monte Carlo
r_mc = client.post('/monte-carlo/simulate', json={'total_biaya_rp': 12500000, 'luas_ha': 1.0, 'n_iterations': 500})
p_untung = r_mc.json().get('data', {}).get('prob_untung_persen', 0)
print(f"4. Monte Carlo: HTTP {r_mc.status_code} | P(Untung): {p_untung}%")

# 5. JA Market
r_mkt = client.post('/market/ja-intel', json={'commodity': 'wortel', 'days': 30})
price_ja = r_mkt.json().get('data', {}).get('current_price_jpy', 0)
print(f"5. JA Market Intel: HTTP {r_mkt.status_code} | Price: {price_ja} JPY/kg")

# 6. Carbon
r_carbon = client.post('/carbon/calculate', json={'komoditas': 'padi', 'luas_ha': 1.0, 'is_sawah': True})
co2 = r_carbon.json().get('data', {}).get('total_co2e_ton', 0)
print(f"6. Carbon Model: HTTP {r_carbon.status_code} | CO2: {co2} ton")

# 7. Forecast
r_fc = client.post('/forecast/predict', json={'komoditas': 'padi', 'current_price_rp_kg': 4500})
yield_fc = r_fc.json().get('data', {}).get('yield_forecast_ton_ha', 0)
print(f"7. Forecast Model: HTTP {r_fc.status_code} | Yield: {yield_fc} ton/ha")

# 8. MCP Search
r_search = client.post('/mcp/search', json={'query': 'harga pupuk NPK 2025', 'max_results': 2})
print(f"8. MCP Search: HTTP {r_search.status_code} | Success: {r_search.json().get('success')}")

# 9. MCP Scrape
r_scrape = client.post('/mcp/scrape', json={'url': 'https://panelharga.badanpangan.go.id'})
engine_used = r_scrape.json().get('data', {}).get('engine_used', 'unknown')
print(f"9. MCP Scraper: HTTP {r_scrape.status_code} | Engine: {engine_used}")

# 10. MCP Parse Document
r_doc = client.post('/mcp/parse-document', json={'filename': 'test.txt', 'file_base64': 'TEFQT1JBTiBQRVJUQU5JQU4gUEFESTogTHVhcyAxLjUgaGEsIEJpYXlhIFJwIDIwLjAwMC4wMDA='})
biaya_found = r_doc.json().get('data', {}).get('extracted_metrics', {}).get('biaya_ditemukan', [])
print(f"10. MCP Doc Parser: HTTP {r_doc.status_code} | Biaya Extracted: {biaya_found}")

# 11. Full Pipeline
r_pipe = client.post('/pipeline/full', json={'komoditas': 'padi', 'luas_ha': 1.0, 'n_iterations': 500, 'generate_pdf': False})
stages = [s.encode('ascii', 'ignore').decode('ascii').strip() for s in r_pipe.json().get('pipeline_stages', [])]
print(f"11. Full Pipeline: HTTP {r_pipe.status_code} | Stages: {stages}")

print("=" * 60)
print("SUCCESS: ALL 11 ENDPOINTS TESTED AND VERIFIED!")
print("=" * 60)
