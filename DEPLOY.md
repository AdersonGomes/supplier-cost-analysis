# Instruções de Deploy - Sistema de Análise de Custos

## 🚀 Deploy no GitHub

### 1. Criar Repositório no GitHub
1. Acesse [GitHub](https://github.com) e faça login
2. Clique em "New repository"
3. Nome sugerido: `supplier-cost-analysis`
4. Descrição: "Sistema de Análise de Custos de Fornecedores"
5. Marque como "Public" ou "Private" conforme necessário
6. **NÃO** inicialize com README (já temos um)
7. Clique em "Create repository"

### 2. Conectar Repositório Local ao GitHub
```bash
# No diretório do projeto
git remote add origin https://github.com/SEU_USUARIO/supplier-cost-analysis.git
git branch -M main
git push -u origin main
```

### 3. Configurar GitHub Pages (Opcional)
Para documentação:
1. Vá em Settings > Pages
2. Source: Deploy from a branch
3. Branch: main
4. Folder: /docs

## 🐳 Deploy com Docker

### Desenvolvimento
```bash
docker-compose up -d
```

### Produção
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## ☁️ Deploy em Cloud

### Heroku
```bash
# Instalar Heroku CLI
# Criar app
heroku create supplier-cost-analysis

# Configurar variáveis
heroku config:set FLASK_ENV=production
heroku config:set DATABASE_URL=postgresql://...

# Deploy
git push heroku main
```

### Railway
1. Conecte seu repositório GitHub ao Railway
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### DigitalOcean App Platform
1. Conecte repositório GitHub
2. Configure build commands:
   - Backend: `pip install -r requirements.txt`
   - Frontend: `cd frontend && pnpm install && pnpm build`
3. Configure run command: `python backend/main.py`

## 🔧 Configurações de Produção

### Variáveis de Ambiente
```bash
FLASK_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
SECRET_KEY=sua-chave-secreta-super-segura
REDIS_URL=redis://localhost:6379
```

### Banco de Dados
- Desenvolvimento: SQLite
- Produção: PostgreSQL (recomendado)

### Segurança
- Configure HTTPS
- Use variáveis de ambiente para secrets
- Configure CORS adequadamente
- Implemente rate limiting

## 📊 Monitoramento

### Logs
```bash
# Docker
docker-compose logs -f

# Heroku
heroku logs --tail
```

### Métricas
- Configure New Relic ou similar
- Monitor performance do banco
- Acompanhe uso de recursos

## 🔄 CI/CD

### GitHub Actions
Arquivo já configurado em `.github/workflows/`

### Fluxo Recomendado
1. Desenvolvimento em branch `develop`
2. Pull Request para `main`
3. Deploy automático após merge
4. Testes automatizados

## 🛡️ Backup

### Banco de Dados
```bash
# PostgreSQL
pg_dump $DATABASE_URL > backup.sql

# Restaurar
psql $DATABASE_URL < backup.sql
```

### Arquivos
- Configure backup automático de uploads
- Use storage em nuvem (S3, etc.)

## 📞 Suporte

Para problemas de deploy:
1. Verifique logs de erro
2. Confirme variáveis de ambiente
3. Teste localmente primeiro
4. Consulte documentação da plataforma

---

**Última atualização**: Julho 2024

