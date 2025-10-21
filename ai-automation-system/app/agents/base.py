"""
Base Agent Class
Classe abstrata para todos os 12 agentes IA.
Implementa logging, error handling e tracking.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import logging
from datetime import datetime

from app.core.database import SessionLocal
from app.models.tasks import Task, TaskStatus
from app.models.logs import AgentLog

logger = logging.getLogger(__name__)

class BaseAgent(ABC):
    """
    Classe base para todos os agents.

    Funcionalidades:
    - Logging automático no database
    - Task tracking
    - Error handling
    - Métricas de execução

    Subclasses devem implementar o método execute().
    """

    def __init__(self, name: str):
        """
        Args:
            name: Nome do agent (ex: "MarketResearch")
        """
        self.name = name
        self.db = SessionLocal()

    def log(self, level: str, message: str, details: Optional[Dict] = None):
        """
        Cria log de execução do agent no database.

        Args:
            level: Nível do log (INFO, WARNING, ERROR)
            message: Mensagem principal
            details: Detalhes adicionais em JSON
        """
        try:
            log_entry = AgentLog(
                agent_name=self.name,
                level=level,
                message=message,
                details=details
            )
            self.db.add(log_entry)
            self.db.commit()
        except Exception as e:
            logger.error(f"Failed to save log: {e}")

    def update_task_status(
        self,
        task_id: str,
        status: TaskStatus,
        result: Optional[Dict] = None,
        error: Optional[str] = None
    ):
        """
        Atualiza status da task no database.

        Args:
            task_id: ID da task Celery
            status: Novo status
            result: Resultado da execução (se success)
            error: Mensagem de erro (se failed)
        """
        task = self.db.query(Task).filter(Task.celery_task_id == task_id).first()
        if task:
            task.status = status
            if result:
                task.result = result
            if error:
                task.error = error

            if status == TaskStatus.SUCCESS or status == TaskStatus.FAILED:
                task.completed_at = datetime.utcnow()
                if task.started_at:
                    task.duration = (task.completed_at - task.started_at).total_seconds()

            self.db.commit()

    @abstractmethod
    def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Método principal do agent.
        Deve ser implementado por cada agent específico.

        Args:
            input_data: Dados de entrada

        Returns:
            Resultado da execução
        """
        pass

    def run(self, task_id: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Wrapper que executa o agent com error handling completo.

        Args:
            task_id: ID da task Celery
            input_data: Dados de entrada

        Returns:
            Resultado da execução

        Raises:
            Exception: Qualquer erro durante execução
        """
        try:
            # Log início
            self.log("INFO", f"Starting {self.name}", {"input": input_data})
            self.update_task_status(task_id, TaskStatus.RUNNING)

            # Executar agent
            result = self.execute(input_data)

            # Log sucesso
            self.log("INFO", f"Completed {self.name}", {"result": result})
            self.update_task_status(task_id, TaskStatus.SUCCESS, result=result)

            return result

        except Exception as e:
            error_msg = str(e)

            # Log erro
            self.log("ERROR", f"Failed {self.name}", {"error": error_msg})
            self.update_task_status(task_id, TaskStatus.FAILED, error=error_msg)

            raise

        finally:
            self.db.close()
