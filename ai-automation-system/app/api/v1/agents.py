"""
Agents Router - Endpoints para executar agentes IA
"""
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.tasks import Task, TaskStatus
from app.schemas.task import TaskResponse, TaskStatusResponse

# Import Celery tasks
from app.agents.orchestrator import orchestrator_task
from app.agents.market_research import market_research_task
from app.agents.risk_analysis import risk_analysis_task
from app.agents.copywriter import copywriter_task

router = APIRouter()

@router.post("/orchestrator/run", response_model=TaskStatusResponse)
async def run_orchestrator(
    input_data: Dict[str, Any],
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Disparar o Orchestrator Agent.

    O Orchestrator coordena outros agents baseado no workflow_type.

    Args:
        input_data: {
            "workflow_type": "product_discovery" | "content_creation" | "full_automation",
            "category": "electronics",
            "max_price": 100,
            ...
        }

    Returns:
        {
            "task_id": "abc-123",
            "status": "pending",
            "result": null
        }

    Example:
        POST /api/v1/agents/orchestrator/run
        {
            "workflow_type": "product_discovery",
            "category": "electronics",
            "max_price": 100,
            "min_margin": 30
        }
    """
    # Criar task no database
    task = Task(
        agent_name="Orchestrator",
        task_type=input_data.get("workflow_type", "full_automation"),
        input_data=input_data,
        status=TaskStatus.PENDING
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    # Disparar Celery task
    celery_task = orchestrator_task.delay(input_data)

    # Atualizar com Celery task ID
    task.celery_task_id = celery_task.id
    db.commit()

    return {
        "task_id": celery_task.id,
        "status": "queued",
        "result": None,
        "error": None
    }

@router.post("/market-research/run", response_model=TaskStatusResponse)
async def run_market_research(
    input_data: Dict[str, Any],
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Disparar Market Research Agent diretamente.

    Args:
        input_data: {
            "category": "electronics",
            "max_price": 100
        }

    Returns:
        Task status
    """
    task = Task(
        agent_name="MarketResearch",
        task_type="product_search",
        input_data=input_data,
        status=TaskStatus.PENDING
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    celery_task = market_research_task.delay(input_data)
    task.celery_task_id = celery_task.id
    db.commit()

    return {
        "task_id": celery_task.id,
        "status": "queued",
        "result": None,
        "error": None
    }

@router.post("/copywriter/run", response_model=TaskStatusResponse)
async def run_copywriter(
    input_data: Dict[str, Any],
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Disparar Copywriter Agent diretamente.

    Args:
        input_data: {
            "product_id": 1,
            "product_title": "Smartwatch Pro",
            "product_price": 65.00,
            "languages": ["pt", "en", "es"]
        }

    Returns:
        Task status
    """
    task = Task(
        agent_name="Copywriter",
        task_type="generate_copy",
        input_data=input_data,
        status=TaskStatus.PENDING
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    celery_task = copywriter_task.delay(input_data)
    task.celery_task_id = celery_task.id
    db.commit()

    return {
        "task_id": celery_task.id,
        "status": "queued",
        "result": None,
        "error": None
    }

@router.get("/task/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(
    task_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Verificar status de uma task Celery.

    Args:
        task_id: ID da task Celery

    Returns:
        {
            "task_id": "abc-123",
            "status": "success" | "pending" | "running" | "failed",
            "result": {...},
            "error": null
        }

    Example:
        GET /api/v1/agents/task/abc-123
    """
    from celery.result import AsyncResult
    from app.core.celery_app import celery_app

    result = AsyncResult(task_id, app=celery_app)

    return {
        "task_id": task_id,
        "status": result.state.lower(),
        "result": result.result if result.ready() and result.successful() else None,
        "error": str(result.info) if result.failed() else None
    }

@router.get("/tasks", response_model=list[TaskResponse])
async def list_tasks(
    skip: int = 0,
    limit: int = 100,
    agent_name: str = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Listar tasks executadas.

    Args:
        skip: Offset de paginação
        limit: Limite de resultados
        agent_name: Filtrar por agent (opcional)

    Returns:
        Lista de tasks
    """
    query = db.query(Task)

    if agent_name:
        query = query.filter(Task.agent_name == agent_name)

    tasks = query.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()
    return tasks
