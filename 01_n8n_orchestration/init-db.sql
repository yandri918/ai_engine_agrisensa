-- ============================================================
-- AgriSensa AI Engine — Database Initialization SQL
-- Dijalankan otomatis saat PostgreSQL container pertama kali start
-- ============================================================

-- Create additional database for AgriSensa AI data
SELECT 'CREATE DATABASE agrisensa_ai'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'agrisensa_ai');

-- ============================================================
-- Connect to agrisensa_ai database
-- ============================================================
\c agrisensa_ai;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE agrisensa_ai TO n8n;

-- ----------------------------------------------------------
-- Table: chat_sessions
-- Menyimpan session chat pengguna
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL UNIQUE,
    user_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_active ON chat_sessions(last_active);

-- ----------------------------------------------------------
-- Table: chat_history
-- Menyimpan riwayat chat per session
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    route VARCHAR(50),           -- 'knowledge' | 'tool'
    tool_used VARCHAR(100),      -- nama tool yang dipanggil
    tool_params JSONB,           -- parameter tool
    tool_result JSONB,           -- hasil tool
    sources JSONB,               -- dokumen sumber RAG
    tokens_used INTEGER,
    response_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_history_session ON chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at);

-- ----------------------------------------------------------
-- Table: ml_predictions_log
-- Audit log semua prediksi ML
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS ml_predictions_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_execution_id VARCHAR(255),
    task_type VARCHAR(100) NOT NULL,   -- 'recommend_crop', 'predict_yield', etc.
    input_data JSONB NOT NULL,
    output_data JSONB,
    model_version VARCHAR(50),
    confidence_score FLOAT,
    processing_time_ms INTEGER,
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'error', 'timeout')),
    error_message TEXT,
    session_id VARCHAR(255),
    user_location JSONB,               -- lat/lon jika ada
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ml_predictions_task ON ml_predictions_log(task_type);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_created_at ON ml_predictions_log(created_at);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_status ON ml_predictions_log(status);

-- ----------------------------------------------------------
-- Table: commodity_prices
-- Menyimpan historis harga komoditas (WF-04)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS commodity_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commodity_name VARCHAR(100) NOT NULL,
    commodity_code VARCHAR(50),
    price NUMERIC(12, 2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'kg',
    province VARCHAR(100),
    market_name VARCHAR(200),
    source VARCHAR(100) DEFAULT 'BAPANAS',
    price_date DATE NOT NULL,
    prev_price NUMERIC(12, 2),
    change_pct FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prices_commodity ON commodity_prices(commodity_name);
CREATE INDEX IF NOT EXISTS idx_prices_date ON commodity_prices(price_date);
CREATE INDEX IF NOT EXISTS idx_prices_province ON commodity_prices(province);
CREATE UNIQUE INDEX IF NOT EXISTS idx_prices_unique ON commodity_prices(commodity_name, province, price_date);

-- ----------------------------------------------------------
-- Table: price_alerts
-- Alert harga yang dikirim ke pengguna
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS price_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commodity_name VARCHAR(100) NOT NULL,
    alert_type VARCHAR(50),            -- 'price_spike', 'price_drop', 'threshold_breach'
    old_price NUMERIC(12, 2),
    new_price NUMERIC(12, 2),
    change_pct FLOAT,
    message TEXT,
    notification_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- Table: cv_analysis_reports
-- Laporan analisis Computer Vision (WF-03)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS cv_analysis_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_execution_id VARCHAR(255),
    analysis_type VARCHAR(50) NOT NULL, -- 'disease_detection', 'bwd_analysis'
    image_filename VARCHAR(255),
    image_size_bytes INTEGER,
    detections JSONB,                   -- Roboflow detection results
    bwd_results JSONB,                  -- BWD analysis results
    ai_interpretation TEXT,            -- Gemini AI interpretation
    confidence_avg FLOAT,
    status VARCHAR(20) DEFAULT 'success',
    session_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cv_reports_type ON cv_analysis_reports(analysis_type);
CREATE INDEX IF NOT EXISTS idx_cv_reports_created_at ON cv_analysis_reports(created_at);

-- ----------------------------------------------------------
-- Table: model_performance_metrics
-- MLOps monitoring metrics (WF-06)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS model_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50),
    metric_name VARCHAR(100) NOT NULL,  -- 'accuracy', 'rmse', 'f1', etc.
    metric_value FLOAT NOT NULL,
    baseline_value FLOAT,
    drift_detected BOOLEAN DEFAULT FALSE,
    drift_magnitude FLOAT,
    total_predictions INTEGER,
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    mlflow_run_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_model_metrics_name ON model_performance_metrics(model_name);
CREATE INDEX IF NOT EXISTS idx_model_metrics_created_at ON model_performance_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_model_metrics_drift ON model_performance_metrics(drift_detected);

-- ----------------------------------------------------------
-- Table: notifications_log
-- Log semua notifikasi yang dikirim (WF-07)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_type VARCHAR(100) NOT NULL,
    channel VARCHAR(50) NOT NULL,      -- 'email', 'telegram', 'push', 'webhook'
    recipient VARCHAR(255),
    subject VARCHAR(500),
    message TEXT,
    payload JSONB,
    status VARCHAR(20) DEFAULT 'sent',
    error_message TEXT,
    triggered_by_workflow VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_channel ON notifications_log(channel);
CREATE INDEX IF NOT EXISTS idx_notif_created_at ON notifications_log(created_at);
CREATE INDEX IF NOT EXISTS idx_notif_status ON notifications_log(status);

-- ----------------------------------------------------------
-- Table: weather_data_cache
-- Cache data cuaca per lokasi (WF-05)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS weather_data_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    location_name VARCHAR(255),
    province VARCHAR(100),
    weather_data JSONB,
    climate_data JSONB,
    planting_calendar JSONB,
    forecast_date DATE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weather_location ON weather_data_cache(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_weather_expires ON weather_data_cache(expires_at);

-- ----------------------------------------------------------
-- View: v_ml_task_summary
-- Summary statistik per task ML
-- ----------------------------------------------------------
CREATE OR REPLACE VIEW v_ml_task_summary AS
SELECT
    task_type,
    COUNT(*) AS total_requests,
    COUNT(CASE WHEN status = 'success' THEN 1 END) AS successful,
    COUNT(CASE WHEN status = 'error' THEN 1 END) AS failed,
    ROUND(AVG(processing_time_ms)::numeric, 0) AS avg_response_ms,
    ROUND(AVG(confidence_score)::numeric, 3) AS avg_confidence,
    DATE_TRUNC('day', created_at) AS day
FROM ml_predictions_log
GROUP BY task_type, DATE_TRUNC('day', created_at)
ORDER BY day DESC, total_requests DESC;

-- ----------------------------------------------------------
-- View: v_commodity_price_latest
-- Harga komoditas terkini
-- ----------------------------------------------------------
CREATE OR REPLACE VIEW v_commodity_price_latest AS
SELECT DISTINCT ON (commodity_name, province)
    commodity_name,
    province,
    price,
    unit,
    change_pct,
    price_date,
    source
-- ----------------------------------------------------------
-- Table: workflow_error_logs
-- Dead Letter Queue & Error log untuk WF-99 Global Error Handler
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS workflow_error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id VARCHAR(100) NOT NULL,
    workflow_name VARCHAR(255) NOT NULL,
    execution_id VARCHAR(255),
    node_name VARCHAR(255),
    error_message TEXT NOT NULL,
    error_stack TEXT,
    input_data JSONB,
    severity VARCHAR(20) DEFAULT 'error' CHECK (severity IN ('warning', 'error', 'critical')),
    alert_sent BOOLEAN DEFAULT FALSE,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_error_workflow ON workflow_error_logs(workflow_name);
CREATE INDEX IF NOT EXISTS idx_error_severity ON workflow_error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_created_at ON workflow_error_logs(created_at);

-- ----------------------------------------------------------
-- Table: knowledge_ingestion_log
-- Riwayat dokumen yang di-ingest ke RAG ChromaDB (WF-10)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS knowledge_ingestion_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_title VARCHAR(500) NOT NULL,
    source_type VARCHAR(50) NOT NULL,    -- 'pdf', 'url', 'docx', 'manual'
    source_url VARCHAR(1000),
    total_chunks INTEGER NOT NULL,
    total_characters INTEGER,
    collection_name VARCHAR(100) DEFAULT 'agrisensa_kb',
    ingestion_status VARCHAR(20) DEFAULT 'completed',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ingest_source ON knowledge_ingestion_log(source_type);
CREATE INDEX IF NOT EXISTS idx_ingest_created_at ON knowledge_ingestion_log(created_at);

GRANT SELECT ON ALL TABLES IN SCHEMA public TO n8n;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO n8n;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO n8n;
