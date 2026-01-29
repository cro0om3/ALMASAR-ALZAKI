@echo off
chcp 65001 >nul
echo ========================================
echo   ALMSAR ALZAKI Transport and Maintenance - CRM System
echo ========================================
echo.

REM Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js غير مثبت!
    echo 💡 قم بتثبيت Node.js من: https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js موجود
node --version
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 تثبيت Dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ فشل تثبيت Dependencies!
        pause
        exit /b 1
    )
    echo ✅ تم تثبيت Dependencies
    echo.
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo ⚠️  ملف .env.local غير موجود!
    echo 💡 انسخ .env.example إلى .env.local وحدّث DATABASE_URL
    echo.
)

REM Generate Prisma Client
echo 🔄 توليد Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ⚠️  فشل توليد Prisma Client (قد يكون DATABASE_URL غير صحيح)
    echo.
)

echo.
echo 🚀 بدء تشغيل Development Server...
echo 📍 افتح: http://localhost:3000
echo ⏹️  اضغط Ctrl+C لإيقاف السيرفر
echo.

call npm run dev

pause
