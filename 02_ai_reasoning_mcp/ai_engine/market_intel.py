"""
AgriSensa JA Market Intelligence Engine
========================================
Mengolah data harga pasar dari JA (Japan Agriculture / 日本農協):
- Harga komoditas (円/kg)
- 入荷量 (Arrival Volume / Volume Masuk)
- Volatilitas harga 30 hari
- Tren harga dengan moving average
- Perbandingan musiman

Data source:
1. JA-NET / JA直売所 market data (web scraping)
2. 農林水産省 (Kementerian Pertanian Jepang) open data API
3. Mock/demo data untuk development

Output bilingual: Bahasa Indonesia + 日本語
"""

import logging
import re
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional


# Trusted Japan Agricultural Sources
OPENGOV_VEGETABLE_MARKET_URL = "https://opengov.jp/en/prices/vegetable-market/31700/"
AGRINE_SMART_FARMING_URL = "https://agrine.jp/"
JA_GROUP_MARKET_URL = "https://life.ja-group.jp/farm/market/"

logger = logging.getLogger("agrisensa.market_intel")

# ─────────────────────────────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────────────────────────────

# Referensi harga JA & Pasar Indonesia komoditas (Bilateral Market Database)
JA_COMMODITY_MOCK = {
    # 1. Sayuran & Hortikultura
    "wortel":        {"ja_name": "にんじん",         "id_name": "Wortel Brastagi",          "category": "Hortikultura", "base_price": 180,  "id_price": 14000, "unit": "円/kg", "season_peak": [10, 11, 12]},
    "bawang":        {"ja_name": "たまねぎ",         "id_name": "Bawang Bombay",            "category": "Hortikultura", "base_price": 140,  "id_price": 28000, "unit": "円/kg", "season_peak": [5, 6, 7]},
    "bawang_merah":  {"ja_name": "赤たまねぎ",       "id_name": "Bawang Merah Brebes",      "category": "Hortikultura", "base_price": 520,  "id_price": 34000, "unit": "円/kg", "season_peak": [6, 7, 8]},
    "bawang_putih":  {"ja_name": "にんにく",         "id_name": "Bawang Putih Honan",       "category": "Hortikultura", "base_price": 650,  "id_price": 38000, "unit": "円/kg", "season_peak": [4, 5, 6]},
    "tomat":         {"ja_name": "トマト",           "id_name": "Tomat Servo",              "category": "Hortikultura", "base_price": 320,  "id_price": 16000, "unit": "円/kg", "season_peak": [6, 7, 8]},
    "cabai":         {"ja_name": "とうがらし",       "id_name": "Cabai Merah Keriting",     "category": "Hortikultura", "base_price": 850,  "id_price": 42000, "unit": "円/kg", "season_peak": [7, 8, 9]},
    "cabai_rawit":   {"ja_name": "バードアイチリ",   "id_name": "Cabai Rawit Merah",        "category": "Hortikultura", "base_price": 1200, "id_price": 46000, "unit": "円/kg", "season_peak": [6, 7, 8]},
    "kentang":       {"ja_name": "じゃがいも",       "id_name": "Kentang Granola L",        "category": "Hortikultura", "base_price": 160,  "id_price": 18000, "unit": "円/kg", "season_peak": [6, 7, 8]},
    "kubis":         {"ja_name": "キャベツ",         "id_name": "Kubis / Kol Hijau",        "category": "Hortikultura", "base_price": 95,   "id_price": 8500,  "unit": "円/kg", "season_peak": [3, 4, 5]},
    "mentimun":      {"ja_name": "きゅうり",         "id_name": "Mentimun Jepang (Kyuri)",  "category": "Hortikultura", "base_price": 240,  "id_price": 9000,  "unit": "円/kg", "season_peak": [6, 7, 8]},
    "bayam":         {"ja_name": "ほうれんそう",     "id_name": "Bayam Hijau (Horenso)",    "category": "Hortikultura", "base_price": 320,  "id_price": 12000, "unit": "円/kg", "season_peak": [10, 11, 12]},
    "daikon":        {"ja_name": "だいこん",         "id_name": "Lobak Jepang (Daikon)",    "category": "Hortikultura", "base_price": 110,  "id_price": 15000, "unit": "円/本", "season_peak": [11, 12, 1]},
    "terong":        {"ja_name": "なす",             "id_name": "Terong Ungu (Nasu)",       "category": "Hortikultura", "base_price": 260,  "id_price": 10000, "unit": "円/kg", "season_peak": [7, 8, 9]},
    "shiitake":      {"ja_name": "しいたけ",         "id_name": "Jamur Shiitake",           "category": "Hortikultura", "base_price": 850,  "id_price": 45000, "unit": "円/kg", "season_peak": [10, 11, 12]},
    "jahe":          {"ja_name": "しょうが",         "id_name": "Jahe Gajah / Emprit",      "category": "Hortikultura", "base_price": 420,  "id_price": 22000, "unit": "円/kg", "season_peak": [8, 9, 10]},

    # 2. Pangan Pokok & Biji-bijian
    "padi":          {"ja_name": "こめ (コシヒカリ)", "id_name": "Beras Premium Ciherang",   "category": "Pangan",       "base_price": 420,  "id_price": 15500, "unit": "円/kg", "season_peak": [9, 10, 11]},
    "jagung":        {"ja_name": "とうもろこし",     "id_name": "Jagung Pipil Pakan",       "category": "Pangan",       "base_price": 260,  "id_price": 6500,  "unit": "円/kg", "season_peak": [7, 8, 9]},
    "edamame":       {"ja_name": "えだまめ",         "id_name": "Kedelai Sayur (Edamame)",  "category": "Pangan",       "base_price": 480,  "id_price": 18000, "unit": "円/kg", "season_peak": [7, 8, 9]},
    "kedelai":       {"ja_name": "だいず",           "id_name": "Kedelai Biji Kering",      "category": "Pangan",       "base_price": 340,  "id_price": 12500, "unit": "円/kg", "season_peak": [8, 9, 10]},
    "singkong":      {"ja_name": "キャッサバ",       "id_name": "Ubi Kayu / Singkong",      "category": "Pangan",       "base_price": 280,  "id_price": 4500,  "unit": "円/kg", "season_peak": [6, 7, 8]},
    "ubi_jalar":     {"ja_name": "さつまいも",       "id_name": "Ubi Jalar Cilembu",        "category": "Pangan",       "base_price": 280,  "id_price": 9000,  "unit": "円/kg", "season_peak": [9, 10, 11]},

    # 3. Buah-buahan Premium
    "melon_crown":   {"ja_name": "マスクメロン",     "id_name": "Melon Golden Inthanon",    "category": "Buah-buahan",  "base_price": 1800, "id_price": 28000, "unit": "円/kg", "season_peak": [6, 7, 8]},
    "semangka":      {"ja_name": "すいか",           "id_name": "Semangka Non-Biji",        "category": "Buah-buahan",  "base_price": 350,  "id_price": 8500,  "unit": "円/kg", "season_peak": [6, 7, 8]},
    "pisang":        {"ja_name": "バナナ",           "id_name": "Pisang Cavendish",         "category": "Buah-buahan",  "base_price": 240,  "id_price": 16000, "unit": "円/kg", "season_peak": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]},
    "durian":        {"ja_name": "ドリアン",         "id_name": "Durian Musang King",       "category": "Buah-buahan",  "base_price": 3200, "id_price": 180000,"unit": "円/kg", "season_peak": [11, 12, 1]},
    "stroberi":      {"ja_name": "あまおう苺",       "id_name": "Stroberi Sweet Heart",     "category": "Buah-buahan",  "base_price": 1400, "id_price": 95000, "unit": "円/kg", "season_peak": [1, 2, 3, 4]},
    "anggur_muscat": {"ja_name": "シャインマスカット","id_name": "Anggur Shine Muscat",     "category": "Buah-buahan",  "base_price": 2800, "id_price": 120000,"unit": "円/kg", "season_peak": [8, 9, 10]},
    "apel_fuji":     {"ja_name": "ふじりんご",       "id_name": "Apel Fuji Premium",        "category": "Buah-buahan",  "base_price": 420,  "id_price": 35000, "unit": "円/kg", "season_peak": [10, 11, 12]},
    "jeruk_mikan":   {"ja_name": "温州みかん",       "id_name": "Jeruk Mikan Honey",        "category": "Buah-buahan",  "base_price": 380,  "id_price": 26000, "unit": "円/kg", "season_peak": [11, 12, 1]},

    # 4. Perkebunan, Rempah & Spesialitas Ekspor
    "kopi_arabika":  {"ja_name": "アラビカコーヒー", "id_name": "Kopi Arabika Gayo (Green Bean)", "category": "Perkebunan", "base_price": 2200, "id_price": 115000,"unit": "円/kg", "season_peak": [10, 11, 12]},
    "kopi_robusta":  {"ja_name": "ロブスタコーヒー", "id_name": "Kopi Robusta Lampung",    "category": "Perkebunan", "base_price": 1100, "id_price": 65000, "unit": "円/kg", "season_peak": [6, 7, 8]},
    "kakao":         {"ja_name": "発酵カカオ豆",     "id_name": "Biji Kakao Fermentasi",    "category": "Perkebunan", "base_price": 1350, "id_price": 78000, "unit": "円/kg", "season_peak": [5, 6, 7]},
    "sawit_cpo":     {"ja_name": "パーム油 (CPO)",    "id_name": "Minyak Kelapa Sawit (CPO)", "category": "Perkebunan", "base_price": 180,  "id_price": 14200, "unit": "円/kg", "season_peak": [8, 9, 10]},
    "vanili":        {"ja_name": "バニラビーンズ",   "id_name": "Vanili Gourmet Organik",   "category": "Perkebunan", "base_price": 18000,"id_price": 950000,"unit": "円/kg", "season_peak": [7, 8, 9]},
    "cengkeh":       {"ja_name": "クローブ (丁子)",   "id_name": "Cengkeh Kering Maluku",    "category": "Perkebunan", "base_price": 2400, "id_price": 125000,"unit": "円/kg", "season_peak": [7, 8, 9]},
    "lada_hitam":    {"ja_name": "黒コショウ",       "id_name": "Lada Hitam Lampung",       "category": "Perkebunan", "base_price": 1600, "id_price": 85000, "unit": "円/kg", "season_peak": [8, 9, 10]},
    "teh_matcha":    {"ja_name": "宇治抹茶",         "id_name": "Teh Hijau / Matcha",       "category": "Perkebunan", "base_price": 4500, "id_price": 220000,"unit": "円/kg", "season_peak": [5, 6]},
}

JA_MARKET_REGIONS = {
    "kanto":   "関東",
    "kansai":  "関西",
    "kyushu":  "九州",
    "tohoku":  "東北",
    "chubu":   "中部",
    "hokkaido":"北海道",
}

# ─────────────────────────────────────────────────────────────────────────────
# Data Classes
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class PricePoint:
    """Satu titik data harga historis."""
    date: str                  # YYYY-MM-DD
    price_jpy: float           # 円/kg
    arrival_volume_ton: float  # 入荷量 (ton)
    market: str = "東京都中央卸売市場"
    quality_grade: str = "M"   # S/M/L/2L


@dataclass
class JAMarketResult:
    """Hasil analisis JA Market Intelligence."""
    # Komoditas info
    commodity_id: str
    commodity_ja: str          # 日本語名
    commodity_id_name: str     # Nama Indonesia

    # Harga saat ini
    current_price_jpy: float   # 円/kg
    price_idr_estimate: float  # Estimasi IDR (kurs asumsi)
    jpy_idr_rate: float        # Kurs JPY/IDR

    # Volume
    current_arrival_ton: float # 入荷量 hari ini (ton)
    avg_arrival_30d_ton: float # Rata-rata 入荷量 30 hari

    # Trend & Volatility
    trend_direction: str       # "naik" / "turun" / "stabil"
    trend_strength: str        # "kuat" / "sedang" / "lemah"
    price_change_1d_pct: float # Perubahan 1 hari (%)
    price_change_7d_pct: float # Perubahan 7 hari (%)
    price_change_30d_pct: float# Perubahan 30 hari (%)
    volatility_30d_pct: float  # Volatilitas 30 hari (%)

    # Moving averages
    ma_7d: float               # MA 7 hari
    ma_30d: float              # MA 30 hari

    # Min/Max
    price_min_30d: float
    price_max_30d: float
    price_avg_30d: float

    # Seasonal analysis
    is_peak_season: bool
    season_note: str
    peak_months: List[int]

    # Historical data
    history_30d: List[Dict]    # [{date, price, volume}, ...]

    # Analisis untuk eksportir Indonesia
    export_opportunity: str    # Rekomendasi peluang ekspor
    price_forecast_7d: List[Dict]  # Prediksi 7 hari ke depan

    # Metadata
    data_source: str
    analysis_timestamp: str
    region: str


# ─────────────────────────────────────────────────────────────────────────────
# Core Engine
# ─────────────────────────────────────────────────────────────────────────────

class JaMarketIntelEngine:
    """
    JA (Japan Agriculture) Market Intelligence Engine.
    Menganalisis harga, volume, dan tren pasar Jepang untuk komoditas pertanian.
    """

    JPY_IDR_RATE = 105.0   # Default kurs, idealnya diupdate real-time

    def __init__(self, jpy_idr_rate: float = 105.0):
        self.jpy_idr_rate = jpy_idr_rate
        logger.info(f"JAMarketIntelEngine init, JPY/IDR={jpy_idr_rate}")

    # ──────────────────────────────────────
    # Public API
    # ──────────────────────────────────────

    def analyze(self, commodity: str, region: str = "kanto", days: int = 30) -> JAMarketResult:
        """Analisis JA market untuk komoditas tertentu."""
        commodity_key = commodity.lower().strip()
        meta = JA_COMMODITY_MOCK.get(commodity_key)
        if not meta:
            # Coba fuzzy match
            for key in JA_COMMODITY_MOCK:
                if commodity_key in key or key in commodity_key:
                    commodity_key = key
                    meta = JA_COMMODITY_MOCK[key]
                    break
        if not meta:
            meta = {"ja_name": commodity, "base_price": 200, "unit": "円/kg", "season_peak": []}

        # Generate historical data (mock production-grade)
        history = self._generate_history(meta["base_price"], days)

        # Compute analytics
        prices = [h["price_jpy"] for h in history]
        volumes = [h["arrival_volume_ton"] for h in history]

        current_price = prices[-1]
        avg_price = sum(prices) / len(prices)

        # Moving averages
        ma_7  = sum(prices[-7:]) / min(7, len(prices))
        ma_30 = sum(prices) / len(prices)

        # Changes
        chg_1d  = ((prices[-1] - prices[-2]) / prices[-2] * 100) if len(prices) >= 2 else 0.0
        chg_7d  = ((prices[-1] - prices[-7]) / prices[-7] * 100) if len(prices) >= 7 else 0.0
        chg_30d = ((prices[-1] - prices[0])  / prices[0]  * 100) if len(prices) > 0 else 0.0

        # Volatility (std dev / mean * 100)
        import statistics
        vol = (statistics.stdev(prices) / avg_price * 100) if len(prices) > 1 else 0.0

        # Trend
        trend_dir, trend_str = self._determine_trend(prices)

        # Seasonal check
        now_month = datetime.now().month
        is_peak = now_month in meta.get("season_peak", [])
        season_note = self._season_note(is_peak, meta.get("season_peak", []), meta["ja_name"])

        # Export opportunity analysis
        export_opp = self._export_opportunity(
            current_price, avg_price, vol, trend_dir, is_peak
        )

        # 7-day forecast (simple trend extrapolation)
        forecast = self._forecast_7d(prices, volumes)

        return JAMarketResult(
            commodity_id=commodity_key,
            commodity_ja=meta["ja_name"],
            commodity_id_name=commodity_key.title(),
            current_price_jpy=round(current_price, 1),
            price_idr_estimate=round(current_price * self.jpy_idr_rate, 0),
            jpy_idr_rate=self.jpy_idr_rate,
            current_arrival_ton=round(volumes[-1], 1),
            avg_arrival_30d_ton=round(sum(volumes) / len(volumes), 1),
            trend_direction=trend_dir,
            trend_strength=trend_str,
            price_change_1d_pct=round(chg_1d, 2),
            price_change_7d_pct=round(chg_7d, 2),
            price_change_30d_pct=round(chg_30d, 2),
            volatility_30d_pct=round(vol, 2),
            ma_7d=round(ma_7, 1),
            ma_30d=round(ma_30, 1),
            price_min_30d=round(min(prices), 1),
            price_max_30d=round(max(prices), 1),
            price_avg_30d=round(avg_price, 1),
            is_peak_season=is_peak,
            season_note=season_note,
            peak_months=meta.get("season_peak", []),
            history_30d=history,
            export_opportunity=export_opp,
            price_forecast_7d=forecast,
            data_source="JA農協 Market Data (Mock/Estimated)",
            analysis_timestamp=datetime.now().isoformat(),
            region=JA_MARKET_REGIONS.get(region, region),
        )

    def analyze_from_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse dict input → analyze → return dict (untuk API)."""
        try:
            commodity = data.get("commodity", "wortel")
            region    = data.get("region", "kanto")
            days      = min(int(data.get("days", 30)), 365)
            jpy_rate  = float(data.get("jpy_idr_rate", self.jpy_idr_rate))
            self.jpy_idr_rate = jpy_rate

            result = self.analyze(commodity, region, days)
            return {"success": True, "data": asdict(result)}
        except Exception as e:
            logger.error(f"JA Market Intel error: {e}")
            return {"success": False, "error": str(e)}

    def scrape_ja_price(self, commodity_ja: str) -> Optional[float]:
        """
        Scrape harga JA dari web. Fallback ke mock jika gagal.
        Target: https://www.ja-net.jp/information/price
        """
        try:
            import urllib.request
            # Attempt real scraping (ganti URL sesuai target)
            url = f"https://www.vegemap.naro.go.jp/agri/agri_menu.asp"
            headers = {
                "User-Agent": "Mozilla/5.0 (AgriSensa Market Intel Bot)",
                "Accept-Language": "ja,en;q=0.9",
            }
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as resp:
                html = resp.read().decode("utf-8", errors="ignore")
                # Extract price with regex (adjust pattern per target site)
                pattern = rf"{re.escape(commodity_ja)}.*?(\d+)円"
                match = re.search(pattern, html, re.DOTALL)
                if match:
                    return float(match.group(1))
        except Exception as e:
            logger.debug(f"Scraping failed, using mock: {e}")
        return None

    # ──────────────────────────────────────
    # Private helpers
    # ──────────────────────────────────────

    def _generate_history(self, base_price: float, days: int) -> List[Dict]:
        """Generate historical price data (mock dengan realistic variation)."""
        import random
        random.seed(int(base_price))
        history = []
        price = base_price
        volume = 1200.0

        today = datetime.now()
        for i in range(days, 0, -1):
            date = today - timedelta(days=i)
            # Random walk with mean reversion
            shock_price  = random.gauss(0, 0.015)  # ±1.5% daily
            shock_volume = random.gauss(0, 0.08)   # ±8% daily volume
            price  = max(base_price * 0.5, price  * (1 + shock_price))
            volume = max(100, volume * (1 + shock_volume))

            # Weekend effect (lower volume)
            if date.weekday() >= 5:
                volume *= 0.3

            history.append({
                "date": date.strftime("%Y-%m-%d"),
                "weekday_ja": ["月", "火", "水", "木", "金", "土", "日"][date.weekday()],
                "price_jpy": round(price, 1),
                "price_idr": round(price * self.jpy_idr_rate, 0),
                "arrival_volume_ton": round(volume, 1),
            })
        return history

    @staticmethod
    def _determine_trend(prices: List[float]):
        if len(prices) < 5:
            return "stabil", "lemah"
        # Simple linear regression slope
        n = len(prices)
        x = list(range(n))
        x_mean = sum(x) / n
        y_mean = sum(prices) / n
        slope = sum((xi - x_mean) * (yi - y_mean) for xi, yi in zip(x, prices)) / \
                sum((xi - x_mean) ** 2 for xi in x)
        slope_pct = slope / y_mean * 100  # % per day
        if slope_pct > 0.5:
            return "naik",  "kuat" if slope_pct > 1.5 else "sedang"
        elif slope_pct < -0.5:
            return "turun", "kuat" if slope_pct < -1.5 else "sedang"
        return "stabil", "lemah"

    @staticmethod
    def _season_note(is_peak: bool, peak_months: List[int], ja_name: str) -> str:
        bulan_id = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]
        bulan_ja = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"]
        peak_str_id = ", ".join(bulan_id[m-1] for m in peak_months)
        peak_str_ja = "".join(bulan_ja[m-1] for m in peak_months)
        if is_peak:
            return f"🟢 Sedang musim puncak {ja_name}。ピークシーズン中 ({peak_str_ja})"
        else:
            return f"🔵 Di luar musim puncak. Puncak pada: {peak_str_id} / {peak_str_ja}"

    @staticmethod
    def _export_opportunity(price: float, avg: float, vol: float,
                            trend: str, is_peak: bool) -> str:
        score = 0
        if price > avg * 1.1: score += 2
        if trend == "naik":   score += 2
        if vol < 15:          score += 1   # Volatilitas rendah = stabil
        if is_peak:           score += 1

        if score >= 5:
            return "🟢 PELUANG TINGGI — Harga premium, tren naik, pasar stabil. Waktu ideal ekspor."
        elif score >= 3:
            return "🟡 PELUANG SEDANG — Kondisi pasar cukup baik. Monitor volatilitas."
        else:
            return "🔴 PELUANG RENDAH — Harga di bawah rata-rata atau volatilitas tinggi. Tunggu."

    
    def get_trusted_sources(self) -> Dict[str, Dict[str, str]]:
        """Mengembalikan direktori lengkap sumber data resmi Indonesia dan Jepang."""
        return {
            "indonesia": {
                "bapanas_panel_harga": "https://panelharga.badanpangan.go.id",
                "bi_pihps_nasional": "https://www.bi.go.id/hargapangan",
                "pasar_jaya_jakarta": "https://infopangan.jakarta.go.id",
                "cybex_kementan": "http://cybex.pertanian.go.id",
                "brin_litbang_repo": "https://repository.pertanian.go.id",
                "bmkg_agroklimat": "https://iklim.bmkg.go.id",
                "katam_litbang": "http://katam.litbang.pertanian.go.id",
            },
            "japan": {
                "ja_group_official": "https://life.ja-group.jp/farm/market/",
                "opengov_market_prices": "https://opengov.jp/en/prices/vegetable-market/31700/",
                "agrine_smart_farming": "https://agrine.jp/",
            }
        }

    def scrape_opengov_market_data(self, url: str = OPENGOV_VEGETABLE_MARKET_URL) -> Dict[str, Any]:
        """Scrape & parsing harga sayuran dari OpenGov Jepang."""
        from .web_scraper import WebScraper
        scraper = WebScraper()
        res = scraper.scrape_from_dict({"url": url, "extract_tables": True})
        if res.get("success"):
            return {
                "source": "OpenGov Japan Vegetable Market",
                "url": url,
                "data": res.get("data", {}),
                "timestamp": datetime.now().isoformat()
            }
        return {"source": "OpenGov Japan", "url": url, "error": res.get("error")}

    def _forecast_7d(self, prices: List[float], volumes: List[float]) -> List[Dict]:
        """Prediksi harga 7 hari ke depan menggunakan linear trend."""
        n = len(prices)
        if n < 7:
            return []
        # Simple linear regression
        x = list(range(n))
        x_mean = sum(x) / n
        y_mean = sum(prices) / n
        slope = sum((xi - x_mean) * (yi - y_mean) for xi, yi in zip(x, prices)) / \
                (sum((xi - x_mean) ** 2 for xi in x) or 1)

        today = datetime.now()
        forecast = []
        for i in range(1, 8):
            pred_price = y_mean + slope * (n + i - 1 - x_mean)
            pred_price = max(0, pred_price)
            forecast.append({
                "date": (today + timedelta(days=i)).strftime("%Y-%m-%d"),
                "predicted_price_jpy": round(pred_price, 1),
                "predicted_price_idr": round(pred_price * self.jpy_idr_rate, 0),
                "confidence": "medium",
                "day": i,
            })
        return forecast


# ─────────────────────────────────────────────────────────────────────────────
# Standalone
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import json
    engine = JaMarketIntelEngine()
    result = engine.analyze_from_dict({"commodity": "wortel", "region": "kanto", "days": 30})
    d = result["data"]
    print(f"✅ JA Market: {d['commodity_ja']} ({d['commodity_id_name']})")
    print(f"   Harga: ¥{d['current_price_jpy']}/kg ≈ Rp{d['price_idr_estimate']:,.0f}/kg")
    print(f"   Tren: {d['trend_direction']} ({d['trend_strength']})")
    print(f"   Volatilitas 30d: {d['volatility_30d_pct']}%")
    print(f"   入荷量: {d['current_arrival_ton']} ton")
    print(f"   Peluang Ekspor: {d['export_opportunity']}")
