from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime
from .models import TypeUser, StatusTask

# --- Base Schemas ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    type: TypeUser

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    time_estimate: Optional[datetime] = None
    order: Optional[int] = 0

# --- User Schemas ---
class UserCreate(UserBase):
    password: str  

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class LoginData(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Guidance Schemas ---
class GuidanceCreate(BaseModel):
    theme: str 
    advisor_id: int
    student_id: int

class GuidanceResponse(BaseModel):
    id: int
    theme: str
    model_config = ConfigDict(from_attributes=True)

# --- Task Schemas ---
class TaskCreate(TaskBase):
    guidance_id: int

class TaskResponse(TaskBase):
    id: int
    status: StatusTask
    model_config = ConfigDict(from_attributes=True)

class TaskUpdateStatus(BaseModel):
    status: StatusTask

# --- Chat Schemas ---
class ChatRequest(BaseModel):
    message: str
    student_id: Optional[int] = None

class ChatResponse(BaseModel):
    response: str

class UserSimple(BaseModel):
    id: int
    name: str
    email: str
    model_config = ConfigDict(from_attributes=True)

class GuidanceList(BaseModel):
    id: int
    theme: str
    created_at: datetime
    student: UserSimple  

    model_config = ConfigDict(from_attributes=True)

class GuidanceLink(BaseModel):
    student_email: EmailStr
    theme: str

class CommentCreate(BaseModel):
    content: str
    task_id: int

class CommentResponse(BaseModel):
    id: int
    content: str
    created_at: datetime
    user_name: str 
    user_id: int  
    
    model_config = ConfigDict(from_attributes=True)