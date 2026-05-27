from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    location_type: str = "both"  # "moscow" | "podmoskovye" | "both" | "blog" | "uslugi"
    count: int = Field(default=1, ge=1, le=5, description="For moscow: districts per run (max 5)")
    background: bool = Field(default=False, description="Run in background (for cron-job.org)")


class RegenerateRequest(BaseModel):
    slug: str


class District(BaseModel):
    district_id: int
    name: str
    slug: str
    okrug: str
    okrug_name: str
    priority_order: int
    month_planned: int
    status: str = "pending"
    style_page: Optional[int] = None
    style_blog: Optional[int] = None
    generated_at: Optional[datetime] = None
    page_url: Optional[str] = None
    blog_url: Optional[str] = None


class City(BaseModel):
    city_id: int
    name: str
    slug: str
    region: Optional[str] = None
    priority_order: int
    month_planned: int
    status: str = "pending"
    style_page: Optional[int] = None
    style_blog: Optional[int] = None
    generated_at: Optional[datetime] = None
    page_url: Optional[str] = None
    blog_url: Optional[str] = None


class GeneratedPage(BaseModel):
    slug: str
    type: str  # "district" | "city" | "blog"
    name: str
    title: str
    url: str
    page_content: str
    meta_title: str
    meta_description: str
    generated_at: datetime
    style_page: Optional[int] = None
    style_blog: Optional[int] = None
    indexed: bool = False
    indexed_at: Optional[datetime] = None


class GenerateResult(BaseModel):
    status: str
    generated: list[dict] = []


class StatusResponse(BaseModel):
    moscow: dict
    podmoskovye: dict
    total_pages: int
