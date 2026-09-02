"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  UploadCloud,
  Sparkles,
  BookOpen,
  Leaf,
  Bug,
  Sprout,
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Eye,
  Layers,
  FlaskConical,
  Clock,
  HardDrive,
  FileSpreadsheet,
  FileCode,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface LibraryDoc {
  filename: string;
  title: string;
  category: string;
  tags: string[];
  size_mb: number;
  file_type: string;
  download_url: string;
  last_modified: string;
}

interface ParsedDocResult {
  filename: string;
  file_type: string;
  total_pages_or_sheets: number;
  extracted_text: string;
  extracted_tables: string[][][];
  extracted_metrics: {
    biaya_ditemukan?: string[];
    luas_ha_ditemukan?: number[];
    yield_ditemukan?: number[];
    komoditas_disebut?: string[];
    bahan_nabati_ditemukan?: string[];
    hama_sasaran_ditemukan?: string[];
    metode_pembuatan?: string[];
    dosis_aplikasi?: string[];
  };
  ai_summary: string;
  key_findings: string[];
  processing_time_sec: number;
  timestamp: string;
}

export default function DocumentsIntelligencePage() {
  const [activeTab, setActiveTab] = useState<"library" | "upload" | "insights">("library");
  const [libraryDocs, setLibraryDocs] = useState<LibraryDoc[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<LibraryDoc | null>(null);
  const [parsedResult, setParsedResult] = useState<ParsedDocResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch library documents on mount
  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (data.success && data.documents) {
        setLibraryDocs(data.documents);
        if (data.documents.length > 0) {
          setSelectedDoc(data.documents[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load library:", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger parsing on stored document
  const handleParseStored = async (doc: LibraryDoc) => {
    setLoading(true);
    setErrorMsg(null);
    setSelectedDoc(doc);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: doc.filename }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setParsedResult(data.data);
        setActiveTab("insights");
      } else {
        setErrorMsg(data.error || "Gagal memproses dokumen");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat memparsing dokumen");
    } finally {
      setLoading(false);
    }
  };

  // Handle external file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.data) {
        setParsedResult(data.data);
        setActiveTab("insights");
      } else {
        setErrorMsg(data.error || "Gagal mengekstrak file upload");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mengunggah file");
    } finally {
      setUploading(false);
    }
  };

  const filteredDocs = libraryDocs.filter((doc) => {
    const matchSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCat = selectedCategory === "ALL" || doc.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const categories = ["ALL", ...Array.from(new Set(libraryDocs.map((d) => d.category)))];

  return (
    <div className="space-y-8 pb-16 text-slate-100 max-w-7xl mx-auto font-sans">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* HERO BANNER                                                        */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 border border-sky-500/30 shadow-2xl bg-gradient-to-r from-sky-950/80 via-slate-900 to-slate-950 backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Document Intelligence & Multi-Format Knowledge Parser
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Perpustakaan Riset & Dokumen Intelijen
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Pusat repositori dokumen riset baku AgriSensa (Pestisida Nabati, SOP GAP, Formulasi) & fitur parsing file eksternal (PDF, Word, Excel, CSV) untuk ekstraksi formula, tabel, dan wawasan strategis.
            </p>
          </div>

          {/* Quick Action Tabs */}
          <div className="flex items-center bg-slate-950/90 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("library")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "library"
                  ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Katalog Riset</span>
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "upload"
                  ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Unggah Dokumen</span>
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              disabled={!parsedResult}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "insights"
                  ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
                  : !parsedResult
                  ? "text-slate-600 cursor-not-allowed"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hasil Wawasan</span>
            </button>
          </div>
        </div>
      </div>

      {/* ERROR ALERT */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-xs hover:text-white font-bold">
            Tutup
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: KNOWLEDGE LIBRARY & STORED REFERENCE PAPERS                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "library" && (
        <div className="space-y-6">
          {/* Filter and Search Bar */}
          <div className="p-4 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari dokumen, nama bahan aktif (mimba, gadung), hama sasaran (wereng, ulat)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Kategori:</span>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                      selectedCategory === cat
                        ? "bg-sky-500 text-slate-950 font-bold"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <div
                key={doc.filename}
                className="p-6 rounded-2xl bg-[#090e18] border border-slate-800 hover:border-sky-500/40 shadow-xl transition-all flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 uppercase">
                      {doc.file_type.toUpperCase()} • {doc.size_mb} MB
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Dokumen referensi resmi AgriSensa mencakup 200+ halaman formula bahan aktif nabati, teknik ekstraksi maserasi/fermentasi, serta dosis semprot hama terpadu.
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {doc.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <a
                    href={doc.download_url}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Unduh PDF</span>
                  </a>

                  <button
                    onClick={() => handleParseStored(doc)}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-400 text-slate-950 text-xs font-bold shadow-md shadow-sky-500/20 hover:opacity-95 transition-all"
                  >
                    {loading && selectedDoc?.filename === doc.filename ? (
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Bedah & Ekstrak AI</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: EXTERNAL DOCUMENT UPLOAD (DRAG & DROP)                       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "upload" && (
        <div className="p-8 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl space-y-6 text-center max-w-3xl mx-auto">
          <div className="h-16 w-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mx-auto">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Unggah Dokumen Pertanian Eksternal</h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Unggah file laporan hasil panen, dokumen SOP budidaya, atau data keuangan usaha tani Anda. AI Engine akan membaca dan mengekstrak parameter kunci secara otomatis.
            </p>
          </div>

          {/* Upload Dropzone */}
          <label className="border-2 border-dashed border-slate-700 hover:border-sky-500/60 rounded-2xl p-10 block cursor-pointer bg-slate-950/60 hover:bg-slate-900/40 transition-all space-y-3">
            <input
              type="file"
              accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex justify-center gap-3 text-slate-400">
              <FileText className="w-6 h-6 text-rose-400" />
              <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
              <FileCode className="w-6 h-6 text-sky-400" />
            </div>
            <p className="text-xs font-bold text-white">
              {uploading ? "Sedang memproses & mengekstrak data dokumen..." : "Klik untuk memilih file atau seret file ke sini"}
            </p>
            <p className="text-[11px] text-slate-500">
              Format yang didukung: PDF, DOCX, XLSX, CSV, TXT (Maks. 50 MB)
            </p>
          </label>

          {uploading && (
            <div className="flex items-center justify-center gap-2 text-xs text-sky-400 font-semibold pt-2">
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>Menjalankan Pipeline PyMuPDF OCR & DeepSeek Reasoning...</span>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: EXTRACTED INSIGHTS & BOTANICAL SOP VIEWER                    */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "insights" && parsedResult && (
        <div className="space-y-6">
          {/* Metadata Bar */}
          <div className="p-4 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 font-bold">
                {parsedResult.file_type.toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-white">{parsedResult.filename}</p>
                <p className="text-[11px] text-slate-400">
                  Total Halaman/Sheet: <strong className="text-slate-200">{parsedResult.total_pages_or_sheets}</strong> • Waktu Ekstraksi: <strong className="text-slate-200">{parsedResult.processing_time_sec}s</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("library")}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700 transition-colors"
            >
              Kembali ke Katalog
            </button>
          </div>

          {/* AI Executive Summary Card */}
          <div className="p-6 rounded-2xl bg-[#090e18] border border-sky-500/40 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-sky-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">Ringkasan Eksekutif & Sintesis Wawasan Dokumen</h3>
            </div>
            <div className="prose prose-invert prose-xs max-w-none text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {parsedResult.ai_summary}
              </ReactMarkdown>
            </div>
          </div>

          {/* Key Findings List */}
          {parsedResult.key_findings && parsedResult.key_findings.length > 0 && (
            <div className="p-6 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Temuan Kunci Dokumen
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {parsedResult.key_findings.map((finding, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="mt-0.5">{finding}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Metrics Grid: Botanicals, Pests, Dosages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Botanicals */}
            <div className="p-5 rounded-2xl bg-[#090e18] border border-emerald-500/30 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Leaf className="w-4 h-4" />
                <h4 className="text-xs font-bold text-white uppercase">Bahan Alami Teridentifikasi</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {parsedResult.extracted_metrics.bahan_nabati_ditemukan &&
                parsedResult.extracted_metrics.bahan_nabati_ditemukan.length > 0 ? (
                  parsedResult.extracted_metrics.bahan_nabati_ditemukan.map((b) => (
                    <span
                      key={b}
                      className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 capitalize"
                    >
                      {b}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">Tidak ada bahan nabati khusus</span>
                )}
              </div>
            </div>

            {/* Target Pests */}
            <div className="p-5 rounded-2xl bg-[#090e18] border border-rose-500/30 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-rose-400">
                <Bug className="w-4 h-4" />
                <h4 className="text-xs font-bold text-white uppercase">Hama & Penyakit Sasaran</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {parsedResult.extracted_metrics.hama_sasaran_ditemukan &&
                parsedResult.extracted_metrics.hama_sasaran_ditemukan.length > 0 ? (
                  parsedResult.extracted_metrics.hama_sasaran_ditemukan.map((p) => (
                    <span
                      key={p}
                      className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 capitalize"
                    >
                      {p}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">Hama umum pertanian</span>
                )}
              </div>
            </div>

            {/* Crops & Methods */}
            <div className="p-5 rounded-2xl bg-[#090e18] border border-purple-500/30 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-purple-400">
                <Sprout className="w-4 h-4" />
                <h4 className="text-xs font-bold text-white uppercase">Komoditas & Metode Ekstraksi</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {parsedResult.extracted_metrics.komoditas_disebut &&
                parsedResult.extracted_metrics.komoditas_disebut.length > 0 ? (
                  parsedResult.extracted_metrics.komoditas_disebut.map((c) => (
                    <span
                      key={c}
                      className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 capitalize"
                    >
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">Multikomoditas</span>
                )}
              </div>
            </div>
          </div>

          {/* Extracted Data Tables (if any) */}
          {parsedResult.extracted_tables && parsedResult.extracted_tables.length > 0 && (
            <div className="p-6 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                Tabel Terstruktur yang Berhasil Diekstrak
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <tbody className="divide-y divide-slate-800">
                    {parsedResult.extracted_tables[0].map((row, rIdx) => (
                      <tr key={rIdx} className={rIdx === 0 ? "bg-slate-900 font-bold text-white" : "hover:bg-slate-900/40"}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3.5 py-2.5 text-slate-300 font-mono text-[11px]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Raw Text Preview */}
          <div className="p-6 rounded-2xl bg-[#090e18] border border-slate-800 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCode className="w-4 h-4 text-slate-400" />
              Teks Mentah Hasil Ekstraksi (Cuplikan 30.000 Karakter)
            </h4>
            <pre className="p-4 rounded-xl bg-slate-950 text-slate-400 text-[11px] font-mono overflow-y-auto max-h-72 whitespace-pre-wrap leading-relaxed border border-slate-800">
              {parsedResult.extracted_text}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
