from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DashboardStats(BaseModel):
    totalUsers: int
    totalJobs: int
    totalApplications: int
    pendingApplications: int
    scheduledInterviews: int
    activeJobs: int

class RecentJob(BaseModel):
    id: str
    title: str
    company_name: str
    status: str
    created_at: datetime
    applicationCount: int

    class Config:
        orm_mode = True

class RecentActivity(BaseModel):
    id: str
    type: str
    message: str
    user_name: Optional[str]
    timestamp: datetime
    user_initials: str

    class Config:
        orm_mode = True
