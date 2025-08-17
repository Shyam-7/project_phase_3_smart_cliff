from pydantic import BaseModel, Json
from typing import Optional, Any
from app.db.schemas.common.base_schema import BaseSchema

class SiteContentBase(BaseModel):
    section: str
    section_type: str
    title: str
    content: Optional[str] = None
    image_url: Optional[str] = None
    image_alt: Optional[str] = None
    additional_data: Optional[Any] = None
    sort_order: Optional[int] = 0
    is_active: Optional[bool] = True

class SiteContentCreate(SiteContentBase):
    pass

class SiteContentUpdate(BaseModel):
    section: Optional[str] = None
    section_type: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    image_alt: Optional[str] = None
    additional_data: Optional[Any] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None

class SiteContent(SiteContentBase, BaseSchema):
    id: int # Override id to be int

    class Config:
        orm_mode = True
