@echo off
chcp 65001 >nul
echo ============================================
echo    WebStore - Setup Script (Windows)
echo ============================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js 18+
    echo https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js found

if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env
        echo Created .env file from example
        echo Please edit .env file with your database connection details
        pause
    )
)

echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies
    pause
    exit /b 1
)
echo Dependencies installed successfully

if not exist "uploads" mkdir uploads
echo uploads directory ready

echo.
echo ============================================
echo    Setup Complete!
echo ============================================
echo.
echo To import database, run:
echo   psql YOUR_DATABASE_URL ^< database-full-backup.sql
echo.
echo To start the app:
echo   npm start
echo.
echo App will run on: http://localhost:5000
echo.
pause
