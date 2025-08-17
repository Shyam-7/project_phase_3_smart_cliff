from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import BaseModel

class Announcement(BaseModel):
    __tablename__ = 'announcements'
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    target_audience = Column(String(100), default='all')
    created_by = Column(String(36), ForeignKey('users.id'))
    status = Column(String(50), default='active')
    scheduled_at = Column(DateTime)

    creator = relationship("User")
