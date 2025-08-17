from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.db.schemas.common.base_schema import BaseSchema

class AnnouncementBase(BaseModel):
    title: str
    content: str
    target_audience: Optional[str] = 'all'
    status: Optional[str] = 'active'
    scheduled_at: Optional[datetime] = None

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    target_audience: Optional[str] = None
    status: Optional[str] = None
    scheduled_at: Optional[datetime] = None

class Announcement(AnnouncementBase, BaseSchema):
    created_by: str

    class Config:
        orm_mode = True
