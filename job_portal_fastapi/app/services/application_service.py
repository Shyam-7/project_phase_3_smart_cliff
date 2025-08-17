from sqlalchemy.orm import Session
from app.db.models.job.application_model import Application
from app.db.schemas.job.application_schema import ApplicationCreate, ApplicationUpdate
from fastapi import HTTPException

def create_application(db: Session, application: ApplicationCreate, user_id: str):
    # Check if user has already applied for this job
    existing_application = db.query(Application).filter(
        Application.job_id == application.job_id,
        Application.user_id == user_id
    ).first()
    if existing_application:
        raise HTTPException(status_code=400, detail="You have already applied for this job")

    db_application = Application(**application.dict(), user_id=user_id)
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

def get_user_applications(db: Session, user_id: str):
    return db.query(Application).filter(Application.user_id == user_id).all()

def get_application_by_id(db: Session, application_id: str):
    db_application = db.query(Application).filter(Application.id == application_id).first()
    if not db_application:
        raise HTTPException(status_code=404, detail="Application not found")
    return db_application

def update_application(db: Session, application_id: str, application_update: ApplicationUpdate, current_user_id: str, user_role: str):
    db_application = get_application_by_id(db, application_id)

    # Check if the user is the owner of the application or an admin
    if db_application.user_id != current_user_id and user_role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized to update this application")

    update_data = application_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_application, key, value)

    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

def withdraw_application(db: Session, application_id: str, user_id: str):
    db_application = get_application_by_id(db, application_id)

    if db_application.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to withdraw this application")

    db.delete(db_application)
    db.commit()
    return {"message": "Application withdrawn successfully"}
