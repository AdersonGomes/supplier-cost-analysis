# Sistema de Análise de Custos - Windows

Guia completo para instalação e uso no Windows 10/11.

## 🚀 Instalação Rápida

### Pré-requisitos
- **Python 3.11+**: [Download](https://www.python.org/downloads/windows/) - ⚠️ Marque "Add Python to PATH"
- **Node.js 20+**: [Download](https://nodejs.org/en/download/)

### Instalação Automática
```cmd
git clone https://github.com/AdersonGomes/supplier-cost-analysis.git
cd supplier-cost-analysis
scripts\setup.bat
```

### Iniciar Sistema
```cmd
scripts\start.bat
```

### Acesso
- **URL**: http://localhost:5000
- **Usuário**: admin
- **Senha**: admin123

## 🔧 Solução de Problemas

### "Python não reconhecido"
Reinstale Python marcando "Add Python to PATH"

### "Porta 5000 em uso"
```cmd
netstat -ano | findstr :5000
taskkill /PID [número] /F
```

### "Acesso negado"
Execute o Prompt como Administrador

## 📁 Estrutura Windows
```
supplier-cost-analysis\
├── backend\
│   ├── venv\              # Ambiente virtual Python
│   ├── database\          # Banco SQLite
│   └── static\            # Frontend integrado
├── frontend\
│   └── dist\              # Build de produção
└── scripts\
    ├── setup.bat          # Instalação
    └── start.bat          # Iniciar sistema
```

## 🛠️ Comandos Úteis

**Reinstalar dependências:**
```cmd
cd backend
venv\Scripts\activate.bat
pip install -r requirements.txt
```

**Rebuild frontend:**
```cmd
cd frontend
pnpm run build
cd ..
xcopy "frontend\dist\*" "backend\static\" /s /e /y
```

**Verificar instalação:**
```cmd
python --version
node --version
pnpm --version
```

---
**Desenvolvido e testado no Windows 10/11** ✅

