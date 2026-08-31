# 🌾 AgriSensa Unified AI & MLOps Ecosystem

<p align="center">
  <img src="https://img.shields.io/badge/Platform-AgriSensa%20AI%20Engine-2ea44f?style=for-the-badge&logo=plant" alt="AgriSensa" />
  <img src="https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python" alt="Python 3.12" />
  <img src="https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/n8n-Orchestration-FF6D5A?style=for-the-badge&logo=n8n" alt="n8n" />
  <img src="https://img.shields.io/badge/Streamlit-22%20Modules-FF4B4B?style=for-the-badge&logo=streamlit" alt="Streamlit" />
  <img src="https://img.shields.io/badge/Docker-Microservices-2496ED?style=for-the-badge&logo=docker" alt="Docker" />
</p>

---

## 📌 1. Ikhtisar Ekosistem (*Executive Summary*)

**AgriSensa Unified AI & MLOps Ecosystem** adalah platform agritech terdistribusi (*Distributed Hybrid AI Architecture*) yang mengintegrasikan komputasi agronomi presisi, *Supervised Machine Learning*, *Explainable AI (XAI)*, *Computer Vision*, *Probabilistic Monte Carlo Simulations*, dan *Agentic RAG* yang diorkestrasi secara otomatis melalui **n8n**.

Sistem ini dirancang untuk menjawab tantangan sektor pertanian modern mulai dari rekomendasi komoditas berbasis tanah/iklim, deteksi penyakit daun, kalkulasi kebutuhan hara pupuk presisi, hingga simulasi kelayakan finansial budidaya tanaman.

---

## 🏗️ 2. Diagram Arsitektur Sistem

```
                               ┌───────────────────────────────────────────────┐
                               │             USER / CLIENT LAYER               │
                               ├───────────────────────┬───────────────────────┤
                               │  Streamlit Dashboard  │   Web Landing (PWA)   │
                               │     (Port: 8501)      │     (Static/HTML5)    │
                               └───────────┬───────────┴───────────┬───────────┘
                                           │                       │
                                           ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 01. WORKFLOW ORCHESTRATION LAYER (n8n Engine - Port: 5678)                                              │
│ • 12 Enterprise Workflows (WF-00 Master s/d WF-10 RAG + WF-99 Error Handler)                            │
│ • PostgreSQL 16 (Port: 5433) | Redis Session Cache | Rate Limiting | Notification Dispatcher            │
└────────────────────────────────────┬────────────────────────────────────┬───────────────────────────────┘
                                     │                                    │
                  ┌──────────────────▼──────────────────┐  ┌──────────────▼──────────────────┐
                  │ 02. AI REASONING & MCP LAYER        │  │ 03. MLOPS INFERENCE API         │
                  │ (FastAPI - Port: 8001)              │  │ (FastAPI - Port: 8000)          │
                  ├─────────────────────────────────────┤  ├─────────────────────────────────┤
                  │ • RAB Engine & Finansial            │  │ • 7 Serialized ML Models (.pkl) │
                  │ • Monte Carlo 10k Simulations       │  │ • Crop Recommendation (LGBM/RF) │
                  │ • JA & ID Market Intelligence       │  │ • Yield & Advanced Yield (SHAP) │
                  │ • IPCC Carbon Calculator            │  │ • Leaf Color Chart (BWD HSV CV) │
                  │ • PyMuPDF / Excel / Docx Parser     │  │ • Roboflow YOLOv8 CV Engine     │
                  │ • ReportLab Dynamic PDF Generator   │  │ • Soil & NPK Chemical Balancer  │
                  └──────────────────┬──────────────────┘  └──────────────┬──────────────────┘
                                     │                                    │
                                     └──────────────────┬─────────────────┘
                                                        ▼
                               ┌─────────────────────────────────────────────────┐
                               │ 04. DATA & KNOWLEDGE ASSETS                     │
                               ├─────────────────────────────────────────────────┤
                               │ • Datasets (Crop Rec, Rainfall, Soil, Yield)    │
                               │ • Excel Calculators (Master NPK & Crop v1/v2)   │
                               │ • SOP Ensiklopedia Budidaya & Pestisida Nabati  │
                               └─────────────────────────────────────────────────┘
```

---

## 🔁 3. Diagram Sequence Alur End-to-End

Berikut adalah alur komunikasi antar-komponen saat pengguna meminta simulasi perencanaan agribisnis lengkap (RAB, Monte Carlo, Market Intel, hingga pembuatan PDF):

```mermaid
sequenceDiagram
    autonumber
    actor User as Petani / Agronom (UI)
    participant UI as Streamlit (Port 8501)
    participant n8n as n8n Orchestrator (Port 5678)
    participant AI_API as FastAPI AI Engine (Port 8001)
    participant ML_API as FastAPI MLOps API (Port 8000)
    participant MCP as MCP Tools & Gemini LLM
    participant DB as PostgreSQL & Redis Cache

    User->>UI: Input parameter (Komoditas, Luas Lahan, NPK Tanah)
    UI->>n8n: POST /webhook/agrisensa/advanced (Payload Usaha Tani)
    
    rect rgb(240, 248, 255)
        Note over n8n,ML_API: 1. Estimasi Hasil Panen Berbasis Tanah/Iklim
        n8n->>ML_API: POST /api/ml/predict-yield-advanced
        ML_API-->>n8n: Return Estimated Yield (Ton/Ha) + SHAP Features
    end

    rect rgb(255, 250, 240)
        Note over n8n,AI_API: 2. Kalkulasi RAB & Simulasi Stokastik 10.000 Iterasi
        n8n->>AI_API: POST /rab/calculate
        AI_API-->>n8n: Return Struktur Biaya, ROI, BEP, B/C Ratio
        n8n->>AI_API: POST /monte-carlo/simulate (10.000 iterasi)
        AI_API-->>n8n: Return Distribusi Risiko (p10, p50, p90, Risk of Loss)
    end

    rect rgb(245, 255, 245)
        Note over n8n,MCP: 3. Pengayaan Data Pasar & Rekomendasi Naratif AI
        n8n->>MCP: Query Market Intel (Bapanas / JA Japan) + RAG Knowledge
        MCP-->>n8n: Insight Pasar Terkini + Rekomendasi Tindakan Strategis
    end

    rect rgb(255, 245, 245)
        Note over n8n,AI_API: 4. Kompilasi Laporan & Visualisasi PDF
        n8n->>AI_API: POST /pdf/generate (Base64 Charts + Full Summary)
        AI_API-->>n8n: Return PDF Binary Stream / Download URL
    end

    n8n->>DB: Log Transaksi Eksekusi & Audit Trail
    n8n-->>UI: Response JSON Lengkap (Status, Metrik Finansial, PDF URL)
    UI-->>User: Tampilkan Dashboard Visual & Tombol Unduh Laporan PDF
```

---

## 📂 4. Struktur Direktori Proyek

```
agrisensa-unified-engine/
│
├── 📁 01_n8n_orchestration/              # Master Workflow Automation & Stack
│   ├── 📁 workflows/                     # 14 JSON Workflow n8n Teruji
│   │   ├── 00_master_orchestrator.json   # Dispatcher rute & token auth
│   │   ├── 01_agentic_rag_chat.json      # RAG Chatbot dengan Gemini
│   │   ├── 02_ml_inference_engine.json   # Router inferensi ML port 8000
│   │   ├── 03_computer_vision_engine.json# Roboflow YOLO & BWD analyzer
│   │   ├── 04_market_intelligence.json   # Scraper harga Bapanas & JA Japan
│   │   ├── 05_weather_climate_engine.json# OpenWeather & KATAM Litbang
│   │   ├── 06_mlops_monitor.json         # Healthcheck & model drift monitor
│   │   ├── 07_notification_engine.json   # Dispatcher Telegram & Push
│   │   ├── 08_agrisensa_advanced_engine.json # Monte Carlo & RAB port 8001
│   │   ├── 09_mcp_tools_workflow.json    # Eksekutor Tool MCP
│   │   ├── 10_rag_knowledge_ingestion.json# Ingest SOP ke Vector Store
│   │   ├── 11_supply_chain_traceability.json # Supply Chain & QR Passport Engine
│   │   ├── 12_google_drive_knowledge_watcher.json # GDrive Automated Ingester
│   │   └── 99_global_error_handler.json  # Fail-safe & error alerting
│   ├── docker-compose.n8n.yml            # Stack n8n + PostgreSQL + Redis
│   ├── init-db.sql                       # Inisialisasi skema & tabel database
│   ├── setup_n8n_engine.ps1              # Skrip setup otomatis PowerShell
│   ├── .env.n8n                          # Konfigurasi environment n8n
│   └── README_N8N_ENGINE.md              # Dokumentasi lengkap 14 workflow
│
├── 📁 02_ai_reasoning_mcp/               # Advanced Reasoning & MCP Tool Engine
│   ├── 📁 ai_engine/                     # 13 Modul Logika & Analisis
│   │   ├── rab_engine.py                 # Perhitungan Rencana Anggaran Biaya
│   │   ├── monte_carlo.py                # Simulasi risiko panen 10.000 iterasi
│   │   ├── market_intel.py               # Intelijen harga komoditas ID & JP
│   │   ├── carbon_model.py               # Estimasi jejak karbon (IPCC Tier-1)
│   │   ├── forecasting_model.py          # Proyeksi deret waktu harga/panen
│   │   ├── language_switch.py            # Adaptor bahasa & lokalisasi MCP
│   │   ├── supply_chain.py               # Supply Chain & QR Passport Generator
│   │   ├── search_engine.py              # DuckDuckGo agricultural search
│   │   ├── web_scraper.py                # Scraper portal pasar & agrikultur
│   │   ├── document_parser.py            # Parser PyMuPDF, Docx, Excel, CSV
│   │   ├── chart_engine.py               # Visualizer grafik Matplotlib/Base64
│   │   ├── pdf_generator.py              # Generator laporan PDF ReportLab
│   │   └── __init__.py
│   ├── 📁 api/
│   │   └── main.py                       # FastAPI Server (Port 8001)
│   ├── requirements.txt                  # Dependensi AI & MCP
│   ├── verify_backend.py                 # Skrip verifikasi seluruh modul
│   └── .env                              # Konfigurasi lokal port 8001
│
├── 📁 03_mlops_inference_api/            # MLOps & Machine Learning Inference API
│   ├── 📁 ml_models/                     # Model Terlatih (.pkl) & Dataset Kalibrasi
│   │   ├── crop_recommendation_model.pkl # Model Klasifikasi 22 Komoditas
│   │   ├── yield_prediction_model.pkl    # Model Regresi Estimasi Tonase/Ha
│   │   ├── advanced_yield_model.pkl      # Model Yield teroptimasi
│   │   ├── shap_explainer.pkl            # TreeExplainer untuk Explainable AI
│   │   ├── bwd_model.pkl                 # Model Kalibrasi Bagan Warna Daun
│   │   ├── success_model.pkl             # Model Probabilitas Keberhasilan
│   │   ├── recommendation_model.pkl      # Model Rekomendasi Terpadu
│   │   ├── bwd_dataset.csv               # Dataset Kalibrasi Hue-to-Score BWD
│   │   └── model_loader.py               # Singleton loader model caching
│   ├── 📁 routes/
│   │   ├── ml.py                         # Endpoint /api/ml/*
│   │   └── analysis.py                   # Endpoint /api/analysis/*
│   ├── 📁 services/
│   │   ├── ml_service.py                 # Pipeline logika machine learning
│   │   └── analysis_service.py           # Analisis citra HSV OpenCV & NPK
│   ├── config.py                         # Konfigurasi MLOps & direktori
│   ├── schemas.py                        # Validasi Pydantic Request/Response
│   ├── main.py                           # FastAPI Server (Port 8000)
│   ├── requirements.txt                  # Dependensi MLOps & Scikit-Learn
│   ├── Dockerfile                        # Kontainerisasi MLOps API
│   └── .env                              # Konfigurasi lokal port 8000
│
├── 📁 04_knowledge_and_data/             # Dataset, SOP & Ensiklopedia Agronomi
│   ├── 📁 datasets/                      # Raw Tabular Data (CSV & JSON)
│   │   ├── Crop_recommendation.csv       # 2200 baris data tanah & iklim
│   │   ├── yield.csv                     # Data historis panen per komoditas
│   │   ├── rainfall.csv                  # Data curah hujan per wilayah
│   │   ├── agrimap_export.json           # GeoJSON koordinat sentra tani
│   │   └── soil_map_npk_data.json        # Data acuan hara tanah BBSDLP
│   ├── 📁 encyclopedias/                 # Kalkulator & Ensiklopedia Master Excel
│   │   ├── AgriSensa_Master_NPK_Calculator_v1.xlsx
│   │   ├── AgriSensa_Food_Crop_Encyclopedia_Calculator_v1.xlsx
│   │   └── AgriSensa_Food_Crop_Encyclopedia_Calculator_v2.xlsx
│   └── 📁 sops_and_guidelines/           # Panduan Ilmiah Budidaya & Pestisida
│       ├── Agrisensa_Mega_Encyclopedia.html
│       ├── Master_Budidaya_Cabe_Premium.html
│       └── Agrisensa_Pestisida_Nabati_Product.md
│
├── 📁 05_frontend_clients/               # Antarmuka Pengguna (UI/UX)
│   ├── 📁 agrisensa_streamlit_dashboard/ # Dashboard Interaktif 22 Modul
│   │   ├── Home.py                       # Halaman Utama Dashboard
│   │   ├── 📁 pages/                     # 22 Halaman Analisis & Laboratorium
│   │   ├── 📁 services/                  # Client API penghubung ke Backend
│   │   ├── 📁 utils/                     # Format helper, UI style, & auth
│   │   ├── 📁 .streamlit/                # Konfigurasi tema & secrets.toml
│   │   └── requirements.txt              # Dependensi Streamlit & Plotly
│   └── 📁 agrisensa_web_landing/         # Landing Page Portofolio Modern
│       └── index.html                    # Single Page PWA
│
├── 🚀 start_all_engines.bat              # 1-Click Launcher Seluruh Service Lokal
├── 📦 install_all_dependencies.bat       # 1-Click Installer Seluruh Requirements
├── 📄 .env                               # Master Environment Configuration
├── 📄 .env.example                       # Master Environment Template
└── 📄 README.md                          # Dokumentasi Induk Ekosistem
```

---

## 🌐 5. Endpoint & Port Layanan

| Layanan | Host & Port | Endpoint Dokumentasi / UI | Deskripsi Fungsi |
| :--- | :---: | :---: | :--- |
| **MLOps Inference API** | `localhost:8000` | [`/docs`](http://localhost:8000/docs) (Swagger) | Inferensi 7 Model ML, Rekomendasi Crop, Prediksi Yield, SHAP Explainer, Analisis BWD. |
| **Advanced AI & MCP Engine** | `localhost:8001` | [`/docs`](http://localhost:8001/docs) (Swagger) | Kalkulasi RAB, Monte Carlo 10.000 iterasi, Intel Pasar JA/ID, IPCC Carbon, Chart & PDF Engine. |
| **n8n Orchestrator** | `localhost:5678` | [`/`](http://localhost:5678) (Web UI) | Master Orchestrator, Webhook Router, Scheduler, Notification Dispatcher. |
| **PostgreSQL Database** | `localhost:5433` | `postgresql://n8n:***@localhost:5433` | Database relasional untuk n8n state & AgriSensa records. |
| **Redis Queue & Cache** | `localhost:6379` | `redis://:***@localhost:6379` | Session caching & Bull message queueing. |
| **Streamlit AI Dashboard** | `localhost:8501` | [`/`](http://localhost:8501) (Web App) | Antarmuka interaktif 22 halaman untuk agronom, petani, dan laboratorium tani. |

---

## 📜 6. API Contract & Standar Integrasi

Semua komunikasi data antara Frontend, n8n, dan FastAPI mengikuti standar format berikut:

### A. HTTP Headers Standar
```http
Content-Type: application/json
Accept: application/json
```

### B. Struktur Respon Standar (Envelope Format)
#### Respon Berhasil (200 OK)
```json
{
  "success": true,
  "data": {},
  "metadata": {
    "execution_time_ms": 45.2,
    "timestamp": "2026-08-31T10:45:00Z",
    "service": "agrisensa-ai-engine"
  }
}
```

#### Respon Gagal (4xx / 5xx)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input parameter berada di luar batas biologis tanah.",
    "details": [
      {
        "field": "ph",
        "issue": "Nilai pH harus berada di rentang 3.0 s/d 10.0"
      }
    ]
  },
  "timestamp": "2026-08-31T10:45:00Z"
}
```

### C. Daftar Status & Error Codes

| Kode HTTP | Error Code | Deskripsi |
| :--- | :--- | :--- |
| **`200 OK`** | `-` | Request berhasil diproses. |
| **`400 Bad Request`** | `INVALID_PAYLOAD` | Format payload tidak sesuai atau ada parameter esensial yang hilang. |
| **`404 Not Found`** | `RESOURCE_NOT_FOUND` | Komoditas atau model ML yang diminta tidak terdaftar di database. |
| **`422 Unprocessable`** | `SCHEMA_VALIDATION_ERROR` | Tipe data gagal divalidasi oleh skema Pydantic. |
| **`500 Internal Error`** | `ENGINE_COMPUTATION_ERROR` | Kegagalan komputasi matematika atau kegagalan internal service. |
| **`503 Service Unavailable`**| `SERVICE_UNREACHABLE` | Endpoint model/database target offline atau tidak merespons. |

---

## 📊 7. Contoh Payload & Integrasi WF-08 (RAB + Monte Carlo)

Workflow **WF-08 (`08_agrisensa_advanced_engine.json`)** mengeksekusi perhitungan Rencana Anggaran Biaya (RAB) dan menjalankan 10.000 iterasi Monte Carlo secara berantai.

### A. Contoh Request Payload (`POST /rab/calculate` & WF-08)
```json
{
  "komoditas": "cabai_merah",
  "luas_ha": 0.5,
  "estimasi_yield_ton_ha": 14.0,
  "harga_jual_rp_kg": 35000,
  "musim_tanam_bulan": 5,
  "biaya_penyusutan_persen": 5.0,
  "pajak_persen": 0.0,
  "komponen_biaya": [
    { "kategori": "benih", "item": "Benih Hibrida F1", "jumlah": 10, "satuan": "sachet", "harga_satuan": 175000 },
    { "kategori": "pupuk", "item": "NPK Mutiara 16-16-16", "jumlah": 8, "satuan": "karung_50kg", "harga_satuan": 850000 },
    { "kategori": "pupuk", "item": "Urea Non-Subsidi", "jumlah": 4, "satuan": "karung_50kg", "harga_satuan": 550000 },
    { "kategori": "tenaga_kerja", "item": "Olah Tanah & Bedengan", "jumlah": 20, "satuan": "HOK", "harga_satuan": 100000 },
    { "kategori": "pestisida", "item": "Fungisida & Insektisida", "jumlah": 1, "satuan": "paket", "harga_satuan": 3500000 }
  ],
  "catatan": "Musim Tanam Gadu 2026"
}
```

### B. Contoh Request Payload Monte Carlo (`POST /monte-carlo/simulate`)
```json
{
  "total_biaya_rp": 19750000,
  "estimasi_yield_ton_ha": 14.0,
  "harga_jual_rp_kg": 35000,
  "luas_ha": 0.5,
  "yield_std_persen": 15.0,
  "harga_std_persen": 25.0,
  "biaya_std_persen": 10.0,
  "n_iterations": 10000,
  "use_triangular_price": true,
  "random_seed": 42
}
```

### C. Contoh Respon JSON Gabungan (Output Ekosistem WF-08)
```json
{
  "success": true,
  "data": {
    "rab_summary": {
      "total_biaya_operasional_rp": 19750000,
      "estimasi_produksi_kg": 7000,
      "estimasi_pendapatan_kotor_rp": 245000000,
      "estimasi_keuntungan_bersih_rp": 225250000,
      "bep_harga_per_kg": 2821.42,
      "bep_volume_kg": 564.28,
      "bc_ratio": 12.4,
      "roi_persen": 1140.5
    },
    "monte_carlo_10k": {
      "iterations": 10000,
      "probabilitas_rugi_persen": 0.02,
      "probabilitas_untung_persen": 99.98,
      "percentile_keuntungan": {
        "p10_skenario_pesimis_rp": 152300000,
        "p50_skenario_moderat_rp": 224800000,
        "p90_skenario_optimis_rp": 298400000
      },
      "value_at_risk_95_rp": 145000000,
      "rekomendasi_kelayakan": "SANGAT LAYAK (Risiko Investasi Rendah)"
    }
  },
  "metadata": {
    "execution_time_ms": 112.4,
    "timestamp": "2026-08-31T10:45:01Z"
  }
}
```

---

## 🚀 8. Panduan Instalasi & Menjalankan Sistem

### A. Prasyarat Sistem
* **OS:** Windows 10/11, macOS, atau Linux
* **Python:** 3.10 – 3.12 (Disertai `py` launcher atau `python3`)
* **Docker & Docker Compose:** Diperlukan untuk stack n8n, PostgreSQL, dan Redis

---

### B. Langkah 1: Pasang Dependensi Python (1-Klik)
Cukup klik ganda file:
👉 **`install_all_dependencies.bat`**

*Atau via terminal secara manual:*
```bash
pip install -r 02_ai_reasoning_mcp/requirements.txt
pip install -r 03_mlops_inference_api/requirements.txt
pip install -r 05_frontend_clients/agrisensa_streamlit_dashboard/requirements.txt
```

---

### C. Langkah 2: Konfigurasi Environment (`.env`)
Salin file template menjadi `.env` aktif:
```bash
cp .env.example .env
```
Isi API key Anda (Google Gemini, Roboflow, Telegram, OpenWeather, dll).

---

### D. Langkah 3: Jalankan Seluruh Ekosistem (1-Klik)
Cukup klik ganda file:
👉 **`start_all_engines.bat`**

Skrip ini akan secara otomatis:
1. Mendeteksi interpreter Python (`py -3` atau `python`).
2. Menjalankan **MLOps API** pada port `8000`.
3. Menjalankan **AI Reasoning & MCP Engine** pada port `8001`.
4. Menjalankan **Streamlit AI Dashboard** pada port `8501`.

---

### E. Langkah 4: Jalankan Stack n8n Orchestrator (Docker)
Buka terminal dan jalankan:
```bash
cd 01_n8n_orchestration
docker-compose -f docker-compose.n8n.yml up -d
```
Akses UI n8n di: `http://localhost:5678` *(Login default: `agrisensa` / `agrisensa2026_secure`)*.

---

## 🔬 9. Validasi Ilmiah & Landasan Formula

1. **Neraca Kesetimbangan Hara NPK (Nutrient Balance Equation):**
   $$\text{Kebutuhan Pupuk (kg/ha)} = \frac{(\text{Hara/Ton} \times \text{Target Ton/Ha}) - (\text{Hara Tanah} \times \text{Efisiensi Tanah})}{\text{Efisiensi Serapan Pupuk (\%)} \times \text{Kadar Hara Pupuk (\%)}}$$
   Mengacu pada standar **Balitbangtan Kementan** dan regulasi **Permentan No. 40/2007**.
2. **Kalibrasi Bagan Warna Daun (BWD / LCC):**
   Menggunakan ekstraksi ruang warna HSV pada panjang gelombang hijau (*Hue* $30^\circ - 90^\circ$) yang dikalibrasi terhadap standar 4-skala **IRRI (*International Rice Research Institute*)**.
3. **Simulasi Risiko Monte Carlo:**
   Menjalankan 10.000 iterasi stokastik dengan distribusi probabilitas ($p_{10}, p_{50}, p_{90}$) terhadap volatilitas harga pasar dan fluktuasi cuaca ekstrem.
4. **Explainable AI (SHAP TreeExplainer):**
   Menguraikan kontribusi marjinal setiap fitur tanah/iklim terhadap hasil prediksi tanaman untuk transparansi model.

---

## 🛡️ 10. Tim Pengembang & Lisensi

* **Author / Lead Engineer:** Yandri ([@yandri918](https://github.com/yandri918))
* **Repository:** `agrisensa-unified-engine`
* **License:** MIT License — Bebas digunakan dan dikembangkan untuk kemajuan agritech Indonesia.

<p align="center">
  <b>🌾 AgriSensa — Empowering Indonesian Agriculture with Precision AI 🌾</b>
</p>
