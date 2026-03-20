@echo off
REM run.bat - The simplest way to start the API
REM Just double-click this file or run: run.bat

echo.
echo ================================
echo   Starting LegalRO API...
echo ================================
echo.

REM Navigate to the correct directory
cd /d "%~dp0"

REM Kill any existing instances silently
taskkill /F /IM legal.exe >NUL 2>&1

REM Wait a moment
timeout /t 1 >NUL

REM Start the API
dotnet run --launch-profile https

REM If the above fails, try without building
REM dotnet run --no-build --launch-profile https
