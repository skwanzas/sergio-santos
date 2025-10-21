"""
Configuração do Redis.
Cliente Redis para cache e queue do Celery.
"""
from redis import Redis
from app.core.config import settings

# Cliente Redis
redis_client = Redis.from_url(
    settings.REDIS_URL,
    decode_responses=True
)

def get_redis():
    """Retorna cliente Redis."""
    return redis_client
