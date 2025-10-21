"""
Configuração do banco de dados PostgreSQL.
SQLAlchemy engine, session e base declarativa.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Verifica conexão antes de usar
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    echo=settings.DEBUG  # Log SQL queries em debug
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base para modelos
Base = declarative_base()

# Dependency para FastAPI
def get_db():
    """
    Dependency que fornece uma sessão de database.
    Fecha automaticamente após o request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
