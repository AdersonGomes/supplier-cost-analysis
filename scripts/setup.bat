@echo off
<<<<<<< HEAD
chcp 65001 >nul
REM Script de setup do Sistema de Analise de Custos de Fornecedores para Windows

echo.
echo Configurando Sistema de Analise de Custos de Fornecedores...
echo.

REM Verificar se Python esta instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo Python nao encontrado. Instale Python 3.11+ de https://python.org
=======
REM Script de setup do Sistema de Análise de Custos de Fornecedores para Windows

echo.
echo 🚀 Configurando Sistema de Análise de Custos de Fornecedores...
echo.

REM Verificar se Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python não encontrado. Instale Python 3.11+ de https://python.org
>>>>>>> 8493e763a1557008086c42772471158dcc623c90
    pause
    exit /b 1
)

<<<<<<< HEAD
REM Verificar se Node.js esta instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js nao encontrado. Instale Node.js 20+ de https://nodejs.org
=======
REM Verificar se Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado. Instale Node.js 20+ de https://nodejs.org
>>>>>>> 8493e763a1557008086c42772471158dcc623c90
    pause
    exit /b 1
)

<<<<<<< HEAD
echo Configurando Backend...
=======
echo 🐍 Configurando Backend...
>>>>>>> 8493e763a1557008086c42772471158dcc623c90
cd backend

REM Criar ambiente virtual
if not exist "venv" (
    python -m venv venv
)

REM Ativar ambiente virtual
call venv\Scripts\activate.bat

<<<<<<< HEAD
REM Instalar dependencias
=======
REM Instalar dependências
>>>>>>> 8493e763a1557008086c42772471158dcc623c90
pip install --upgrade pip
pip install -r requirements.txt

REM Inicializar banco de dados
python -c "from main import app, db; app.app_context().push(); db.create_all(); print('Banco inicializado!')"

cd ..

<<<<<<< HEAD
echo Configurando Frontend...
cd frontend

REM Instalar pnpm se necessario
=======
echo ⚛️ Configurando Frontend...
cd frontend

REM Instalar pnpm se necessário
>>>>>>> 8493e763a1557008086c42772471158dcc623c90
pnpm --version >nul 2>&1
if errorlevel 1 (
    npm install -g pnpm
)

<<<<<<< HEAD
REM Instalar dependencias
=======
REM Instalar dependências
>>>>>>> 8493e763a1557008086c42772471158dcc623c90
pnpm install

REM Build do frontend
pnpm run build

cd ..

REM Copiar frontend para backend
if exist "backend\static" rmdir /s /q "backend\static"
mkdir "backend\static"
xcopy "frontend\dist\*" "backend\static\" /s /e /y

echo.
<<<<<<< HEAD
echo Setup concluido! Execute: scripts\start.bat
=======
echo ✅ Setup concluído! Execute: scripts\start.bat
>>>>>>> 8493e763a1557008086c42772471158dcc623c90
pause

