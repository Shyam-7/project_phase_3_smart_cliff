from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import BaseModel

class Notification(BaseModel):
    __tablename__ = 'notifications'
    user_id = Column(String(36), ForeignKey('users.id'))
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default='general')
    is_read = Column(Boolean, default=False)
    action_url = Column(String(500))
    read_at = Column(DateTime)

    user = relationship("User")
