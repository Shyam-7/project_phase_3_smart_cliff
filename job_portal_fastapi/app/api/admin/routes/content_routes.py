from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Any
from app.db.schemas.content.content_schema import SiteContent, SiteContentCreate, SiteContentUpdate
from app.services.content_service import (
    get_user_dashboard_content,
    get_content_by_section,
    get_content_by_section_type,
    get_all_content,
    create_content,
    update_content,
    delete_content
)
from app.core.permissions import get_admin_user
from app.db.models.user.user_model import User
from app.api.deps import get_db

router = APIRouter(prefix="/api/content", tags=["Content"])

# Public routes
@router.get("/public/user-dashboard", response_model=Any)
def read_user_dashboard_content(db: Session = Depends(get_db)):
    return get_user_dashboard_content(db)

@router.get("/public/section/{section}", response_model=SiteContent)
def read_content_by_section(section: str, db: Session = Depends(get_db)):
    return get_content_by_section(db, section=section)

@router.get("/public/section-type/{section_type}", response_model=List[SiteContent])
def read_content_by_section_type(section_type: str, db: Session = Depends(get_db)):
    return get_content_by_section_type(db, section_type=section_type)

# Admin routes
@router.get("/admin", response_model=List[SiteContent])
def read_all_content(db: Session = Depends(get_db), admin_user: User = Depends(get_admin_user)):
    return get_all_content(db)

@router.post("/admin", response_model=SiteContent)
def create_new_content(content: SiteContentCreate, db: Session = Depends(get_db), admin_user: User = Depends(get_admin_user)):
    return create_content(db, content=content)

@router.put("/admin/{content_id}", response_model=SiteContent)
def update_existing_content(content_id: int, content_update: SiteContentUpdate, db: Session = Depends(get_db), admin_user: User = Depends(get_admin_user)):
    return update_content(db, content_id=content_id, content_update=content_update)

@router.delete("/admin/{content_id}")
def remove_content(content_id: int, db: Session = Depends(get_db), admin_user: User = Depends(get_admin_user)):
    return delete_content(db, content_id=content_id)
