@echo off
chcp 65001 > nul
title UpGear Launcher

echo.
echo  [UpGear Launcher]
echo.

:: --- path check ----------------------------------------------------------
set "ROOT=%~dp0"
set "SERVER_DIR=%ROOT%server"
set "APP_DIR=%ROOT%upgear-app"
set "READYAI_DIR=%ROOT%readyai-app"
set "ENV_FILE=%ROOT%.env"

if not exist "%SERVER_DIR%\index.js" (
    echo [ERROR] server\index.js not found: %SERVER_DIR%
    pause & exit /b 1
)
if not exist "%APP_DIR%\package.json" (
    echo [ERROR] upgear-app\package.json not found: %APP_DIR%
    pause & exit /b 1
)

:: --- Node.js check -------------------------------------------------------
where node > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not installed. Install from https://nodejs.org/
    pause & exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo  Node.js : %NODE_VER%

:: --- Install server node_modules -----------------------------------------
if not exist "%SERVER_DIR%\node_modules" (
    echo.
    echo  [1/4] server npm install...
    cd /d "%SERVER_DIR%"
    call npm install
    if %errorlevel% neq 0 ( echo [ERROR] server npm install failed & pause & exit /b 1 )
)

:: --- Install upgear-app node_modules -------------------------------------
if not exist "%APP_DIR%\node_modules" (
    echo.
    echo  [2/4] upgear-app npm install...
    cd /d "%APP_DIR%"
    call npm install
    if %errorlevel% neq 0 ( echo [ERROR] upgear-app npm install failed & pause & exit /b 1 )
)

:: --- Install Chromium (Playwright) once ----------------------------------
set "CHROMIUM_MARK=%APP_DIR%\node_modules\.chromium_installed"
if not exist "%CHROMIUM_MARK%" (
    echo.
    echo  [3/4] Chromium install (Playwright) ...
    cd /d "%APP_DIR%"
    call npx playwright install chromium
    if %errorlevel% equ 0 (
        echo installed > "%CHROMIUM_MARK%"
        echo  Chromium installed OK
    ) else (
        echo  [WARNING] Chromium install failed. Playwright analysis may not work.
    )
)

:: --- Install readyai-app node_modules ------------------------------------
if exist "%READYAI_DIR%\package.json" (
    if not exist "%READYAI_DIR%\node_modules" (
        echo.
        echo  [4/4] readyai-app npm install...
        cd /d "%READYAI_DIR%"
        call npm install
    )
)

:: --- .env check ----------------------------------------------------------
if not exist "%ENV_FILE%" (
    echo.
    echo  [WARNING] .env not found. Create %ENV_FILE% with:
    echo    RAKUTEN_APP_ID=xxxxx
    echo    ANTHROPIC_API_KEY=sk-ant-xxxxx
    echo.
)

:: --- Start server --------------------------------------------------------
echo.
echo  Starting UpGear Server (port 3001) ...
start "UpGear Server" cmd /k "cd /d "%SERVER_DIR%" && node --env-file=../.env index.js || (echo. && echo [ERROR] Server failed to start && pause)"

timeout /t 3 > nul

:: --- Start upgear-app ----------------------------------------------------
echo  Starting UpGear OS (port 5173) ...
start "UpGear App" cmd /k "cd /d "%APP_DIR%" && npm run dev || (echo. && echo [ERROR] Frontend failed && pause)"

:: --- Start readyai-app ---------------------------------------------------
if exist "%READYAI_DIR%\package.json" (
    echo  Starting ReadyAI (port 5174) ...
    start "ReadyAI" cmd /k "cd /d "%READYAI_DIR%" && npm run dev || (echo. && echo [ERROR] ReadyAI failed && pause)"
)

:: --- Open browser (Edge preferred) --------------------------------------
echo  Opening browser...
timeout /t 5 > nul

set "EDGE1=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
set "EDGE2=C:\Program Files\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE1%" (
    start "" "%EDGE1%" "http://localhost:5173"
) else if exist "%EDGE2%" (
    start "" "%EDGE2%" "http://localhost:5173"
) else (
    start "" "http://localhost:5173"
)

echo.
echo  UpGear started!
echo.
echo    UpGear OS  (admin) : http://localhost:5173
echo    ReadyAI    (public): http://localhost:5174
echo    Backend    (API)   : http://localhost:3001
echo.
echo  Close each window with Ctrl+C to stop.
echo.
timeout /t 5 > nul
exit
