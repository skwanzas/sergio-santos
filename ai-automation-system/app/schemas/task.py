"""
Task Schemas - Validação de dados de tasks
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any
from app.models.tasks import TaskStatus

# Input schemas
class TaskCreate(BaseModel):
    """Schema para criar task."""
    agent_name: str
    task_type: str
    input_data: Dict[str, Any]

# Output schemas
class TaskResponse(BaseModel):
    """Schema de resposta de task."""
    id: int
    celery_task_id: str
    agent_name: str
    task_type: str
    status: TaskStatus
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TaskStatusResponse(BaseModel):
    """Schema para verificar status de task."""
    task_id: str
    status: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
