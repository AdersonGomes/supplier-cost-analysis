@echo off
REM Script para iniciar o Sistema de Análise de Custos no Windows

echo.
echo 🚀 Iniciando Sistema de Análise de Custos...
echo.

cd backend
call venv\Scripts\activate.bat

echo 🌐 Servidor iniciando em http://localhost:5000
echo 📋 Credenciais: admin / admin123
echo.
echo Para parar, pressione Ctrl+C
echo.

python main.py

