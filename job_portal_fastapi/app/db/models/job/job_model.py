from sqlalchemy import Column, String, Text, Integer, DateTime, Numeric, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import BaseModel

class Job(BaseModel):
    __tablename__ = 'jobs'
    title = Column(String(255))
    company_name = Column(String(255))
    location = Column(String(255))
    employment_type = Column(String(100))
    experience_level = Column(String(100))
    category = Column(String(100))
    status = Column(String(50), default='active')
    description = Column(Text)
    requirements = Column(Text)
    posted_by = Column(String(36), ForeignKey('users.id'))
    views = Column(Integer, default=0)
    expires_at = Column(DateTime)
    salary_min = Column(Numeric(10, 2))
    salary_max = Column(Numeric(10, 2))
    salary_currency = Column(String(3), default='INR')
    company_rating = Column(Numeric(2, 1))
    company_reviews_count = Column(Integer, default=0)
    remote_allowed = Column(Boolean, default=False)
    skills_required = Column(Text)
    benefits = Column(Text)
    company_size = Column(String(50))
    company_type = Column(String(50), default='Corporate')

    poster = relationship("User")
