# 🌾 AgriSensa n8n AI Engine

> **Platform AI Pertanian Indonesia** — Orkestrasi workflow AI berbasis n8n yang mengintegrasikan 8 engine spesialis untuk semua fitur AgriSensa

[![n8n](https://img.shields.io/badge/n8n-Workflow%20Orchestrator-orange)](https://n8n.io)
[![FastAPI](https://img.shields.io/badge/FastAPI-3.0-green)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-red)](https://redis.io)
[![Gemini](https://img.shields.io/badge/Google-Gemini%20AI-blue)](https://deepmind.google/technologies/gemini/)

---

## 📐 Arsitektur Sistem

```
                        CLIENT LAYER
         ┌────────────────────────────────────┐
         │  Streamlit │ PWA Mobile │ Vercel   │
         └──────────────────┬─────────────────┘
                            │ POST /webhook/agrisensa/*
              ┌─────────────▼──────────────┐
              │   WF-00: MASTER ORCHESTRATOR │
              │   Intent Router + Dispatcher │
              └────────┬──────────┬─────────┘
          ┌────────────┤          ├────────────────────────────┐
    ┌─────▼──┐   ┌─────▼──┐  ┌───▼────┐  ┌───────┐  ┌───────┐
    │ WF-01  │   │ WF-02  │  │ WF-03  │  │ WF-04 │  │ WF-05 │
    │Agentic │   │   ML   │  │ Comput │  │Market │  │Weather│
    │  RAG   │   │Infer-  │  │ Vision │  │Intel  │  │Climate│
    │  Chat  │   │  ence  │  │(CV)    │  │       │  │       │
    └────────┘   └────────┘  └────────┘  └───────┘  └───────┘
         │                        │           │
    ┌────▼───┐               ┌────▼──┐   ┌────▼────┐
    │ WF-06  │               │WF-07  │   │  DATA   │
    │MLOps   │               │Notify │   │  LAYER  │
    │Monitor │               │Engine │   │  PG/    │
    │        �│   ├── 03_computer_vision_engine.json  # Disease Detection
│   ├── 04_market_intelligence.json     # Market Data & Prediction
│   ├── 05_weather_climate_engine.json  # Weather & Planting
│   ├── 06_mlops_monitor.json           # Drift Detection & MLOps
│   ├── 07_notification_engine.json     # Multi-channel Alerts
│   ├── 08_agrisensa_advanced_engine.json # RAB + Monte Carlo + Carbon + Forecast
│   ├── 09_mcp_tools_workflow.json      # MCP DuckDuckGo + Scraper + DocParser
│   ├── 10_rag_knowledge_ingestion.json # Automated RAG Ingestion Pipeline
│   └── 99_global_error_handler.json    # DLQ & Instant Error Alerting
├── docker-compose.n8n.yml              # Docker stack (n8n+PG+Redis+ChromaDB)
├── .env.n8n.example                    # Environment variables template
├── init-db.sql                         # Database schema initialization
├── setup_n8n_engine.ps1                # PowerShell setup automation
└── README_N8N_ENGINE.md                # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Docker Desktop
- AgriSensa API Core running (port 8000)
- AgriSensa AI Engine running (port 8001)
- API Keys: Gemini, Roboflow, OpenWeatherMap

### 1. Setup Environment

```powershell
# Clone / navigate to agrisensa-n8n-engine
cd agrisensa-n8n-engine

# Copy and edit environment variables
Copy-Item .env.n8n.example .env.n8n
notepad .env.n8n   # Edit with your API keys
```

### 2. Start Docker Stack

```powershell
# Start semua services (n8n + PostgreSQL + Redis + ChromaDB)
docker compose -f docker-compose.n8n.yml --env-file .env.n8n up -d

# Cek status containers
docker compose -f docker-compose.n8n.yml ps
```

### 3. Jalankan Setup Script (Auto-Import Workflows)

```powershell
# Setup otomatis + import semua 12 workflow
.\setup_n8n_engine.ps1 -ImportWorkflows

# Setup + import + test semua endpoint
.\setup_n8n_engine.ps1 -ImportWorkflows -TestWorkflows
```

### 4. Akses n8n UI

```
URL:      http://localhost:5678
Username: agrisensa
Password: agrisensa2026
```

---

## 📡 Webhook Endpoints (12 Workflows)

| Workflow | Endpoint | Method | Deskripsi |
|----------|----------|--------|-----------|
| **WF-00** | `/webhook/agrisensa/gateway` | POST | Master gateway (auto-routing ke 9 sub-workflow) |
| **WF-01** | `/webhook/agrisensa/chat` | POST | Agentic RAG Chat dengan memory session |
| **WF-02** | `/webhook/agrisensa/ml` | POST | ML Inference (7 tasks: crop, yield, SHAP XAI) |
| **WF-03** | `/webhook/agrisensa/vision` | POST | Disease Detection (Roboflow + BWD + Gemini) |
| **WF-04** | `/webhook/agrisensa/market` | POST | Market Intelligence (BAPANAS + Linear Regression) |
| **WF-05** | `/webhook/agrisensa/weather` | POST | Weather & Climate (NASA POWER + OpenWeather) |
| **WF-06** | `/webhook/agrisensa/mlops` | POST | MLOps Monitor (Drift Detection + MLflow Sync) |
| **WF-07** | `/webhook/agrisensa/notify` | POST | Multi-Channel Notifications (Telegram/Email/Push) |
| **WF-08** | `/webhook/agrisensa/advanced` | POST | Advanced AI Engine (RAB + Monte Carlo 10k + Carbon + Forecast) |
| **WF-09** | `/webhook/agrisensa/mcp` | POST | MCP Tools Orchestrator (DuckDuckGo + Scraper + DocParser) |
| **WF-10** | `/webhook/agrisensa/ingest` | POST | Automated RAG Knowledge Ingestion to ChromaDB |
| **WF-99** | *(Error Trigger)* | - | Global Error Handler & Dead Letter Queue (DLQ) |o-Import Workflows)

```powershell
# Setup otomatis + import semua workflow
.\setup_n8n_engine.ps1 -ImportWorkflows

# Setup + import + test semua endpoint
.\setup_n8n_engine.ps1 -ImportWorkflows -TestWorkflows
```

### 4. Akses n8n UI

```
URL:      http://localhost:5678
Username: agrisensa
Password: agrisensa2026
```

---

## 📡 Webhook Endpoints

| Workflow | Endpoint | Method | Deskripsi |
|----------|----------|--------|-----------|
| WF-00 | `/webhook/agrisensa/gateway` | POST | Master gateway (auto-routing) |
| WF-01 | `/webhook/agrisensa/chat` | POST | Agentic RAG Chat |
| WF-02 | `/webhook/agrisensa/ml` | POST | ML Inference (7 tasks) |
| WF-03 | `/webhook/agrisensa/vision` | POST | Disease Detection (CV) |
| WF-04 | `/webhook/agrisensa/market` | POST | Market Intelligence |
| WF-05 | `/webhook/agrisensa/weather` | POST | Weather & Climate |
| WF-06 | `/webhook/agrisensa/mlops` | POST | MLOps Monitor |
| WF-07 | `/webhook/agrisensa/notify` | POST | Notifications |

### Via AgriSensa FastAPI Proxy (`/n8n/*`)

Setelah menambahkan `n8n_router` ke FastAPI:

| Endpoint | Deskripsi |
|----------|-----------|
| `POST /n8n/chat` | Proxy ke WF-01 |
| `POST /n8n/ml` | Proxy ke WF-02 |
| `POST /n8n/vision` | Proxy ke WF-03 |
| `POST /n8n/market` | Proxy ke WF-04 |
| `POST /n8n/weather` | Proxy ke WF-05 |
| `POST /n8n/notify` | Proxy ke WF-07 (background) |
| `GET /n8n/health` | Health check semua workflow |
| `GET /n8n/workflows` | Daftar semua workflow |

---

## 🔌 Contoh Request

### 1. Chat dengan AgriBot (WF-01)

```bash
curl -X POST http://localhost:5678/webhook/agrisensa/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Apa pupuk terbaik untuk tanaman padi?",
    "session_id": "user_123",
    "chat_history": []
  }'
```

### 2. Rekomendasi Tanaman (WF-02)

```bash
curl -X POST http://localhost:5678/webhook/agrisensa/ml \
  -H "Content-Type: application/json" \
  -d '{
    "task": "recommend_crop",
    "n_value": 90, "p_value": 42, "k_value": 43,
    "temperature": 20.8, "humidity": 82,
    "ph": 6.5, "rainfall": 202.9
  }'
```

### 3. Prediksi Panen XAI (WF-02)

```bash
curl -X POST http://localhost:5678/webhook/agrisensa/ml \
  -H "Content-Type: application/json" \
  -d '{
    "task": "predict_yield_advanced",
    "nitrogen": 120, "phosphorus": 75, "potassium": 75,
    "temperature": 26.5, "rainfall": 1800, "ph": 6.2
  }'
```

### 4. Deteksi Penyakit Tanaman (WF-03)

```bash
curl -X POST http://localhost:5678/webhook/agrisensa/vision \
  -H "Content-Type: application/json" \
  -d '{
    "image_base64": "BASE64_ENCODED_IMAGE_HERE",
    "analysis_type": "both"
  }'
```

### 5. Harga Komoditas + Prediksi (WF-04)

```bash
curl -X POST http://localhost:5678/webhook/agrisensa/market \
  -H "Content-Type: application/json" \
  -d '{
    "commodity": "padi",
    "days": 30,
    "include_prediction": true
  }'
```

### 6. Cuaca & Kalender Tanam (WF-05)

```bash
curl -X POST http://localhost:5678/webhook/agrisensa/weather \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -6.9175,
    "longitude": 107.6191,
    "location_name": "Bandung, Jawa Barat",
    "commodity": "cabai"
  }'
```

### 7. Kirim Notifikasi (WF-07)

```bash
curl -X POST http://localhost:5678/webhook/agrisensa/notify \
  -H "Content-Type: application/json" \
  -d '{
    "notification_type": "price_alert",
    "channel": "telegram",
    "subject": "Alert Harga Cabai",
    "message": "Harga cabai naik 8.5% hari ini!"
  }'
```

---

## 🗄️ Database Schema

Database `agrisensa_ai` (PostgreSQL) berisi 8 tabel utama:

| Tabel | Workflow | Isi |
|-------|----------|-----|
| `chat_sessions` | WF-01 | Session management |
| `chat_history` | WF-01 | Riwayat chat per session |
| `ml_predictions_log` | WF-02 | Audit semua prediksi ML |
| `commodity_prices` | WF-04 | Historis harga komoditas |
| `price_alerts` | WF-04 | Alert threshold harga |
| `cv_analysis_reports` | WF-03 | Laporan diagnosa penyakit |
| `model_performance_metrics` | WF-06 | MLOps metrics |
| `notifications_log` | WF-07 | Audit notifikasi terkirim |
| `weather_data_cache` | WF-05 | Cache data cuaca 3 jam |

---

## 🌐 External APIs yang Digunakan

| API | Workflow | Endpoint |
|-----|----------|----------|
| Google Gemini AI | WF-01, 03, 05 | `generativelanguage.googleapis.com` |
| Roboflow | WF-03 | `infer.roboflow.com` |
| OpenWeatherMap | WF-05 | `api.openweathermap.org/data/2.5/forecast` |
| NASA POWER | WF-05 | `power.larc.nasa.gov/api/temporal/daily/point` |
| BAPANAS | WF-04 | `panelharga.badanpangan.go.id` |
| Telegram Bot | WF-07 | `api.telegram.org/bot{token}/sendMessage` |
| Firebase FCM | WF-07 | `fcm.googleapis.com/fcm/send` |
| MLflow | WF-06 | `localhost:5000/api/2.0/mlflow` |

---

## 🔍 Monitoring & Troubleshooting

```powershell
# Lihat logs n8n
docker logs agrisensa_n8n -f

# Lihat logs PostgreSQL
docker logs agrisensa_n8n_postgres -f

# Lihat logs Redis
docker logs agrisensa_n8n_redis -f

# Restart n8n saja
docker restart agrisensa_n8n

# Stop semua services
docker compose -f docker-compose.n8n.yml down

# Stop dan hapus volumes (reset complete)
docker compose -f docker-compose.n8n.yml down -v
```

### Akses Database Langsung

```powershell
# Masuk ke PostgreSQL
docker exec -it agrisensa_n8n_postgres psql -U n8n -d agrisensa_ai

# Query ML predictions 24 jam terakhir
docker exec -it agrisensa_n8n_postgres psql -U n8n -d agrisensa_ai -c \
  "SELECT task_type, COUNT(*), AVG(processing_time_ms) FROM ml_predictions_log WHERE created_at > NOW() - INTERVAL '24h' GROUP BY task_type;"
```

---

## 🛡️ Security Notes

- Ganti `N8N_BASIC_AUTH_PASSWORD` di `.env.n8n` dengan password yang kuat
- Jangan expose port 5678 ke internet tanpa HTTPS/reverse proxy (nginx/traefik)
- API keys di `.env.n8n` harus dijaga kerahasiaannya (jangan di-commit ke Git)
- File `.env.n8n` sudah ada di `.gitignore`

---

## 👨‍💻 Developer

**Andriyanto** — AgriSensa AI Platform  
Email: yandri918@gmail.com  
GitHub: [@yandri918](https://github.com/yandri918)

---

*AgriSensa n8n AI Engine v2.0 — Built with ❤️ for Indonesian Farmers 🇮🇩*
