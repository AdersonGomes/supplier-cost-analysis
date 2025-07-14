# Sistema de Análise de Custos de Fornecedores

Uma ferramenta web completa para gerenciar e aprovar tabelas de custos de fornecedores com fluxo de aprovação automatizado e múltiplas alçadas baseadas em valores e impacto financeiro.

## 🚀 Características Principais

- **Fluxo de Aprovação Automatizado**: Workflow de 30 dias com múltiplas alçadas
- **Análise de Impacto**: Cálculo automático de impacto financeiro
- **Interface Responsiva**: Design moderno e responsivo para desktop e mobile
- **Controle de Acesso**: Sistema de roles com diferentes níveis de permissão
- **Dashboard Interativo**: Métricas em tempo real e acompanhamento de atividades
- **Upload de Arquivos**: Suporte para Excel (.xlsx, .xls) e CSV
- **Auditoria Completa**: Histórico detalhado de todas as ações

## 🛠️ Tecnologias Utilizadas

### Backend
- **Flask**: Framework web Python
- **SQLAlchemy**: ORM para banco de dados
- **Flask-CORS**: Suporte a CORS
- **Pandas**: Análise e manipulação de dados
- **OpenPyXL**: Processamento de arquivos Excel

### Frontend
- **React**: Biblioteca JavaScript para UI
- **Tailwind CSS**: Framework CSS utilitário
- **Shadcn/UI**: Componentes de interface
- **Lucide Icons**: Ícones modernos
- **React Router**: Roteamento SPA

## 📋 Pré-requisitos

- Python 3.11+
- Node.js 20+
- pnpm (gerenciador de pacotes)

## 🔧 Instalação e Configuração

### 1. Clone o Repositório
```bash
git clone <url-do-repositorio>
cd supplier-cost-analysis
```

### 2. Configuração do Backend

```bash
# Navegar para o diretório do backend
cd supplier_cost_analysis

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt
```

### 3. Configuração do Frontend

```bash
# Navegar para o diretório do frontend
cd supplier-cost-frontend

# Instalar dependências
pnpm install

# Construir para produção
pnpm run build
```

### 4. Integração Frontend + Backend

```bash
# Copiar arquivos do frontend para o Flask
rm -rf supplier_cost_analysis/src/static/*
cp -r supplier-cost-frontend/dist/* supplier_cost_analysis/src/static/
```

## 🚀 Executando o Sistema

### Modo Desenvolvimento

#### Backend
```bash
cd supplier_cost_analysis
source venv/bin/activate
python src/main.py
```

#### Frontend (desenvolvimento separado)
```bash
cd supplier-cost-frontend
pnpm run dev
```

### Modo Produção (Integrado)
```bash
cd supplier_cost_analysis
source venv/bin/activate
python src/main.py
```

O sistema estará disponível em: `http://localhost:5000`

## 👤 Credenciais de Acesso

### Usuário Administrador
- **Usuário**: admin
- **Senha**: admin123

### Usuários de Teste
O sistema inclui usuários de exemplo para cada role:
- **Fornecedor**: supplier / supplier123
- **Comprador**: buyer / buyer123
- **Analista**: analyst / analyst123
- **Gerente**: manager / manager123
- **Diretor**: director / director123
- **VP**: vp / vp123

## 📁 Estrutura do Projeto

```
supplier-cost-analysis/
├── supplier_cost_analysis/          # Backend Flask
│   ├── src/
│   │   ├── main.py                  # Aplicação principal
│   │   ├── models/                  # Modelos de dados
│   │   ├── routes/                  # Rotas da API
│   │   └── static/                  # Arquivos estáticos (frontend)
│   ├── requirements.txt             # Dependências Python
│   └── venv/                        # Ambiente virtual
├── supplier-cost-frontend/          # Frontend React
│   ├── src/
│   │   ├── components/              # Componentes React
│   │   ├── hooks/                   # Hooks customizados
│   │   └── assets/                  # Assets estáticos
│   ├── package.json                 # Dependências Node.js
│   └── dist/                        # Build de produção
├── wireframe_*.png                  # Wireframes do design
├── fluxo_aprovacao.png             # Diagrama do fluxo
├── design_system.md                # Especificações de design
├── requisitos_sistema.md           # Documentação de requisitos
├── manual_usuario.md               # Manual do usuário
└── README.md                       # Este arquivo
```

## 🔄 Fluxo de Aprovação

1. **Fornecedor** envia tabela de custos
2. **Comprador de Categoria** valida recebimento (2 dias)
3. **Analista de Pricing** realiza análise (5 dias)
4. **Aprovação baseada em valor**:
   - Até R$ 50k: Gerente Comercial
   - R$ 50k-200k: + Diretor Comercial + Diretor Pricing
   - R$ 200k-500k: + Vice Presidência
   - Acima R$ 500k: Toda a cadeia

## 📊 Funcionalidades por Role

| Funcionalidade | Fornecedor | Comprador | Analista | Gerente | Diretor | VP | Admin |
|----------------|------------|-----------|----------|---------|---------|----|----- |
| Upload Tabelas | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Aprovar Tabelas | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Relatórios | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Configurações | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

## 🔒 Segurança

- Autenticação obrigatória para todas as funcionalidades
- Controle de acesso baseado em roles
- Sessões com timeout automático
- Logs de auditoria para todas as ações
- Validação de dados de entrada
- Proteção contra CSRF

## 📈 Métricas e Relatórios

- Fornecedores ativos
- Tabelas de custo processadas
- Aprovações pendentes por alçada
- Impacto financeiro mensal
- Tempo médio de aprovação
- Taxa de aprovação por categoria
- Performance por fornecedor

## 🐛 Solução de Problemas

### Erro de Conexão
- Verificar se o servidor Flask está rodando
- Confirmar que a porta 5000 está disponível

### Erro de Login
- Verificar credenciais
- Confirmar que o usuário está ativo no sistema

### Arquivo não Aceito
- Verificar formato (Excel ou CSV)
- Confirmar estrutura de colunas obrigatórias

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte técnico ou dúvidas:
- Documentação: Consulte o `manual_usuario.md`
- Issues: Abra uma issue no repositório
- Email: contato@empresa.com

---

**Desenvolvido com ❤️ para otimizar o processo de aprovação de custos de fornecedores**

