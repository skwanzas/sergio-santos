"""
FastAPI Main Application
Sistema de Automação com Agentes IA
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.core.config import settings
# from app.api.v1 import auth, products, agents, analytics  # Será criado depois

# Configurar logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Criar app FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    docs_url="/docs",
    redoc_url="/redoc",
    description="""
    ## 🤖 Sistema de Automação com Agentes IA

    Sistema inteligente de descoberta de oportunidades de arbitragem no e-commerce.

    ### Funcionalidades
    - 🔍 **Market Research**: Varre marketplaces 24/7
    - 📊 **Risk Analysis**: Avalia oportunidades
    - ✍️ **AI Copywriting**: Gera copy em 3 idiomas com GPT-4
    - 📈 **Analytics**: Dashboard de métricas

    ### 12 Agentes IA Especializados
    1. Orchestrator - Coordenação central
    2. Market Research - Descoberta de produtos
    3. Risk Analysis - Análise de riscos
    4. Copywriter - Geração de conteúdo
    5. Designer - Otimização de imagens
    6. SEO Specialist - Keywords e otimização
    7. Pricing Optimizer - Preços inteligentes
    8. Compliance Checker - Verificação legal
    9. Trend Analyzer - Análise de tendências
    10. Performance Analyst - Métricas
    11. Relationship Manager - Gestão de fornecedores
    12. Innovator - Novas estratégias
    """
)

# CORS - Configurar origens permitidas
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar origens
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/", tags=["Health"])
def root():
    """
    Endpoint raiz - Informações do sistema.
    """
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "environment": settings.ENVIRONMENT,
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health", tags=["Health"])
def health_check():
    """
    Health check endpoint para monitoring.
    """
    return {"status": "healthy"}

# Incluir routers (será implementado nas próximas etapas)
# app.include_router(auth.router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["auth"])
# app.include_router(products.router, prefix=f"{settings.API_V1_PREFIX}/products", tags=["products"])
# app.include_router(agents.router, prefix=f"{settings.API_V1_PREFIX}/agents", tags=["agents"])
# app.include_router(analytics.router, prefix=f"{settings.API_V1_PREFIX}/analytics", tags=["analytics"])

# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Handler global de exceções.
    """
    logger.error(f"Global error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    """
    Executa ao iniciar a aplicação.
    """
    logger.info(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"📍 Environment: {settings.ENVIRONMENT}")
    logger.info(f"🔧 Debug mode: {settings.DEBUG}")
    logger.info(f"📚 API Docs: http://localhost:8000/docs")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """
    Executa ao desligar a aplicação.
    """
    logger.info("🛑 Shutting down application")
