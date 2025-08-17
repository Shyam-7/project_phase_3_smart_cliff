from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from ..services import job_service
from ..models.job import JobResponse, JobCreate, JobUpdate
from ..models.user import User
from ..database import get_db
from ..dependencies import get_current_admin_user
from mysql.connector.connection import MySQLConnection

router = APIRouter()

@router.get("/", response_model=List[JobResponse])
def read_jobs(
    db: MySQLConnection = Depends(get_db),
    category: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    experience: Optional[str] = Query(None),
    employment_type: Optional[str] = Query(None),
    company_type: Optional[str] = Query(None),
    salary_min: Optional[int] = Query(None),
    salary_max: Optional[int] = Query(None),
    remote_allowed: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("DESC"),
):
    return job_service.get_all_jobs(
        db, category, location, experience, employment_type, company_type,
        salary_min, salary_max, remote_allowed, search, sort_by, sort_order
    )

@router.get("/admin/all", response_model=List[JobResponse])
def read_all_jobs_for_admin(
    db: MySQLConnection = Depends(get_db),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("DESC"),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_admin_user)
):
    return job_service.get_all_jobs_for_admin(db, sort_by, sort_order, search)

@router.get("/{job_id}", response_model=JobResponse)
def read_job(job_id: int, db: MySQLConnection = Depends(get_db)):
    job = job_service.get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("/", response_model=JobResponse, status_code=201)
def create_new_job(
    job: JobCreate,
    db: MySQLConnection = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    user_id = current_user.id
    return job_service.create_job(db, job, user_id)

@router.put("/{job_id}", response_model=JobResponse)
def update_existing_job(
    job_id: int,
    job: JobUpdate,
    db: MySQLConnection = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    updated_job = job_service.update_job(db, job_id, job)
    if not updated_job:
        raise HTTPException(status_code=404, detail="Job not found")
    return updated_job

@router.delete("/{job_id}")
def delete_existing_job(
    job_id: int,
    db: MySQLConnection = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    result = job_service.delete_job(db, job_id)
    if not result:
        raise HTTPException(status_code=404, detail="Job not found")
    return result
