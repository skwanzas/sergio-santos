"""
Agent 1: Orchestrator
Coordenador central - orquestra todos os outros agents.
"""
from celery import chain
from typing import Dict, Any, List

from app.agents.base import BaseAgent
from app.core.celery_app import celery_app

class OrchestratorAgent(BaseAgent):
    """
    Agent 1: Orquestrador Central

    Responsabilidades:
    - Coordenar pipeline de automação
    - Chamar outros agents na ordem correta
    - Gerenciar fluxo de dados entre agents

    Workflows:
    - product_discovery: Market Research → Risk Analysis
    - content_creation: Copywriter → SEO → Designer
    - full_automation: Discovery → Content → Approval
    """

    def __init__(self):
        super().__init__("Orchestrator")

    def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Orquestra o pipeline de automação.

        Args:
            input_data: {
                "workflow_type": "product_discovery" | "content_creation" | "full_automation",
                "category": "electronics",  # Para market research
                "max_price": 100,
                ...
            }

        Returns:
            {
                "workflow": "product_discovery",
                "total_found": 50,
                "approved": 15,
                "products": [...]
            }
        """
        workflow_type = input_data.get("workflow_type", "full_automation")

        if workflow_type == "product_discovery":
            return self.run_product_discovery(input_data)
        elif workflow_type == "content_creation":
            return self.run_content_creation(input_data)
        else:
            return self.run_full_automation(input_data)

    def run_product_discovery(self, params: Dict) -> Dict:
        """
        Pipeline: Market Research → Risk Analysis → Approval

        Args:
            params: {
                "category": "electronics",
                "max_price": 100,
                "min_margin": 30
            }

        Returns:
            {
                "total_found": 50,
                "approved": 15,
                "products": [...]
            }
        """
        # Importar tasks aqui para evitar circular import
        from app.agents.market_research import market_research_task
        from app.agents.risk_analysis import risk_analysis_task

        # Chamar Market Research Agent
        self.log("INFO", "Starting market research", params)
        research_task = market_research_task.delay(params)
        research_result = research_task.get(timeout=300)  # 5 minutos

        # Se encontrou produtos, analisar riscos
        if research_result.get("products"):
            products = research_result["products"]
            approved_products = []

            self.log("INFO", f"Analyzing {len(products)} products", None)

            # Analisar cada produto (limitando a 10 para demo)
            for product in products[:10]:
                risk_task = risk_analysis_task.delay(product)
                risk_result = risk_task.get(timeout=60)

                if risk_result.get("approved"):
                    approved_products.append({
                        **product,
                        "risk_score": risk_result["risk_score"],
                        "risk_factors": risk_result["risk_factors"]
                    })

            return {
                "workflow": "product_discovery",
                "total_found": len(products),
                "approved": len(approved_products),
                "products": approved_products
            }

        return {
            "workflow": "product_discovery",
            "total_found": 0,
            "approved": 0,
            "products": []
        }

    def run_content_creation(self, params: Dict) -> Dict:
        """
        Pipeline: Copywriter → SEO → Designer (quando implementados)

        Args:
            params: {
                "product_id": 1,
                "languages": ["pt", "en", "es"]
            }

        Returns:
            {
                "product_id": 1,
                "content_generated": True,
                "copy": {...}
            }
        """
        from app.agents.copywriter import copywriter_task

        product_id = params.get("product_id")

        # Gerar copy
        copy_task = copywriter_task.delay(params)
        copy_result = copy_task.get(timeout=120)

        return {
            "workflow": "content_creation",
            "product_id": product_id,
            "content_generated": True,
            "copy": copy_result
        }

    def run_full_automation(self, params: Dict) -> Dict:
        """
        Pipeline completo: Discovery → Content → Publish

        Args:
            params: {
                "category": "electronics",
                "auto_create_content": True
            }

        Returns:
            {
                "discovery": {...},
                "content_created": 5,
                "status": "completed"
            }
        """
        # Discovery
        discovery = self.run_product_discovery(params)

        # Se auto_create_content, gerar copy para produtos aprovados
        created_content = []
        if params.get("auto_create_content") and discovery["products"]:
            for product in discovery["products"][:5]:  # Limitar a 5
                content_result = self.run_content_creation({
                    "product_id": product.get("id"),
                    "product_title": product.get("title"),
                    "product_price": product.get("price")
                })
                created_content.append(content_result)

        return {
            "workflow": "full_automation",
            "discovery": discovery,
            "content_created": len(created_content),
            "status": "completed"
        }

# Celery task
@celery_app.task(bind=True, name='app.agents.orchestrator.orchestrator_task')
def orchestrator_task(self, input_data: Dict[str, Any]):
    """
    Celery task para o Orchestrator Agent.

    Args:
        input_data: Parâmetros do workflow

    Returns:
        Resultado da orquestração
    """
    agent = OrchestratorAgent()
    return agent.run(self.request.id, input_data)
