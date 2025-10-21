"""
Auth Router - Endpoints de Autenticação
Register, Login, Profile, Change Password
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
    PasswordChange
)
from app.api.deps import get_current_user, get_current_active_user

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Registrar novo usuário.

    Cria uma nova conta de usuário no sistema.

    Args:
        user_data: Dados do usuário (email, username, password)
        db: Sessão do database

    Returns:
        Usuário criado (sem senha)

    Raises:
        HTTPException 400: Email ou username já existe
    """
    # Verificar se email já existe
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Verificar se username já existe
    existing_username = db.query(User).filter(User.username == user_data.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    # Criar usuário
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.post("/login")
def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Login - Autenticação de usuário.

    Valida credenciais e retorna JWT token.

    Args:
        credentials: Email e password
        db: Sessão do database

    Returns:
        {
            "access_token": "eyJ...",
            "token_type": "bearer",
            "user": {...}
        }

    Raises:
        HTTPException 401: Credenciais inválidas
        HTTPException 403: Usuário inativo
    """
    # Buscar usuário por email
    user = db.query(User).filter(User.email == credentials.email).first()

    # Verificar se usuário existe e senha está correta
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Verificar se usuário está ativo
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )

    # Criar access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(user)
    }

@router.get("/me", response_model=UserResponse)
def get_profile(
    current_user: User = Depends(get_current_active_user)
):
    """
    Obter perfil do usuário atual.

    Endpoint protegido - requer autenticação.

    Args:
        current_user: Usuário autenticado (do token JWT)

    Returns:
        Dados do usuário atual
    """
    return current_user

@router.put("/me", response_model=UserResponse)
def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Atualizar perfil do usuário atual.

    Args:
        user_update: Dados a atualizar (username e/ou email)
        current_user: Usuário autenticado
        db: Sessão do database

    Returns:
        Usuário atualizado

    Raises:
        HTTPException 400: Email ou username já existe
    """
    # Verificar se novo email já existe (se fornecido)
    if user_update.email and user_update.email != current_user.email:
        existing_email = db.query(User).filter(User.email == user_update.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        current_user.email = user_update.email

    # Verificar se novo username já existe (se fornecido)
    if user_update.username and user_update.username != current_user.username:
        existing_username = db.query(User).filter(User.username == user_update.username).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        current_user.username = user_update.username

    db.commit()
    db.refresh(current_user)

    return current_user

@router.put("/change-password")
def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Alterar senha do usuário atual.

    Args:
        password_data: Senha atual e nova senha
        current_user: Usuário autenticado
        db: Sessão do database

    Returns:
        {"message": "Password changed successfully"}

    Raises:
        HTTPException 400: Senha atual incorreta
    """
    # Verificar senha atual
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )

    # Atualizar senha
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()

    return {"message": "Password changed successfully"}
