from pydantic import BaseModel, Field
from typing import Optional
from app.db.schemas.common.base_schema import BaseSchema

class ApplicationBase(BaseModel):
    job_id: str = Field(..., example="a-valid-job-uuid")
    resume_url: Optional[str] = Field(None, example="https://example.com/resume.pdf")
    cover_letter: Optional[str] = Field(None, example="I am writing to apply for the Software Engineer position...")
    full_name: Optional[str] = Field(None, example="John Doe")
    email: Optional[str] = Field(None, example="johndoe@example.com")
    phone: Optional[str] = Field(None, example="+1-555-555-5555")
    quick_apply: Optional[bool] = Field(False, example=True)
    status: Optional[str] = Field('applied', example="applied")
    admin_notes: Optional[str] = Field(None, example="This candidate looks promising.")

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    status: Optional[str] = Field(None, example="reviewed")
    admin_notes: Optional[str] = Field(None, example="Candidate has been shortlisted for an interview.")

class Application(ApplicationBase, BaseSchema):
    user_id: str = Field(..., example="a-valid-user-uuid")

    class Config:
        orm_mode = True
