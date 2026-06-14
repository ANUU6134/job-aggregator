from sqlalchemy import Column, String, Integer, Float, DateTime, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from .base import Base

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), unique=True, nullable=False, index=True)
    slug = Column(String(255), unique=True, nullable=False)
    logo_url = Column(Text)
    website = Column(String(255))
    description = Column(Text)
    industry = Column(String(100))
    size = Column(String(50))
    founded_year = Column(Integer)
    headquarters = Column(String(255))
    employee_count = Column(Integer)
    rating = Column(Float)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    jobs = relationship("Job", back_populates="company", cascade="all, delete-orphan")