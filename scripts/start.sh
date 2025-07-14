#!/bin/bash

# Script para iniciar o Sistema de Análise de Custos de Fornecedores

set -e

echo "🚀 Iniciando Sistema de Análise de Custos de Fornecedores..."

# Verificar se o setup foi executado
if [ ! -d "backend/venv" ]; then
    echo "❌ Ambiente não configurado. Execute primeiro:"
    echo "  ./scripts/setup.sh"
    exit 1
fi

# Iniciar backend
echo "🐍 Iniciando backend Flask..."
cd backend
source venv/bin/activate

# Verificar se o banco existe, se não, criar
if [ ! -f "app.db" ]; then
    echo "🗄️ Criando banco de dados..."
    python -c "
from main import app, db
with app.app_context():
    db.create_all()
    print('Banco de dados criado!')
"
fi

# Iniciar servidor Flask
echo "🌐 Servidor iniciando em http://localhost:5000"
echo "📋 Credenciais: admin / admin123"
echo ""
echo "Para parar o servidor, pressione Ctrl+C"
echo ""

python main.py

