from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from .base import Base

# Association table for job skills
job_skills_table = Table(
    'job_skills',
    Base.metadata,
    Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    Column('job_id', UUID(as_uuid=True), ForeignKey('jobs.id', ondelete='CASCADE')),
    Column('skill_name', String(100), nullable=False),
    Column('is_required', Boolean, default=False),
    Column('created_at', DateTime, server_default=func.now())
)

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    external_id = Column(String(255))
    title = Column(String(255), nullable=False, index=True)
    company_id = Column(UUID(as_uuid=True), ForeignKey('companies.id'))
    company_name = Column(String(255))
    description = Column(Text, nullable=False)
    requirements = Column(Text)
    responsibilities = Column(Text)
    location = Column(String(255))
    country = Column(String(100))
    salary_min = Column(Integer)
    salary_max = Column(Integer)
    salary_currency = Column(String(3), default="USD")
    salary_period = Column(String(20))
    job_type = Column(String(50))
    experience_level = Column(String(50))
    industry = Column(String(100))
    remote_type = Column(String(20))
    is_remote = Column(Boolean, default=False)
    visa_sponsorship = Column(Boolean, default=False)
    posted_date = Column(DateTime, nullable=False)
    application_deadline = Column(DateTime)
    source = Column(String(100))
    source_url = Column(Text)
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    views_count = Column(Integer, default=0)
    applications_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    company = relationship("Company", back_populates="jobs")
    saved_by_users = relationship("SavedJob", back_populates="job", cascade="all, delete-orphan")
    applications = relationship("JobApplication", back_populates="job", cascade="all, delete-orphan")

# backend/app/models/job.py - Update the SavedJob model

class SavedJob(Base):
    __tablename__ = "saved_jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=True)
    external_job_id = Column(String(255), nullable=True)  # For live search jobs
    job_title = Column(String(500), nullable=True)  # Cache job title for live jobs
    company_name = Column(String(500), nullable=True)  # Cache company name
    job_location = Column(String(500), nullable=True)  # Cache location
    job_url = Column(Text, nullable=True)  # Cache job URL
    notes = Column(Text)
    status = Column(String(50), default="saved")
    saved_at = Column(DateTime, server_default=func.now())
    
    user = relationship("User", back_populates="saved_jobs")
    job = relationship("Job", back_populates="saved_by_users")