from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base

class TypeUser(str, enum.Enum):
    ADVISOR = 'advisor'
    STUDENT = 'student'

class StatusTask(str, enum.Enum):
    PENDING = 'pending'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'
    LATE = 'late'

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    type = Column(Enum(TypeUser), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    avatar_path = Column(String, nullable=True)
    
    guidelines_advisor = relationship("Guidance", 
                                    foreign_keys= "Guidance.advisor_id",
                                    back_populates="advisor")
    guidelines_student = relationship("Guidance",
                                    foreign_keys="Guidance.student_id",
                                    back_populates = "student")

class Guidance(Base):
    __tablename__ = 'guidances'
    
    id = Column(Integer, primary_key = True, index=True)
    theme = Column(String)
    defense_date = Column(DateTime, nullable=True)
    advisor_id = Column(Integer, ForeignKey('users.id'))
    student_id = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    advisor = relationship("User",
                           foreign_keys=[advisor_id],
                           back_populates="guidelines_advisor")
    student = relationship("User",
                              foreign_keys=[student_id],
                              back_populates="guidelines_student")
    tasks = relationship("Task",back_populates="guidance")
    meetings = relationship("Meeting", back_populates="guidance")
    kanban_columns = relationship("KanbanColumn", back_populates="guidance", order_by="KanbanColumn.order.asc()", cascade="all, delete-orphan")

class KanbanColumn(Base):
    __tablename__ = 'kanban_columns'

    id = Column(Integer, primary_key=True, index=True)
    guidance_id = Column(Integer, ForeignKey("guidances.id"), nullable=False)
    title = Column(String, nullable=False)
    slug = Column(String, nullable=False)
    order = Column(Integer, default=0)
    color = Column(String, default="bg-gray-100")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    guidance = relationship("Guidance", back_populates="kanban_columns")

class Task(Base):
    __tablename__ = 'tasks'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    time_estimate = Column(DateTime,nullable=True)
    status = Column(String, default="pending")
    order = Column(Integer, default = 0)
    guidance_id = Column(Integer, ForeignKey("guidances.id"))
    
    guidance = relationship("Guidance",back_populates="tasks")
    comments = relationship("Comment", back_populates="task", order_by="Comment.created_at", cascade="all, delete-orphan")
    attachments = relationship("Attachment", back_populates="task", cascade="all, delete-orphan")
    
class Comment(Base): 
    __tablename__ = 'comments'

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    task_id = Column(Integer, ForeignKey("tasks.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    task = relationship("Task", back_populates="comments")
    user = relationship("User") 

class Attachment(Base):
    __tablename__ = 'attachments'

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False) 
    file_path = Column(String, nullable=False) 
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    task_id = Column(Integer, ForeignKey("tasks.id"))
    
    task = relationship("Task", back_populates="attachments")

class Notification(Base):
    __tablename__ = 'notifications'

    id = Column(Integer, primary_key=True, index=True)
    message = Column(String, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user_id = Column(Integer, ForeignKey("users.id"))
    link = Column(String, nullable=True)

class Meeting(Base):
    __tablename__ = 'meetings'

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, nullable=False)
    topic = Column(String, nullable=False)
    status = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    guidance_id = Column(Integer, ForeignKey("guidances.id"))
    
    guidance = relationship("Guidance", back_populates="meetings")