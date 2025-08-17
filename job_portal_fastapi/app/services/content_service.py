from sqlalchemy.orm import Session
from app.db.models.content.content_model import SiteContent
from app.db.schemas.content.content_schema import SiteContentCreate, SiteContentUpdate
from fastapi import HTTPException

def get_all_content(db: Session):
    return db.query(SiteContent).order_by(SiteContent.section_type, SiteContent.sort_order, SiteContent.section).all()

def get_content_by_section(db: Session, section: str):
    return db.query(SiteContent).filter(SiteContent.section == section, SiteContent.is_active == True).order_by(SiteContent.sort_order).first()

def get_content_by_section_type(db: Session, section_type: str):
    return db.query(SiteContent).filter(SiteContent.section_type == section_type, SiteContent.is_active == True).order_by(SiteContent.sort_order, SiteContent.section).all()

def create_content(db: Session, content: SiteContentCreate):
    db_content = db.query(SiteContent).filter(SiteContent.section == content.section).first()
    if db_content:
        raise HTTPException(status_code=400, detail="Content section already exists")
    db_content = SiteContent(**content.dict())
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    return db_content

def update_content(db: Session, content_id: int, content_update: SiteContentUpdate):
    db_content = db.query(SiteContent).filter(SiteContent.id == content_id).first()
    if not db_content:
        raise HTTPException(status_code=404, detail="Content not found")

    update_data = content_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_content, key, value)

    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    return db_content

def delete_content(db: Session, content_id: int):
    db_content = db.query(SiteContent).filter(SiteContent.id == content_id).first()
    if not db_content:
        raise HTTPException(status_code=404, detail="Content not found")
    db.delete(db_content)
    db.commit()
    return {"message": "Content deleted successfully"}

def get_user_dashboard_content(db: Session):
    sections = ['hero', 'welcome', 'how_it_works']
    content_items = db.query(SiteContent).filter(SiteContent.section.in_(sections), SiteContent.is_active == True).order_by(SiteContent.sort_order).all()

    dashboard_content = {
      'hero': {'title': '', 'subtitle': '', 'searchSuggestions': '', 'ctaButtonText': 'Find Job'},
      'welcome': {'title': '', 'content': '', 'ctaButtonText': 'Get Started', 'secondaryLinks': []},
      'howItWorks': {'title': '', 'steps': []},
      'heroImage': {'url': '/assets/person_searching_job.png', 'alt': 'Person searching job'}
    }

    for item in content_items:
        additional_data = item.additional_data or {}
        if item.section == 'hero':
            dashboard_content['hero']['title'] = item.title
            dashboard_content['hero']['subtitle'] = item.content
            dashboard_content['hero']['searchSuggestions'] = additional_data.get('searchSuggestions', '')
            dashboard_content['hero']['ctaButtonText'] = additional_data.get('ctaButtonText', 'Find Job')
            if 'imageUrl' in additional_data:
                dashboard_content['heroImage']['url'] = additional_data['imageUrl']
            if 'imageAlt' in additional_data:
                dashboard_content['heroImage']['alt'] = additional_data['imageAlt']
        elif item.section == 'welcome':
            dashboard_content['welcome']['title'] = item.title
            dashboard_content['welcome']['content'] = item.content
            dashboard_content['welcome']['ctaButtonText'] = additional_data.get('ctaButtonText', 'Get Started')
            dashboard_content['welcome']['secondaryLinks'] = additional_data.get('secondaryLinks', [])
        elif item.section == 'how_it_works':
            dashboard_content['howItWorks']['title'] = item.title
            dashboard_content['howItWorks']['steps'] = additional_data.get('steps', [])

    return dashboard_content
