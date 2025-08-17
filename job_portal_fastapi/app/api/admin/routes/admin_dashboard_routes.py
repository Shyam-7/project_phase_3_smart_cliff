from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.schemas.admin.dashboard_schema import DashboardStats, RecentJob, RecentActivity
from app.api.admin.services.admin_dashboard_service import (
    get_dashboard_stats,
    get_recent_jobs,
    get_recent_activity
)
from app.core.permissions import get_admin_user
from app.db.models.user.user_model import User
from app.api.deps import get_db

router = APIRouter(prefix="/api/admin/dashboard", tags=["Admin Dashboard"])

@router.get("/stats", response_model=DashboardStats)
def read_dashboard_stats(db: Session = Depends(get_db), admin_user: User = Depends(get_admin_user)):
    return get_dashboard_stats(db)

@router.get("/recent-jobs", response_model=List[RecentJob])
def read_recent_jobs(limit: int = 5, db: Session = Depends(get_db), admin_user: User = Depends(get_admin_user)):
    return get_recent_jobs(db, limit=limit)

@router.get("/recent-activity", response_model=List[RecentActivity])
def read_recent_activity(limit: int = 5, db: Session = Depends(get_db), admin_user: User = Depends(get_admin_user)):
    return get_recent_activity(db, limit=limit)
