from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import BaseModel

class JobSeekerProfile(BaseModel):
    __tablename__ = 'job_seeker_profiles'
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False, unique=True)
    resume_url = Column(String(255))
    skills = Column(Text)
    experience = Column(Text)
    education = Column(Text)
    bio = Column(Text)
    cover_letter = Column(Text)
    first_name = Column(String(255))
    last_name = Column(String(255))
    phone_number = Column(String(50))

    user = relationship("User")
