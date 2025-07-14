# Manual do Usuário - Sistema de Análise de Custos de Fornecedores

## 1. Visão Geral

O Sistema de Análise de Custos de Fornecedores é uma ferramenta web completa para gerenciar e aprovar tabelas de custos de fornecedores em ambiente de varejo, com fluxo de aprovação estruturado em múltiplas alçadas baseadas em valores e impacto financeiro.

## 2. Funcionalidades Principais

### 2.1 Gestão de Usuários e Autenticação
- Sistema de login seguro com diferentes níveis de acesso
- Controle de permissões baseado em roles (funções)
- Gestão de usuários por administradores

### 2.2 Upload e Análise de Tabelas de Custo
- Upload de arquivos Excel (.xlsx, .xls) e CSV
- Validação automática de dados
- Análise comparativa com tabelas anteriores
- Cálculo automático de impacto financeiro

### 2.3 Fluxo de Aprovação Automatizado
- Workflow de 30 dias com múltiplas alçadas
- Aprovação baseada em valores e impacto financeiro
- Notificações automáticas e controle de prazos
- Histórico completo de aprovações

### 2.4 Dashboard e Relatórios
- Visão geral com métricas principais
- Acompanhamento de atividades recentes
- Relatórios de performance e análises

## 3. Tipos de Usuário

### 3.1 Fornecedor
- Enviar novas tabelas de custos
- Acompanhar status das aprovações
- Visualizar histórico de tabelas

### 3.2 Comprador de Categoria
- Primeira alçada de aprovação
- Validar recebimento de tabelas
- Encaminhar para análise de pricing

### 3.3 Analista de Pricing
- Realizar análise comparativa de custos
- Calcular simulação de nova margem comercial
- Gerar relatórios de impacto

### 3.4 Gerente Comercial
- Aprovar tabelas de baixo impacto (até R$ 50.000)
- Validar análises comerciais

### 3.5 Diretor Comercial / Diretor de Pricing
- Aprovar tabelas de médio impacto (R$ 50.001 - R$ 500.000)
- Validação estratégica e técnica

### 3.6 Vice Presidência Comercial
- Aprovar tabelas de alto impacto (acima R$ 500.000)
- Aprovação final estratégica

### 3.7 Administrador
- Gerenciar usuários e permissões
- Configurar parâmetros do sistema
- Monitorar performance

## 4. Como Usar o Sistema

### 4.1 Fazendo Login
1. Acesse o sistema através do navegador
2. Digite seu usuário e senha
3. Clique em "Entrar"

**Credenciais de demonstração:**
- Usuário: admin
- Senha: admin123

### 4.2 Navegação
- **Dashboard**: Visão geral e métricas principais
- **Tabelas de Custo**: Gerenciar tabelas de custos
- **Aprovações**: Visualizar e processar aprovações pendentes
- **Fornecedores**: Gerenciar cadastro de fornecedores
- **Relatórios**: Visualizar relatórios e análises
- **Configurações**: Configurar parâmetros do sistema (admin)

### 4.3 Enviando uma Tabela de Custos (Fornecedor)
1. Acesse "Tabelas de Custo"
2. Clique em "Nova Tabela"
3. Selecione o arquivo Excel ou CSV
4. Preencha as informações obrigatórias:
   - Fornecedor
   - Categoria
   - Data de vigência
   - Comentários (opcional)
5. Clique em "Enviar"

### 4.4 Aprovando uma Tabela (Aprovadores)
1. Acesse "Aprovações" ou veja notificações no Dashboard
2. Clique na tabela para revisar
3. Analise os dados e impacto financeiro
4. Escolha uma ação:
   - **Aprovar**: Avança para próxima alçada
   - **Rejeitar**: Cancela o processo
   - **Delegar**: Transfere para outro usuário (se permitido)
5. Adicione comentários se necessário
6. Confirme a ação

### 4.5 Acompanhando o Status
- No Dashboard: Veja resumo de atividades
- Em Tabelas de Custo: Veja status detalhado
- Em Aprovações: Acompanhe fluxo de aprovação

## 5. Estrutura de Arquivos para Upload

### 5.1 Formato Obrigatório
O arquivo deve conter as seguintes colunas:

| Coluna | Descrição | Obrigatório |
|--------|-----------|-------------|
| sku | Código do produto | Sim |
| description | Descrição do produto | Sim |
| new_cost | Novo custo | Sim |
| previous_cost | Custo anterior | Não |
| category | Categoria do produto | Não |
| unit | Unidade de medida | Não |
| monthly_volume | Volume mensal | Não |

### 5.2 Exemplo de Arquivo CSV
```csv
sku,description,new_cost,previous_cost,category,unit,monthly_volume
PROD001,Produto A,10.50,10.00,Categoria 1,UN,1000
PROD002,Produto B,25.75,24.50,Categoria 2,KG,500
```

## 6. Fluxo de Aprovação

### 6.1 Sequência Padrão
1. **Fornecedor** envia tabela
2. **Comprador de Categoria** valida recebimento (2 dias)
3. **Analista de Pricing** realiza análise (5 dias)
4. **Aprovação baseada em valor**:
   - Até R$ 50k: Gerente Comercial (3 dias)
   - R$ 50k-200k: + Diretor Comercial + Diretor Pricing (5 dias cada)
   - R$ 200k-500k: + Vice Presidência (7 dias)
   - Acima R$ 500k: Toda a cadeia

### 6.2 Prazos e Alertas
- Prazo total: 30 dias
- Alertas 24h antes do vencimento
- Escalação automática após vencimento
- Relatório semanal para gestores

## 7. Critérios de Aprovação

### 7.1 Aprovação Automática
- Variação de custo inferior a 2%
- Fornecedores com histórico positivo
- Produtos de baixo impacto (< R$ 10.000/mês)

### 7.2 Critérios de Rejeição
- Dados inconsistentes ou incompletos
- Impacto financeiro excessivo sem justificativa
- Não conformidade com políticas comerciais

## 8. Relatórios e Métricas

### 8.1 Dashboard Principal
- Fornecedores ativos
- Tabelas de custo processadas
- Aprovações pendentes
- Impacto financeiro mensal

### 8.2 Métricas Disponíveis
- Tempo médio de aprovação
- Taxa de aprovação por alçada
- Volume de tabelas processadas
- Impacto financeiro por categoria
- Performance por fornecedor

## 9. Segurança e Auditoria

### 9.1 Controles de Segurança
- Autenticação obrigatória
- Controle de acesso baseado em roles
- Sessões com timeout automático
- Logs de todas as ações

### 9.2 Auditoria
- Histórico completo de aprovações
- Rastreabilidade de alterações
- Backup automático de dados
- Retenção de dados por 7 anos

## 10. Suporte Técnico

### 10.1 Problemas Comuns
- **Erro de login**: Verificar credenciais e status do usuário
- **Arquivo não aceito**: Verificar formato e estrutura
- **Aprovação travada**: Verificar prazos e notificações

### 10.2 Contato
Para suporte técnico, entre em contato com o administrador do sistema.

## 11. Atualizações e Melhorias

O sistema está em constante evolução. Novas funcionalidades incluem:
- Integração com sistemas ERP
- Notificações por email
- Relatórios avançados
- API para integrações externas

---

**Versão do Manual**: 1.0  
**Data**: Julho 2024  
**Sistema**: Análise de Custos de Fornecedores v1.0

