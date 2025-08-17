from sqlalchemy import Column, String, Text, Integer, Boolean, JSON
from app.db.base import BaseModel

class SiteContent(BaseModel):
    __tablename__ = 'site_content'
    # Override id from BaseModel to be an Integer
    id = Column(Integer, primary_key=True, index=True)
    section = Column(String(255), unique=True, nullable=False)
    section_type = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text)
    image_url = Column(String(255))
    image_alt = Column(String(255))
    additional_data = Column(JSON)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
