@echo off
title AgriSensa Unified AI Ecosystem Launcher
color 0A
echo ============================================================
echo   AGRISENSA UNIFIED AI ECOSYSTEM (PORT 8000, 8001, 5678, 8501)
echo ============================================================
echo.

:: Detect Python executable (prefer py launcher on Windows if available)
where py >nul 2>&1
if %ERRORLEVEL% equ 0 (
    set "PY_CMD=py -3"
) else (
    set "PY_CMD=python"
)

echo [INFO] Using Python command: %PY_CMD%
echo.

echo [1/4] Starting AgriSensa MLOps API (Port 8000)...
start "AgriSensa MLOps API (8000)" cmd /k "cd /d "%~dp003_mlops_inference_api" && %PY_CMD% -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/4] Starting AgriSensa Advanced AI & MCP Engine (Port 8001)...
start "AgriSensa AI Engine (8001)" cmd /k "cd /d "%~dp002_ai_reasoning_mcp" && %PY_CMD% -m uvicorn api.main:app --host 0.0.0.0 --port 8001 --reload"

echo [3/4] Starting AgriSensa Streamlit Dashboard (Port 8501)...
start "AgriSensa Streamlit (8501)" cmd /k "cd /d "%~dp005_frontend_clients\agrisensa_streamlit_dashboard" && %PY_CMD% -m streamlit run Home.py"

echo.
echo [4/4] n8n Orchestrator Docker Stack:
echo To start n8n Docker:
echo   cd 01_n8n_orchestration
echo   docker-compose -f docker-compose.n8n.yml up -d
echo.
echo ============================================================
echo ALL LOCAL SERVICES INITIALIZED!
echo Swagger MLOps API  : http://localhost:8000/docs
echo Swagger AI Engine  : http://localhost:8001/docs
echo Streamlit Frontend : http://localhost:8501
echo n8n Webhook Engine : http://localhost:5678
echo ============================================================
echo.
pause
