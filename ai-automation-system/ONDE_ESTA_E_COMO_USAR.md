# 🎯 GUIA VISUAL: ONDE ESTÁ E COMO USAR SEU APLICATIVO

## 📍 LOCALIZAÇÃO DO SEU APLICATIVO

```
/home/user/sergio-santos/
└── ai-automation-system/          👈 SEU APP ESTÁ AQUI!
    ├── START.sh                   ⭐ ARQUIVO PARA INICIAR
    ├── app/                       (Backend Python)
    ├── frontend/                  (Dashboard React)
    └── docker-compose.yml         (Configuração)
```

---

## ⚠️ IMPORTANTE: VOCÊ PRECISA INSTALAR O DOCKER PRIMEIRO!

O aplicativo foi criado para rodar com **Docker**, que facilita MUITO a instalação.
**Docker não está instalado no seu sistema ainda.**

---

## 🚀 OPÇÃO 1: USAR COM DOCKER (RECOMENDADO - SUPER FÁCIL)

### Passo 1: Instalar Docker

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

Depois faça **logout e login novamente** para o Docker funcionar.

**Mac:**
Baixe e instale: https://www.docker.com/products/docker-desktop/

**Windows:**
Baixe e instale: https://www.docker.com/products/docker-desktop/

### Passo 2: Iniciar o Aplicativo (1 COMANDO!)

```bash
cd /home/user/sergio-santos/ai-automation-system
./START.sh
```

### Passo 3: Acessar o Dashboard
O navegador vai abrir automaticamente em: **http://localhost:3000**

**Login:**
- Username: `admin`
- Password: `admin123`

---

## 🛠️ OPÇÃO 2: USAR SEM DOCKER (MANUAL - MAIS TRABALHOSO)

Se você não quiser instalar Docker, pode rodar manualmente:

### Passo 1: Instalar Dependências

```bash
cd /home/user/sergio-santos/ai-automation-system

# Instalar Python dependencies
pip install -r requirements.txt

# Criar arquivo .env
cp .env.example .env
```

### Passo 2: Configurar Banco de Dados

Você precisa ter PostgreSQL e Redis instalados:

```bash
# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Instalar Redis
sudo apt install redis-server

# Criar banco de dados
sudo -u postgres psql -c "CREATE DATABASE ai_automation;"
sudo -u postgres psql -c "CREATE USER ai_user WITH PASSWORD 'ai_password_2024';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ai_automation TO ai_user;"
```

### Passo 3: Configurar .env

Edite o arquivo `.env` e configure:
```
DATABASE_URL=postgresql://ai_user:ai_password_2024@localhost:5432/ai_automation
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=seu-secret-key-aqui
OPENAI_API_KEY=sua-chave-openai-aqui
```

### Passo 4: Iniciar Serviços Manualmente

**Terminal 1 - API:**
```bash
cd /home/user/sergio-santos/ai-automation-system
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Worker:**
```bash
cd /home/user/sergio-santos/ai-automation-system
celery -A app.core.celery_app worker --loglevel=info
```

**Terminal 3 - Frontend:**
```bash
cd /home/user/sergio-santos/ai-automation-system/frontend
npm install
npm run dev
```

### Passo 5: Acessar
- Frontend: http://localhost:3000
- API: http://localhost:8000/docs

---

## 🎯 QUAL OPÇÃO ESCOLHER?

### ✅ OPÇÃO 1 (Docker) - SE VOCÊ QUER:
- ✅ Instalar com 1 comando
- ✅ Tudo funcionar automaticamente
- ✅ Não se preocupar com dependências
- ✅ **RECOMENDADO!**

### ⚙️ OPÇÃO 2 (Manual) - SE VOCÊ QUER:
- Controle total
- Já tem PostgreSQL/Redis instalados
- Não quer usar Docker

---

## 📊 O QUE VOCÊ VAI VER QUANDO FUNCIONAR

### 1. Dashboard Principal (http://localhost:3000)
```
┌─────────────────────────────────────────┐
│  🤖 AI Automation System                │
│  Dashboard | Agentes | Produtos | Tasks │
├─────────────────────────────────────────┤
│                                         │
│  📊 ESTATÍSTICAS                        │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │ 10   │ │  7   │ │ 25   │ │ 20   │  │
│  │Produt│ │Aprova│ │Tasks │ │Comple│  │
│  └──────┘ └──────┘ └──────┘ └──────┘  │
│                                         │
│  ⚡ AÇÕES RÁPIDAS                       │
│  ┌────────────┐ ┌────────────┐        │
│  │ Executar   │ │ Ver        │        │
│  │ Agentes    │ │ Produtos   │        │
│  └────────────┘ └────────────┘        │
└─────────────────────────────────────────┘
```

### 2. Página de Agentes
- Botões para executar workflows
- Configuração visual de parâmetros
- Resultados em tempo real

### 3. Página de Produtos
- Lista de produtos descobertos
- Filtros (Todos/Aprovados/Rejeitados)
- Métricas de margem e risco

---

## ❓ PRÓXIMOS PASSOS

**Escolha qual opção você quer:**

### Se escolher OPÇÃO 1 (Docker):
```bash
# 1. Instale o Docker (comando acima)
# 2. Faça logout e login
# 3. Execute:
cd /home/user/sergio-santos/ai-automation-system
./START.sh
```

### Se escolher OPÇÃO 2 (Manual):
Siga os passos da Opção 2 acima.

---

## 💬 PRECISA DE AJUDA?

**Me diga:**
1. Você quer instalar Docker? (Opção 1 - mais fácil)
2. Ou prefere rodar manualmente? (Opção 2 - mais trabalhoso)

Posso te ajudar com qualquer uma das opções! 🚀
