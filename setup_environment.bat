@echo off
echo ========================================
echo    CONFIGURACAO DO AMBIENTE WHISPER
echo ========================================
echo.

echo Verificando se o Python esta instalado...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Python nao encontrado!
    echo Por favor, instale o Python 3.8 ou superior de https://python.org
    pause
    exit /b 1
)

echo Python encontrado!
echo.

echo Verificando se o FFmpeg esta instalado...
ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 (
    echo AVISO: FFmpeg nao encontrado!
    echo O FFmpeg e necessario para processar arquivos de video.
    echo Baixe de https://ffmpeg.org/download.html
    echo.
)

echo Instalando dependencias Python...
echo.
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias!
    pause
    exit /b 1
)

echo.
echo ========================================
echo    CONFIGURACAO CONCLUIDA COM SUCESSO!
echo ========================================
echo.
echo O sistema esta pronto para uso.
echo Arraste um arquivo de audio/video para "Solte seu arquivo aqui.bat"
echo.
pause