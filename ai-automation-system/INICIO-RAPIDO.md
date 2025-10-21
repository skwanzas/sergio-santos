# 🚀 AI AUTOMATION SYSTEM - INÍCIO RÁPIDO

## ⚡ COMEÇAR EM 1 COMANDO

```bash
./START.sh
```

**É só isso!** O script vai:
1. ✓ Verificar se Docker está instalado
2. ✓ Construir todas as imagens
3. ✓ Iniciar todos os serviços (API, Workers, Databases)
4. ✓ Configurar o banco de dados
5. ✓ Criar usuário admin
6. ✓ Abrir o navegador automaticamente

---

## 📋 PRÉ-REQUISITOS

### Instalar Docker

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Fazer logout e login novamente
```

**Mac:**
- Baixar [Docker Desktop para Mac](https://www.docker.com/products/docker-desktop/)

**Windows:**
- Baixar [Docker Desktop para Windows](https://www.docker.com/products/docker-desktop/)

### Configurar OpenAI API Key (Opcional)

Se você quiser usar o Agent de Copywriting (GPT-4), edite o arquivo `.env`:

```bash
OPENAI_API_KEY=sk-sua-chave-aqui
```

---

## 🌐 ACESSOS APÓS INICIAR

### 🎯 Dashboard Principal - Interface React
```
http://localhost:3000
```
👤 **Login Padrão:**
- Username: `admin`
- Password: `admin123`

**Interface visual completa com:**
- Dashboard com estatísticas
- Execução de workflows com botões
- Visualização de produtos
- Monitoramento de tasks
- Interface moderna e responsiva

### 📖 Swagger UI - Documentação Interativa da API
```
http://localhost:8000/docs
```
Para desenvolvedores que querem testar a API diretamente.

### 🌸 Flower - Monitor dos Workers
```
http://localhost:5555
```
Veja em tempo real os agents processando tasks.

### 📊 Neo4j Browser - Banco de Dados Grafo
```
http://localhost:7474
```
- User: `neo4j`
- Password: `neo4j_password_2024`

---

## 🤖 COMO USAR OS AGENTES IA

### ⚡ Método Recomendado: Dashboard Visual (FÁCIL!)

### 1. Acessar o Dashboard
1. Acesse http://localhost:3000
2. Faça login com:
   - Username: `admin`
   - Password: `admin123`

### 2. Executar Descoberta de Produtos (Market Research + Risk Analysis)
1. No menu, clique em "Agentes"
2. Selecione o workflow "Product Discovery"
3. Configure os parâmetros:
   - Categoria: Eletrônicos
   - Preço Máximo: $100
   - Margem Mínima: 30%
4. Clique em "Executar Workflow"
5. Aguarde os resultados aparecerem na tela!

### 3. Ver Produtos Descobertos
1. No menu, clique em "Produtos"
2. Veja todos os produtos com suas métricas
3. Filtre por aprovados/rejeitados
4. Visualize margens de lucro e análise de risco

### 4. Monitorar Execução
1. No menu, clique em "Tasks"
2. Veja todas as execuções dos agentes
3. Clique em uma task para ver detalhes completos

---

### 🛠️ Método Alternativo: API Swagger (Para Desenvolvedores)

### 1. Fazer Login via API
1. Acesse http://localhost:8000/docs
2. Clique em "POST /api/v1/auth/login"
3. Clique em "Try it out"
4. Use as credenciais:
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
5. Copie o `access_token` retornado
6. Clique no botão "Authorize" (cadeado) no topo
7. Cole o token no formato: `Bearer seu_token_aqui`

### 2. Executar Descoberta de Produtos via API
1. Clique em "POST /api/v1/agents/orchestrator/run"
2. Clique em "Try it out"
3. Use este exemplo:
   ```json
   {
     "workflow_type": "product_discovery",
     "category": "electronics",
     "max_price": 100,
     "min_margin": 30
   }
   ```
4. Clique em "Execute"
5. O sistema vai:
   - 🔍 Buscar produtos em marketplaces
   - 📊 Calcular margens de lucro
   - ⚠️ Analisar riscos
   - ✅ Aprovar produtos viáveis

### 3. Gerar Copy de Marketing (Copywriter Agent)
1. Clique em "POST /api/v1/agents/copywriter/run"
2. Clique em "Try it out"
3. Use este exemplo:
   ```json
   {
     "product_id": 1,
     "product_title": "Smartwatch Fitness Pro",
     "product_price": 89.99,
     "languages": ["pt", "en", "es"]
   }
   ```
4. Clique em "Execute"
5. O GPT-4 vai gerar:
   - 📝 Título otimizado
   - 📄 Descrição persuasiva
   - 🎯 5 bullet points
   - 💰 Call-to-action

### 4. Automação Completa (Discovery + Content)
1. Clique em "POST /api/v1/agents/orchestrator/run"
2. Use:
   ```json
   {
     "workflow_type": "full_automation",
     "category": "electronics",
     "max_price": 100,
     "auto_create_content": true
   }
   ```
3. O sistema vai executar TUDO automaticamente:
   - 🔍 Descobrir produtos
   - ⚠️ Analisar riscos
   - 📝 Gerar copy em 3 idiomas
   - ✅ Entregar produtos prontos para publicar

---

## 📊 MONITORAR EXECUÇÃO

### Ver Tasks em Tempo Real
1. Acesse Flower: http://localhost:5555
2. Veja:
   - ✅ Tasks completadas
   - 🔄 Tasks em execução
   - ⏳ Tasks na fila
   - ❌ Tasks com erro

### Ver Logs
```bash
# Todos os logs
docker-compose logs -f

# Só API
docker-compose logs -f api

# Só Workers
docker-compose logs -f worker_market worker_analysis worker_default
```

---

## 🛠️ COMANDOS ÚTEIS

### Parar o Sistema
```bash
docker-compose down
```

### Reiniciar o Sistema
```bash
docker-compose restart
```

### Ver Status dos Serviços
```bash
docker-compose ps
```

### Limpar TUDO (incluindo dados)
```bash
docker-compose down -v
```

### Reconstruir e Reiniciar
```bash
docker-compose up -d --build
```

---

## 🎯 PRÓXIMOS PASSOS

### Fase Atual: ✅ 4 Agentes Funcionando
- ✅ Agent 1: Orchestrator (coordenador)
- ✅ Agent 2: Market Research (descoberta)
- ✅ Agent 3: Risk Analysis (análise de risco)
- ✅ Agent 4: Copywriter (copy IA)

### Próximas Fases: 🚧 Em Desenvolvimento
- 🚧 Agent 5: SEO Optimizer
- 🚧 Agent 6: Designer (imagens)
- 🚧 Agent 7: Pricing Strategy
- 🚧 Agent 8: Competitor Monitor
- 🚧 Agent 9: Listing Manager
- 🚧 Agent 10: Customer Service Bot
- 🚧 Agent 11: Analytics
- 🚧 Agent 12: Approval Manager

---

## ❓ PROBLEMAS COMUNS

### Erro: "Docker não está instalado"
Instale o Docker seguindo a seção Pré-Requisitos acima.

### Erro: "Porta 8000 já está em uso"
Outro serviço está usando a porta. Pare o serviço ou mude a porta no `docker-compose.yml`.

### Erro: "OpenAI API key inválida"
1. Edite o arquivo `.env`
2. Adicione sua chave: `OPENAI_API_KEY=sk-sua-chave`
3. Reinicie: `docker-compose restart`

### Workers não processam tasks
1. Verifique Flower: http://localhost:5555
2. Veja logs: `docker-compose logs -f worker_market`
3. Reinicie workers: `docker-compose restart worker_market worker_analysis worker_default`

### Banco de dados vazio
1. Pare tudo: `docker-compose down -v`
2. Inicie novamente: `./START.sh`

---

## 📚 DOCUMENTAÇÃO COMPLETA

- **README.md** - Documentação técnica completa
- **COMO_USAR.md** - Guia detalhado de uso
- **FASE*_SUMMARY.md** - Detalhes de cada fase de implementação

---

## 🎉 PRONTO!

Agora você tem um sistema completo de automação com IA rodando localmente.

Acesse http://localhost:8000/docs e comece a explorar!

**Dúvidas?** Veja a documentação completa nos arquivos mencionados acima.
