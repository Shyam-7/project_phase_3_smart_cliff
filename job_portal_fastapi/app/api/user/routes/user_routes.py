from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import List
from app.db.schemas.user.user_schema import User, UserUpdate
from app.api.user.services import user_service
from app.core.auth import get_current_user
from app.core.permissions import get_admin_user
from app.db.models.user.user_model import User as UserModel
from app.api.deps import get_db

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/profile", response_model=User)
def read_users_me(current_user: UserModel = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=User)
def update_user_me(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    return user_service.update_user_profile(db, user_id=current_user.id, user_update=user_update)

@router.get("/", response_model=List[User])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin_user: UserModel = Depends(get_admin_user)
):
    users = user_service.get_all_users(db, skip=skip, limit=limit)
    return users

@router.get("/{user_id}", response_model=User)
def read_user_by_id(
    user_id: str,
    db: Session = Depends(get_db),
    admin_user: UserModel = Depends(get_admin_user)
):
    return user_service.get_user_by_id(db, user_id=user_id)

@router.delete("/{user_id}")
def remove_user(
    user_id: str,
    db: Session = Depends(get_db),
    admin_user: UserModel = Depends(get_admin_user)
):
    return user_service.delete_user(db, user_id=user_id)

@router.patch("/{user_id}/status", response_model=User)
def update_user_status_by_id(
    user_id: str,
    status: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    admin_user: UserModel = Depends(get_admin_user)
):
    return user_service.update_user_status(db, user_id=user_id, status=status)
