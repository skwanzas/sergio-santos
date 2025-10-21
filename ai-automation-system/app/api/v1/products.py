"""
Products Router - CRUD de Produtos
Gerenciamento de oportunidades de arbitragem
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.products import Product, Listing, Sale
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductDetailResponse,
    ListingCreate,
    ListingResponse,
    SaleCreate,
    SaleResponse
)

router = APIRouter()

# ==================== PRODUCTS ====================

@router.get("/", response_model=List[ProductResponse])
def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = None,
    min_margin: Optional[float] = None,
    platform: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Listar produtos (oportunidades descobertas).

    Filtros disponíveis:
    - status: discovered, approved, listed, rejected
    - min_margin: margem mínima percentual (0-100)
    - platform: amazon, ebay, aliexpress, etc.

    Args:
        skip: Número de registros a pular (paginação)
        limit: Número máximo de registros
        status: Filtro por status
        min_margin: Margem mínima em %
        platform: Plataforma origem
        current_user: Usuário autenticado
        db: Sessão do database

    Returns:
        Lista de produtos
    """
    query = db.query(Product)

    # Aplicar filtros
    if status:
        query = query.filter(Product.status == status)

    if min_margin is not None:
        query = query.filter(Product.margin_percent >= min_margin)

    if platform:
        query = query.filter(Product.platform == platform)

    # Ordenar por margem decrescente
    query = query.order_by(Product.margin_percent.desc())

    products = query.offset(skip).limit(limit).all()
    return products

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Criar novo produto (oportunidade).

    Normalmente criado automaticamente pelo Market Research Agent.
    Pode ser criado manualmente para testes.

    Args:
        product_data: Dados do produto
        current_user: Usuário autenticado
        db: Sessão do database

    Returns:
        Produto criado

    Raises:
        HTTPException 400: external_id já existe
    """
    # Verificar se external_id já existe
    existing = db.query(Product).filter(Product.external_id == product_data.external_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product with this external_id already exists"
        )

    # Calcular margem
    margin = None
    margin_percent = None
    if product_data.cost:
        margin = product_data.price - product_data.cost
        margin_percent = (margin / product_data.price) * 100 if product_data.price > 0 else 0

    # Criar produto
    new_product = Product(
        **product_data.dict(),
        margin=margin,
        margin_percent=margin_percent
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product

@router.get("/{product_id}", response_model=ProductDetailResponse)
def get_product(
    product_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obter detalhes completos de um produto.

    Inclui todas as informações: pricing, sourcing, risk, marketing, etc.

    Args:
        product_id: ID do produto
        current_user: Usuário autenticado
        db: Sessão do database

    Returns:
        Produto com todos os detalhes

    Raises:
        HTTPException 404: Produto não encontrado
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    return product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_update: ProductUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Atualizar produto.

    Útil para atualizar status, adicionar copy gerado pela IA,
    adicionar imagens, keywords SEO, etc.

    Args:
        product_id: ID do produto
        product_update: Dados a atualizar
        current_user: Usuário autenticado
        db: Sessão do database

    Returns:
        Produto atualizado

    Raises:
        HTTPException 404: Produto não encontrado
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Atualizar campos fornecidos
    update_data = product_update.dict(exclude_unset=True)

    # Recalcular margem se preço ou custo mudaram
    if 'price' in update_data or 'cost' in update_data:
        price = update_data.get('price', product.price)
        cost = update_data.get('cost', product.cost)
        if cost:
            margin = price - cost
            margin_percent = (margin / price) * 100 if price > 0 else 0
            update_data['margin'] = margin
            update_data['margin_percent'] = margin_percent

    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Deletar produto.

    Deleta também os listings e sales relacionados (cascade).

    Args:
        product_id: ID do produto
        current_user: Usuário autenticado
        db: Sessão do database

    Raises:
        HTTPException 404: Produto não encontrado
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    db.delete(product)
    db.commit()

    return None

# ==================== LISTINGS ====================

@router.get("/{product_id}/listings", response_model=List[ListingResponse])
def get_product_listings(
    product_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Listar todos os listings de um produto.

    Args:
        product_id: ID do produto
        current_user: Usuário autenticado
        db: Sessão do database

    Returns:
        Lista de listings do produto
    """
    listings = db.query(Listing).filter(Listing.product_id == product_id).all()
    return listings

@router.post("/listings", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    listing_data: ListingCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Criar novo listing (registrar publicação).

    Quando você publica manualmente um produto em uma plataforma,
    registre aqui para tracking.

    Args:
        listing_data: Dados do listing
        current_user: Usuário autenticado
        db: Sessão do database

    Returns:
        Listing criado

    Raises:
        HTTPException 404: Produto não encontrado
    """
    # Verificar se produto existe
    product = db.query(Product).filter(Product.id == listing_data.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Criar listing
    new_listing = Listing(**listing_data.dict())
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)

    return new_listing

# ==================== SALES ====================

@router.post("/sales", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
def create_sale(
    sale_data: SaleCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Registrar venda realizada.

    Quando um produto é vendido, registre aqui para tracking
    de performance e lucro.

    Args:
        sale_data: Dados da venda
        current_user: Usuário autenticado
        db: Sessão do database

    Returns:
        Sale criada

    Raises:
        HTTPException 404: Produto não encontrado
        HTTPException 400: order_id já existe
    """
    # Verificar se produto existe
    product = db.query(Product).filter(Product.id == sale_data.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Verificar se order_id já existe
    existing_sale = db.query(Sale).filter(Sale.order_id == sale_data.order_id).first()
    if existing_sale:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sale with this order_id already exists"
        )

    # Calcular net_profit
    cost = sale_data.cost or 0
    platform_fee = sale_data.platform_fee or 0
    net_profit = sale_data.sale_price - cost - platform_fee

    # Criar sale
    from datetime import datetime
    new_sale = Sale(
        **sale_data.dict(),
        net_profit=net_profit,
        sale_date=datetime.utcnow()
    )

    db.add(new_sale)
    db.commit()
    db.refresh(new_sale)

    return new_sale

@router.get("/sales", response_model=List[SaleResponse])
def get_sales(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Listar todas as vendas.

    Args:
        skip: Número de registros a pular
        limit: Número máximo de registros
        current_user: Usuário autenticado
        db: Sessão do database

    Returns:
        Lista de vendas
    """
    sales = db.query(Sale).order_by(Sale.sale_date.desc()).offset(skip).limit(limit).all()
    return sales
