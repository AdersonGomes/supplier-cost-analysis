# Sistema de Análise de Custos de Fornecedores

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-2.3+-000000.svg)](https://flask.palletsprojects.com/)

Uma ferramenta web completa para gerenciar e aprovar tabelas de custos de fornecedores com fluxo de aprovação automatizado e múltiplas alçadas baseadas em valores e impacto financeiro.

## 🚀 Características Principais

- **Fluxo de Aprovação Automatizado**: Workflow de 30 dias com múltiplas alçadas
- **Análise de Impacto**: Cálculo automático de impacto financeiro
- **Interface Responsiva**: Design moderno e responsivo para desktop e mobile
- **Controle de Acesso**: Sistema de roles com diferentes níveis de permissão
- **Dashboard Interativo**: Métricas em tempo real e acompanhamento de atividades
- **Upload de Arquivos**: Suporte para Excel (.xlsx, .xls) e CSV
- **Auditoria Completa**: Histórico detalhado de todas as ações

## 🏗️ Arquitetura

```
supplier-cost-analysis/
├── backend/                 # API Flask + SQLAlchemy
├── frontend/                # React + Tailwind CSS
├── docs/                    # Documentação completa
├── scripts/                 # Scripts de automação
├── .github/workflows/       # CI/CD GitHub Actions
├── docker-compose.yml       # Configuração Docker
└── README.md               # Este arquivo
```

## 🛠️ Tecnologias

### Backend
- **Flask**: Framework web Python
- **SQLAlchemy**: ORM para banco de dados
- **Pandas**: Análise e manipulação de dados
- **OpenPyXL**: Processamento de arquivos Excel

### Frontend
- **React 18**: Biblioteca JavaScript para UI
- **Tailwind CSS**: Framework CSS utilitário
- **Shadcn/UI**: Componentes de interface
- **React Router**: Roteamento SPA

## 🚀 Início Rápido

### Pré-requisitos
- Python 3.11+
- Node.js 20+
- pnpm

### Instalação com Docker (Recomendado)
```bash
git clone <url-do-repositorio>
cd supplier-cost-analysis
docker-compose up -d
```

### Instalação Manual
```bash
# Clone o repositório
git clone <url-do-repositorio>
cd supplier-cost-analysis

# Execute o script de setup
./scripts/setup.sh

# Inicie o sistema
./scripts/start.sh
```

### Acesso
- **URL**: http://localhost:5000
- **Usuário**: admin
- **Senha**: admin123

## 📋 Funcionalidades por Role

| Funcionalidade | Fornecedor | Comprador | Analista | Gerente | Diretor | VP | Admin |
|----------------|------------|-----------|----------|---------|---------|----|----- |
| Upload Tabelas | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Aprovar Tabelas | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Relatórios | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Configurações | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

## 🔄 Fluxo de Aprovação

1. **Fornecedor** envia tabela de custos
2. **Comprador de Categoria** valida recebimento (2 dias)
3. **Analista de Pricing** realiza análise (5 dias)
4. **Aprovação baseada em valor**:
   - Até R$ 50k: Gerente Comercial
   - R$ 50k-200k: + Diretor Comercial + Diretor Pricing
   - R$ 200k-500k: + Vice Presidência
   - Acima R$ 500k: Toda a cadeia

## 📚 Documentação

- [Manual do Usuário](docs/manual_usuario.md)
- [Documentação Técnica](docs/requisitos_sistema.md)
- [Sistema de Design](docs/design_system.md)
- [Resumo Executivo](docs/resumo_executivo.md)

## 🧪 Testes

```bash
# Backend
cd backend
python -m pytest

# Frontend
cd frontend
pnpm test
```

## 🚀 Deploy

### Desenvolvimento
```bash
./scripts/dev.sh
```

### Produção
```bash
./scripts/deploy.sh
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **Documentação**: [docs/](docs/)
- **Issues**: [GitHub Issues](../../issues)
- **Discussões**: [GitHub Discussions](../../discussions)

---

**Desenvolvido com ❤️ para otimizar o processo de aprovação de custos de fornecedores**

