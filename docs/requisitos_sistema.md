# Sistema de Análise de Tabela de Custos - Especificação de Requisitos

## 1. Visão Geral do Sistema

O sistema é uma ferramenta web para análise e aprovação de tabelas de custos de fornecedores em ambiente de varejo, com fluxo de aprovação estruturado em múltiplas alçadas baseadas em valores e impacto financeiro.

## 2. Atores do Sistema

### 2.1 Fornecedor
- Responsável por submeter novas tabelas de custos
- Acompanha status da aprovação
- Recebe notificações sobre o andamento

### 2.2 Comprador da Categoria
- Primeira alçada de aprovação
- Valida recebimento da tabela
- Encaminha para análise de pricing

### 2.3 Analista de Pricing
- Realiza análise comparativa de custos
- Calcula simulação de nova margem comercial
- Gera relatórios de impacto

### 2.4 Gerente Comercial
- Valida análise de pricing
- Aprova ou rejeita baseado em critérios comerciais

### 2.5 Diretor Comercial
- Alçada superior para valores médios
- Validação estratégica comercial

### 2.6 Diretor de Pricing
- Validação técnica de pricing
- Aprovação de metodologias de cálculo

### 2.7 Vice Presidência Comercial
- Alçada máxima para valores altos
- Aprovação final estratégica

### 2.8 Administrador do Sistema
- Gerencia usuários e permissões
- Configura parâmetros do sistema
- Monitora performance

## 3. Funcionalidades Principais

### 3.1 Upload de Tabela de Custos
- Interface para upload de arquivos (Excel, CSV)
- Validação de formato e estrutura
- Armazenamento seguro dos arquivos
- Versionamento de tabelas

### 3.2 Fluxo de Aprovação (30 dias)
- Workflow automatizado com prazos
- Notificações automáticas por email
- Controle de SLA por etapa
- Escalação automática em caso de atraso

### 3.3 Análise Comparativa
- Comparação automática com tabela anterior
- Identificação de variações percentuais
- Cálculo de impacto por produto/categoria
- Geração de relatórios visuais

### 3.4 Simulação de Margem
- Cálculo automático de novas margens
- Projeção de impacto no faturamento
- Análise de competitividade
- Cenários de pricing

### 3.5 Sistema de Alçadas
- Definição de limites por cargo
- Roteamento automático baseado em valores
- Aprovação paralela ou sequencial
- Histórico de decisões

## 4. Regras de Negócio

### 4.1 Critérios de Alçada por Valor
```
Impacto Financeiro Mensal:
- Até R$ 50.000: Gerente Comercial
- R$ 50.001 - R$ 200.000: Diretor Comercial + Diretor Pricing
- R$ 200.001 - R$ 500.000: + Vice Presidência Comercial
- Acima R$ 500.000: Aprovação de toda a cadeia
```

### 4.2 Prazos por Etapa
```
- Comprador Categoria: 2 dias úteis
- Análise Pricing: 5 dias úteis
- Gerente Comercial: 3 dias úteis
- Diretor Comercial: 5 dias úteis
- Diretor Pricing: 5 dias úteis
- Vice Presidência: 7 dias úteis
- Buffer para imprevistos: 3 dias úteis
```

### 4.3 Critérios de Aprovação Automática
- Variação de custo inferior a 2%
- Fornecedores com histórico positivo
- Produtos de baixo impacto (< R$ 10.000/mês)

### 4.4 Alertas e Escalações
- Notificação 24h antes do vencimento
- Escalação automática após vencimento
- Relatório semanal para gestores

## 5. Arquitetura Técnica

### 5.1 Frontend
- React.js com TypeScript
- Material-UI para componentes
- Responsivo (mobile-first)
- PWA capabilities

### 5.2 Backend
- Flask (Python) com SQLAlchemy
- PostgreSQL para dados estruturados
- Redis para cache e sessões
- Celery para tarefas assíncronas

### 5.3 Infraestrutura
- Deploy em containers Docker
- Load balancer para alta disponibilidade
- Backup automático diário
- Monitoramento com logs

## 6. Segurança

### 6.1 Autenticação
- Login com email/senha
- Integração com Active Directory (opcional)
- Sessões com timeout automático
- Auditoria de acessos

### 6.2 Autorização
- Controle de acesso baseado em roles
- Permissões granulares por funcionalidade
- Segregação de dados por fornecedor
- Logs de todas as ações

### 6.3 Dados
- Criptografia de dados sensíveis
- Backup com retenção de 7 anos
- Anonimização para relatórios
- LGPD compliance

## 7. Integrações

### 7.1 Sistema ERP
- Importação de dados de produtos
- Sincronização de fornecedores
- Atualização de custos aprovados

### 7.2 Email
- Notificações automáticas
- Relatórios periódicos
- Alertas de vencimento

### 7.3 BI/Analytics
- Exportação de dados para análise
- APIs para dashboards externos
- Métricas de performance do processo

## 8. Parâmetros Configuráveis

### 8.1 Valores de Alçada
- Limites financeiros por cargo
- Percentuais de variação crítica
- Prazos por etapa do processo

### 8.2 Regras de Negócio
- Critérios de aprovação automática
- Fórmulas de cálculo de margem
- Categorias de produtos

### 8.3 Notificações
- Templates de email
- Frequência de lembretes
- Destinatários por tipo de alerta

## 9. Métricas e KPIs

### 9.1 Operacionais
- Tempo médio de aprovação
- Taxa de aprovação por alçada
- Volume de tabelas processadas

### 9.2 Financeiras
- Impacto total aprovado/rejeitado
- Economia gerada pelo processo
- ROI do sistema

### 9.3 Qualidade
- Taxa de erro em análises
- Satisfação dos usuários
- Disponibilidade do sistema

