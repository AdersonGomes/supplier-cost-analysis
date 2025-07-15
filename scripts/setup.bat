@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1

echo ========================================
echo Sistema de Analise de Custos - Setup
echo ========================================
echo.

REM Verificar se estamos no diretorio correto
if not exist "backend\main.py" (
    echo ERRO: Execute este script a partir da pasta raiz do projeto
    echo Exemplo: C:\caminho\para\supplier-cost-analysis^> scripts\setup.bat
    pause
    exit /b 1
)

echo [1/6] Verificando pre-requisitos...

REM Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Python nao encontrado
    echo Instale Python 3.11+ de: https://python.org/downloads/windows/
    echo IMPORTANTE: Marque "Add Python to PATH" durante a instalacao
    pause
    exit /b 1
)

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado
    echo Instale Node.js 20+ de: https://nodejs.org/download/
    pause
    exit /b 1
)

echo Python: OK
echo Node.js: OK
echo.

echo [2/6] Configurando Backend...

REM Navegar para backend
cd backend

REM Remover ambiente virtual anterior se existir
if exist "venv" (
    echo Removendo ambiente virtual anterior...
    rmdir /s /q "venv" 2>nul
)

REM Criar novo ambiente virtual
echo Criando ambiente virtual...
python -m venv venv
if errorlevel 1 (
    echo ERRO: Falha ao criar ambiente virtual
    pause
    exit /b 1
)

REM Ativar ambiente virtual
echo Ativando ambiente virtual...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERRO: Falha ao ativar ambiente virtual
    pause
    exit /b 1
)

REM Atualizar pip
echo Atualizando pip...
python -m pip install --upgrade pip --quiet

REM Instalar dependencias
echo Instalando dependencias Python...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias Python
    pause
    exit /b 1
)

REM Criar pastas necessarias
if not exist "database" mkdir database
if not exist "uploads" mkdir uploads
if not exist "static" mkdir static

REM Inicializar banco de dados
echo Inicializando banco de dados...
python -c "from main import app, db; app.app_context().push(); db.create_all(); print('Banco inicializado com sucesso!')"
if errorlevel 1 (
    echo ERRO: Falha ao inicializar banco de dados
    pause
    exit /b 1
)

REM Voltar para raiz
cd ..

echo [3/6] Configurando Frontend...

REM Navegar para frontend
cd frontend

REM Verificar se pnpm esta instalado
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo Instalando pnpm...
    npm install -g pnpm --silent
    if errorlevel 1 (
        echo ERRO: Falha ao instalar pnpm
        pause
        exit /b 1
    )
)

REM Remover node_modules anterior
if exist "node_modules" (
    echo Removendo node_modules anterior...
    rmdir /s /q "node_modules" 2>nul
)

REM Instalar dependencias
echo Instalando dependencias Node.js...
pnpm install --silent
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias Node.js
    pause
    exit /b 1
)

echo [4/6] Construindo Frontend...
pnpm run build --silent
if errorlevel 1 (
    echo ERRO: Falha ao construir frontend
    pause
    exit /b 1
)

REM Voltar para raiz
cd ..

echo [5/6] Integrando Frontend com Backend...

REM Limpar pasta static anterior
if exist "backend\static" (
    rmdir /s /q "backend\static" 2>nul
)

REM Criar pasta static
mkdir "backend\static" 2>nul

REM Copiar arquivos do frontend
echo Copiando arquivos do frontend...
xcopy "frontend\dist\*" "backend\static\" /s /e /y /q >nul
if errorlevel 1 (
    echo ERRO: Falha ao copiar arquivos do frontend
    pause
    exit /b 1
)

echo [6/6] Finalizando...

echo.
echo ========================================
echo Setup concluido com sucesso!
echo ========================================
echo.
echo Para iniciar o sistema:
echo   scripts\start.bat
echo.
echo Para acessar:
echo   URL: http://localhost:5000
echo   Usuario: admin
echo   Senha: admin123
echo.
pause

