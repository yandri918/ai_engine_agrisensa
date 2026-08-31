"""
AgriSensa Advanced AI Engine & MCP Package
==========================================
Core Modules:
1. rab_engine        - RAB + ROI/BEP/MOS/TCR
2. monte_carlo       - 10.000 iterasi simulasi
3. market_intel      - JA Market Intelligence
4. carbon_model      - CO2 & Carbon Offset
5. forecasting_model - Prediksi yield & harga
6. language_switch   - MCP ID ↔ JA
7. pdf_generator     - Laporan PDF bilingual

MCP Tools:
8. search_engine     - DuckDuckGo MCP Search Tool
9. web_scraper       - Firecrawl / Native Scraper Tool
10. document_parser  - Document Fetcher & Parser (PDF/DOCX/XLSX/CSV)
11. chart_engine     - Industry Standard Chart Visualization (Plotly & ECharts)
"""

from .rab_engine        import RABEngine, RABInput, RABResult
from .monte_carlo       import MonteCarloEngine, MonteCarloInput, MonteCarloResult
from .market_intel      import JaMarketIntelEngine, JAMarketResult
from .carbon_model      import CarbonModel, CarbonInput, CarbonResult
from .forecasting_model import ForecastingModel, ForecastInput, ForecastResult
from .language_switch   import LanguageSwitchEngine, LanguageSwitchResult
from .pdf_generator     import PDFGenerator

# MCP Tools
from .search_engine     import SearchEngine, SearchResult, SearchEngineResult
from .web_scraper       import WebScraper, ScrapeResult
from .document_parser   import DocumentParser, ParsedDocumentResult
from .chart_engine      import ChartEngine

__all__ = [
    "RABEngine", "RABInput", "RABResult",
    "MonteCarloEngine", "MonteCarloInput", "MonteCarloResult",
    "JaMarketIntelEngine", "JAMarketResult",
    "CarbonModel", "CarbonInput", "CarbonResult",
    "ForecastingModel", "ForecastInput", "ForecastResult",
    "LanguageSwitchEngine", "LanguageSwitchResult",
    "PDFGenerator",
    # MCP Tools
    "SearchEngine", "SearchResult", "SearchEngineResult",
    "WebScraper", "ScrapeResult",
    "DocumentParser", "ParsedDocumentResult",
    "ChartEngine",
]

__version__ = "2.1.0"
