from sqlalchemy.orm import Session
from sqlalchemy import func, text, or_
from app.db.models.user.user_model import User
from app.db.models.job.job_model import Job
from app.db.models.job.application_model import Application

def get_dashboard_stats(db: Session):
    totalUsers = db.query(User).count()
    totalJobs = db.query(Job).count()
    activeJobs = db.query(Job).filter(or_(Job.expires_at > func.now(), Job.expires_at == None), Job.status == 'active').count()
    totalApplications = db.query(Application).count()

    return {
        "totalUsers": totalUsers,
        "totalJobs": totalJobs,
        "totalApplications": totalApplications,
        "activeJobs": activeJobs
    }

def get_recent_activity(db: Session, limit: int = 5):
    # This is a simplified version for Option 1
    recent_users_query = text(f"""
        SELECT
            id,
            'user_registered' as type,
            CONCAT(name, ' joined the platform') as description,
            created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT {limit}
    """)
    recent_users = db.execute(recent_users_query).mappings().all()

    recent_applications_query = text(f"""
        SELECT
            a.id,
            'application' as type,
            CONCAT(a.full_name, ' applied to ', j.title) as description,
            a.created_at
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        ORDER BY a.created_at DESC
        LIMIT {limit}
    """)
    recent_applications = db.execute(recent_applications_query).mappings().all()

    all_activities = sorted(
        list(recent_users) + list(recent_applications),
        key=lambda x: x['created_at'],
        reverse=True
    )
    return all_activities[:limit]

def get_job_categories(db: Session):
    return db.query(Job.category, func.count(Job.id).label('count')).group_by(Job.category).order_by(func.count(Job.id).desc()).all()

def get_application_status(db: Session):
    return db.query(Application.status, func.count(Application.id).label('count')).group_by(Application.status).order_by(func.count(Application.id).desc()).all()
