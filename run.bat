@echo off
echo ========================================
echo   ALMSAR ALZAKI T&M - CRM System
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting development server...
echo Open http://localhost:3015 in your browser
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause
