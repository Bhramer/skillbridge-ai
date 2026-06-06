@echo off
REM Launch SkillBridge AI backend and frontend from the repository root.
REM Double-click this file in Explorer to start both servers.

REM Change to the repo root directory where this script lives.
cd /d "%~dp0"

REM Start the backend in a new window using the virtual environment Python.
start "SkillBridge Backend" cmd /k "cd /d "%~dp0backend" && "%~dp0\.venv\Scripts\python.exe" -m uvicorn app.main:app --reload --port 8000"

REM Wait a moment so the backend window can open.
timeout /t 2 /nobreak >nul

REM Start the frontend in a new window from the frontend directory.
start "SkillBridge Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

REM Close this launcher window automatically.
exit
