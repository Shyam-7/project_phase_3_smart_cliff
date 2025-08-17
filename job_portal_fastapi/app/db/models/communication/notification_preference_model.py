from sqlalchemy import Column, String, Boolean, ForeignKey
from app.db.base import BaseModel

class NotificationPreference(BaseModel):
    __tablename__ = 'notification_preferences'
    user_id = Column(String(36), ForeignKey('users.id'), unique=True, nullable=False)
    email_notifications = Column(Boolean, default=True, nullable=False)
    push_notifications = Column(Boolean, default=True, nullable=False)
    job_alerts = Column(Boolean, default=True, nullable=False)
    application_updates = Column(Boolean, default=True, nullable=False)
    announcement_notifications = Column(Boolean, default=True, nullable=False)
