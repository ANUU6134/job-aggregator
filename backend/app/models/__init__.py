# backend/app/models/__init__.py
from .base import Base
from .user import User, UserProfile, UserSkill, WorkExperience, Education
from .company import Company
from .job import Job, SavedJob
from .application import JobApplication, ApplicationInterview
#from .job_alert import JobAlert  # Add this
from .notification import Notification, JobAlert
from .scraping_log import ScrapingLog

# Import all models so they register with SQLAlchemy
__all__ = [
    "Base",
    "User", 
    "UserProfile", 
    "UserSkill", 
    "WorkExperience", 
    "Education",
    "Company",
    "Job", 
    "SavedJob",
    "JobApplication", 
    "ApplicationInterview",
    "JobAlert",  # Add this
    "Notification",
    "ScrapingLog"
]