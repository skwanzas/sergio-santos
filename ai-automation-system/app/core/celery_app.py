"""
Celery Configuration
Task queue assíncrona para os 12 agentes IA.
"""
from celery import Celery
from app.core.config import settings

# Criar app Celery
celery_app = Celery(
    "ai_automation",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        'app.agents.orchestrator',
        'app.agents.market_research',
        'app.agents.risk_analysis',
        'app.agents.copywriter',
        # Outros agents serão adicionados depois
    ]
)

# Configurações
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hora max
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Task routing (cada agent pode ter sua própria queue)
celery_app.conf.task_routes = {
    'app.agents.market_research.*': {'queue': 'market_research'},
    'app.agents.risk_analysis.*': {'queue': 'risk_analysis'},
    'app.agents.copywriter.*': {'queue': 'copywriter'},
    'app.agents.orchestrator.*': {'queue': 'default'},
}

# Auto-discover tasks
celery_app.autodiscover_tasks(['app.agents'])
