@echo off
chcp 65001 >nul
REM Script para limpar instalacao anterior

echo.
echo Limpando instalacao anterior...
echo.

REM Limpar ambiente virtual
if exist "backend\venv" (
    echo Removendo ambiente virtual...
    rmdir /s /q "backend\venv"
)

REM Limpar node_modules
if exist "frontend\node_modules" (
    echo Removendo node_modules...
    rmdir /s /q "frontend\node_modules"
)

REM Limpar build
if exist "frontend\dist" (
    echo Removendo build anterior...
    rmdir /s /q "frontend\dist"
)

REM Limpar static
if exist "backend\static" (
    echo Removendo static anterior...
    rmdir /s /q "backend\static"
)

REM Limpar banco de dados
if exist "backend\database\app.db" (
    echo Removendo banco anterior...
    del "backend\database\app.db"
)

echo.
echo Limpeza concluida! Execute: scripts\setup.bat
pause

