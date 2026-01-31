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

class Task(Base):
    __tablename__ = 'tasks'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    time_estimate = Column(DateTime,nullable=True)
    status = Column(Enum(StatusTask),default=StatusTask.PENDING)
    order = Column(Integer, default = 0)
    guidance_id = Column(Integer, ForeignKey("guidances.id"))
    
    guidance = relationship("Guidance",back_populates="tasks")
    comments = relationship("Comment", back_populates="task", order_by="Comment.created_at")
    attachments = relationship("Attachment", back_populates="task")
    
class Comment(Base): 
    __tablename__ = 'comments'

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Chaves Estrangeiras
    task_id = Column(Integer, ForeignKey("tasks.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    # Relacionamentos
    task = relationship("Task", back_populates="comments")
    user = relationship("User") # Para sabermos o nome de quem comentou

class Attachment(Base):
    __tablename__ = 'attachments'

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False) # Nome original do arquivo (ex: TCC_Versao1.pdf)
    file_path = Column(String, nullable=False) # Caminho no servidor (ex: static/uploads/uuid.pdf)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    task_id = Column(Integer, ForeignKey("tasks.id"))
    
    # Relacionamento com Tarefa
    task = relationship("Task", back_populates="attachments")

class Notification(Base):
    __tablename__ = 'notifications'

    id = Column(Integer, primary_key=True, index=True)
    message = Column(String, nullable=False)
    read = Column(Boolean, default=False) # Se já foi lida
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Quem vai receber a notificação
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Opcional: Link para saber onde clicar (ex: guidance/1)
    link = Column(String, nullable=True)