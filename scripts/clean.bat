@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1

echo ========================================
echo Sistema de Analise de Custos - Limpeza
echo ========================================
echo.

REM Verificar se estamos no diretorio correto
if not exist "backend\main.py" (
    echo ERRO: Execute este script a partir da pasta raiz do projeto
    pause
    exit /b 1
)

echo ATENCAO: Este script ira remover:
echo - Ambiente virtual Python (backend\venv)
echo - Dependencias Node.js (frontend\node_modules)
echo - Build do frontend (frontend\dist)
echo - Arquivos estaticos (backend\static)
echo - Banco de dados (backend\database\app.db)
echo - Arquivos de upload (backend\uploads)
echo.
set /p confirm="Deseja continuar? (S/N): "
if /i not "%confirm%"=="S" (
    echo Operacao cancelada
    pause
    exit /b 0
)

echo.
echo Iniciando limpeza...

REM Parar processos Python que possam estar rodando
echo Parando processos Python...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

REM Aguardar um pouco
timeout /t 2 /nobreak >nul

REM Limpar backend
echo Limpando backend...
if exist "backend\venv" (
    echo - Removendo ambiente virtual...
    rmdir /s /q "backend\venv" 2>nul
)

if exist "backend\static" (
    echo - Removendo arquivos estaticos...
    rmdir /s /q "backend\static" 2>nul
)

if exist "backend\database\app.db" (
    echo - Removendo banco de dados...
    del "backend\database\app.db" 2>nul
)

if exist "backend\uploads" (
    echo - Removendo uploads...
    rmdir /s /q "backend\uploads" 2>nul
)

REM Limpar frontend
echo Limpando frontend...
if exist "frontend\node_modules" (
    echo - Removendo node_modules...
    rmdir /s /q "frontend\node_modules" 2>nul
)

if exist "frontend\dist" (
    echo - Removendo build...
    rmdir /s /q "frontend\dist" 2>nul
)

if exist "frontend\.next" (
    echo - Removendo cache Next.js...
    rmdir /s /q "frontend\.next" 2>nul
)

REM Limpar cache
echo Limpando cache...
if exist "%APPDATA%\npm-cache" (
    echo - Limpando cache npm...
    rmdir /s /q "%APPDATA%\npm-cache" 2>nul
)

echo.
echo ========================================
echo Limpeza concluida!
echo ========================================
echo.
echo Para reinstalar:
echo   scripts\setup.bat
echo.
pause

