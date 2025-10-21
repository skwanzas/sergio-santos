"""
Agent 3: Risk Analysis
Avalia riscos de produtos antes de aprovar para publicação.
"""
from typing import Dict, Any, List

from app.agents.base import BaseAgent
from app.core.celery_app import celery_app

class RiskAnalysisAgent(BaseAgent):
    """
    Agent 3: Risk Analysis

    Responsabilidades:
    - Avaliar risco financeiro (margem, preço)
    - Avaliar risco de demanda
    - Avaliar risco de fornecedor (rating, pedidos)
    - Calcular score de risco (0-100)
    - Aprovar/rejeitar produtos

    Score de Risco:
    - 0-30: Baixo risco (APROVADO)
    - 31-50: Médio risco (REVISAR)
    - 51-100: Alto risco (REJEITADO)
    """

    def __init__(self):
        super().__init__("RiskAnalysis")

    def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analisa riscos do produto.

        Args:
            input_data: Dados do produto

        Returns:
            {
                "product_id": "prod_1",
                "risk_score": 25,
                "risk_factors": ["low_margin"],
                "approved": True,
                "recommendation": "approve"
            }
        """
        product = input_data

        # Calcular score de risco
        risk_factors = []
        risk_score = 0

        # 1. Risco de Preço (peso: 20)
        price = product.get("price", 0)
        if price > 100:
            risk_factors.append("high_price")
            risk_score += 20
        elif price < 10:
            risk_factors.append("very_low_price")
            risk_score += 15

        # 2. Risco de Margem (peso: 30)
        margin_percent = product.get("margin_percent", 0)
        if margin_percent < 20:
            risk_factors.append("low_margin")
            risk_score += 30
        elif margin_percent < 30:
            risk_factors.append("medium_margin")
            risk_score += 15

        # 3. Risco de Demanda (peso: 25)
        estimated_demand = product.get("estimated_demand", 0)
        if estimated_demand < 50:
            risk_factors.append("low_demand")
            risk_score += 25
        elif estimated_demand < 100:
            risk_factors.append("medium_demand")
            risk_score += 10

        # 4. Risco de Fornecedor (peso: 25)
        supplier_rating = product.get("supplier_rating", 0)
        supplier_orders = product.get("supplier_orders", 0)

        if supplier_rating < 4.0:
            risk_factors.append("low_supplier_rating")
            risk_score += 15

        if supplier_orders < 500:
            risk_factors.append("low_supplier_orders")
            risk_score += 10

        # Decisão de aprovação
        approved = risk_score < 50
        recommendation = self._get_recommendation(risk_score)

        return {
            "product_id": product.get("id"),
            "risk_score": risk_score,
            "risk_factors": risk_factors,
            "approved": approved,
            "recommendation": recommendation,
            "details": {
                "price_risk": "high" if price > 100 else "low",
                "margin_risk": self._get_margin_risk(margin_percent),
                "demand_risk": self._get_demand_risk(estimated_demand),
                "supplier_risk": self._get_supplier_risk(supplier_rating, supplier_orders)
            }
        }

    def _get_recommendation(self, risk_score: int) -> str:
        """
        Retorna recomendação baseada no score.

        Args:
            risk_score: Score de risco (0-100)

        Returns:
            "approve" | "review" | "reject"
        """
        if risk_score < 30:
            return "approve"
        elif risk_score < 50:
            return "review"
        else:
            return "reject"

    def _get_margin_risk(self, margin_percent: float) -> str:
        """Classifica risco de margem."""
        if margin_percent >= 40:
            return "low"
        elif margin_percent >= 20:
            return "medium"
        else:
            return "high"

    def _get_demand_risk(self, estimated_demand: int) -> str:
        """Classifica risco de demanda."""
        if estimated_demand >= 150:
            return "low"
        elif estimated_demand >= 50:
            return "medium"
        else:
            return "high"

    def _get_supplier_risk(self, rating: float, orders: int) -> str:
        """Classifica risco de fornecedor."""
        if rating >= 4.5 and orders >= 1000:
            return "low"
        elif rating >= 4.0 and orders >= 500:
            return "medium"
        else:
            return "high"

# Celery task
@celery_app.task(bind=True, name='app.agents.risk_analysis.risk_analysis_task')
def risk_analysis_task(self, input_data: Dict[str, Any]):
    """
    Celery task para Risk Analysis Agent.

    Args:
        input_data: Dados do produto a analisar

    Returns:
        Análise de risco completa
    """
    agent = RiskAnalysisAgent()
    return agent.run(self.request.id, input_data)
