"""
API Dependencies - Dependências reutilizáveis para FastAPI
Autenticação, autorização e validação de usuários.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User

# Security scheme
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency para obter o usuário atual do token JWT.

    Args:
        credentials: Credenciais do header Authorization
        db: Sessão do database

    Returns:
        User object do usuário autenticado

    Raises:
        HTTPException 401: Token inválido ou expirado
        HTTPException 404: Usuário não encontrado

    Example:
        @app.get("/protected")
        def protected_route(user: User = Depends(get_current_user)):
            return {"user_id": user.id}
    """
    # Extrair token
    token = credentials.credentials

    # Decodificar token
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extrair user_id do payload
    user_id: int = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Buscar usuário no database
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency para obter apenas usuários ativos.

    Args:
        current_user: Usuário atual (do get_current_user)

    Returns:
        User object se o usuário está ativo

    Raises:
        HTTPException 403: Usuário inativo

    Example:
        @app.get("/users/me")
        def read_users_me(user: User = Depends(get_current_active_user)):
            return user
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user

async def get_current_superuser(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency para endpoints que requerem superuser.

    Args:
        current_user: Usuário atual (do get_current_user)

    Returns:
        User object se o usuário é superuser

    Raises:
        HTTPException 403: Usuário não é superuser

    Example:
        @app.delete("/users/{user_id}")
        def delete_user(
            user_id: int,
            admin: User = Depends(get_current_superuser)
        ):
            # Apenas superusers podem deletar usuários
            ...
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user
