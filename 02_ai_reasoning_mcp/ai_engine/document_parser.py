"""
AgriSensa Document Parser & Fetcher (MCP Tool)
=============================================
Modul pengolah & ekstraksi dokumen untuk AgriSensa:
- Parse PDF (fitur: PyMuPDF / pypdf fallback)
- Parse Word .docx (python-docx)
- Parse Excel .xlsx / .xls (openpyxl / pandas)
- Parse CSV / TSV (pandas / csv)
- Fetch & Parse URL (PDF/HTML via WebScraper)
- Ekstraksi tabel keuangan & angka metrik pertanian (RAB, harga, luas, yield)
- Gemini AI Summarization & Key Insights extraction
"""

import os
import io
import re
import csv
import json
import logging
import time
import base64
from dataclasses import dataclass, field, asdict
from typing import Any, Dict, List, Optional, Union
from datetime import datetime

logger = logging.getLogger("agrisensa.document_parser")

# ─────────────────────────────────────────────────────────────────────────────
# Parser Library Checks
# ─────────────────────────────────────────────────────────────────────────────
try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    fitz = None
    PYMUPDF_AVAILABLE = False

try:
    from pypdf import PdfReader
    PYPDF_AVAILABLE = True
except ImportError:
    PdfReader = None
    PYPDF_AVAILABLE = False

try:
    import docx
    DOCX_AVAILABLE = True
except ImportError:
    docx = None
    DOCX_AVAILABLE = False

try:
    import openpyxl
    OPENPYXL_AVAILABLE = True
except ImportError:
    OPENPYXL_AVAILABLE = False

try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    pd = None
    PANDAS_AVAILABLE = False


@dataclass
class ParsedDocumentResult:
    filename: str
    file_type: str                  # pdf, docx, xlsx, csv, url, text
    total_pages_or_sheets: int
    extracted_text: str
    extracted_tables: List[List[List[str]]]
    extracted_metrics: Dict[str, Any]
    ai_summary: str
    key_findings: List[str]
    processing_time_sec: float
    timestamp: str


class DocumentParser:
    """
    AgriSensa Document Parser & Analyzer.
    Mengekstrak teks, tabel, data keuangan dan metrik pertanian dari berbagai file.
    """

    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")
        logger.info(
            f"DocumentParser init (PyMuPDF={PYMUPDF_AVAILABLE}, docx={DOCX_AVAILABLE}, openpyxl={OPENPYXL_AVAILABLE})"
        )

    def parse_file(
        self,
        file_bytes: bytes,
        filename: str,
        file_type: Optional[str] = None
    ) -> ParsedDocumentResult:
        """Parse file dari bytes (upload)."""
        t0 = time.perf_counter()
        ext = file_type or filename.split(".")[-1].lower()

        text = ""
        tables = []
        pages = 1

        if ext == "pdf":
            text, tables, pages = self._parse_pdf(file_bytes)
        elif ext in ["docx", "doc"]:
            text, tables, pages = self._parse_docx(file_bytes)
        elif ext in ["xlsx", "xls"]:
            text, tables, pages = self._parse_excel(file_bytes)
        elif ext in ["csv", "tsv"]:
            text, tables, pages = self._parse_csv(file_bytes, delimiter="," if ext == "csv" else "\t")
        else:
            # Plain text
            text = file_bytes.decode("utf-8", errors="ignore")

        metrics = self._extract_agricultural_metrics(text)
        ai_summary, findings = self._summarize_with_gemini(filename, text, metrics)

        return ParsedDocumentResult(
            filename=filename,
            file_type=ext,
            total_pages_or_sheets=pages,
            extracted_text=text[:30000],
            extracted_tables=tables[:10],
            extracted_metrics=metrics,
            ai_summary=ai_summary,
            key_findings=findings,
            processing_time_sec=round(time.perf_counter() - t0, 3),
            timestamp=datetime.now().isoformat(),
        )

    def parse_base64(self, b64_content: str, filename: str) -> Dict[str, Any]:
        """Parse base64 uploaded file."""
        try:
            raw_bytes = base64.b64decode(b64_content)
            res = self.parse_file(raw_bytes, filename)
            return {"success": True, "data": asdict(res)}
        except Exception as e:
            logger.error(f"Error parsing base64 file {filename}: {e}")
            return {"success": False, "error": str(e)}

    def parse_from_path(self, file_path: str) -> Dict[str, Any]:
        """Parse file dari file system local."""
        try:
            filename = os.path.basename(file_path)
            with open(file_path, "rb") as f:
                content = f.read()
            res = self.parse_file(content, filename)
            return {"success": True, "data": asdict(res)}
        except Exception as e:
            logger.error(f"Error parsing local file {file_path}: {e}")
            return {"success": False, "error": str(e)}

    # ──────────────────────────────────────
    # Specific format parsers
    # ──────────────────────────────────────

    def _parse_pdf(self, file_bytes: bytes) -> tuple:
        text_chunks = []
        tables = []
        pages = 0

        if PYMUPDF_AVAILABLE:
            try:
                doc = fitz.open(stream=file_bytes, filetype="pdf")
                pages = len(doc)
                for page_num in range(pages):
                    page = doc[page_num]
                    text_chunks.append(f"--- Halaman {page_num + 1} ---\n" + page.get_text())
                    # Extract tables if pymupdf table feature exists
                    try:
                        tabs = page.find_tables()
                        for tab in tabs:
                            tables.append(tab.extract())
                    except Exception:
                        pass
                return "\n".join(text_chunks), tables, pages
            except Exception as e:
                logger.warning(f"PyMuPDF failed, fallback: {e}")

        if PYPDF_AVAILABLE:
            try:
                reader = PdfReader(io.BytesIO(file_bytes))
                pages = len(reader.pages)
                for i, page in enumerate(reader.pages):
                    text_chunks.append(f"--- Halaman {i + 1} ---\n" + (page.extract_text() or ""))
                return "\n".join(text_chunks), tables, pages
            except Exception as e:
                logger.error(f"pypdf failed: {e}")

        return "Gagal mengekstrak teks PDF. Install PyMuPDF: pip install pymupdf", tables, 0

    def _parse_docx(self, file_bytes: bytes) -> tuple:
        if not DOCX_AVAILABLE:
            return "python-docx belum terinstall. Jalankan: pip install python-docx", [], 0
        try:
            doc = docx.Document(io.BytesIO(file_bytes))
            text_lines = [p.text for p in doc.paragraphs if p.text]
            tables = []
            for t in doc.tables:
                rows = []
                for row in t.rows:
                    rows.append([cell.text.strip() for cell in row.cells])
                if rows:
                    tables.append(rows)
            return "\n".join(text_lines), tables, 1
        except Exception as e:
            return f"Error parsing docx: {str(e)}", [], 0

    def _parse_excel(self, file_bytes: bytes) -> tuple:
        if PANDAS_AVAILABLE:
            try:
                excel_file = io.BytesIO(file_bytes)
                xls = pd.ExcelFile(excel_file)
                text_parts = []
                tables = []
                for sheet_name in xls.sheet_names:
                    df = pd.read_excel(xls, sheet_name=sheet_name)
                    text_parts.append(f"=== Sheet: {sheet_name} ===\n" + df.to_string())
                    # Convert to table matrix (string format)
                    matrix = [df.columns.astype(str).tolist()] + df.astype(str).values.tolist()
                    tables.append(matrix[:50])
                return "\n\n".join(text_parts), tables, len(xls.sheet_names)
            except Exception as e:
                logger.warning(f"pandas excel read failed: {e}")

        return "Excel parsing membutuhkan pandas/openpyxl: pip install pandas openpyxl", [], 0

    def _parse_csv(self, file_bytes: bytes, delimiter: str = ",") -> tuple:
        try:
            content = file_bytes.decode("utf-8", errors="ignore")
            reader = csv.reader(io.StringIO(content), delimiter=delimiter)
            rows = list(reader)
            text = "\n".join([", ".join(r) for r in rows[:100]])
            return text, [rows[:100]], 1
        except Exception as e:
            return f"Error parsing CSV: {str(e)}", [], 0

    # ──────────────────────────────────────
    # Agricultural Metric Extractor
    # ──────────────────────────────────────

    @staticmethod
    def _extract_agricultural_metrics(text: str) -> Dict[str, Any]:
        """Ekstraksi metrik penting pertanian secara otomatis."""
        metrics = {
            "biaya_ditemukan": [],
            "luas_ha_ditemukan": [],
            "yield_ditemukan": [],
            "komoditas_disebut": [],
        }

        # Biaya / Rupiah
        prices = re.findall(r"Rp[\s]?[\d.,]+(?:\s*(?:ribu|juta|rb|jt|miliar))?", text, re.IGNORECASE)
        metrics["biaya_ditemukan"] = list(set([p.strip() for p in prices]))[:10]

        # Luas Lahan (ha / m2)
        ha_matches = re.findall(r"(\d+(?:[.,]\d+)?)\s*(?:ha|hektar|hektare)", text, re.IGNORECASE)
        metrics["luas_ha_ditemukan"] = [float(h.replace(",", ".")) for h in ha_matches][:5]

        # Yield (ton/ha, ton)
        yield_matches = re.findall(r"(\d+(?:[.,]\d+)?)\s*(?:ton/ha|t/ha|ton|kg)", text, re.IGNORECASE)
        metrics["yield_ditemukan"] = [float(y.replace(",", ".")) for y in yield_matches][:5]

        # Komoditas
        common_crops = [
            "padi", "cabai", "jagung", "kedelai", "bawang", "tomat", "wortel",
            "kentang", "singkong", "kelapa sawit", "kopi", "kakao", "tebu"
        ]
        found_crops = [c for c in common_crops if re.search(rf"\b{c}\b", text, re.IGNORECASE)]
        metrics["komoditas_disebut"] = found_crops

        return metrics

    def _summarize_with_gemini(self, filename: str, text: str, metrics: Dict[str, Any]) -> tuple:
        """Gunakan Gemini untuk membuat ringkasan eksekutif dokumen."""
        if not self.gemini_api_key or not text or len(text.strip()) < 50:
            return (
                f"Dokumen {filename} berhasil diparsing ({len(text)} karakter). Metrik: {metrics.get('komoditas_disebut', [])}",
                ["Teks berhasil diekstrak.", f"Komoditas ditemukan: {metrics.get('komoditas_disebut', ['-'])}"]
            )

        try:
            import urllib.request
            prompt = (
                f"Anda adalah AI analis dokumen pertanian AgriSensa.\n"
                f"Ringkas dokumen '{filename}' berikut dalam Bahasa Indonesia yang terstruktur dan padat.\n"
                f"Teks Dokumen:\n{text[:6000]}\n\n"
                f"Format output:\n"
                f"1. Ringkasan Eksekutif (2-3 kalimat)\n"
                f"2. 3-5 Temuan / Poin Kunci Utama"
            )

            payload = json.dumps({
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 800}
            }).encode()

            req = urllib.request.Request(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.gemini_api_key}",
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=25) as resp:
                result = json.loads(resp.read())
                summary_raw = result["candidates"][0]["content"]["parts"][0]["text"]

            findings = [line.strip("- •* ") for line in summary_raw.splitlines() if line.strip().startswith(("-", "•", "*", "1.", "2.", "3."))]
            return summary_raw, findings[:5]
        except Exception as e:
            logger.warning(f"Gemini document summarization failed: {e}")
            return (
                f"Dokumen {filename} diproses. Ringkasan otomatis AI sedang tidak tersedia.",
                [f"Panjang teks: {len(text)} karakter", f"Komoditas: {metrics.get('komoditas_disebut', [])}"]
            )


if __name__ == "__main__":
    parser = DocumentParser()
    sample_text = "Laporan RAB Pertanian Padi 2025. Luas lahan 2.5 ha. Total biaya produksi Rp 35.000.000. Estimasi panen 6.5 ton/ha."
    res = parser.parse_file(sample_text.encode("utf-8"), "laporan_sample.txt")
    print(f"Parser OK: {res.filename}, metrics: {res.extracted_metrics}")
