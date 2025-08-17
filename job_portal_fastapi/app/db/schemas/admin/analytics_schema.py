from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DashboardStats(BaseModel):
    totalUsers: int
    totalJobs: int
    totalApplications: int
    activeJobs: int

class RecentActivity(BaseModel):
    id: str
    type: str
    description: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True

class JobCategoryDistribution(BaseModel):
    category: Optional[str]
    count: int

class ApplicationStatusDistribution(BaseModel):
    status: str
    count: int
