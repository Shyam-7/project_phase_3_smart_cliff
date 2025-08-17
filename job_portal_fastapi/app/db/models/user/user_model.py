from sqlalchemy import Column, String, DateTime
from app.db.base import BaseModel

class User(BaseModel):
    __tablename__ = 'users'
    name = Column(String(255))
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default='job_seeker')
    status = Column(String(50), default='active')
    last_active_at = Column(DateTime)
