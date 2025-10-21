"""
User Model - Usuários do sistema
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class User(Base):
    """
    Modelo de usuário do sistema.

    Attributes:
        id: ID único do usuário
        email: Email único (usado para login)
        username: Nome de usuário
        hashed_password: Senha hasheada com bcrypt
        is_active: Usuário ativo/inativo
        is_superuser: Usuário administrador
        created_at: Data de criação
        updated_at: Data de última atualização
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Flags
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships (será implementado depois)
    # tasks = relationship("Task", back_populates="owner")

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"
