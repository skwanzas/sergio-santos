"""
Product Models - Produtos, Listings e Sales
Modelos principais para o sistema de arbitragem
"""
from sqlalchemy import Column, Integer, String, Float, JSON, DateTime, Boolean, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Product(Base):
    """
    Modelo para produtos identificados pelo sistema.
    Armazena oportunidades de arbitragem descobertas.

    Attributes:
        id: ID único
        external_id: ID externo da plataforma
        title: Nome do produto
        description: Descrição
        category: Categoria
        price: Preço de venda
        cost: Custo de aquisição
        margin: Margem em valor absoluto
        margin_percent: Margem percentual
        estimated_demand: Demanda estimada
        platform: Plataforma origem (amazon, ebay, etc)
        supplier_url: URL do fornecedor
        supplier_rating: Rating do fornecedor
        supplier_orders: Número de pedidos do fornecedor
        shipping_cost: Custo de envio
        shipping_time: Tempo de envio em dias
        risk_score: Score de risco (0-100)
        risk_factors: Fatores de risco (JSON)
        compliance_check: Passou verificação de compliance
        status: Status atual (discovered, approved, listed, etc)
        generated_copy: Copy gerado pela IA (JSON)
        generated_images: URLs de imagens (JSON)
        seo_keywords: Keywords SEO (JSON)
        target_platforms: Plataformas alvo (JSON)
        optimal_prices: Preços otimizados por plataforma (JSON)
    """
    __tablename__ = "products"
    __table_args__ = (
        Index('idx_product_platform_price', 'platform', 'price'),
        Index('idx_product_created', 'created_at'),
        Index('idx_product_status', 'status'),
    )

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String, unique=True, nullable=False)

    # Basic info
    title = Column(String, nullable=False)
    description = Column(String)
    category = Column(String, index=True)

    # Pricing
    price = Column(Float, nullable=False)
    cost = Column(Float)
    margin = Column(Float)
    margin_percent = Column(Float)
    estimated_demand = Column(Integer)

    # Sourcing
    platform = Column(String, index=True)
    supplier_url = Column(String)
    supplier_rating = Column(Float)
    supplier_orders = Column(Integer)
    shipping_cost = Column(Float)
    shipping_time = Column(Integer)  # dias

    # Risk
    risk_score = Column(Float, index=True)
    risk_factors = Column(JSON)
    compliance_check = Column(Boolean, default=False)

    # Status
    status = Column(String, default="discovered")

    # Marketing (gerado pelos agentes IA)
    generated_copy = Column(JSON)  # {pt: {...}, en: {...}, es: {...}}
    generated_images = Column(JSON)  # [url1, url2, url3, ...]
    seo_keywords = Column(JSON)  # [kw1, kw2, kw3, ...]

    # Target
    target_platforms = Column(JSON)  # ["eBay", "Amazon", "ML"]
    optimal_prices = Column(JSON)  # {"eBay": 65, "Amazon": 68}

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    listings = relationship("Listing", back_populates="product", cascade="all, delete-orphan")
    sales = relationship("Sale", back_populates="product")

    def __repr__(self):
        return f"<Product(id={self.id}, title={self.title}, margin={self.margin_percent}%)>"


class Listing(Base):
    """
    Produto publicado em uma plataforma.
    Criado quando o usuário decide publicar uma oportunidade.

    Attributes:
        id: ID único
        product_id: ID do produto relacionado
        platform: Plataforma onde foi publicado
        platform_id: ID na plataforma
        url: URL do listing
        price: Preço de listagem
        views: Visualizações
        clicks: Cliques
        conversions: Conversões
        revenue: Receita gerada
        status: Status (active, paused, sold_out)
        listed_at: Data de publicação
    """
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)

    # Platform info
    platform = Column(String, nullable=False)
    platform_id = Column(String, unique=True)
    url = Column(String)
    price = Column(Float, nullable=False)

    # Performance
    views = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    conversions = Column(Integer, default=0)
    revenue = Column(Float, default=0.0)

    # Status
    status = Column(String, default="active")
    listed_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    product = relationship("Product", back_populates="listings")

    def __repr__(self):
        return f"<Listing(id={self.id}, platform={self.platform}, status={self.status})>"


class Sale(Base):
    """
    Venda realizada.
    Registra quando um produto listado é vendido.

    Attributes:
        id: ID único
        product_id: ID do produto vendido
        order_id: ID do pedido na plataforma
        platform: Plataforma onde vendeu
        sale_price: Preço de venda
        cost: Custo do produto
        platform_fee: Taxa da plataforma
        net_profit: Lucro líquido
        sale_date: Data da venda
        status: Status (pending, completed, refunded)
    """
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)

    # Order info
    order_id = Column(String, unique=True, nullable=False)
    platform = Column(String, nullable=False)

    # Financial
    sale_price = Column(Float, nullable=False)
    cost = Column(Float)
    platform_fee = Column(Float)
    net_profit = Column(Float)

    # Metadata
    sale_date = Column(DateTime, nullable=False, index=True)
    status = Column(String, default="pending")

    # Relationship
    product = relationship("Product", back_populates="sales")

    def __repr__(self):
        return f"<Sale(id={self.id}, order={self.order_id}, profit={self.net_profit})>"
