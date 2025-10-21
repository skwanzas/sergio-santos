"""
Script para inicializar o database.
Cria todas as tabelas e insere dados iniciais se necessário.
"""
import sys
import os

# Adicionar parent directory ao path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import engine, Base
from app.models import user, tasks, logs

def init_db():
    """Cria todas as tabelas."""
    print("🔧 Criando tabelas no database...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database inicializado com sucesso!")

if __name__ == "__main__":
    init_db()
