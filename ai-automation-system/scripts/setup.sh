#!/bin/bash

# Script de setup automatizado - AI Automation System

echo "🤖 ====================================="
echo "   AI Automation System - Setup"
echo "====================================="

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Python
echo -e "\n${YELLOW}1. Verificando Python...${NC}"
if command -v python3.11 &> /dev/null; then
    PYTHON_VERSION=$(python3.11 --version)
    echo -e "${GREEN}✓ $PYTHON_VERSION encontrado${NC}"
else
    echo -e "${RED}✗ Python 3.11+ não encontrado${NC}"
    echo "Instale Python 3.11 ou superior"
    exit 1
fi

# Criar virtual environment
echo -e "\n${YELLOW}2. Criando ambiente virtual...${NC}"
if [ ! -d "venv" ]; then
    python3.11 -m venv venv
    echo -e "${GREEN}✓ Ambiente virtual criado${NC}"
else
    echo -e "${GREEN}✓ Ambiente virtual já existe${NC}"
fi

# Ativar venv
source venv/bin/activate

# Atualizar pip
echo -e "\n${YELLOW}3. Atualizando pip...${NC}"
pip install --upgrade pip setuptools wheel > /dev/null 2>&1
echo -e "${GREEN}✓ pip atualizado${NC}"

# Instalar dependências
echo -e "\n${YELLOW}4. Instalando dependências...${NC}"
echo "   (Isso pode levar alguns minutos)"
pip install -r requirements.txt > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependências instaladas${NC}"
else
    echo -e "${RED}✗ Erro ao instalar dependências${NC}"
    exit 1
fi

# Copiar .env
echo -e "\n${YELLOW}5. Configurando ambiente...${NC}"
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Arquivo .env criado${NC}"
    echo -e "${YELLOW}⚠ IMPORTANTE: Edite o arquivo .env com suas credenciais!${NC}"
else
    echo -e "${GREEN}✓ Arquivo .env já existe${NC}"
fi

# Verificar setup
echo -e "\n${YELLOW}6. Verificando instalação...${NC}"
python scripts/check_setup.py

echo -e "\n${GREEN}====================================="
echo "   Setup Concluído!"
echo "=====================================${NC}"
echo ""
echo "Próximos passos:"
echo "1. Edite o arquivo .env com suas credenciais"
echo "2. Configure PostgreSQL (veja README.md)"
echo "3. Execute: python scripts/init_db.py"
echo "4. Inicie a API: uvicorn app.main:app --reload"
echo ""
