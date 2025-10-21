# 🌾 ENDIAGRO - Sistema de Gestão Financeira

Sistema web completo de gestão financeira desenvolvido especificamente para empresas agropecuárias em Angola, com base no Plano Geral de Contabilidade Angolano (PGC-AO).

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Execução](#execução)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Endpoints](#api-endpoints)
- [Roadmap](#roadmap)
- [Contribuir](#contribuir)

## 🎯 Sobre o Projeto

O **ENDIAGRO** é um sistema web completo que permite:

- **Planear** → Inserir previsões anuais de receitas e despesas
- **Controlar** → Registar valores realizados mensalmente
- **Comparar** → Analisar desvios entre previsto e realizado
- **Automatizar** → Classificar documentos automaticamente com OCR e IA
- **Analisar** → Calcular 20+ indicadores financeiros em tempo real
- **Alertar** → Notificar desvios e anomalias financeiras

### Para quem é este sistema?

- Empresas agropecuárias em Angola
- Gestores financeiros
- Contabilistas
- Consultores empresariais

## ✨ Funcionalidades

### 📊 Módulos Financeiros

- [x] **Demonstração de Resultados**
  - Gestão de proveitos (Classe 7 PGC-AO)
  - Gestão de custos (Classe 6 PGC-AO)
  - Cálculo automático de resultado líquido
  - Cálculo de imposto industrial (25%)

- [x] **Balanço Previsional**
  - Ativo não corrente e corrente
  - Passivo e capital próprio
  - Validação automática de equilíbrio

- [ ] **Plano de Tesouraria Mensal**
  - Previsões mensais (Janeiro a Dezembro)
  - Valores realizados
  - Cálculo de saldos

- [ ] **Balanço de Execução**
  - Comparação previsto vs. realizado
  - Cálculo de desvios percentuais
  - Alertas automáticos

### 🤖 Funcionalidades Avançadas

- [ ] **Upload de Documentos**
  - Suporte para PDF e imagens
  - OCR (Tesseract.js) para extração de texto
  - Classificação automática com IA (OpenAI)

- [ ] **Indicadores Financeiros**
  - **Lead Indicators** (preditivos)
    - Prazo médio de recebimento
    - Rotação de existências
    - Taxa de ocupação de capacidade
  - **Lag Indicators** (resultado)
    - Margem líquida
    - ROE (Return on Equity)
    - Liquidez geral
    - Autonomia financeira

### 🔐 Segurança e Autenticação

- [x] Registo de utilizadores
- [x] Login com JWT (JSON Web Tokens)
- [x] Gestão de roles (admin, gestor, contador, consultor)
- [x] Proteção de rotas
- [x] Rate limiting
- [x] Helmet para segurança de headers

## 🛠️ Tecnologias Utilizadas

### Backend

- **Node.js** 18+ - Runtime JavaScript
- **Express** - Framework web
- **PostgreSQL** 14+ - Base de dados relacional
- **bcrypt** - Hash de passwords
- **jsonwebtoken** - Autenticação JWT
- **Tesseract.js** - OCR (Optical Character Recognition)
- **OpenAI API** - Classificação inteligente de documentos

### Frontend

- **React** 18+ - Biblioteca UI
- **React Router** - Navegação
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Framework CSS
- **Recharts** - Gráficos e visualizações
- **Lucide React** - Ícones

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) versão 18 ou superior
- [PostgreSQL](https://www.postgresql.org/) versão 14 ou superior
- [Git](https://git-scm.com/)
- Editor de código (recomendado: [VS Code](https://code.visualstudio.com/))

### Verificar versões instaladas

```bash
node --version   # Deve ser >= 18.0.0
npm --version    # Deve ser >= 9.0.0
psql --version   # Deve ser >= 14.0
```

## 🚀 Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/endiagro.git
cd endiagro
```

### 2. Configurar a Base de Dados

#### Criar base de dados PostgreSQL

```bash
# Entrar no PostgreSQL
psql -U postgres

# Executar os seguintes comandos SQL:
CREATE DATABASE endiagro_db;
CREATE USER endiagro_user WITH PASSWORD 'senha_segura_123';
GRANT ALL PRIVILEGES ON DATABASE endiagro_db TO endiagro_user;
\q
```

#### Executar o schema da base de dados

```bash
psql -U endiagro_user -d endiagro_db -f backend/database/schema.sql
```

### 3. Instalar dependências do Backend

```bash
cd backend
npm install
```

### 4. Instalar dependências do Frontend

```bash
cd ../frontend
npm install
```

## ⚙️ Configuração

### Backend - Variáveis de Ambiente

Copie o ficheiro `.env.example` para `.env` e configure as variáveis:

```bash
cd backend
cp .env.example .env
```

Edite o ficheiro `.env`:

```env
# Servidor
PORT=5000
NODE_ENV=development

# Base de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=endiagro_db
DB_USER=endiagro_user
DB_PASSWORD=senha_segura_123

# JWT
JWT_SECRET=chave_secreta_muito_complexa_aqui_123456
JWT_EXPIRE=7d

# OpenAI (opcional - para classificação com IA)
OPENAI_API_KEY=sua_chave_api_openai_aqui

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend - Variáveis de Ambiente (opcional)

Crie um ficheiro `.env` na pasta `frontend`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🎮 Execução

### Modo Desenvolvimento

#### Executar Backend

```bash
cd backend
npm run dev
```

O servidor estará disponível em: `http://localhost:5000`

#### Executar Frontend

Em outro terminal:

```bash
cd frontend
npm start
```

A aplicação estará disponível em: `http://localhost:3000`

### Criar utilizador inicial

#### Via API (usando curl ou Postman):

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Administrador",
    "email": "admin@endiagro.com",
    "password": "admin123",
    "role": "admin"
  }'
```

#### Ou diretamente via interface web:

1. Aceda a `http://localhost:3000/register`
2. Preencha o formulário de registo
3. Faça login em `http://localhost:3000/login`

## 📁 Estrutura do Projeto

```
endiagro/
├── backend/
│   ├── database/
│   │   └── schema.sql              # Schema completo da base de dados
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js         # Configuração PostgreSQL
│   │   ├── controllers/
│   │   │   ├── authController.js   # Lógica de autenticação
│   │   │   └── drController.js     # Demonstração de Resultados
│   │   ├── middleware/
│   │   │   └── auth.js             # Middleware JWT
│   │   ├── routes/
│   │   │   ├── auth.js             # Rotas de autenticação
│   │   │   └── dr.js               # Rotas DR
│   │   ├── services/               # Serviços (OCR, IA)
│   │   └── utils/                  # Utilitários
│   ├── uploads/                    # Ficheiros carregados
│   ├── .env                        # Variáveis de ambiente
│   ├── package.json
│   └── server.js                   # Servidor principal
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.js
│   │   │   │   └── Register.js
│   │   │   ├── Dashboard/
│   │   │   │   └── Dashboard.js
│   │   │   ├── DR/                 # Demonstração de Resultados
│   │   │   ├── Balanco/            # Balanço
│   │   │   ├── Tesouraria/         # Tesouraria
│   │   │   ├── Documentos/         # Upload e OCR
│   │   │   └── Indicadores/        # Indicadores financeiros
│   │   ├── contexts/
│   │   │   └── AuthContext.js      # Context de autenticação
│   │   ├── services/
│   │   │   └── api.js              # Serviços da API
│   │   ├── App.js                  # Componente principal
│   │   ├── index.js
│   │   └── index.css               # Estilos globais
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

## 🔌 API Endpoints

### Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/register` | Registar utilizador | Não |
| POST | `/api/auth/login` | Login | Não |
| GET | `/api/auth/profile` | Obter perfil | Sim |
| PUT | `/api/auth/profile` | Atualizar perfil | Sim |
| PUT | `/api/auth/change-password` | Alterar password | Sim |

### Demonstração de Resultados

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/dr` | Criar/Atualizar DR | Sim |
| GET | `/api/dr` | Listar todas DRs | Sim |
| GET | `/api/dr/:exercicio` | Obter DR específica | Sim |
| GET | `/api/dr/comparativo/:anos` | Comparativo de anos | Sim |
| DELETE | `/api/dr/:exercicio` | Eliminar DR | Sim |

### Exemplo de Requisição

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@endiagro.com", "password": "admin123"}'

# Criar DR (com token)
curl -X POST http://localhost:5000/api/dr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "exercicio": 2025,
    "proveitos": {
      "vendasOleoSesamo": 3104200000,
      "vendasMel": 199200000
    },
    "custos": {
      "materiasPrimas": 78850000,
      "remuneracoesPessoal": 265600000
    }
  }'
```

## 🗺️ Roadmap

### Fase 1: Fundação ✅ (Concluída)
- [x] Estrutura do projeto
- [x] Base de dados PostgreSQL
- [x] Sistema de autenticação
- [x] Servidor backend básico
- [x] Frontend React base

### Fase 2: Módulos Financeiros 🔄 (Em Progresso)
- [x] Demonstração de Resultados (API)
- [ ] Demonstração de Resultados (Frontend)
- [ ] Balanço Previsional
- [ ] Plano de Tesouraria
- [ ] Balanço de Execução

### Fase 3: Funcionalidades Avançadas 📋 (Planeado)
- [ ] Upload de documentos
- [ ] OCR (Tesseract.js)
- [ ] Classificação com IA (OpenAI)
- [ ] Indicadores automáticos
- [ ] Dashboard de indicadores

### Fase 4: Testes e Deploy 📋 (Planeado)
- [ ] Testes unitários (Backend)
- [ ] Testes de integração
- [ ] Testes E2E (Frontend)
- [ ] Deploy em produção
- [ ] Documentação completa

## 🧪 Testes

### Executar testes do Backend

```bash
cd backend
npm test
```

### Executar testes do Frontend

```bash
cd frontend
npm test
```

## 📝 Notas Importantes

### Segurança

- **NUNCA** commit o ficheiro `.env` para o repositório
- Altere a `JWT_SECRET` para produção
- Use passwords fortes
- Configure HTTPS em produção

### Performance

- O sistema está otimizado para até 1000 utilizadores simultâneos
- Base de dados indexada para queries rápidas
- Compressão de respostas ativada

### Suporte

Para dúvidas ou problemas:
- Consultar a documentação técnica completa no manual
- Criar uma issue no GitHub
- Contactar a equipa de desenvolvimento

## 📄 Licença

Este projeto está sob a licença MIT. Consulte o ficheiro `LICENSE` para mais detalhes.

## 👥 Equipa

- **Desenvolvimento**: Equipa ENDIAGRO
- **Versão**: 1.0.0
- **Data**: Janeiro 2025

---

**ENDIAGRO** - Sistema de Gestão Financeira para Empresas Agropecuárias em Angola
