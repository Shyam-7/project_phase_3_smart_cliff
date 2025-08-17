from fastapi import FastAPI
from .routers import jobs, auth
from .database import db_pool # To ensure the pool is created at startup

app = FastAPI()

app.include_router(auth.router, tags=["auth"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])

@app.on_event("startup")
async def startup_event():
    # This is to ensure the database pool is initialized on startup
    # The import in the global scope already does this, but this is more explicit
    if db_pool:
        print("Database pool is ready.")
    else:
        print("Database pool could not be initialized.")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Job Portal API"}
