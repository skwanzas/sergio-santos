#!/bin/bash

# Script para rodar múltiplos Celery workers
# Cada worker processa uma queue específica

echo "🤖 ======================================"
echo "   Starting Celery Workers"
echo "   AI Automation System"
echo "========================================"

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Worker 1: Market Research
echo -e "\n${YELLOW}Starting Worker 1: Market Research${NC}"
celery -A app.core.celery_app worker \
  --loglevel=info \
  --queue=market_research \
  --concurrency=2 \
  --hostname=worker-market-research@%h &

# Worker 2: Risk Analysis + Copywriter
echo -e "${YELLOW}Starting Worker 2: Risk Analysis + Copywriter${NC}"
celery -A app.core.celery_app worker \
  --loglevel=info \
  --queue=risk_analysis,copywriter \
  --concurrency=2 \
  --hostname=worker-content@%h &

# Worker 3: Default queue (Orchestrator)
echo -e "${YELLOW}Starting Worker 3: Orchestrator (default)${NC}"
celery -A app.core.celery_app worker \
  --loglevel=info \
  --queue=default \
  --concurrency=1 \
  --hostname=worker-orchestrator@%h &

# Flower: Monitoring dashboard
echo -e "${YELLOW}Starting Flower: Monitoring Dashboard${NC}"
celery -A app.core.celery_app flower \
  --port=5555 \
  --loglevel=info &

sleep 2
echo -e "\n${GREEN}======================================"
echo "   All Workers Started!"
echo "======================================${NC}"
echo ""
echo "📊 Flower Dashboard: http://localhost:5555"
echo "🔍 Workers:"
echo "   - market_research (2 workers)"
echo "   - risk_analysis (2 workers)"
echo "   - copywriter (2 workers)"
echo "   - orchestrator (1 worker)"
echo ""
echo "To stop all workers: pkill -f celery"
echo ""

# Aguardar
wait
