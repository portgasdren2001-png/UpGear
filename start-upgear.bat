@echo off
chcp 65001 > nul
title UpGear Launcher

echo.
echo  ╔══════════════════════════════════╗
echo  ║         UpGear Launcher          ║
echo  ╚══════════════════════════════════╝
echo.

:: ─── パス確認 ───────────────────────────────────────────────
set "ROOT=%~dp0"
set "SERVER_DIR=%ROOT%server"
set "APP_DIR=%ROOT%upgear-app"
set "READYAI_DIR=%ROOT%readyai-app"

if not exist "%SERVER_DIR%\index.js" (
    echo [ERROR] server\index.js が見つかりません
    echo        場所: %SERVER_DIR%
    pause
    exit /b 1
)

if not exist "%APP_DIR%\package.json" (
    echo [ERROR] upgear-app\package.json が見つかりません
    echo        場所: %APP_DIR%
    pause
    exit /b 1
)

:: ─── Node.js 確認 ────────────────────────────────────────────
where node > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js がインストールされていません
    echo        https://nodejs.org/ からインストールしてください
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo  Node.js : %NODE_VER%

:: ─── 依存パッケージ確認 ──────────────────────────────────────
if not exist "%APP_DIR%\node_modules" (
    echo.
    echo  upgear-app の依存パッケージをインストール中...
    cd /d "%APP_DIR%"
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install が失敗しました
        pause
        exit /b 1
    )
)

if exist "%READYAI_DIR%\package.json" (
    if not exist "%READYAI_DIR%\node_modules" (
        echo.
        echo  readyai-app の依存パッケージをインストール中...
        cd /d "%READYAI_DIR%"
        call npm install
    )
)

:: ─── .env 確認 ───────────────────────────────────────────────
if not exist "%ROOT%.env" (
    echo.
    echo  [WARNING] .env ファイルが見つかりません
    echo            楽天API・Anthropic APIを使うには .env を作成してください
    echo            例: RAKUTEN_APP_ID=xxxxx
    echo                ANTHROPIC_API_KEY=sk-ant-xxxxx
    echo.
)

:: ─── server 起動 ─────────────────────────────────────────────
echo.
echo  [1/3] サーバーを起動中...
start "UpGear Server" cmd /k "cd /d "%SERVER_DIR%" && echo  UpGear Server 起動中... && node --env-file=../.env index.js || (echo. && echo [ERROR] サーバーの起動に失敗しました && pause)"

:: サーバーの起動を少し待つ
timeout /t 2 > nul

:: ─── upgear-app 起動 ─────────────────────────────────────────
echo  [2/4] UpGear OS を起動中...
start "UpGear App" cmd /k "cd /d "%APP_DIR%" && echo  UpGear App 起動中... && npm run dev || (echo. && echo [ERROR] フロントエンドの起動に失敗しました && pause)"

:: ─── readyai-app 起動 ─────────────────────────────────────────
if exist "%READYAI_DIR%\package.json" (
    echo  [3/4] ReadyAI を起動中...
    start "ReadyAI" cmd /k "cd /d "%READYAI_DIR%" && echo  ReadyAI 起動中... && npm run dev || (echo. && echo [ERROR] ReadyAI の起動に失敗しました && pause)"
)

:: フロントエンドの起動を待つ
echo  [4/4] ブラウザが開くまで少し待ちます...
timeout /t 4 > nul

:: ─── ブラウザを開く (Edge 優先) ──────────────────────────────
set "EDGE_PATH1=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
set "EDGE_PATH2=C:\Program Files\Microsoft\Edge\Application\msedge.exe"

if exist "%EDGE_PATH1%" (
    start "" "%EDGE_PATH1%" "http://localhost:5173"
) else if exist "%EDGE_PATH2%" (
    start "" "%EDGE_PATH2%" "http://localhost:5173"
) else (
    start "" "http://localhost:5173"
)

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║  UpGear が起動しました                           ║
echo  ║                                                  ║
echo  ║  UpGear OS (管理) : http://localhost:5173   ║
echo  ║  ReadyAI (公開)  : http://localhost:5174   ║
echo  ║  バックエンド      : http://localhost:3001   ║
echo  ║                                                  ║
echo  ║  終了するには各ウィンドウで Ctrl+C を押してください ║
echo  ╚══════════════════════════════════════════════════╝
echo.

timeout /t 5 > nul
exit
