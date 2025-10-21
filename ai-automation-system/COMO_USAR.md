# 🚀 COMO USAR O SISTEMA - GUIA PRÁTICO

## 📍 Onde Está o Aplicativo?

O sistema está em: `/home/user/sergio-santos/ai-automation-system/`

```
seu-computador/
└── sergio-santos/
    ├── backend/           (Sistema ENDIAGRO - outro projeto)
    ├── frontend/          (Sistema ENDIAGRO - outro projeto)
    └── ai-automation-system/  ⭐ ESTE É O SISTEMA DE AGENTES IA
        ├── app/               (Código da aplicação)
        ├── scripts/           (Scripts para rodar)
        ├── .env.example       (Configurações)
        └── requirements.txt   (Dependências)
```

---

## 🖥️ O Sistema TEM 3 PARTES:

### 1. **API Backend** (FastAPI) - Cérebro do Sistema
- **Onde:** `app/main.py`
- **Acesso:** http://localhost:8000
- **Docs:** http://localhost:8000/docs (Swagger UI - interface visual)

### 2. **Celery Workers** - Os 4 Agentes IA Trabalhando
- **Onde:** `app/agents/`
- **Script:** `scripts/run_workers.sh`
- **Monitoring:** http://localhost:5555 (Flower Dashboard)

### 3. **Database** - Onde os Dados Ficam
- **PostgreSQL** - Produtos, Usuários, Tasks, Vendas
- **Redis** - Cache e fila de tarefas

---

## ⚡ PASSO A PASSO - PRIMEIRA VEZ

### **PASSO 1: Configurar Ambiente** (Fazer 1 vez só)

```bash
# 1. Entrar na pasta do sistema
cd /home/user/sergio-santos/ai-automation-system

# 2. Copiar arquivo de configuração
cp .env.example .env

# 3. Editar configurações (IMPORTANTE!)
nano .env
```

**EDITE estas linhas no arquivo `.env`:**
```env
# Mude estas senhas!
DATABASE_URL=postgresql://ai_user:SUA_SENHA_AQUI@localhost:5432/ai_automation
SECRET_KEY=cole-uma-chave-super-secreta-aqui-123456789

# Se tiver OpenAI API Key (para o Copywriter funcionar)
OPENAI_API_KEY=sk-sua-chave-aqui

# Deixe o resto como está
```

**Para gerar uma SECRET_KEY segura:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### **PASSO 2: Criar Database PostgreSQL** (Fazer 1 vez só)

```bash
# Entrar no PostgreSQL
sudo -u postgres psql

# Executar estes comandos (copie e cole):
CREATE DATABASE ai_automation;
CREATE USER ai_user WITH PASSWORD 'SUA_SENHA_AQUI';
GRANT ALL PRIVILEGES ON DATABASE ai_automation TO ai_user;
\q
```

### **PASSO 3: Instalar Dependências** (Fazer 1 vez só)

```bash
# Criar ambiente virtual
python3 -m venv venv

# Ativar ambiente
source venv/bin/activate

# Instalar tudo
pip install -r requirements.txt

# Criar tabelas no database
python scripts/init_db.py
```

---

## 🎮 USAR O SISTEMA (Fazer sempre que quiser usar)

### **Abrir 3 Terminais:**

#### **TERMINAL 1: Iniciar API** 🚀

```bash
cd /home/user/sergio-santos/ai-automation-system
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Você verá:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     🚀 Starting AI Automation System v1.0.0
INFO:     📚 API Docs: http://localhost:8000/docs
```

✅ **Deixe este terminal aberto!**

#### **TERMINAL 2: Iniciar Workers** 🤖

```bash
cd /home/user/sergio-santos/ai-automation-system
source venv/bin/activate

# Verificar se Redis está rodando
redis-cli ping
# Deve retornar: PONG

# Se não estiver, inicie:
# sudo systemctl start redis

# Iniciar workers
./scripts/run_workers.sh
```

**Você verá:**
```
🤖 ======================================
   Starting Celery Workers
======================================
📊 Flower Dashboard: http://localhost:5555
```

✅ **Deixe este terminal aberto!**

#### **TERMINAL 3: Usar o Sistema** 💻

Este terminal fica livre para você executar comandos.

---

## 🌐 ACESSAR O SISTEMA NO BROWSER

### **1. Swagger UI (Interface Visual da API)** ⭐ **RECOMENDADO**

**Abra no browser:**
```
http://localhost:8000/docs
```

**O que você vê:**
```
┌─────────────────────────────────────────┐
│  AI Automation System - v1.0.0          │
├─────────────────────────────────────────┤
│                                          │
│  📁 Authentication                       │
│    POST /api/v1/auth/register           │
│    POST /api/v1/auth/login              │
│    GET  /api/v1/auth/me                 │
│                                          │
│  📁 Products                             │
│    GET  /api/v1/products                │
│    POST /api/v1/products                │
│                                          │
│  📁 AI Agents ⭐                         │
│    POST /api/v1/agents/orchestrator/run │
│    POST /api/v1/agents/market-research  │
│    POST /api/v1/agents/copywriter       │
│    GET  /api/v1/agents/task/{id}        │
│                                          │
└─────────────────────────────────────────┘
```

**NESTA INTERFACE VOCÊ PODE:**
- ✅ Ver todos os endpoints
- ✅ Testar cada endpoint clicando nele
- ✅ Ver exemplos de JSON
- ✅ Executar os agentes IA
- ✅ Não precisa usar terminal!

### **2. Flower Dashboard (Monitoring dos Agentes)**

**Abra no browser:**
```
http://localhost:5555
```

**O que você vê:**
- Agentes trabalhando em tempo real
- Tasks executadas
- Gráficos de performance
- Status dos workers

---

## 🎯 EXEMPLO PRÁTICO - USAR PELA PRIMEIRA VEZ

### **1. Criar sua conta (fazer 1 vez)**

**No Swagger UI (http://localhost:8000/docs):**

1. Clique em **"POST /api/v1/auth/register"**
2. Clique em **"Try it out"**
3. Cole este JSON:

```json
{
  "email": "seu@email.com",
  "username": "admin",
  "password": "senha123"
}
```

4. Clique em **"Execute"**
5. ✅ Conta criada!

### **2. Fazer Login**

1. Clique em **"POST /api/v1/auth/login"**
2. Clique em **"Try it out"**
3. Cole:

```json
{
  "email": "seu@email.com",
  "password": "senha123"
}
```

4. Clique em **"Execute"**
5. **COPIE O TOKEN** que aparece na resposta:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  ⬅️ COPIE ISSO
  "token_type": "bearer"
}
```

### **3. Autenticar no Swagger**

1. No topo da página, clique no botão **"Authorize" 🔓**
2. Digite: `Bearer SEU_TOKEN_AQUI`
3. Clique em **"Authorize"**
4. ✅ Agora você está autenticado!

### **4. Executar os Agentes IA** 🤖

#### **A. Descobrir Produtos (Market Research + Risk Analysis)**

1. Clique em **"POST /api/v1/agents/orchestrator/run"**
2. Clique em **"Try it out"**
3. Cole:

```json
{
  "workflow_type": "product_discovery",
  "category": "electronics",
  "max_price": 100,
  "min_margin": 30
}
```

4. Clique em **"Execute"**
5. **COPIE O task_id** da resposta:

```json
{
  "task_id": "abc-123-def-456",  ⬅️ COPIE ISSO
  "status": "queued"
}
```

#### **B. Verificar Resultado**

**Aguarde 10 segundos**, depois:

1. Clique em **"GET /api/v1/agents/task/{task_id}"**
2. Clique em **"Try it out"**
3. Cole o **task_id** que você copiou
4. Clique em **"Execute"**

**Você verá o resultado:**
```json
{
  "task_id": "abc-123",
  "status": "success",
  "result": {
    "workflow": "product_discovery",
    "total_found": 10,
    "approved": 6,
    "products": [
      {
        "title": "Smartwatch Fitness Pro",
        "price": 65.0,
        "cost": 22.0,
        "margin": 43.0,
        "margin_percent": 66.15,
        "risk_score": 25,
        "approved": true
      },
      ...
    ]
  }
}
```

✅ **Pronto! Os agentes encontraram 6 oportunidades aprovadas!**

#### **C. Gerar Copy para um Produto**

1. Clique em **"POST /api/v1/agents/copywriter/run"**
2. Cole:

```json
{
  "product_title": "Smartwatch Fitness Pro",
  "product_price": 65.0,
  "languages": ["pt", "en", "es"]
}
```

3. **Execute** e copie o task_id
4. Aguarde 30 segundos
5. Verifique o resultado com **GET /agents/task/{id}**

**Resultado:**
```json
{
  "copy": {
    "pt": {
      "headline": "Smartwatch Pro - Seu Coach Pessoal no Pulso",
      "description": "Monitore saúde, rastreie exercícios, receba notificações",
      "bullets": [
        "Bateria de 7 dias",
        "Monitoramento cardíaco 24/7",
        "Resistente à água IP68",
        "Notificações inteligentes",
        "Rastreamento de sono"
      ],
      "cta": "Compre Agora!"
    },
    "en": {...},
    "es": {...}
  }
}
```

✅ **Copy profissional gerado em 3 idiomas!**

---

## 📱 ONDE ESTÁ O FRONTEND (Dashboard Visual)?

### **IMPORTANTE:**

O sistema atual **NÃO TEM frontend visual ainda**.

Você usa através de:
1. ✅ **Swagger UI** - http://localhost:8000/docs (Interface web da API)
2. ✅ **Flower** - http://localhost:5555 (Monitoring dos agentes)
3. ✅ **Comandos curl** (via terminal)

### **Para ter um Dashboard Visual:**

Você precisaria implementar a **Fase 10: Frontend Dashboard** que incluiria:
- Interface React
- Tabelas de produtos
- Gráficos
- Botões visuais

Quer que eu implemente isso agora? 🤔

---

## 🔄 FLUXO COMPLETO DE USO

```
┌─────────────────────────────────────────────┐
│  1. Abrir 3 terminais                       │
│     - API (uvicorn)                         │
│     - Workers (celery)                      │
│     - Comandos                              │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  2. Abrir browser                           │
│     http://localhost:8000/docs              │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  3. Criar conta e fazer login               │
│     Copiar token JWT                        │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  4. Clicar em "Authorize" no Swagger        │
│     Colar token                             │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  5. Executar agentes                        │
│     POST /agents/orchestrator/run           │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  6. Verificar resultado                     │
│     GET /agents/task/{id}                   │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  7. Ver produtos aprovados                  │
│     GET /products?status=approved           │
└─────────────────────────────────────────────┘
```

---

## ❓ PERGUNTAS FREQUENTES

### **"Onde vejo os produtos descobertos?"**

No Swagger UI:
- **GET /api/v1/products** - Lista todos
- **GET /api/v1/products?status=approved** - Só aprovados
- **GET /api/v1/products/{id}** - Detalhes completos

### **"Como sei se os agentes estão trabalhando?"**

Acesse: http://localhost:5555 (Flower Dashboard)

Você verá:
- Tasks em execução
- Tasks completadas
- Workers ativos

### **"Os agentes trabalham sozinhos 24/7?"**

SIM! Depois de iniciar os workers, eles ficam rodando.

Para executar tasks:
- Via Swagger UI: POST /agents/orchestrator/run
- Via cron: Agendar execuções automáticas

### **"Onde ficam os dados?"**

PostgreSQL database:
- Produtos: Tabela `products`
- Vendas: Tabela `sales`
- Tasks: Tabela `tasks`
- Logs: Tabela `agent_logs`

Para ver no database:
```bash
psql -U ai_user -d ai_automation
SELECT * FROM products;
```

### **"Como parar tudo?"**

```bash
# Parar API: Ctrl+C no terminal 1
# Parar Workers: Ctrl+C no terminal 2
# Ou: pkill -f celery
```

---

## 🎯 RESUMO - 3 PASSOS SIMPLES

```
1️⃣ INICIAR SISTEMA
   Terminal 1: uvicorn app.main:app --reload
   Terminal 2: ./scripts/run_workers.sh

2️⃣ ABRIR BROWSER
   http://localhost:8000/docs

3️⃣ USAR
   Register → Login → Authorize → Executar Agentes!
```

---

## 📞 PRECISA DE AJUDA?

Se algo não funcionar:

1. **Verificar se tudo está rodando:**
```bash
# PostgreSQL
sudo systemctl status postgresql

# Redis
redis-cli ping

# API
curl http://localhost:8000/health
```

2. **Ver logs:**
```bash
# API: Ver terminal 1
# Workers: Ver terminal 2
# Ou: cat logs/app.log
```

3. **Reiniciar tudo:**
```bash
# Parar tudo (Ctrl+C nos terminais)
# Reiniciar na ordem:
# 1. PostgreSQL + Redis
# 2. API
# 3. Workers
```

---

**🎉 Agora você sabe onde está e como usar o sistema!**

**Próximo passo:** Quer que eu crie um Frontend visual (Dashboard React)? 🚀
