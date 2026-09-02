"""
AgriSensa Web Scraper (Firecrawl MCP Tool)
=========================================
Modul Web Scraping untuk mengambil konten dari web pertanian:
- BAPANAS (Badan Pangan Nasional)
- JA (Japan Agriculture / 日本農協)
- Kementan RI / Portal Pertanian
- Berita & Dokumen Web lainnya

Prioritas Scraper:
1. Firecrawl API (`firecrawl-py`) jika FIRECRAWL_API_KEY tersedia
2. Fallback: `httpx` + `BeautifulSoup4` (clean markdown / text extractor)
"""

import os
import re
import json
import logging
import time
from dataclasses import dataclass, field, asdict
from typing import Any, Dict, List, Optional
from datetime import datetime

from dotenv import load_dotenv

# Load .env if present
load_dotenv()
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env"))
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env"))

logger = logging.getLogger("agrisensa.web_scraper")

# ─────────────────────────────────────────────────────────────────────────────
# Firecrawl Check
# ─────────────────────────────────────────────────────────────────────────────
FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY", "")
try:
    from firecrawl import FirecrawlApp
    FIRECRAWL_AVAILABLE = bool(FIRECRAWL_API_KEY)
    if FIRECRAWL_AVAILABLE:
        logger.info("FirecrawlApp available with API key")
except ImportError:
    FirecrawlApp = None
    FIRECRAWL_AVAILABLE = False

try:
    from bs4 import BeautifulSoup
    BS4_AVAILABLE = True
except ImportError:
    BS4_AVAILABLE = False

try:
    import httpx
    HTTPX_AVAILABLE = True
except ImportError:
    HTTPX_AVAILABLE = False


@dataclass
class ScrapeResult:
    url: str
    title: str
    markdown_content: str
    text_content: str
    extracted_tables: List[List[List[str]]]
    prices_found: List[str]
    metadata: Dict[str, Any]
    engine_used: str
    elapsed_seconds: float
    timestamp: str


class WebScraper:
    """
    AgriSensa Web Scraper:
    Mendukung Firecrawl (Cloud Scraping/Crawl) dan Native Fallback (httpx + bs4).
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("FIRECRAWL_API_KEY", "")
        self.firecrawl_client = None
        if self.api_key and FirecrawlApp:
            try:
                self.firecrawl_client = FirecrawlApp(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Failed to init FirecrawlApp: {e}")

    def scrape_url(self, url: str, extract_tables: bool = True) -> ScrapeResult:
        """Scrape single URL."""
        t0 = time.perf_counter()
        logger.info(f"Scraping URL: {url}")

        if self.firecrawl_client:
            try:
                # Firecrawl API (v1 / v2 / v4 compatible)
                res = None
                if hasattr(self.firecrawl_client, "scrape"):
                    res = self.firecrawl_client.scrape(url, formats=["markdown", "html"])
                elif hasattr(self.firecrawl_client, "scrape_url"):
                    try:
                        res = self.firecrawl_client.scrape_url(url, formats=["markdown", "html"])
                    except TypeError:
                        res = self.firecrawl_client.scrape_url(url, params={"formats": ["markdown", "html"]})

                if res:
                    # Handle both object attributes (Document) and dictionary returns
                    if hasattr(res, "markdown"):
                        md = res.markdown or ""
                        meta = res.metadata if hasattr(res, "metadata") else {}
                        meta_dict = meta.__dict__ if hasattr(meta, "__dict__") else (meta if isinstance(meta, dict) else {})
                        title = getattr(meta, "title", None) or meta_dict.get("title", "") or url
                        text = getattr(res, "text", None) or md
                    elif isinstance(res, dict):
                        md = res.get("markdown", "")
                        meta_dict = res.get("metadata", {})
                        title = meta_dict.get("title", "") or url
                        text = res.get("text", "") or md
                    else:
                        md = str(res)
                        meta_dict = {}
                        title = url
                        text = md

                    tables = self._extract_tables_from_markdown(md) if extract_tables else []
                    prices = self._extract_prices(text)

                    return ScrapeResult(
                        url=url,
                        title=str(title),
                        markdown_content=md,
                        text_content=text[:10000],
                        extracted_tables=tables,
                        prices_found=prices,
                        metadata=meta_dict if isinstance(meta_dict, dict) else {},
                        engine_used="firecrawl",
                        elapsed_seconds=round(time.perf_counter() - t0, 3),
                        timestamp=datetime.now().isoformat(),
                    )
            except Exception as e:
                logger.warning(f"Firecrawl scrape failed for {url}: {e}, using native fallback")

        # Native Fallback (httpx + BeautifulSoup)
        return self._native_scrape(url, extract_tables, t0)

    def _native_scrape(self, url: str, extract_tables: bool, t0: float) -> ScrapeResult:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AgriSensa/2.0 (WebScraper)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "id,ja,en;q=0.9",
        }
        content = ""
        try:
            if HTTPX_AVAILABLE:
                with httpx.Client(timeout=20.0, follow_redirects=True, headers=headers) as client:
                    resp = client.get(url)
                    resp.raise_for_status()
                    content = resp.text
            else:
                import urllib.request
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=20) as resp:
                    content = resp.read().decode("utf-8", errors="ignore")
        except Exception as e:
            logger.error(f"Native fetch failed for {url}: {e}")
            content = f"<html><body><p>Gagal mengambil URL: {url} ({str(e)})</p></body></html>"

        title = url
        text_content = ""
        markdown_content = ""
        tables = []

        if BS4_AVAILABLE and content:
            soup = BeautifulSoup(content, "html.parser")
            for tag in soup(["script", "style", "nav", "footer", "header", "noscript"]):
                tag.decompose()

            if soup.title:
                title = soup.title.string or url

            text_content = soup.get_text(separator="\n", strip=True)
            markdown_content = self._html_to_simple_markdown(soup)

            if extract_tables:
                tables = self._extract_tables_from_soup(soup)
        else:
            text_content = re.sub(r"<[^>]+>", " ", content)
            markdown_content = text_content

        prices = self._extract_prices(text_content)

        return ScrapeResult(
            url=url,
            title=title.strip(),
            markdown_content=markdown_content[:20000],
            text_content=text_content[:10000],
            extracted_tables=tables,
            prices_found=prices,
            metadata={"source": "native_httpx_bs4"},
            engine_used="native_bs4",
            elapsed_seconds=round(time.perf_counter() - t0, 3),
            timestamp=datetime.now().isoformat(),
        )

    def scrape_from_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """API wrapper."""
        url = data.get("url", "")
        if not url:
            return {"success": False, "error": "URL wajib diisi"}
        try:
            res = self.scrape_url(url, extract_tables=data.get("extract_tables", True))
            return {"success": True, "data": asdict(res)}
        except Exception as e:
            logger.error(f"Scrape error: {e}")
            return {"success": False, "error": str(e)}

    @staticmethod
    def _extract_prices(text: str) -> List[str]:
        idr = re.findall(r"Rp[\s]?[\d.,]+(?:\s*(?:ribu|juta|rb|jt|/kg|/ton))?", text, re.IGNORECASE)
        jpy = re.findall(r"[¥円][\s]?[\d.,]+(?:\s*(?:/kg|/トン))?", text)
        found = list(set([p.strip() for p in idr + jpy if len(p.strip()) > 3]))
        return found[:15]

    @staticmethod
    def _extract_tables_from_soup(soup) -> List[List[List[str]]]:
        extracted = []
        for table in soup.find_all("table")[:5]:
            rows = []
            for tr in table.find_all("tr"):
                cells = [td.get_text(strip=True) for td in tr.find_all(["th", "td"])]
                if cells:
                    rows.append(cells)
            if rows:
                extracted.append(rows)
        return extracted

    @staticmethod
    def _extract_tables_from_markdown(md: str) -> List[List[List[str]]]:
        tables = []
        lines = md.splitlines()
        current_table = []
        in_table = False
        for line in lines:
            if "|" in line:
                in_table = True
                cells = [c.strip() for c in line.split("|")[1:-1]]
                if cells and not all(re.match(r"^:?-+:?$", c) for c in cells):
                    current_table.append(cells)
            else:
                if in_table and current_table:
                    tables.append(current_table)
                    current_table = []
                in_table = False
        if current_table:
            tables.append(current_table)
        return tables

    @staticmethod
    def _html_to_simple_markdown(soup) -> str:
        lines = []
        for elem in soup.find_all(["h1", "h2", "h3", "p", "li"]):
            txt = elem.get_text(strip=True)
            if not txt:
                continue
            if elem.name == "h1":
                lines.append(f"# {txt}\n")
            elif elem.name == "h2":
                lines.append(f"## {txt}\n")
            elif elem.name == "h3":
                lines.append(f"### {txt}\n")
            elif elem.name == "li":
                lines.append(f"- {txt}")
            else:
                lines.append(f"{txt}\n")
        return "\n".join(lines)


if __name__ == "__main__":
    scraper = WebScraper()
    res = scraper.scrape_from_dict({"url": "https://panelharga.badanpangan.go.id"})
    print(f"Scrape result: success={res['success']}, engine={res.get('data', {}).get('engine_used')}")
