from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.db.schemas.common.base_schema import BaseSchema

class NotificationBase(BaseModel):
    title: str
    message: str
    type: Optional[str] = 'general'
    is_read: Optional[bool] = False
    action_url: Optional[str] = None
    read_at: Optional[datetime] = None

class Notification(NotificationBase, BaseSchema):
    user_id: str

    class Config:
        orm_mode = True
