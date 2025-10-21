#!/bin/bash

# ============================================
# AI AUTOMATION SYSTEM - ONE-CLICK STARTER
# ============================================

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════╗"
echo "║   AI AUTOMATION SYSTEM - ONE-CLICK START      ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não está instalado!${NC}"
    echo "Por favor, instale o Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não está instalado!${NC}"
    echo "Por favor, instale o Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker está instalado${NC}"
echo -e "${GREEN}✓ Docker Compose está instalado${NC}"
echo ""

# Verificar se .env existe, se não, criar a partir do .env.example
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ Arquivo .env não encontrado. Criando a partir de .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Arquivo .env criado!${NC}"
        echo -e "${YELLOW}⚠ IMPORTANTE: Configure sua OPENAI_API_KEY no arquivo .env${NC}"
        echo ""
    else
        echo -e "${RED}❌ .env.example não encontrado!${NC}"
        exit 1
    fi
fi

# Parar containers existentes (se houver)
echo -e "${BLUE}🛑 Parando containers existentes...${NC}"
docker-compose down 2>/dev/null || true
echo ""

# Build das imagens
echo -e "${BLUE}🔨 Construindo imagens Docker...${NC}"
docker-compose build --no-cache
echo -e "${GREEN}✓ Imagens construídas com sucesso!${NC}"
echo ""

# Iniciar todos os serviços
echo -e "${BLUE}🚀 Iniciando todos os serviços...${NC}"
docker-compose up -d
echo ""

# Aguardar serviços ficarem prontos
echo -e "${BLUE}⏳ Aguardando serviços ficarem prontos...${NC}"
sleep 10

# Verificar status dos containers
echo -e "${BLUE}📊 Status dos Serviços:${NC}"
docker-compose ps
echo ""

# Verificar se API está respondendo
echo -e "${BLUE}🔍 Verificando API...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ API está respondendo!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ API não está respondendo após 30 segundos${NC}"
        echo "Verifique os logs com: docker-compose logs api"
        exit 1
    fi
    echo -n "."
    sleep 1
done
echo ""

# Mostrar logs iniciais
echo -e "${BLUE}📜 Últimas linhas dos logs:${NC}"
docker-compose logs --tail=20
echo ""

# Sucesso!
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════╗"
echo "║         SISTEMA INICIADO COM SUCESSO!         ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${BLUE}🌐 ACESSOS:${NC}"
echo ""
echo -e "  🎯 Dashboard Principal (Frontend React):"
echo -e "     ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "  📖 API Documentation (Swagger UI):"
echo -e "     ${GREEN}http://localhost:8000/docs${NC}"
echo ""
echo -e "  🌸 Flower Dashboard (Celery Monitor):"
echo -e "     ${GREEN}http://localhost:5555${NC}"
echo ""
echo -e "  📊 Neo4j Browser (Graph Database):"
echo -e "     ${GREEN}http://localhost:7474${NC}"
echo -e "     User: neo4j / Pass: neo4j_password_2024"
echo ""
echo -e "${BLUE}👤 CREDENCIAIS PADRÃO:${NC}"
echo -e "     Username: ${GREEN}admin${NC}"
echo -e "     Password: ${GREEN}admin123${NC}"
echo ""
echo -e "${BLUE}📝 COMANDOS ÚTEIS:${NC}"
echo ""
echo -e "  Ver logs em tempo real:"
echo -e "     ${YELLOW}docker-compose logs -f${NC}"
echo ""
echo -e "  Ver logs de um serviço específico:"
echo -e "     ${YELLOW}docker-compose logs -f api${NC}"
echo -e "     ${YELLOW}docker-compose logs -f worker_market${NC}"
echo ""
echo -e "  Parar todos os serviços:"
echo -e "     ${YELLOW}docker-compose down${NC}"
echo ""
echo -e "  Reiniciar todos os serviços:"
echo -e "     ${YELLOW}docker-compose restart${NC}"
echo ""
echo -e "  Parar e remover tudo (incluindo volumes):"
echo -e "     ${YELLOW}docker-compose down -v${NC}"
echo ""
echo -e "${GREEN}✨ Bom trabalho! Sistema pronto para uso.${NC}"
echo ""

# Abrir navegador automaticamente (opcional)
if command -v xdg-open &> /dev/null; then
    echo -e "${BLUE}🌐 Abrindo Dashboard no navegador...${NC}"
    xdg-open http://localhost:3000 2>/dev/null &
elif command -v open &> /dev/null; then
    echo -e "${BLUE}🌐 Abrindo Dashboard no navegador...${NC}"
    open http://localhost:3000 2>/dev/null &
fi
