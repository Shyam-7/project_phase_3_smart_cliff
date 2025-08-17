from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.db.schemas.communication.announcement_schema import Announcement, AnnouncementCreate, AnnouncementUpdate
from app.db.schemas.communication.notification_schema import Notification
from app.db.schemas.communication.notification_preference_schema import NotificationPreference, NotificationPreferenceUpdate
from app.services.communication_service import (
    get_announcements,
    create_announcement,
    update_announcement,
    cancel_scheduled_announcement,
    get_user_notifications,
    mark_notification_as_read,
    mark_all_notifications_as_read,
    get_notification_preferences,
    update_notification_preferences
)
from app.core.auth import get_current_user
from app.core.permissions import get_admin_user
from app.db.models.user.user_model import User
from app.api.deps import get_db

router = APIRouter(prefix="/api/communication", tags=["Communication"])

# Announcements (Admin)
@router.get("/announcements", response_model=List[Announcement])
def read_announcements(status: str = None, db: Session = Depends(get_db), admin_user: User = Depends(get_admin_user)):
    return get_announcements(db, status=status)

@router.post("/announcements", response_model=Announcement, status_code=status.HTTP_201_CREATED)
def create_new_announcement(announcement: AnnouncementCreate, db: Session = Depends(get_db), admin_user: User = Depends(get_admin_user)):
    return create_announcement(db, announcement=announcement, user_id=admin_user.id)

@router.put("/announcements/{announcement_id}", response_model=Announcement)
def update_existing_announcement(announcement_id: str, announcement_update: AnnouncementUpdate, db: Session = Depends(get_db), admin_user: User = Depends(get_admin_user)):
    return update_announcement(db, announcement_id=announcement_id, announcement_update=announcement_update)

@router.delete("/announcements/{announcement_id}/cancel", response_model=Announcement)
def cancel_announcement(announcement_id: str, db: Session = Depends(get_db), admin_user: User = Depends(get_admin_user)):
    return cancel_scheduled_announcement(db, announcement_id=announcement_id)

# Notifications (User)
@router.get("/notifications", response_model=List[Notification])
def read_user_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_user_notifications(db, user_id=current_user.id)

@router.put("/notifications/{notification_id}/read", response_model=Notification)
def mark_one_notification_as_read(notification_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return mark_notification_as_read(db, notification_id=notification_id, user_id=current_user.id)

@router.put("/notifications/read-all")
def mark_all_user_notifications_as_read(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return mark_all_notifications_as_read(db, user_id=current_user.id)

# Notification Preferences (User)
@router.get("/preferences", response_model=NotificationPreference)
def read_notification_preferences(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_notification_preferences(db, user_id=current_user.id)

@router.put("/preferences", response_model=NotificationPreference)
def update_user_notification_preferences(preferences_update: NotificationPreferenceUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return update_notification_preferences(db, user_id=current_user.id, preferences_update=preferences_update)
