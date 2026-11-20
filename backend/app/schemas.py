from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime
from .models import TypeUser, StatusTask

class UserBase(BaseModel):
    name: str
    email: EmailStr
    type: TypeUser
    phone: Optional[str] = None

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    time_estimate: Optional[datetime] = None
    order: Optional[int] = 0

class UserCreate(UserBase):
    password: str  

class UserResponse(UserBase):
    id: int
    name: str
    email: str
    type: str
    phone: Optional[str] = None
    avatar_path: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: Optional[str] = None

class LoginData(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserSimple(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    type: Optional[str] = None
    avatar_path: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class GuidanceCreate(BaseModel):
    theme: str 
    advisor_id: int
    student_id: int
    coadvisor_id: Optional[int] = None

class GuidanceUpdate(BaseModel):
    theme: Optional[str] = None
    defense_date: Optional[datetime] = None
    coadvisor_id: Optional[int] = None

class DefenseDateUpdate(BaseModel):
    defense_date: datetime

class CoadvisorUpdate(BaseModel):
    coadvisor_email: EmailStr

class GuidanceLink(BaseModel):
    student_email: EmailStr
    theme: str
    defense_date: Optional[datetime] = None
    coadvisor_email: Optional[EmailStr] = None

class AvailableStudent(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    avatar_path: Optional[str] = None
    is_already_linked: bool = False
    active_theme: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class GuidanceResponse(BaseModel):
    id: int
    theme: str
    defense_date: Optional[datetime] = None
    advisor_id: Optional[int] = None
    coadvisor_id: Optional[int] = None
    student_id: Optional[int] = None
    student: Optional[UserSimple] = None
    coadvisor: Optional[UserSimple] = None
    model_config = ConfigDict(from_attributes=True)

class GuidanceList(BaseModel):
    id: int
    theme: str
    defense_date: Optional[datetime] = None 
    created_at: datetime
    advisor_id: Optional[int] = None
    coadvisor_id: Optional[int] = None
    student_id: Optional[int] = None
    student: UserSimple  
    advisor: Optional[UserSimple] = None
    coadvisor: Optional[UserSimple] = None
    user_role: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class TaskCreate(TaskBase):
    guidance_id: int
    status: Optional[str] = "pending"
    creator_id: Optional[int] = None

class TaskResponse(TaskBase):
    id: int
    guidance_id: int
    status: str
    creator_id: Optional[int] = None
    creator: Optional[UserSimple] = None
    creator_role: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    time_estimate: Optional[datetime] = None
    status: Optional[str] = None
    order: Optional[int] = None

class TaskUpdateStatus(BaseModel):
    status: str

class KanbanColumnBase(BaseModel):
    title: str
    color: Optional[str] = "bg-gray-100"
    order: Optional[int] = 0

class KanbanColumnCreate(BaseModel):
    title: str
    color: Optional[str] = "bg-gray-100"
    order: Optional[int] = None

class KanbanColumnUpdate(BaseModel):
    title: Optional[str] = None
    color: Optional[str] = None
    order: Optional[int] = None

class KanbanColumnReorder(BaseModel):
    column_ids: List[int]

class KanbanColumnResponse(BaseModel):
    id: int
    guidance_id: int
    title: str
    slug: str
    color: str
    order: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class CommentCreate(BaseModel):
    content: str
    task_id: int

class CommentResponse(BaseModel):
    id: int
    content: str
    created_at: datetime
    user_name: str
    user_id: int
    user_role: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class AttachmentCreate(BaseModel):
    filename: str
    task_id: int

class AttachmentResponse(BaseModel):
    id: int
    filename: str
    file_path: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class NotificationResponse(BaseModel):
    id: int
    message: str
    read: bool
    created_at: datetime
    link: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class MeetingCreate(BaseModel):
    date: datetime
    topic: str
    guidance_id: int

class MeetingUpdateStatus(BaseModel):
    status: str 

class MeetingUpdate(BaseModel):
    date: Optional[datetime] = None
    topic: Optional[str] = None
    status: Optional[str] = None

class MeetingResponse(BaseModel):
    id: int
    date: datetime
    topic: str
    status: str
    created_at: datetime
    guidance_id: Optional[int] = None
    creator_id: Optional[int] = None
    creator: Optional[UserSimple] = None
    creator_role: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

