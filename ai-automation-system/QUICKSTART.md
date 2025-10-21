# 🚀 Guia de Início Rápido - AI Automation System

## ⚡ Setup em 5 Minutos

### 1️⃣ Clone e Entre no Diretório

```bash
cd ai-automation-system
```

### 2️⃣ Execute o Setup Automático

```bash
./scripts/setup.sh
```

Este script irá:
- ✅ Verificar Python 3.11+
- ✅ Criar ambiente virtual
- ✅ Instalar todas as dependências
- ✅ Criar arquivo .env

### 3️⃣ Configure as Variáveis de Ambiente

Edite o arquivo `.env` criado:

```bash
nano .env  # ou use seu editor preferido
```

**Mínimo necessário para começar:**

```env
# Database (local)
DATABASE_URL=postgresql://ai_user:secure_password@localhost:5432/ai_automation

# Redis (local)
REDIS_URL=redis://localhost:6379/0

# Neo4j (local)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password

# JWT Secret (gere uma chave forte)
SECRET_KEY=sua-chave-super-secreta-aqui-123456

# OpenAI (obtenha em: https://platform.openai.com)
OPENAI_API_KEY=sk-your-openai-key-here
```

### 4️⃣ Configurar PostgreSQL

```bash
# Entrar no PostgreSQL
sudo -u postgres psql

# Executar comandos SQL
CREATE DATABASE ai_automation;
CREATE USER ai_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE ai_automation TO ai_user;
\q
```

### 5️⃣ Inicializar Database

```bash
source venv/bin/activate
python scripts/init_db.py
```

### 6️⃣ Iniciar a API

```bash
uvicorn app.main:app --reload --port 8000
```

Acesse: **http://localhost:8000/docs** 🎉

---

## 🐳 Setup com Docker (Alternativa)

Se preferir usar Docker:

```bash
# Criar containers
docker-compose up -d

# Verificar status
docker-compose ps

# Logs
docker-compose logs -f api
```

---

## 🧪 Testar a Instalação

```bash
# Verificar dependências
python scripts/check_setup.py

# Health check da API
curl http://localhost:8000/health

# Verificar documentação
open http://localhost:8000/docs
```

---

## 📊 Próximos Passos

1. **Criar primeiro usuário**: Via `/api/v1/auth/register`
2. **Fazer login**: Obter JWT token
3. **Explorar API Docs**: http://localhost:8000/docs
4. **Iniciar Celery Workers**: `celery -A app.core.celery_app worker`
5. **Monitorar com Flower**: `celery -A app.core.celery_app flower`

---

## ❓ Problemas Comuns

### Erro: "ModuleNotFoundError"
```bash
# Reinstalar dependências
pip install -r requirements.txt
```

### Erro: "Connection refused" (PostgreSQL)
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Erro: "Connection refused" (Redis)
```bash
# Verificar se Redis está rodando
sudo systemctl status redis
sudo systemctl start redis
```

---

## 📚 Documentação Completa

- **Manual Técnico**: Ver documento principal
- **API Reference**: http://localhost:8000/docs
- **README**: README.md

---

**Pronto!** 🎉 Seu sistema de automação está configurado!
