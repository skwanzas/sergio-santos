"""
Product Schemas - Validação de dados de produto
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any

# Input schemas
class ProductCreate(BaseModel):
    """Schema para criar produto."""
    external_id: str
    title: str = Field(..., min_length=3)
    description: Optional[str] = None
    category: Optional[str] = None
    price: float = Field(..., gt=0)
    cost: Optional[float] = None
    platform: str
    supplier_url: Optional[str] = None

class ProductUpdate(BaseModel):
    """Schema para atualizar produto."""
    title: Optional[str] = Field(None, min_length=3)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    cost: Optional[float] = None
    status: Optional[str] = None
    generated_copy: Optional[Dict[str, Any]] = None
    generated_images: Optional[List[str]] = None
    seo_keywords: Optional[List[str]] = None

# Output schemas
class ProductResponse(BaseModel):
    """Schema de resposta básica de produto."""
    id: int
    external_id: str
    title: str
    description: Optional[str]
    category: Optional[str]
    price: float
    cost: Optional[float]
    margin: Optional[float]
    margin_percent: Optional[float]
    platform: str
    risk_score: Optional[float]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class ProductDetailResponse(ProductResponse):
    """Schema de resposta detalhada de produto."""
    estimated_demand: Optional[int]
    supplier_url: Optional[str]
    supplier_rating: Optional[float]
    supplier_orders: Optional[int]
    shipping_cost: Optional[float]
    shipping_time: Optional[int]
    risk_factors: Optional[Dict[str, Any]]
    compliance_check: bool
    generated_copy: Optional[Dict[str, Any]]
    generated_images: Optional[List[str]]
    seo_keywords: Optional[List[str]]
    target_platforms: Optional[List[str]]
    optimal_prices: Optional[Dict[str, float]]
    updated_at: datetime

# Listing schemas
class ListingCreate(BaseModel):
    """Schema para criar listing."""
    product_id: int
    platform: str
    price: float = Field(..., gt=0)
    platform_id: Optional[str] = None
    url: Optional[str] = None

class ListingResponse(BaseModel):
    """Schema de resposta de listing."""
    id: int
    product_id: int
    platform: str
    platform_id: Optional[str]
    url: Optional[str]
    price: float
    views: int
    clicks: int
    conversions: int
    revenue: float
    status: str
    listed_at: datetime

    class Config:
        from_attributes = True

# Sale schemas
class SaleCreate(BaseModel):
    """Schema para registrar venda."""
    product_id: int
    order_id: str
    platform: str
    sale_price: float = Field(..., gt=0)
    cost: Optional[float] = None
    platform_fee: Optional[float] = None

class SaleResponse(BaseModel):
    """Schema de resposta de venda."""
    id: int
    product_id: int
    order_id: str
    platform: str
    sale_price: float
    cost: Optional[float]
    platform_fee: Optional[float]
    net_profit: Optional[float]
    sale_date: datetime
    status: str

    class Config:
        from_attributes = True
