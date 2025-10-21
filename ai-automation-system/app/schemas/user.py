"""
User Schemas - Validação de dados de usuário
"""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

# Input schemas
class UserCreate(BaseModel):
    """Schema para criação de usuário."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    """Schema para login."""
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    """Schema para atualização de usuário."""
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None

class PasswordChange(BaseModel):
    """Schema para mudança de senha."""
    current_password: str
    new_password: str = Field(..., min_length=8)

# Output schemas
class UserResponse(BaseModel):
    """Schema de resposta de usuário (sem senha)."""
    id: int
    email: str
    username: str
    is_active: bool
    is_superuser: bool
    created_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2

class UserInDB(UserResponse):
    """Schema interno com senha hasheada."""
    hashed_password: str
