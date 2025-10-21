# 🤖 Sistema de Automação com Agentes IA

Sistema inteligente de descoberta de oportunidades de arbitragem no e-commerce usando 12 agentes de IA especializados.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.11+-green)

## 📋 O que é este Sistema?

**NÃO é um bot de compra/venda automático!**

É um **ASSISTENTE DE INTELIGÊNCIA DE MERCADO** que:

- ✅ **DESCOBRE** discrepâncias de preços entre plataformas (Amazon, eBay, AliExpress)
- ✅ **ANALISA** riscos, margens e viabilidade de cada oportunidade
- ✅ **PREPARA** todo conteúdo de marketing (copy em 3 idiomas + SEO + imagens)
- ✅ **APRESENTA** oportunidades validadas em dashboard intuitivo
- ✅ **RASTREIA** performance quando você decide executar
- ❌ **NÃO COMPRA** ou vende automaticamente - você decide tudo

## 🎯 Como Funciona a Arbitragem?

```
Smartwatch no AliExpress: $22
Mesmo produto no eBay: $65
→ Oportunidade de $43 de margem (66% lucro)
```

O sistema **DESCOBRE** esta oportunidade automaticamente. Você **DECIDE** se quer executar.

## 🏗️ Arquitetura

```
DASHBOARD (React)
    ↓
FASTAPI (Backend REST)
    ↓
┌─────────────┬──────────┬──────────┐
│ PostgreSQL  │  Redis   │  Neo4j   │
│ (Dados)     │ (Queue)  │ (Grafo)  │
└─────────────┴──────────┴──────────┘
    ↓
CELERY WORKERS (12 Agents IA)
    ↓
┌──────────────┬──────────┬────────────┐
│ Amazon API   │ eBay API │ OpenAI GPT │
└──────────────┴──────────┴────────────┘
```

## 🤖 Os 12 Agentes IA

1. **Orchestrator** - Coordena todos os outros agents
2. **Market Research** - Varre marketplaces 24/7
3. **Risk Analysis** - Filtra oportunidades seguras
4. **Copywriter** - Gera copy em PT/EN/ES com GPT-4
5. **Designer** - Seleciona e otimiza imagens
6. **SEO Specialist** - Keywords e otimização
7. **Pricing Optimizer** - Calcula preços ideais
8. **Compliance Checker** - Verifica legalidade
9. **Trend Analyzer** - Detecta tendências
10. **Performance Analyst** - Analisa métricas
11. **Relationship Manager** - Avalia fornecedores
12. **Innovator** - Testa novas estratégias

## 🛠️ Stack Tecnológica

### Backend
- **Python 3.11+** - Linguagem principal
- **FastAPI** - Framework web moderno
- **PostgreSQL 15+** - Database principal
- **Redis 7+** - Cache + Queue
- **Neo4j 5+** - Grafo de conhecimento
- **Celery** - Task queue assíncrona
- **SQLAlchemy** - ORM
- **OpenAI GPT-4** - Geração de copy

### Frontend
- **React 18+** - Interface web
- **Tailwind CSS** - Styling
- **Recharts** - Gráficos

## 📦 Instalação

### Pré-requisitos

```bash
# Verificar versões
python --version   # >= 3.11
psql --version     # >= 15
redis-cli --version # >= 7
```

### Setup Rápido

```bash
# 1. Clonar repositório
git clone <repo-url>
cd ai-automation-system

# 2. Criar ambiente virtual
python3.11 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# 3. Instalar dependências
pip install -r requirements.txt

# 4. Configurar ambiente
cp .env.example .env
# Editar .env com suas credenciais

# 5. Criar database
psql -U postgres
CREATE DATABASE ai_automation;
CREATE USER ai_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE ai_automation TO ai_user;
\q

# 6. Inicializar database
python scripts/init_db.py

# 7. Verificar setup
python scripts/check_setup.py
```

## 🚀 Execução

### Modo Desenvolvimento

```bash
# Terminal 1: API
uvicorn app.main:app --reload --port 8000

# Terminal 2: Celery Workers
celery -A app.core.celery_app worker --loglevel=info

# Terminal 3: Flower (Monitoring)
celery -A app.core.celery_app flower --port=5555
```

Acesse:
- **API Docs**: http://localhost:8000/docs
- **Flower Dashboard**: http://localhost:5555

## 📊 Métricas Esperadas

### Após 1 Mês
- **1.500** produtos analisados
- **450** produtos aprovados (30%)
- **12** produtos publicados (você decide)
- **5** vendas realizadas
- **$175** lucro líquido

### ROI
- **Investimento**: $80/mês (VPS + OpenAI)
- **Tempo economizado**: 25h/semana vs. pesquisa manual
- **Valor do tempo**: $2000/mês (@ $20/h)
- **ROI real**: ♾️ (economiza muito mais que custa)

## 💰 Custos de Operação

### Desenvolvimento
- **$0/mês** - Tudo local

### Produção MVP
- VPS: $10-20/mês
- OpenAI GPT-4: $30-50/mês
- **Total: $50-80/mês**

### Produção Escala
- VPS maior: $40/mês
- Managed PostgreSQL: $25/mês
- OpenAI uso alto: $80-150/mês
- **Total: $150-250/mês**

## 📚 Fases de Implementação

- [x] **Fase 1**: Setup do Ambiente ✅
- [ ] **Fase 2**: Estrutura Base
- [ ] **Fase 3**: Database PostgreSQL
- [ ] **Fase 4**: FastAPI Core
- [ ] **Fase 5**: Autenticação & Segurança
- [ ] **Fase 6**: Celery & Agents (12 agentes)
- [ ] **Fase 7**: PostgreSQL & Neo4j
- [ ] **Fase 8**: APIs Externas
- [ ] **Fase 9**: Monitoring
- [ ] **Fase 10**: Frontend Dashboard
- [ ] **Fase 11**: Deployment
- [ ] **Fases 12-17**: Testes, Otimização, CI/CD

## 🔒 Segurança

- JWT authentication
- Bcrypt password hashing
- Rate limiting
- SQL injection protection (SQLAlchemy)
- CORS configurado
- Environment variables

## 📖 Documentação

- **Manual Técnico Completo**: Ver documentação detalhada
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc

## 🤝 Contribuir

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

MIT License - veja LICENSE para detalhes

## 👥 Equipa

- **Versão**: 1.0.0
- **Data**: Janeiro 2025

---

**Sistema de Automação com Agentes IA** - Descoberta Inteligente de Oportunidades de Arbitragem 🚀
