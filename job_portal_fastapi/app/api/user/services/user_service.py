from sqlalchemy.orm import Session
from app.db.models.user.user_model import User
from app.db.schemas.user.user_schema import UserUpdate
from fastapi import HTTPException
from app.core.security import get_password_hash

def get_user_profile(db: Session, user_id: str):
    return db.query(User).filter(User.id == user_id).first()

def update_user_profile(db: Session, user_id: str, user_update: UserUpdate):
    db_user = get_user_profile(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = user_update.dict(exclude_unset=True)

    if "password" in update_data and update_data["password"]:
        hashed_password = get_password_hash(update_data["password"])
        db_user.password_hash = hashed_password
        del update_data["password"]

    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_all_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

def get_user_by_id(db: Session, user_id: str):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

def delete_user(db: Session, user_id: str):
    db_user = get_user_by_id(db, user_id)
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}

def update_user_status(db: Session, user_id: str, status: str):
    db_user = get_user_by_id(db, user_id)
    db_user.status = status
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
