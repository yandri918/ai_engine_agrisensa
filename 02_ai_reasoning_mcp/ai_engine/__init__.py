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
8. supply_chain      - Supply Chain & QR Passport Traceability

MCP Tools:
9. search_engine     - DuckDuckGo MCP Search Tool
10. web_scraper      - Firecrawl / Native Scraper Tool
11. document_parser  - Document Fetcher & Parser (PDF/DOCX/XLSX/CSV)
12. chart_engine     - Industry Standard Chart Visualization (Plotly & ECharts)
"""

from .rab_engine        import RABEngine, RABInput, RABResult
from .monte_carlo       import MonteCarloEngine, MonteCarloInput, MonteCarloResult
from .market_intel      import JaMarketIntelEngine, JAMarketResult
from .carbon_model      import CarbonModel, CarbonInput, CarbonResult
from .forecasting_model import ForecastingModel, ForecastInput, ForecastResult
from .language_switch   import LanguageSwitchEngine, LanguageSwitchResult
from .pdf_generator     import PDFGenerator
from .supply_chain      import SupplyChainEngine

# MCP Tools & Intelligence
from .search_engine     import SearchEngine, SearchResult, SearchEngineResult
from .web_scraper       import WebScraper, ScrapeResult
from .document_parser   import DocumentParser, ParsedDocumentResult
from .chart_engine      import ChartEngine
from .data_analyst      import DataAnalystEngine, ExecutiveInsight
from .fertilizer_engine import FertilizerEngine, ORGANIC_MATERIALS_DB, INORGANIC_FERTILIZERS_DB, RECIPES_DATABASE

__all__ = [
    "RABEngine", "RABInput", "RABResult",
    "MonteCarloEngine", "MonteCarloInput", "MonteCarloResult",
    "JaMarketIntelEngine", "JAMarketResult",
    "CarbonModel", "CarbonInput", "CarbonResult",
    "ForecastingModel", "ForecastInput", "ForecastResult",
    "LanguageSwitchEngine", "LanguageSwitchResult",
    "PDFGenerator",
    "SupplyChainEngine",
    # MCP Tools & Intelligence
    "SearchEngine", "SearchResult", "SearchEngineResult",
    "WebScraper", "ScrapeResult",
    "DocumentParser", "ParsedDocumentResult",
    "ChartEngine",
    "DataAnalystEngine", "ExecutiveInsight",
    "FertilizerEngine", "ORGANIC_MATERIALS_DB", "INORGANIC_FERTILIZERS_DB", "RECIPES_DATABASE",
]

__version__ = "2.3.0"
