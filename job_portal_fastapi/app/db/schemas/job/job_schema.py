from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from app.db.schemas.common.base_schema import BaseSchema

class JobBase(BaseModel):
    title: Optional[str] = Field(None, example="Software Engineer")
    company_name: Optional[str] = Field(None, example="Tech Corp")
    location: Optional[str] = Field(None, example="San Francisco, CA")
    employment_type: Optional[str] = Field(None, example="Full-time")
    experience_level: Optional[str] = Field(None, example="Mid-level")
    category: Optional[str] = Field(None, example="Software Development")
    status: Optional[str] = Field('active', example="active")
    description: Optional[str] = Field(None, example="We are looking for a talented Software Engineer...")
    requirements: Optional[str] = Field(None, example="- 3+ years of experience...")
    salary_min: Optional[Decimal] = Field(None, example=100000.00)
    salary_max: Optional[Decimal] = Field(None, example=150000.00)
    salary_currency: Optional[str] = Field('INR', example="INR")
    company_rating: Optional[Decimal] = Field(None, example=4.5)
    company_reviews_count: Optional[int] = Field(0, example=123)
    remote_allowed: Optional[bool] = Field(False, example=True)
    skills_required: Optional[str] = Field(None, example="Python, FastAPI, Docker")
    benefits: Optional[str] = Field(None, example="Health insurance, 401k, PTO")
    company_size: Optional[str] = Field(None, example="50-200 employees")
    company_type: Optional[str] = Field('Corporate', example="Corporate")
    expires_at: Optional[datetime] = Field(None, example="2025-12-31T23:59:59Z")

class JobCreate(JobBase):
    title: str = Field(..., example="Software Engineer")
    company_name: str = Field(..., example="Tech Corp")
    description: str = Field(..., example="We are looking for a talented Software Engineer...")

class JobUpdate(JobBase):
    pass

class Job(JobBase, BaseSchema):
    views: Optional[int] = Field(0, example=42)

    class Config:
        orm_mode = True
