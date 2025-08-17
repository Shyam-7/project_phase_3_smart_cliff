from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.schemas.job.job_schema import Job, JobCreate, JobUpdate
from app.api.job.services import job_service
from app.core.auth import get_current_user
from app.core.permissions import get_admin_user
from app.db.models.user.user_model import User
from app.api.deps import get_db

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

@router.get("/", response_model=List[Job])
def read_all_active_jobs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    jobs = job_service.get_all_active_jobs(db, skip=skip, limit=limit)
    return jobs

@router.get("/admin/all", response_model=List[Job])
def read_all_jobs_for_admin(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    jobs = job_service.get_all_jobs_for_admin(db, skip=skip, limit=limit)
    return jobs

@router.get("/{job_id}", response_model=Job)
def read_job_by_id(
    job_id: str,
    db: Session = Depends(get_db)
):
    return job_service.get_job_by_id(db, job_id=job_id)

@router.post("/", response_model=Job, status_code=201)
def create_new_job(
    job: JobCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    return job_service.create_job(db, job=job, user_id=admin_user.id)

@router.put("/{job_id}", response_model=Job)
def update_existing_job(
    job_id: str,
    job_update: JobUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    return job_service.update_job(db, job_id=job_id, job_update=job_update)

@router.delete("/{job_id}")
def remove_job(
    job_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    return job_service.delete_job(db, job_id=job_id)
