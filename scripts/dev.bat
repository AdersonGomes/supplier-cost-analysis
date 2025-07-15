@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1

echo ========================================
echo Sistema de Analise de Custos - Dev Mode
echo ========================================
echo.

REM Verificar se estamos no diretorio correto
if not exist "backend\main.py" (
    echo ERRO: Execute este script a partir da pasta raiz do projeto
    pause
    exit /b 1
)

echo Escolha o modo de desenvolvimento:
echo.
echo 1. Backend apenas (API em http://localhost:5000)
echo 2. Frontend apenas (Dev server em http://localhost:3000)
echo 3. Ambos separados (2 terminais)
echo 4. Integrado (Frontend build + Backend)
echo.
set /p choice="Digite sua opcao (1-4): "

if "%choice%"=="1" goto backend_only
if "%choice%"=="2" goto frontend_only
if "%choice%"=="3" goto both_separate
if "%choice%"=="4" goto integrated
echo Opcao invalida
pause
exit /b 1

:backend_only
echo.
echo Iniciando apenas Backend...
cd backend
call venv\Scripts\activate.bat
echo Backend rodando em: http://localhost:5000
python main.py
goto end

:frontend_only
echo.
echo Iniciando apenas Frontend...
cd frontend
echo Frontend rodando em: http://localhost:3000
pnpm run dev
goto end

:both_separate
echo.
echo Abrindo 2 terminais...
start "Backend - API" cmd /k "cd backend && venv\Scripts\activate.bat && echo Backend: http://localhost:5000 && python main.py"
start "Frontend - Dev" cmd /k "cd frontend && echo Frontend: http://localhost:3000 && pnpm run dev"
echo Terminais abertos!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
pause
goto end

:integrated
echo.
echo Modo integrado - construindo frontend...
cd frontend
pnpm run build
cd ..
if exist "backend\static" rmdir /s /q "backend\static"
mkdir "backend\static"
xcopy "frontend\dist\*" "backend\static\" /s /e /y /q >nul
cd backend
call venv\Scripts\activate.bat
echo Sistema integrado: http://localhost:5000
python main.py
goto end

:end

