from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class NotificationRequest(BaseModel):
    task_id: int
    task_title: str
    student_name: str
    student_phone: str
    due_date: str
    guidance_theme: Optional[str] = "Orientação Acadêmica"
    urgency_level: Optional[str] = Field(default="warning", pattern="^(warning|urgent|overdue)$")

class CustomNotificationRequest(BaseModel):
    student_name: str
    student_phone: str
    advisor_name: str
    message: str
    guidance_theme: Optional[str] = None
    title: Optional[str] = None
    idempotency_key: Optional[str] = None

class NotificationResponse(BaseModel):
    success: bool
    message_id: str
    recipient: str
    status: str
    detail: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class HealthResponse(BaseModel):
    status: str
    service: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    provider: str

class MetricsResponse(BaseModel):
    total_processed: int
    total_sent: int
    total_skipped_duplicates: int
    total_failed: int
