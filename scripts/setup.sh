#!/bin/bash

# Script de setup do Sistema de Análise de Custos de Fornecedores
# Este script configura o ambiente de desenvolvimento

set -e

echo "🚀 Configurando Sistema de Análise de Custos de Fornecedores..."

# Verificar se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 não encontrado. Por favor, instale Python 3.11+"
    exit 1
fi

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js 20+"
    exit 1
fi

# Verificar se pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    echo "📦 Instalando pnpm..."
    npm install -g pnpm
fi

echo "🐍 Configurando Backend..."

# Configurar backend
cd backend

# Criar ambiente virtual se não existir
if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual Python..."
    python3 -m venv venv
fi

# Ativar ambiente virtual
source venv/bin/activate

# Instalar dependências
echo "📦 Instalando dependências Python..."
pip install --upgrade pip
pip install -r requirements.txt

# Inicializar banco de dados
echo "🗄️ Inicializando banco de dados..."
python -c "
from main import app, db
with app.app_context():
    db.create_all()
    print('Banco de dados inicializado!')
"

cd ..

echo "⚛️ Configurando Frontend..."

# Configurar frontend
cd frontend

# Instalar dependências
echo "📦 Instalando dependências Node.js..."
pnpm install

# Build do frontend
echo "🔨 Construindo frontend..."
pnpm run build

cd ..

# Copiar frontend para backend
echo "🔗 Integrando frontend com backend..."
rm -rf backend/static/*
cp -r frontend/dist/* backend/static/

echo "✅ Setup concluído com sucesso!"
echo ""
echo "Para iniciar o sistema, execute:"
echo "  ./scripts/start.sh"
echo ""
echo "Ou use Docker:"
echo "  docker-compose up -d"
echo ""
echo "Acesse: http://localhost:5000"
echo "Usuário: admin | Senha: admin123"

