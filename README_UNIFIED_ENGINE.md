# 🌾 AgriSensa Unified AI & MLOps Ecosystem

> **Pusat Orkestrasi Terpadu Seluruh Modul AI, MLOps, Data, dan Antarmuka AgriSensa**

Dokumentasi lengkap dan panduan menyeluruh telah dipindahkan ke **[`README.md`](./README.md)**.

---

## ⚡ Quick Start Ringkas

1. **Instal seluruh dependensi (1-Klik):**
   * Klik ganda [`install_all_dependencies.bat`](./install_all_dependencies.bat)
2. **Jalankan semua service lokal (1-Klik):**
   * Klik ganda [`start_all_engines.bat`](./start_all_engines.bat)
3. **Jalankan Docker n8n:**
   ```bash
   cd 01_n8n_orchestration
   docker-compose -f docker-compose.n8n.yml up -d
   ```

---

## 🌐 Endpoint & Port Layanan

| Layanan | Port / URL | Fungsi |
| :--- | :--- | :--- |
| **MLOps Inference API** | `http://localhost:8000/docs` | Rekomendasi Crop, Yield Prediction, SHAP Explainer, NPK Analysis |
| **Advanced AI & MCP Engine** | `http://localhost:8001/docs` | RAB Engine, Monte Carlo 10k, Market Intel (ID/JP), Chart & PDF Engine |
| **Streamlit AI Dashboard** | `http://localhost:8501` | Antarmuka interaktif 22 modul budidaya & laboratorium pupuk |
| **n8n Orchestrator** | `http://localhost:5678` | Master workflow dispatcher & automation pipelines |
| **PostgreSQL n8n** | `localhost:5433` | Database relasional internal n8n & state data |

---

*Silakan buka file **[`README.md`](./README.md)** untuk membaca arsitektur sistem, diagram alur, dan penjelasan ilmiah lengkap.*
