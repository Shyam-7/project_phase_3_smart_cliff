from fastapi import FastAPI
from app.api.common import auth_routes
from app.api.user.routes import user_routes
from app.api.job.routes import job_routes
from app.api.shared import application_routes
from app.api.admin.routes import content_routes
from app.api.shared import communication_routes
from app.api.admin.routes import admin_dashboard_routes
from app.api.admin.routes import analytics_routes

app = FastAPI(
    title="Job Portal API",
    description="This is the API for the Job Portal application, migrated from Node.js to FastAPI.",
    version="1.0.0",
)

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(job_routes.router)
app.include_router(application_routes.router)
app.include_router(content_routes.router)
app.include_router(communication_routes.router)
app.include_router(admin_dashboard_routes.router)
app.include_router(analytics_routes.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Job Portal API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
