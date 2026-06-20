# backend/app/models/job_alert.py
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from .base import Base

class JobAlert(Base):
    __tablename__ = "job_alerts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    name = Column(String(255))
    keywords = Column(Text)
    location = Column(String(255))
    job_types = Column(JSONB)
    remote_only = Column(Boolean, default=False)
    salary_min = Column(Integer)
    frequency = Column(String(20), default="daily")
    is_active = Column(Boolean, default=True)
    last_sent_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    user = relationship("User", back_populates="job_alerts")