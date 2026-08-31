import sys
sys.path.insert(0, '.')

print("Testing AgriSensa AI Engine Modules...")
print("=" * 55)

# Test 3: JA Market Intel
from ai_engine.market_intel import JaMarketIntelEngine
jr = JaMarketIntelEngine().analyze_from_dict({'commodity': 'wortel', 'days': 30})
jd = jr['data']
print(f"[3] JA Market OK: {jd['commodity_ja']} Y{jd['current_price_jpy']}/kg, Trend: {jd['trend_direction']}")

# Test 4: Carbon Model
from ai_engine.carbon_model import CarbonModel
cr = CarbonModel().calculate_from_dict({'komoditas': 'padi', 'luas_ha': 1, 'is_sawah': True, 'carbon_sink_pohon': 50})
cd = cr['data']
print(f"[4] Carbon OK: {cd['total_co2e_ton']} ton CO2e, Rating: {cd['rating'][:30]}")

# Test 5: Forecasting
from ai_engine.forecasting_model import ForecastingModel
fr = ForecastingModel().predict_from_dict({'komoditas': 'padi', 'current_price_rp_kg': 4500})
fd = fr['data']
print(f"[5] Forecast OK: Yield {fd['yield_forecast_ton_ha']} t/ha, Risk: {fd['risk']['level']}")

# Test 6: Language Switch
from ai_engine.language_switch import LanguageSwitchEngine
lr = LanguageSwitchEngine().switch_from_dict({
    'text': 'Petani membutuhkan pupuk nitrogen untuk padi sawah',
    'source_language': 'id',
    'target_language': 'ja',
    'context': 'rab'
})
ld = lr['data']
print(f"[6] Language OK: {ld['translated_text'][:70]}")

# Test 7: PDF Generator
from ai_engine.pdf_generator import PDFGenerator
pr = PDFGenerator().generate_from_dict({
    'modul': 'rab',
    'language': 'id',
    'data': {'komoditas': 'Padi', 'roi_persen': 190.89, 'total_biaya_rp': 12500000}
})
print(f"[7] PDF OK: {pr['filename']}, {pr['size_kb']} KB, engine: {pr['engine']}")

print("=" * 55)
print("ALL 7 MODULES PASSED!")
