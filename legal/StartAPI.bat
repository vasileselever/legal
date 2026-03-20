@echo off
REM StartAPI.bat - Simple batch file to start the API with checks
echo ========================================
echo   LegalRO Case Management API Starter
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Checking for running instances...
tasklist /FI "IMAGENAME eq legal.exe" 2>NUL | find /I /N "legal.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo    Found running API instance!
    echo    Stopping it...
    taskkill /F /IM legal.exe >NUL 2>&1
    timeout /t 2 >NUL
    echo    Stopped.
) else (
    echo    No existing instances found.
)

echo.
echo [2/3] Building project...
dotnet build --verbosity quiet
if %ERRORLEVEL% NEQ 0 (
    echo    Build failed!
    pause
    exit /b 1
)
echo    Build successful.

echo.
echo [3/3] Starting API...
echo.
echo ========================================
echo   API Starting...
echo ========================================
echo.
echo Access at:
echo   - HTTPS: https://localhost:5001
echo   - HTTP:  http://localhost:5000
echo   - Swagger: https://localhost:5001
echo.
echo Press Ctrl+C to stop
echo.

dotnet run --launch-profile https
