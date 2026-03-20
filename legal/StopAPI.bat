@echo off
echo.
echo ============================================
echo    Stop LegalRO API
echo ============================================
echo.

echo [1/3] Finding processes on port 5053...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5053') do (
    echo Found process: %%a
    echo Stopping process %%a...
    taskkill /PID %%a /F
)

echo.
echo [2/3] Finding legal.exe processes...
tasklist | findstr /I "legal.exe"
if %ERRORLEVEL% EQU 0 (
    echo Stopping all legal.exe processes...
    taskkill /IM legal.exe /F
) else (
    echo No legal.exe processes found.
)

echo.
echo [3/3] Port 5053 status:
netstat -ano | findstr :5053
if %ERRORLEVEL% NEQ 0 (
    echo Port 5053 is now FREE!
) else (
    echo Port 5053 is still in use.
)

echo.
echo ============================================
echo    Done!
echo ============================================
echo.
echo You can now restart the API:
echo   cd legal
echo   dotnet run --launch-profile https
echo.
pause
