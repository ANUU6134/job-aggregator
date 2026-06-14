from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, Text, Enum, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from datetime import datetime
from .base import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    avatar_url = Column(Text)
    role = Column(String(20), default="user")
    is_active = Column(Boolean, default=True)
    is_email_verified = Column(Boolean, default=False)
    email_verification_token = Column(String(255))
    password_reset_token = Column(String(255))
    password_reset_expires = Column(DateTime)
    last_login = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    experience = relationship("WorkExperience", back_populates="user", cascade="all, delete-orphan")
    education = relationship("Education", back_populates="user", cascade="all, delete-orphan")
    saved_jobs = relationship("SavedJob", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("JobApplication", back_populates="user", cascade="all, delete-orphan")
    job_alerts = relationship("JobAlert", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    headline = Column(String(255))
    bio = Column(Text)
    location = Column(String(255))
    country = Column(String(100))
    phone = Column(String(50))
    resume_url = Column(Text)
    github_url = Column(String(255))
    linkedin_url = Column(String(255))
    website_url = Column(String(255))
    visa_sponsorship = Column(Boolean, default=False)
    remote_preference = Column(String(20))
    salary_min = Column(Integer)
    salary_max = Column(Integer)
    currency = Column(String(3), default="USD")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    user = relationship("User", back_populates="profile")

class UserSkill(Base):
    __tablename__ = "user_skills"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    skill_name = Column(String(100), nullable=False)
    years_experience = Column(Float)
    proficiency_level = Column(String(20))
    created_at = Column(DateTime, server_default=func.now())
    
    user = relationship("User", back_populates="skills")

class WorkExperience(Base):
    __tablename__ = "work_experience"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    location = Column(String(255))
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime)
    current = Column(Boolean, default=False)
    description = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    
    user = relationship("User", back_populates="experience")

class Education(Base):
    __tablename__ = "education"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    degree = Column(String(255), nullable=False)
    field_of_study = Column(String(255))
    institution = Column(String(255), nullable=False)
    location = Column(String(255))
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime)
    current = Column(Boolean, default=False)
    description = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    
    user = relationship("User", back_populates="education")