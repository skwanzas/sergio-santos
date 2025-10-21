"""
Script de verificação de setup.
Verifica se todas as dependências estão instaladas corretamente.
"""
import sys

def check_imports():
    """Verifica se todas as bibliotecas estão instaladas."""
    required = {
        'fastapi': 'FastAPI',
        'sqlalchemy': 'SQLAlchemy',
        'celery': 'Celery',
        'redis': 'Redis',
        'openai': 'OpenAI',
        'neo4j': 'Neo4j',
        'playwright': 'Playwright'
    }

    missing = []
    for module, name in required.items():
        try:
            __import__(module)
            print(f"✓ {name} instalado")
        except ImportError:
            print(f"✗ {name} NÃO instalado")
            missing.append(module)

    if missing:
        print(f"\n❌ Dependências faltando: {', '.join(missing)}")
        print(f"\nPara instalar: pip install {' '.join(missing)}")
        sys.exit(1)
    else:
        print("\n✅ Todas as dependências OK!")

if __name__ == "__main__":
    check_imports()
