@echo off
title AgriSensa Dependencies Installer
color 0B
echo ============================================================
echo   INSTALLING ALL AGRISENSA ECOSYSTEM DEPENDENCIES
echo ============================================================
echo.

where py >nul 2>&1
if %ERRORLEVEL% equ 0 (
    set "PY_CMD=py -3"
) else (
    set "PY_CMD=python"
)

echo [INFO] Using Python command: %PY_CMD%
echo.

echo [1/3] Installing dependencies for 02_ai_reasoning_mcp...
cd 02_ai_reasoning_mcp
%PY_CMD% -m pip install -r requirements.txt
cd ..

echo.
echo [2/3] Installing dependencies for 03_mlops_inference_api...
cd 03_mlops_inference_api
%PY_CMD% -m pip install -r requirements.txt
cd ..

echo.
echo [3/3] Installing dependencies for 05_frontend_clients\agrisensa_streamlit_dashboard...
cd 05_frontend_clients\agrisensa_streamlit_dashboard
%PY_CMD% -m pip install -r requirements.txt
cd ..\..

echo.
echo ============================================================
echo ALL DEPENDENCIES INSTALLED SUCCESSFULLY!
echo You can now launch the ecosystem using start_all_engines.bat
echo ============================================================
echo.
pause
