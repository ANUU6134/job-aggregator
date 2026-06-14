from sqlalchemy import Column, String, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from .base import Base

class JobApplication(Base):
    __tablename__ = "job_applications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"))
    status = Column(String(50), default="applied")
    applied_at = Column(DateTime, server_default=func.now())
    notes = Column(Text)
    cover_letter = Column(Text)
    resume_url = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    user = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")
    interviews = relationship("ApplicationInterview", back_populates="application", cascade="all, delete-orphan")

class ApplicationInterview(Base):
    __tablename__ = "application_interviews"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("job_applications.id", ondelete="CASCADE"))
    scheduled_date = Column(DateTime, nullable=False)
    interview_type = Column(String(50))
    interview_url = Column(Text)
    location = Column(Text)
    interviewer_name = Column(String(255))
    interviewer_email = Column(String(255))
    status = Column(String(50), default="scheduled")
    feedback = Column(Text)
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    application = relationship("JobApplication", back_populates="interviews")