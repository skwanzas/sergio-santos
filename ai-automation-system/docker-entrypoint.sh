#!/bin/bash

set -e

echo "============================================"
echo "AI Automation System - Initialization"
echo "============================================"

# Aguardar PostgreSQL estar pronto
echo "Waiting for PostgreSQL..."
until PGPASSWORD=ai_password_2024 psql -h postgres -U ai_user -d ai_automation -c '\q' 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "✓ PostgreSQL is ready!"

# Aguardar Redis estar pronto
echo "Waiting for Redis..."
until redis-cli -h redis ping 2>/dev/null; do
  echo "Redis is unavailable - sleeping"
  sleep 2
done
echo "✓ Redis is ready!"

# Aplicar migrations do Alembic
echo "Running database migrations..."
alembic upgrade head
echo "✓ Migrations applied!"

# Inicializar dados (criar usuário admin se não existir)
echo "Initializing database data..."
python -c "
from app.core.database import SessionLocal, engine, Base
from app.models import User
from app.core.security import get_password_hash
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Criar todas as tabelas
Base.metadata.create_all(bind=engine)

# Criar usuário admin se não existir
db = SessionLocal()
try:
    admin = db.query(User).filter(User.username == 'admin').first()
    if not admin:
        admin = User(
            email='admin@aiautomation.com',
            username='admin',
            hashed_password=get_password_hash('admin123'),
            is_active=True,
            is_superuser=True
        )
        db.add(admin)
        db.commit()
        logger.info('✓ Admin user created: admin / admin123')
    else:
        logger.info('✓ Admin user already exists')
except Exception as e:
    logger.error(f'Error creating admin user: {e}')
    db.rollback()
finally:
    db.close()
"
echo "✓ Database initialized!"

echo "============================================"
echo "Starting FastAPI Application..."
echo "============================================"
echo ""
echo "🌐 API Documentation: http://localhost:8000/docs"
echo "🌸 Flower Dashboard: http://localhost:5555"
echo "📊 Neo4j Browser: http://localhost:7474"
echo ""
echo "👤 Default Admin Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "============================================"

# Iniciar aplicação com Uvicorn
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
