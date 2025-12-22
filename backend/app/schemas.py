from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime
from .models import TypeUser, StatusTask

class UserBase(BaseModel):
    name: str
    email: EmailStr
    type: TypeUser

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    time_estimate: Optional[datetime] = None
    order: Optional[int] = 0

class UserCreate(UserBase):
    pass

class TaskCreate(TaskBase):
    guidance_id: int

class TaskResponse(TaskBase):
    id: int
    status: StatusTask
    
    model_config = ConfigDict(from_attributes=True) 

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class GuidanceCreate(BaseModel):
    theme: str 
    advisor_id: int
    student_id: int

class GuidanceResponse(BaseModel):
    id: int
    theme: str
    model_config = ConfigDict(from_attributes=True)
        
class TaskUpdateStatus(BaseModel):
    status: StatusTask
    

class ChatRequest(BaseModel):
    message: str
    student_id: Optional[int] = None

class ChatResponse(BaseModel):
    response: str