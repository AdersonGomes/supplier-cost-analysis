@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1

echo ========================================
echo Sistema de Analise de Custos - Verificacao
echo ========================================
echo.

REM Verificar se estamos no diretorio correto
if not exist "backend\main.py" (
    echo ERRO: Execute este script a partir da pasta raiz do projeto
    pause
    exit /b 1
)

echo [1] Verificando pre-requisitos...
echo.

REM Verificar Python
echo Python:
python --version 2>nul
if errorlevel 1 (
    echo   ERRO: Python nao encontrado
    echo   Instale de: https://python.org/downloads/windows/
) else (
    echo   OK
)

REM Verificar Node.js
echo Node.js:
node --version 2>nul
if errorlevel 1 (
    echo   ERRO: Node.js nao encontrado
    echo   Instale de: https://nodejs.org/download/
) else (
    echo   OK
)

REM Verificar pnpm
echo pnpm:
pnpm --version 2>nul
if errorlevel 1 (
    echo   AVISO: pnpm nao encontrado (sera instalado automaticamente)
) else (
    echo   OK
)

echo.
echo [2] Verificando estrutura do projeto...
echo.

REM Verificar arquivos principais
if exist "backend\main.py" (
    echo backend\main.py: OK
) else (
    echo backend\main.py: ERRO - Arquivo nao encontrado
)

if exist "frontend\package.json" (
    echo frontend\package.json: OK
) else (
    echo frontend\package.json: ERRO - Arquivo nao encontrado
)

if exist "backend\requirements.txt" (
    echo backend\requirements.txt: OK
) else (
    echo backend\requirements.txt: ERRO - Arquivo nao encontrado
)

echo.
echo [3] Verificando instalacao...
echo.

REM Verificar ambiente virtual
if exist "backend\venv" (
    echo Ambiente virtual: OK
) else (
    echo Ambiente virtual: NAO ENCONTRADO - Execute scripts\setup.bat
)

REM Verificar node_modules
if exist "frontend\node_modules" (
    echo Node modules: OK
) else (
    echo Node modules: NAO ENCONTRADO - Execute scripts\setup.bat
)

REM Verificar build
if exist "frontend\dist" (
    echo Build frontend: OK
) else (
    echo Build frontend: NAO ENCONTRADO - Execute scripts\setup.bat
)

REM Verificar integracao
if exist "backend\static\index.html" (
    echo Integracao frontend/backend: OK
) else (
    echo Integracao frontend/backend: NAO ENCONTRADA - Execute scripts\setup.bat
)

echo.
echo [4] Testando imports Python...
echo.

if exist "backend\venv" (
    cd backend
    call venv\Scripts\activate.bat
    
    echo Testando imports basicos...
    python -c "import flask; print('Flask: OK')" 2>nul
    if errorlevel 1 (
        echo Flask: ERRO
    )
    
    python -c "import pandas; print('Pandas: OK')" 2>nul
    if errorlevel 1 (
        echo Pandas: ERRO
    )
    
    echo Testando imports do projeto...
    python -c "from models.user import db; print('Models: OK')" 2>nul
    if errorlevel 1 (
        echo Models: ERRO - Problema nos imports
    )
    
    python -c "from routes.auth import auth_bp; print('Routes: OK')" 2>nul
    if errorlevel 1 (
        echo Routes: ERRO - Problema nos imports
    )
    
    cd ..
) else (
    echo Ambiente virtual nao encontrado - Execute scripts\setup.bat
)

echo.
echo [5] Verificando portas...
echo.

netstat -an | findstr ":5000" >nul 2>&1
if not errorlevel 1 (
    echo Porta 5000: EM USO - Pode causar conflito
) else (
    echo Porta 5000: LIVRE
)

netstat -an | findstr ":3000" >nul 2>&1
if not errorlevel 1 (
    echo Porta 3000: EM USO - Pode causar conflito no dev mode
) else (
    echo Porta 3000: LIVRE
)

echo.
echo ========================================
echo Verificacao concluida!
echo ========================================
echo.

if exist "backend\venv" if exist "frontend\node_modules" if exist "backend\static\index.html" (
    echo STATUS: Sistema pronto para uso!
    echo Execute: scripts\start.bat
) else (
    echo STATUS: Sistema precisa ser configurado
    echo Execute: scripts\setup.bat
)

echo.
pause

