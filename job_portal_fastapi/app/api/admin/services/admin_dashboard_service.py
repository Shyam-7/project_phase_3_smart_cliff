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
    pendingApplications = db.query(Application).filter(Application.status.in_(['submitted', 'under_review', 'pending', 'reviewing'])).count()
    scheduledInterviews = db.query(Application).filter(Application.status.in_(['interview', 'interview_scheduled', 'interviewing'])).count()

    return {
        "totalUsers": totalUsers,
        "totalJobs": totalJobs,
        "totalApplications": totalApplications,
        "pendingApplications": pendingApplications,
        "scheduledInterviews": scheduledInterviews,
        "activeJobs": activeJobs
    }

def get_recent_jobs(db: Session, limit: int = 5):
    return db.query(
        Job.id,
        Job.title,
        Job.company_name,
        Job.status,
        Job.created_at,
        func.count(Application.id).label('applicationCount')
    ).outerjoin(Application, Job.id == Application.job_id)\
    .group_by(Job.id, Job.title, Job.company_name, Job.status, Job.created_at)\
    .order_by(Job.created_at.desc())\
    .limit(limit)\
    .all()

def get_recent_activity(db: Session, limit: int = 5):
    recent_applications_query = text(f"""
        SELECT
            a.id,
            'application' as type,
            CONCAT(a.full_name, ' applied to ', j.title) as message,
            a.full_name as user_name,
            a.created_at as timestamp
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        ORDER BY a.created_at DESC
        LIMIT {limit}
    """)
    recent_applications = db.execute(recent_applications_query).mappings().all()

    recent_users_query = text(f"""
        SELECT
            id,
            'user_registered' as type,
            CONCAT(name, ' joined the platform') as message,
            name as user_name,
            created_at as timestamp
        FROM users
        WHERE role = 'job_seeker'
        ORDER BY created_at DESC
        LIMIT {limit}
    """)
    recent_users = db.execute(recent_users_query).mappings().all()

    recent_job_posts_query = text(f"""
        SELECT
            j.id,
            'job_posted' as type,
            CONCAT('New job posted: ', j.title, ' at ', j.company_name) as message,
            u.name as user_name,
            j.created_at as timestamp
        FROM jobs j
        LEFT JOIN users u ON j.posted_by = u.id
        ORDER BY j.created_at DESC
        LIMIT {limit}
    """)
    recent_job_posts = db.execute(recent_job_posts_query).mappings().all()

    all_activities = []
    for activity in recent_applications + recent_users + recent_job_posts:
        user_initials = ''.join([n[0] for n in (activity['user_name'] or 'U').split()]).upper()
        all_activities.append({**activity, 'user_initials': user_initials})

    sorted_activities = sorted(all_activities, key=lambda x: x['timestamp'], reverse=True)
    return sorted_activities[:limit]
