"""
Task Model - Tarefas dos Agentes IA
"""
from sqlalchemy import Column, Integer, String, Float, JSON, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class TaskStatus(str, enum.Enum):
    """Status possíveis de uma task."""
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    RETRYING = "retrying"

class Task(Base):
    """
    Modelo de tarefa executada pelos agentes IA.

    Attributes:
        id: ID único da task
        celery_task_id: ID da task no Celery
        agent_name: Nome do agente que executa
        task_type: Tipo da tarefa
        input_data: Dados de entrada (JSON)
        result: Resultado da execução (JSON)
        error: Mensagem de erro (se houver)
        status: Status atual da task
        started_at: Quando iniciou
        completed_at: Quando completou
        duration: Duração em segundos
        created_at: Data de criação
    """
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    celery_task_id = Column(String, unique=True, index=True)

    # Task info
    agent_name = Column(String, nullable=False, index=True)
    task_type = Column(String, nullable=False)

    # Input/Output
    input_data = Column(JSON)
    result = Column(JSON)
    error = Column(String, nullable=True)

    # Status & timing
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDING, index=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    duration = Column(Float, nullable=True)  # segundos

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    def __repr__(self):
        return f"<Task(id={self.id}, agent={self.agent_name}, status={self.status})>"
