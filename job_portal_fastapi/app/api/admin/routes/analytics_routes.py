from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.schemas.admin.analytics_schema import (
    DashboardStats,
    RecentActivity,
    JobCategoryDistribution,
    ApplicationStatusDistribution
)
from app.api.admin.services.analytics_service import (
    get_dashboard_stats,
    get_recent_activity,
    get_job_categories,
    get_application_status
)
from app.core.permissions import get_admin_user
from app.db.models.user.user_model import User
from app.api.deps import get_db

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/overview", response_model=DashboardStats)
def read_analytics_overview(db: Session = Depends(get_db), admin_user: User = Depends(get_admin_user)):
    return get_dashboard_stats(db)

@router.get("/recent-activity", response_model=List[RecentActivity])
def read_recent_activity(limit: int = 5, db: Session = Depends(get_db), admin_user: User = Depends(get_admin_user)):
    return get_recent_activity(db, limit=limit)

@router.get("/job-categories", response_model=List[JobCategoryDistribution])
def read_job_categories(db: Session = Depends(get_db), admin_user: User = Depends(get_admin_user)):
    return get_job_categories(db)

@router.get("/application-status", response_model=List[ApplicationStatusDistribution])
def read_application_status(db: Session = Depends(get_db), admin_user: User = Depends(get_admin_user)):
    return get_application_status(db)
