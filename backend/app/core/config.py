from pydantic_settings import BaseSettings
from typing import Optional, List
import os
import json
import ast

class Settings(BaseSettings):
    # App
    APP_NAME: str = "JobHub API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://jobhub_user:jobhub123@localhost:5432/jobhub")
    DATABASE_POOL_SIZE: int = int(os.getenv("DATABASE_POOL_SIZE", "20"))
    DATABASE_MAX_OVERFLOW: int = int(os.getenv("DATABASE_MAX_OVERFLOW", "40"))
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    # Email
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    EMAIL_FROM: str = "noreply@jobhub.com"
    EMAIL_FROM_NAME: str = "JobHub"
    
    # CORS - Hardcoded for production
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://job-aggregator-frontend-oh8y.onrender.com",
        "https://job-aggregator-api-tqli.onrender.com"
    ]
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    RATE_LIMIT_PERIOD: int = int(os.getenv("RATE_LIMIT_PERIOD", "60"))
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024
    ALLOWED_RESUME_TYPES: List[str] = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    
    # Celery
    CELERY_BROKER_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # External APIs
    LINKEDIN_API_KEY: Optional[str] = None
    INDEED_API_KEY: Optional[str] = None
    GLASSDOOR_API_KEY: Optional[str] = None
    
    # AI
    OPENAI_API_KEY: Optional[str] = None
    SPACY_MODEL: str = "en_core_web_lg"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()