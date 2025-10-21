#!/bin/bash

# ============================================
# AI AUTOMATION SYSTEM - STOP SCRIPT
# ============================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════╗"
echo "║   AI AUTOMATION SYSTEM - STOPPING SERVICES    ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

echo -e "${YELLOW}🛑 Parando todos os serviços...${NC}"
docker-compose down

echo ""
echo -e "${GREEN}✓ Todos os serviços foram parados!${NC}"
echo ""
echo -e "${BLUE}💡 DICA:${NC}"
echo "  Para remover também os dados (volumes):"
echo -e "     ${YELLOW}docker-compose down -v${NC}"
echo ""
echo "  Para iniciar novamente:"
echo -e "     ${YELLOW}./START.sh${NC}"
echo ""
