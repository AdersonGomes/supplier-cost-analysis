@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1

echo ========================================
echo Sistema de Analise de Custos - Start
echo ========================================
echo.

REM Verificar se estamos no diretorio correto
if not exist "backend\main.py" (
    echo ERRO: Execute este script a partir da pasta raiz do projeto
    echo Exemplo: C:\caminho\para\supplier-cost-analysis^> scripts\start.bat
    pause
    exit /b 1
)

REM Verificar se o setup foi executado
if not exist "backend\venv" (
    echo ERRO: Ambiente virtual nao encontrado
    echo Execute primeiro: scripts\setup.bat
    pause
    exit /b 1
)

if not exist "backend\static\index.html" (
    echo ERRO: Frontend nao encontrado
    echo Execute primeiro: scripts\setup.bat
    pause
    exit /b 1
)

echo Verificando porta 5000...
netstat -an | findstr ":5000" >nul 2>&1
if not errorlevel 1 (
    echo AVISO: Porta 5000 ja esta em uso
    echo Para liberar a porta:
    echo   1. Pressione Ctrl+C para cancelar
    echo   2. Execute: netstat -ano ^| findstr :5000
    echo   3. Execute: taskkill /PID [numero_do_processo] /F
    echo.
    echo Pressione qualquer tecla para continuar mesmo assim...
    pause >nul
)

echo Navegando para backend...
cd backend

echo Ativando ambiente virtual...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERRO: Falha ao ativar ambiente virtual
    echo Execute: scripts\setup.bat
    pause
    exit /b 1
)

echo.
echo ========================================
echo Servidor iniciando...
echo ========================================
echo.
echo URL: http://localhost:5000
echo Usuario: admin
echo Senha: admin123
echo.
echo Para parar o servidor: Pressione Ctrl+C
echo.

REM Iniciar servidor
python main.py

