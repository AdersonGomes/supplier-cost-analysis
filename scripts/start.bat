@echo off
<<<<<<< HEAD
chcp 65001 >nul
REM Script para iniciar o Sistema de Analise de Custos no Windows

echo.
echo Iniciando Sistema de Analise de Custos...
=======
REM Script para iniciar o Sistema de Análise de Custos no Windows

echo.
echo 🚀 Iniciando Sistema de Análise de Custos...
>>>>>>> 8493e763a1557008086c42772471158dcc623c90
echo.

cd backend
call venv\Scripts\activate.bat

<<<<<<< HEAD
echo Servidor iniciando em http://localhost:5000
echo Credenciais: admin / admin123
=======
echo 🌐 Servidor iniciando em http://localhost:5000
echo 📋 Credenciais: admin / admin123
>>>>>>> 8493e763a1557008086c42772471158dcc623c90
echo.
echo Para parar, pressione Ctrl+C
echo.

python main.py

