"""
Logs Model - Logs dos Agentes IA
"""
from sqlalchemy import Column, Integer, String, DateTime, JSON, Text
from datetime import datetime
from app.core.database import Base

class AgentLog(Base):
    """
    Logs detalhados de execução de agentes.
    Útil para debugging e audit trail.

    Attributes:
        id: ID único do log
        agent_name: Nome do agente que gerou o log
        task_id: ID da task relacionada (opcional)
        level: Nível do log (INFO, WARNING, ERROR)
        message: Mensagem principal
        details: Detalhes adicionais (JSON)
        timestamp: Quando o log foi criado
    """
    __tablename__ = "agent_logs"

    id = Column(Integer, primary_key=True, index=True)

    # Content
    agent_name = Column(String, nullable=False, index=True)
    task_id = Column(String, index=True)

    # Log data
    level = Column(String, nullable=False)  # INFO, WARNING, ERROR
    message = Column(Text, nullable=False)
    details = Column(JSON, nullable=True)

    # Metadata
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    def __repr__(self):
        return f"<AgentLog(id={self.id}, agent={self.agent_name}, level={self.level})>"
