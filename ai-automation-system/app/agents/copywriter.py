"""
Agent 4: Copywriter
Gera copy de marketing usando OpenAI GPT-4.
"""
from typing import Dict, Any
import openai

from app.agents.base import BaseAgent
from app.core.celery_app import celery_app
from app.core.config import settings

# Configurar OpenAI
openai.api_key = settings.OPENAI_API_KEY

class CopywriterAgent(BaseAgent):
    """
    Agent 4: Copywriter AI

    Responsabilidades:
    - Gerar copy persuasivo para produtos
    - Criar headlines chamativas
    - Escrever descrições otimizadas
    - Listar benefícios (bullet points)
    - Criar CTAs (calls-to-action)
    - Traduzir para múltiplos idiomas (PT, EN, ES)

    Usa: OpenAI GPT-4
    """

    def __init__(self):
        super().__init__("Copywriter")

    def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Gera copy de marketing para produto.

        Args:
            input_data: {
                "product_id": 1,
                "product_title": "Smartwatch Pro",
                "product_price": 65.00,
                "product_description": "...",
                "languages": ["pt", "en", "es"]
            }

        Returns:
            {
                "product_id": 1,
                "copy": {
                    "pt": {...},
                    "en": {...},
                    "es": {...}
                },
                "languages": ["pt", "en", "es"]
            }
        """
        product_id = input_data.get("product_id")
        product_title = input_data.get("product_title", "Product")
        product_price = input_data.get("product_price", 0)
        languages = input_data.get("languages", ["pt", "en", "es"])

        # Gerar copy em múltiplos idiomas
        generated_copy = {}

        for lang in languages:
            self.log("INFO", f"Generating copy in {lang}", None)
            copy = self.generate_copy(product_title, product_price, lang)
            generated_copy[lang] = copy

        return {
            "product_id": product_id,
            "copy": generated_copy,
            "languages": languages
        }

    def generate_copy(self, title: str, price: float, language: str) -> Dict:
        """
        Usa GPT-4 para gerar copy em um idioma específico.

        Args:
            title: Nome do produto
            price: Preço do produto
            language: Idioma (pt, en, es)

        Returns:
            {
                "headline": "...",
                "description": "...",
                "bullets": [...],
                "cta": "..."
            }
        """
        lang_names = {
            "pt": "Portuguese (Brazil)",
            "en": "English (US)",
            "es": "Spanish (Spain)"
        }

        prompt = f"""Create compelling e-commerce marketing copy for this product:

Product: {title}
Price: ${price}
Language: {lang_names[language]}

Generate:
1. A catchy headline (max 60 chars)
2. A short description (max 150 chars)
3. 5 bullet points highlighting benefits (not features)
4. A call-to-action phrase

Make it persuasive, conversion-focused, and benefit-driven.
Format as JSON with keys: headline, description, bullets (array), cta
"""

        try:
            # Chamar OpenAI GPT-4
            response = openai.ChatCompletion.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert e-commerce copywriter specialized in conversion optimization."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=500,
                temperature=0.7
            )

            content = response.choices[0].message.content

            # Tentar parsear JSON
            import json
            try:
                parsed = json.loads(content)
                return {
                    "headline": parsed.get("headline", f"Amazing {title}"),
                    "description": parsed.get("description", f"Get this {title} now!"),
                    "bullets": parsed.get("bullets", [
                        "High quality product",
                        "Fast shipping",
                        "Great value",
                        "Customer satisfaction guaranteed",
                        "Limited time offer"
                    ]),
                    "cta": parsed.get("cta", "Buy Now")
                }
            except json.JSONDecodeError:
                # Se não conseguir parsear, extrair manualmente
                return self._extract_from_text(content, title, price)

        except Exception as e:
            self.log("ERROR", f"Failed to generate copy with GPT-4: {str(e)}", None)
            return self.get_fallback_copy(title, price, language)

    def _extract_from_text(self, content: str, title: str, price: float) -> Dict:
        """
        Extrai copy do texto gerado se não vier em JSON.

        Args:
            content: Texto gerado pelo GPT
            title: Nome do produto
            price: Preço

        Returns:
            Estrutura de copy formatada
        """
        lines = content.split('\n')
        return {
            "headline": lines[0] if lines else f"Amazing {title}",
            "description": lines[1] if len(lines) > 1 else f"Only ${price}",
            "bullets": ["Benefit 1", "Benefit 2", "Benefit 3", "Benefit 4", "Benefit 5"],
            "cta": "Buy Now"
        }

    def get_fallback_copy(self, title: str, price: float, language: str) -> Dict:
        """
        Copy genérico caso GPT-4 falhe.

        Args:
            title: Nome do produto
            price: Preço
            language: Idioma

        Returns:
            Copy genérico
        """
        if language == "pt":
            return {
                "headline": f"Incrível {title}",
                "description": f"Compre este {title} por apenas ${price}",
                "bullets": [
                    "Alta qualidade",
                    "Envio rápido",
                    "Ótimo custo-benefício",
                    "Satisfação garantida",
                    "Oferta limitada"
                ],
                "cta": "Compre Agora"
            }
        elif language == "es":
            return {
                "headline": f"Increíble {title}",
                "description": f"Compra este {title} por solo ${price}",
                "bullets": [
                    "Alta calidad",
                    "Envío rápido",
                    "Gran relación calidad-precio",
                    "Satisfacción garantizada",
                    "Oferta limitada"
                ],
                "cta": "Comprar Ahora"
            }
        else:  # English
            return {
                "headline": f"Amazing {title}",
                "description": f"Get this {title} for only ${price}",
                "bullets": [
                    "High quality",
                    "Fast shipping",
                    "Great value",
                    "Satisfaction guaranteed",
                    "Limited offer"
                ],
                "cta": "Buy Now"
            }

# Celery task
@celery_app.task(bind=True, name='app.agents.copywriter.copywriter_task')
def copywriter_task(self, input_data: Dict[str, Any]):
    """
    Celery task para Copywriter Agent.

    Args:
        input_data: Dados do produto

    Returns:
        Copy gerado em múltiplos idiomas
    """
    agent = CopywriterAgent()
    return agent.run(self.request.id, input_data)
