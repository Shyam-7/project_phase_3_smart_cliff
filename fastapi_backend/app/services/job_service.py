from ..models.job import JobResponse, JobCreate, JobUpdate
from typing import Dict, Any, List, Optional
from mysql.connector.connection import MySQLConnection
import mysql.connector

def transform_job_data(db_job: Dict[str, Any]) -> JobResponse:
    salary_min = round(db_job.get("salary_min") / 100000) if db_job.get("salary_min") else None
    salary_max = round(db_job.get("salary_max") / 100000) if db_job.get("salary_max") else None

    if salary_min and salary_max:
        if salary_min == salary_max:
            salary_display = f"{salary_min} LPA"
        else:
            salary_display = f"{salary_min}-{salary_max} LPA"
    else:
        salary_display = "Not disclosed"

    tags = []
    if db_job.get("category"):
        tags.append(db_job["category"])
    if db_job.get("employment_type"):
        tags.append(db_job["employment_type"])
    if db_job.get("skills_required"):
        tags.extend([s.strip() for s in db_job.get("skills_required", "").split(",")[:3]])

    company_name = db_job.get("company_name", "")

    return JobResponse(
        id=db_job["id"],
        title=db_job["title"],
        company=company_name,
        company_name=company_name,
        rating=db_job.get("company_rating"),
        company_rating=db_job.get("company_rating"),
        reviews=db_job.get("company_reviews_count", 0),
        company_reviews_count=db_job.get("company_reviews_count", 0),
        location=db_job["location"],
        experience=db_job.get("experience_level"),
        experience_level=db_job.get("experience_level"),
        salary=salary_max or 0,
        salaryRange=salary_display,
        postedDate=db_job["created_at"],
        created_at=db_job["created_at"],
        summary=db_job.get("description", "")[:150] + "..." if db_job.get("description") else "",
        description=db_job.get("description", ""),
        companyType=db_job.get("company_type"),
        company_type=db_job.get("company_type"),
        tags=tags,
        posted=db_job["created_at"],
        logo=None,
        logoText=company_name[0].upper() if company_name else "C",
        color=f"hsl({ord(company_name[0]) * 137.508 % 360}, 70%, 50%)" if company_name else "#6366f1",
        employment_type=db_job["employment_type"],
        category=db_job["category"],
        requirements=db_job.get("requirements"),
        skills_required=db_job.get("skills_required"),
        benefits=db_job.get("benefits"),
        views=db_job.get("views", 0),
        expires_at=db_job.get("expires_at"),
        salary_min=db_job.get("salary_min"),
        salary_max=db_job.get("salary_max"),
        remote_allowed=db_job.get("remote_allowed", False),
        company_size=db_job.get("company_size"),
        status=db_job["status"],
        applications=db_job.get("applications")
    )

def get_all_jobs(
    db: MySQLConnection,
    category: Optional[str] = None,
    location: Optional[str] = None,
    experience: Optional[str] = None,
    employment_type: Optional[str] = None,
    company_type: Optional[str] = None,
    salary_min: Optional[int] = None,
    salary_max: Optional[int] = None,
    remote_allowed: Optional[bool] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "DESC",
) -> List[JobResponse]:
    query = 'SELECT * FROM jobs WHERE status = "active"'
    params = []

    if category:
        query += " AND category = %s"
        params.append(category)
    if location and location != "All":
        if location == "Remote":
            query += " AND (remote_allowed = TRUE OR location = 'Remote')"
        elif location == "Hybrid":
            query += " AND location = 'Hybrid'"
        elif location == "On-site":
            query += " AND (location = 'On-site' OR (location NOT IN ('Remote', 'Hybrid') AND remote_allowed = FALSE))"
        else:
            query += " AND location LIKE %s"
            params.append(f"%{location}%")
    if experience:
        query += " AND experience_level = %s"
        params.append(experience)
    if employment_type:
        query += " AND employment_type = %s"
        params.append(employment_type)
    if company_type:
        query += " AND company_type = %s"
        params.append(company_type)
    if salary_min:
        query += " AND salary_max >= %s"
        params.append(salary_min * 100000)
    if salary_max:
        query += " AND salary_min <= %s"
        params.append(salary_max * 100000)
    if remote_allowed is not None and remote_allowed:
        query += " AND remote_allowed = TRUE"
    if search:
        query += " AND (title LIKE %s OR company_name LIKE %s OR description LIKE %s OR skills_required LIKE %s)"
        search_term = f"%{search}%"
        params.extend([search_term, search_term, search_term, search_term])

    valid_sort_fields = ['created_at', 'salary_max', 'views', 'title', 'company_name']
    sort_field = sort_by if sort_by in valid_sort_fields else 'created_at'
    sort_direction = 'ASC' if sort_order.upper() == 'ASC' else 'DESC'
    query += f" ORDER BY {sort_field} {sort_direction}"

    cursor = db.cursor(dictionary=True)
    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    cursor.close()
    return [transform_job_data(row) for row in rows]

def get_all_jobs_for_admin(
    db: MySQLConnection,
    sort_by: str = "created_at",
    sort_order: str = "DESC",
    search: Optional[str] = None,
) -> List[JobResponse]:
    query = """
        SELECT j.*, (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applications
        FROM jobs j
    """
    params = []

    if search:
        query += " WHERE (j.title LIKE %s OR j.company_name LIKE %s OR j.description LIKE %s)"
        search_param = f"%{search}%"
        params.extend([search_param, search_param, search_param])

    valid_sort_columns = ['created_at', 'title', 'status', 'company_name']
    sort_field = sort_by if sort_by in valid_sort_columns else 'created_at'
    sort_direction = 'ASC' if sort_order.upper() == 'ASC' else 'DESC'
    query += f" ORDER BY {sort_field} {sort_direction}"

    cursor = db.cursor(dictionary=True)
    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    cursor.close()
    return [transform_job_data(row) for row in rows]

def get_job_by_id(db: MySQLConnection, job_id: int) -> Optional[JobResponse]:
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM jobs WHERE id = %s", (job_id,))
    row = cursor.fetchone()
    cursor.close()
    if row:
        return transform_job_data(row)
    return None

def create_job(db: MySQLConnection, job: JobCreate, user_id: int) -> JobResponse:
    cursor = db.cursor(dictionary=True)
    query = """
        INSERT INTO jobs (
            title, company_name, location, employment_type, experience_level,
            category, description, requirements, posted_by, salary_min, salary_max,
            remote_allowed, skills_required, benefits, company_size, company_type,
            expires_at, status
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    params = (
        job.title, job.company_name, job.location, job.employment_type, job.experience_level,
        job.category, job.description, job.requirements, user_id, job.salary_min, job.salary_max,
        job.remote_allowed, job.skills_required, job.benefits, job.company_size, job.company_type,
        job.expires_at, job.status
    )
    cursor.execute(query, params)
    db.commit()

    # Fetch the newly created job
    cursor.execute("SELECT * FROM jobs WHERE id = %s", (cursor.lastrowid,))
    new_job = cursor.fetchone()
    cursor.close()
    return transform_job_data(new_job)

def update_job(db: MySQLConnection, job_id: int, job: JobUpdate) -> Optional[JobResponse]:
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM jobs WHERE id = %s", (job_id,))
    existing_job = cursor.fetchone()
    if not existing_job:
        cursor.close()
        return None

    update_data = job.dict(exclude_unset=True)

    query = "UPDATE jobs SET "
    params = []
    for key, value in update_data.items():
        query += f"{key} = %s, "
        params.append(value)
    query += "updated_at = NOW() WHERE id = %s"
    params.append(job_id)

    cursor.execute(query, tuple(params))
    db.commit()

    cursor.execute("SELECT * FROM jobs WHERE id = %s", (job_id,))
    updated_job = cursor.fetchone()
    cursor.close()
    return transform_job_data(updated_job)

def delete_job(db: MySQLConnection, job_id: int) -> Dict[str, Any]:
    cursor = db.cursor(dictionary=True)

    # Check for applications
    cursor.execute("SELECT COUNT(*) as count FROM applications WHERE job_id = %s", (job_id,))
    application_count = cursor.fetchone()['count']

    if application_count > 0:
        cursor.execute("UPDATE jobs SET status = 'inactive', updated_at = NOW() WHERE id = %s", (job_id,))
        message = f"Job marked as inactive. It had {application_count} applications."
        deleted = False
    else:
        cursor.execute("DELETE FROM jobs WHERE id = %s", (job_id,))
        message = "Job deleted successfully!"
        deleted = True

    db.commit()
    cursor.close()
    return {"message": message, "deleted": deleted, "application_count": application_count}
