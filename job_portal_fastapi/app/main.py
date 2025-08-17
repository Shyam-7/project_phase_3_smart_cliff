from fastapi import FastAPI
from .api.common import auth_routes
from .api.user.routes import user_routes, job_routes
from .api.admin.routes import admin_routes, dashboard_routes, job_management_routes, user_management_routes, content_routes
from .api.shared import communication_routes, application_routes

app = FastAPI(
    title="Job Portal API",
    description="The API for the Job Portal application.",
    version="1.0.0",
)

# API Routers
app.include_router(auth_routes.router, tags=["Authentication"])
app.include_router(user_routes.router, prefix="/users", tags=["Users"])
app.include_router(job_routes.router, prefix="/jobs", tags=["Jobs"])
app.include_router(admin_routes.router, prefix="/admin", tags=["Admin"])
app.include_router(dashboard_routes.router, prefix="/admin/dashboard", tags=["Dashboard"])
app.include_router(job_management_routes.router, prefix="/admin/jobs", tags=["Job Management"])
app.include_router(user_management_routes.router, prefix="/admin/users", tags=["User Management"])
app.include_router(content_routes.router, prefix="/admin/content", tags=["Content Management"])
app.include_router(communication_routes.router, prefix="/communication", tags=["Communication"])
app.include_router(application_routes.router, prefix="/applications", tags=["Applications"])


@app.get("/")
def read_root():
    return {"message": "Welcome to the Job Portal API"}
