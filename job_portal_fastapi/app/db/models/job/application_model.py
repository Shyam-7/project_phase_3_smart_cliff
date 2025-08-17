from sqlalchemy import Column, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import BaseModel

class Application(BaseModel):
    __tablename__ = 'applications'
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    job_id = Column(String(36), ForeignKey('jobs.id'), nullable=False)
    resume_url = Column(String(255))
    cover_letter = Column(Text)
    full_name = Column(String(255))
    email = Column(String(255))
    phone = Column(String(20))
    quick_apply = Column(Boolean, default=False)
    status = Column(String(100), default='applied')
    admin_notes = Column(Text)

    user = relationship("User")
    job = relationship("Job")
