from pydantic import BaseModel
from typing import Optional
from app.db.schemas.common.base_schema import BaseSchema

class NotificationPreferenceBase(BaseModel):
    email_notifications: Optional[bool] = True
    push_notifications: Optional[bool] = True
    job_alerts: Optional[bool] = True
    application_updates: Optional[bool] = True
    announcement_notifications: Optional[bool] = True

class NotificationPreferenceUpdate(NotificationPreferenceBase):
    pass

class NotificationPreference(NotificationPreferenceBase, BaseSchema):
    user_id: str

    class Config:
        orm_mode = True
