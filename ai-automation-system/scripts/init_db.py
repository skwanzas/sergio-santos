"""
Script para inicializar o database.
Cria todas as tabelas e insere dados iniciais se necessário.
"""
import sys
import os

# Adicionar parent directory ao path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import engine, Base
from app.models import user, tasks, logs, products

def init_db():
    """Cria todas as tabelas."""
    print("🔧 Criando tabelas no database...")
    print(f"   Database URL: {os.getenv('DATABASE_URL', 'Not set')}")

    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database inicializado com sucesso!")
        print("\n📊 Tabelas criadas:")
        print("   - users")
        print("   - tasks")
        print("   - agent_logs")
        print("   - products")
        print("   - listings")
        print("   - sales")
    except Exception as e:
        print(f"❌ Erro ao criar tabelas: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_db()
