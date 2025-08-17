from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.db.schemas.common.base_schema import BaseSchema

class UserBase(BaseModel):
    email: EmailStr = Field(..., example="user@example.com")
    name: Optional[str] = Field(None, example="John Doe")
    role: Optional[str] = Field('job_seeker', example="job_seeker")
    status: Optional[str] = Field('active', example="active")

class UserCreate(UserBase):
    password: str = Field(..., example="a_very_secret_password")

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = Field(None, example="user@example.com")
    name: Optional[str] = Field(None, example="John Doe")
    role: Optional[str] = Field(None, example="job_seeker")
    status: Optional[str] = Field(None, example="active")
    password: Optional[str] = Field(None, example="a_new_very_secret_password")

class UserInDB(UserBase):
    id: str
    password_hash: str

    class Config:
        orm_mode = True

class User(UserBase, BaseSchema):
    pass
