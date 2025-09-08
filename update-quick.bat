@echo off
echo ========================================
echo    TRANSCREVER PRO - ATUALIZACAO RAPIDA
echo ========================================
echo.

echo [1/4] Parando servicos...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im "Transcrever Pro.exe" >nul 2>&1
echo Servicos parados.

echo.
echo [2/4] Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias do frontend
    pause
    exit /b 1
)

cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias do backend
    cd ..
    pause
    exit /b 1
)
cd ..
echo Dependencias instaladas.

echo.
echo [3/4] Testando aplicacao...
echo Iniciando backend...
start /b cmd /c "cd backend && npm run dev"
timeout /t 3 >nul

echo Iniciando frontend...
start /b cmd /c "npm run dev"
timeout /t 5 >nul

echo.
echo [4/4] Abrindo aplicacao...
start http://localhost:5173

echo.
echo ========================================
echo   ATUALIZACAO CONCLUIDA COM SUCESSO!
echo ========================================
echo.
echo A aplicacao esta rodando em:
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:3001
echo.
echo Para gerar um novo instalador, execute:
echo   node build-installer.js
echo.
pause