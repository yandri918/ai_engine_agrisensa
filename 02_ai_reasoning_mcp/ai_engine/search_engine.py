"""
AgriSensa DuckDuckGo Search Engine (MCP Tool)
=============================================
Tool pencarian web berbasis DuckDuckGo untuk AgriSensa:
- Riset harga komoditas terkini
- Berita pertanian & kebijakan pemerintah
- Data pasar JA (Japan Agriculture)
- Informasi cuaca & iklim
- Pencarian regulasi ekspor/impor

Package: duckduckgo-search (gratis, tanpa API key)
Fallback: urllib scraping jika duckduckgo-search tidak tersedia

Output:
- Hasil search terstruktur (title, url, snippet)
- AI Summarization via Gemini
- Extraction key facts (harga, tanggal, lokasi)
"""

import os
import re
import json
import logging
import time
from dataclasses import dataclass, field, asdict
from typing import Any, Dict, List, Optional
from datetime import datetime

logger = logging.getLogger("agrisensa.search_engine")

# ─────────────────────────────────────────────────────────────────────────────
# Check DuckDuckGo availability
# ─────────────────────────────────────────────────────────────────────────────

try:
    from duckduckgo_search import DDGS
    DDG_AVAILABLE = True
    logger.info("duckduckgo-search available")
except ImportError:
    DDGS = None
    DDG_AVAILABLE = False
    logger.warning("duckduckgo-search not installed → using fallback. pip install duckduckgo-search")


# ─────────────────────────────────────────────────────────────────────────────
# Search Query Templates for Agriculture
# ─────────────────────────────────────────────────────────────────────────────

SEARCH_TEMPLATES = {
    "harga_komoditas": "{komoditas} harga terkini Indonesia {tahun}",
    "harga_ekspor": "{komoditas} harga ekspor Indonesia Jepang {tahun}",
    "berita_pertanian": "berita pertanian Indonesia {komoditas} terbaru",
    "regulasi": "regulasi ekspor {komoditas} Indonesia {tahun}",
    "cuaca": "prakiraan cuaca pertanian {lokasi} {bulan}",
    "ja_market": "{komoditas} JA Japan price 農協 {tahun}",
    "carbon": "carbon footprint pertanian {komoditas} Indonesia",
    "teknologi": "teknologi pertanian {komoditas} terbaru",
    "custom": "{query}",
}

# Key data extractors (regex patterns)
PRICE_PATTERN   = re.compile(r"Rp[\s]?([\d.,]+(?:\s*(?:ribu|juta|rb|jt))?)", re.IGNORECASE)
DATE_PATTERN    = re.compile(r"\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}-\d{2}-\d{2}")
PERCENT_PATTERN = re.compile(r"([\d.,]+)\s*%")
JPY_PATTERN     = re.compile(r"[¥円]([\d.,]+)")


# ─────────────────────────────────────────────────────────────────────────────
# Data Classes
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class SearchResult:
    """Satu hasil pencarian."""
    rank: int
    title: str
    url: str
    snippet: str
    source: str          # domain name
    published: Optional[str] = None
    # Extracted facts
    prices_idr: List[str] = field(default_factory=list)
    prices_jpy: List[str] = field(default_factory=list)
    percentages: List[str] = field(default_factory=list)


@dataclass
class SearchEngineResult:
    """Hasil lengkap pencarian DuckDuckGo."""
    query: str
    query_type: str
    results_count: int
    results: List[SearchResult]
    # AI-generated summary
    ai_summary: str
    key_facts: List[str]
    # Extracted data
    prices_found: List[str]
    urls_found: List[str]
    # Metadata
    search_backend: str
    elapsed_seconds: float
    timestamp: str
    language: str


# ─────────────────────────────────────────────────────────────────────────────
# Core Engine
# ─────────────────────────────────────────────────────────────────────────────

class SearchEngine:
    """
    DuckDuckGo Search Engine for AgriSensa.
    Gratis, tanpa API key, mendukung pencarian berita & web.
    """

    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")
        self.backend = "duckduckgo" if DDG_AVAILABLE else "urllib-fallback"
        logger.info(f"SearchEngine init, backend={self.backend}")

    # ──────────────────────────────────────
    # Public API
    # ──────────────────────────────────────

    def search(self, query: str, query_type: str = "custom",
               max_results: int = 10, language: str = "id",
               region: str = "id-id") -> SearchEngineResult:
        """
        Jalankan pencarian DuckDuckGo.
        query_type: "harga_komoditas" | "ja_market" | "berita_pertanian" | "custom" | dll
        """
        t0 = time.perf_counter()

        # Build query dari template
        final_query = self._build_query(query, query_type)
        logger.info(f"Searching: '{final_query}' (backend={self.backend})")

        # Execute search
        if DDG_AVAILABLE:
            raw_results = self._search_ddg(final_query, max_results, region)
        else:
            raw_results = self._search_fallback(final_query, max_results)

        # Parse results
        parsed = []
        all_prices = []
        all_urls   = []

        for i, r in enumerate(raw_results):
            title   = r.get("title", "")
            url     = r.get("href", r.get("url", ""))
            snippet = r.get("body", r.get("snippet", ""))

            prices_idr = PRICE_PATTERN.findall(snippet + " " + title)
            prices_jpy = JPY_PATTERN.findall(snippet + " " + title)
            pcts       = PERCENT_PATTERN.findall(snippet)

            all_prices.extend([f"Rp{p}" for p in prices_idr])
            all_prices.extend([f"¥{p}" for p in prices_jpy])
            all_urls.append(url)

            parsed.append(SearchResult(
                rank=i + 1,
                title=title,
                url=url,
                snippet=snippet[:500],
                source=self._extract_domain(url),
                published=r.get("date", None),
                prices_idr=[f"Rp{p}" for p in prices_idr],
                prices_jpy=[f"¥{p}" for p in prices_jpy],
                percentages=[f"{p}%" for p in pcts],
            ))

        # AI Summary
        ai_summary, key_facts = self._summarize_with_gemini(
            final_query, parsed, language
        )

        elapsed = time.perf_counter() - t0
        return SearchEngineResult(
            query=final_query,
            query_type=query_type,
            results_count=len(parsed),
            results=parsed,
            ai_summary=ai_summary,
            key_facts=key_facts,
            prices_found=list(set(all_prices))[:20],
            urls_found=all_urls,
            search_backend=self.backend,
            elapsed_seconds=round(elapsed, 3),
            timestamp=datetime.now().isoformat(),
            language=language,
        )

    def search_from_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """API wrapper."""
        try:
            result = self.search(
                query=data.get("query", ""),
                query_type=data.get("query_type", "custom"),
                max_results=min(int(data.get("max_results", 10)), 20),
                language=data.get("language", "id"),
                region=data.get("region", "id-id"),
            )
            return {"success": True, "data": asdict(result)}
        except Exception as e:
            logger.error(f"Search error: {e}")
            return {"success": False, "error": str(e)}

    def search_agriculture_news(self, komoditas: str, days: int = 7) -> Dict[str, Any]:
        """Shortcut: Cari berita pertanian untuk komoditas tertentu."""
        query = f"harga {komoditas} Indonesia terkini berita pertanian {datetime.now().year}"
        return self.search_from_dict({
            "query": query,
            "query_type": "berita_pertanian",
            "max_results": 10,
        })

    def search_ja_market(self, komoditas_ja: str) -> Dict[str, Any]:
        """Shortcut: Cari harga JA Japan untuk komoditas."""
        query = f"{komoditas_ja} 市場価格 JA農協 入荷量 {datetime.now().year}"
        return self.search_from_dict({
            "query": query,
            "query_type": "ja_market",
            "max_results": 8,
            "region": "jp-jp",
        })

    # ──────────────────────────────────────
    # Private helpers
    # ──────────────────────────────────────

    def _search_ddg(self, query: str, max_results: int, region: str) -> List[Dict]:
        """Search menggunakan duckduckgo-search library."""
        results = []
        try:
            with DDGS() as ddgs:
                # Text search
                text_results = list(ddgs.text(
                    query,
                    region=region,
                    safesearch="moderate",
                    max_results=max_results,
                ))
                results.extend(text_results)

                # Also try news search for recent data
                try:
                    news_results = list(ddgs.news(
                        query,
                        region=region,
                        safesearch="moderate",
                        max_results=min(5, max_results),
                    ))
                    # Merge news with dedup
                    existing_urls = {r.get("href", "") for r in results}
                    for nr in news_results:
                        if nr.get("url", "") not in existing_urls:
                            results.append({
                                "title": nr.get("title", ""),
                                "href": nr.get("url", ""),
                                "body": nr.get("body", ""),
                                "date": nr.get("date", ""),
                            })
                except Exception:
                    pass

        except Exception as e:
            logger.warning(f"DDG search error: {e}")
        return results[:max_results]

    def _search_fallback(self, query: str, max_results: int) -> List[Dict]:
        """Fallback search menggunakan urllib (basic DuckDuckGo HTML)."""
        import urllib.request
        import urllib.parse
        import html
        from html.parser import HTMLParser

        results = []
        try:
            encoded = urllib.parse.quote_plus(query)
            url = f"https://html.duckduckgo.com/html/?q={encoded}&kl=id-id"
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AgriSensa/2.0",
                    "Accept-Language": "id,en;q=0.9",
                }
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                content = resp.read().decode("utf-8", errors="ignore")

            # Simple regex extraction
            title_pat   = re.compile(r'class="result__title"[^>]*>.*?<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>', re.DOTALL)
            snippet_pat = re.compile(r'class="result__snippet"[^>]*>(.*?)</div>', re.DOTALL)

            titles   = title_pat.findall(content)
            snippets = [re.sub(r"<[^>]+>", "", s) for s in snippet_pat.findall(content)]

            for i, (href, title) in enumerate(titles[:max_results]):
                snippet = snippets[i] if i < len(snippets) else ""
                results.append({
                    "title": html.unescape(re.sub(r"<[^>]+>", "", title)).strip(),
                    "href": href,
                    "body": html.unescape(snippet).strip(),
                })
        except Exception as e:
            logger.warning(f"Fallback search error: {e}")
            # Last resort: return mock result
            results = [{
                "title": f"Pencarian: {query}",
                "href": f"https://duckduckgo.com/?q={urllib.parse.quote_plus(query)}",
                "body": "Hasil pencarian tidak tersedia. Install duckduckgo-search: pip install duckduckgo-search",
            }]
        return results

    def _summarize_with_gemini(self, query: str, results: List[SearchResult],
                                language: str) -> tuple:
        """Ringkas hasil pencarian dengan Gemini AI."""
        if not self.gemini_api_key or not results:
            # Generate basic summary without AI
            summary = self._basic_summary(query, results, language)
            facts = self._extract_key_facts(results)
            return summary, facts

        try:
            import urllib.request
            snippets = "\n\n".join([
                f"[{r.rank}] {r.title}\n{r.snippet}"
                for r in results[:5]
            ])
            lang_name = "Bahasa Indonesia" if language == "id" else "日本語"
            prompt = (
                f"Anda adalah analis AgriSensa. Berikan ringkasan dalam {lang_name} "
                f"dari hasil pencarian berikut tentang '{query}':\n\n{snippets}\n\n"
                f"Fokus pada: harga, tren, informasi penting untuk petani. "
                f"Maksimal 3 paragraf singkat."
            )
            payload = json.dumps({
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 600}
            }).encode()
            req = urllib.request.Request(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.gemini_api_key}",
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=20) as resp:
                gemini_resp = json.loads(resp.read())
                summary_text = gemini_resp["candidates"][0]["content"]["parts"][0]["text"]
            facts = self._extract_key_facts(results)
            return summary_text, facts
        except Exception as e:
            logger.warning(f"Gemini summarize failed: {e}")
            return self._basic_summary(query, results, language), self._extract_key_facts(results)

    @staticmethod
    def _basic_summary(query: str, results: List[SearchResult], language: str) -> str:
        if not results:
            return f"Tidak ditemukan hasil untuk: {query}"
        count = len(results)
        sources = ", ".join(set(r.source for r in results[:3]))
        if language == "id":
            return (f"Ditemukan {count} hasil pencarian untuk '{query}'. "
                    f"Sumber utama: {sources}. "
                    f"Ringkasan: {results[0].snippet[:200]}...")
        return (f"{query}について{count}件の検索結果が見つかりました。"
                f"主なソース: {sources}。")

    @staticmethod
    def _extract_key_facts(results: List[SearchResult]) -> List[str]:
        facts = []
        all_prices = []
        for r in results:
            all_prices.extend(r.prices_idr)
            all_prices.extend(r.prices_jpy)
        if all_prices:
            facts.append(f"Harga ditemukan: {', '.join(all_prices[:5])}")
        if results:
            facts.append(f"Sumber terpercaya: {results[0].source}")
            if results[0].published:
                facts.append(f"Tanggal terbaru: {results[0].published}")
        return facts

    @staticmethod
    def _build_query(query: str, query_type: str) -> str:
        template = SEARCH_TEMPLATES.get(query_type, "{query}")
        return template.format(
            query=query,
            komoditas=query,
            tahun=datetime.now().year,
            bulan=datetime.now().strftime("%B"),
            lokasi="Indonesia",
        )

    @staticmethod
    def _extract_domain(url: str) -> str:
        try:
            from urllib.parse import urlparse
            return urlparse(url).netloc.replace("www.", "")
        except Exception:
            return url[:30]


# ─────────────────────────────────────────────────────────────────────────────
# Standalone
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    engine = SearchEngine()
    r = engine.search_from_dict({
        "query": "harga padi sawah Indonesia terbaru",
        "query_type": "harga_komoditas",
        "max_results": 5,
    })
    d = r.get("data", {})
    print(f"✅ Search: '{d.get('query')}'")
    print(f"   Backend: {d.get('search_backend')}")
    print(f"   Results: {d.get('results_count')}")
    print(f"   Summary: {d.get('ai_summary', '')[:150]}...")
    print(f"   Prices: {d.get('prices_found', [])[:3]}")
