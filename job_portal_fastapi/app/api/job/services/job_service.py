from sqlalchemy.orm import Session
from app.db.models.job.job_model import Job
from app.db.schemas.job.job_schema import JobCreate, JobUpdate
from fastapi import HTTPException

def get_all_active_jobs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Job).filter(Job.status == 'active').offset(skip).limit(limit).all()

def get_all_jobs_for_admin(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Job).offset(skip).limit(limit).all()

def get_job_by_id(db: Session, job_id: str):
    db_job = db.query(Job).filter(Job.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    return db_job

def create_job(db: Session, job: JobCreate, user_id: str):
    db_job = Job(**job.dict(), posted_by=user_id)
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def update_job(db: Session, job_id: str, job_update: JobUpdate):
    db_job = get_job_by_id(db, job_id)
    update_data = job_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_job, key, value)
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def delete_job(db: Session, job_id: str):
    db_job = get_job_by_id(db, job_id)
    db.delete(db_job)
    db.commit()
    return {"message": "Job deleted successfully"}
