from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class JobBase(BaseModel):
    title: str
    company_name: str
    location: str
    description: Optional[str] = None
    requirements: Optional[str] = None
    employment_type: str
    category: str
    experience_level: Optional[str] = None
    skills_required: Optional[str] = None
    benefits: Optional[str] = None
    company_size: Optional[str] = None
    company_type: Optional[str] = None
    remote_allowed: bool = False
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    status: str = "active"
    expires_at: Optional[datetime] = None

class JobCreate(JobBase):
    pass

class JobUpdate(JobBase):
    title: Optional[str] = None
    company_name: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None

class Job(JobBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    views: int = 0
    company_rating: Optional[float] = None
    company_reviews_count: Optional[int] = None

    class Config:
        orm_mode = True

class JobInDB(Job):
    posted_by: int

class JobResponse(BaseModel):
    id: int
    title: str
    company: str
    company_name: str
    rating: Optional[float] = None
    company_rating: Optional[float] = None
    reviews: Optional[int] = 0
    company_reviews_count: Optional[int] = None
    location: str
    experience: Optional[str] = None
    experience_level: Optional[str] = None
    salary: Optional[float] = 0
    salaryRange: str
    postedDate: datetime
    created_at: datetime
    summary: Optional[str] = ""
    description: Optional[str] = ""
    companyType: Optional[str] = None
    company_type: Optional[str] = None
    tags: List[str] = []
    posted: datetime
    logo: Optional[str] = None
    logoText: str
    color: str
    employment_type: str
    category: str
    requirements: Optional[str] = None
    skills_required: Optional[str] = None
    benefits: Optional[str] = None
    views: int = 0
    expires_at: Optional[datetime] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    remote_allowed: bool = False
    company_size: Optional[str] = None
    status: str
    applications: Optional[int] = None
