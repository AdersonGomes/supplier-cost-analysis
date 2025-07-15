@echo off
chcp 65001 >nul
REM Script de setup do Sistema de Analise de Custos de Fornecedores para Windows

echo.
echo Configurando Sistema de Analise de Custos de Fornecedores...
echo.

REM Verificar se Python esta instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo Python nao encontrado. Instale Python 3.11+ de https://python.org
    pause
    exit /b 1
)

REM Verificar se Node.js esta instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js nao encontrado. Instale Node.js 20+ de https://nodejs.org
    pause
    exit /b 1
)

echo Configurando Backend...
cd backend

REM Criar ambiente virtual
if not exist "venv" (
    python -m venv venv
)

REM Ativar ambiente virtual
call venv\Scripts\activate.bat

REM Instalar dependencias
pip install --upgrade pip
pip install -r requirements.txt

REM Inicializar banco de dados
python -c "from main import app, db; app.app_context().push(); db.create_all(); print('Banco inicializado!')"

cd ..

echo Configurando Frontend...
cd frontend

REM Instalar pnpm se necessario
pnpm --version >nul 2>&1
if errorlevel 1 (
    npm install -g pnpm
)

REM Instalar dependencias
pnpm install

REM Build do frontend
pnpm run build

cd ..

REM Copiar frontend para backend
if exist "backend\static" rmdir /s /q "backend\static"
mkdir "backend\static"
xcopy "frontend\dist\*" "backend\static\" /s /e /y

echo.
echo Setup concluido! Execute: scripts\start.bat
pause

