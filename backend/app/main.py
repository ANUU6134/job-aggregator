from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import logging
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List, Optional
from datetime import datetime, timedelta
import asyncio

from app.core.config import settings
from app.core.database import engine, Base, get_db
from app.models.base import Base as ModelBase
from app.models.user import User
from app.models.job import Job
from app.models.company import Company
from app.models.application import JobApplication
from app.models.notification import JobAlert, Notification
from app.api.v1.endpoints import auth, jobs, users, applications, companies, admin, salary, dashboard
from app.services.scraper_service import JobScraperService
from app.services.ai_matcher import AIJobMatcher
from app.services.email_service import EmailService
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.logging import LoggingMiddleware
from app.tasks.scheduler import start_scheduler

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up JobHub API...")
    
    # Create database tables
    ModelBase.metadata.create_all(bind=engine)
    logger.info("Database tables created")
    
    # Start background scheduler
    if not settings.DEBUG:
        start_scheduler()
        logger.info("Background scheduler started")
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Enterprise Job Aggregator Platform API",
    lifespan=lifespan,
    docs_url="/api/docs" if not settings.DEBUG else "/docs",
    redoc_url="/api/redoc" if not settings.DEBUG else "/redoc"
)

# Get CORS origins from settings with debug logging
cors_origins = settings.BACKEND_CORS_ORIGINS
logger.info(f"CORS Origins configured: {cors_origins}")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"] if settings.DEBUG else ["jobhub-api.onrender.com", "localhost", "127.0.0.1", "job-aggregator-backend.onrender.com"]
)

# Custom middleware
app.add_middleware(RateLimitMiddleware)
app.add_middleware(LoggingMiddleware)

# Include routers
try:
    app.include_router(auth.router, prefix="/api/v1")
    app.include_router(users.router, prefix="/api/v1")
    app.include_router(jobs.router, prefix="/api/v1")
    app.include_router(applications.router, prefix="/api/v1")
    app.include_router(companies.router, prefix="/api/v1")
    app.include_router(admin.router, prefix="/api/v1")
    app.include_router(salary.router, prefix="/api/v1")
    app.include_router(dashboard.router, prefix="/api/v1")
    logger.info("All routers registered successfully")
except Exception as e:
    logger.error(f"Error registering routers: {e}")

@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now().isoformat(),
        "cors_origins": settings.BACKEND_CORS_ORIGINS
    }

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        # Check database
        db.execute("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

@app.options("/{rest_of_path:path}")
async def options_route(rest_of_path: str):
    """Handle preflight requests"""
    return {"message": "OK"}

@app.post("/api/v1/scrapers/run")
async def run_scrapers(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Manually trigger job scraping"""
    from app.services.real_scraper_service import RealJobScraperService
    scraper = RealJobScraperService(db)
    background_tasks.add_task(scraper.run_all_scrapers)
    return {"message": "Real job scraping started in background"}

@app.get("/api/v1/stats")
async def get_platform_stats(db: Session = Depends(get_db)):
    """Get platform statistics"""
    total_jobs = db.query(Job).filter(Job.is_active == True).count()
    total_companies = db.query(Company).count()
    total_users = db.query(User).count()
    
    # Jobs by type
    jobs_by_type = db.query(Job.job_type, func.count(Job.id)).group_by(Job.job_type).all()
    
    # Recent jobs (last 7 days)
    week_ago = datetime.now() - timedelta(days=7)
    recent_jobs = db.query(Job).filter(Job.posted_date >= week_ago).count()
    
    return {
        "total_jobs": total_jobs,
        "total_companies": total_companies,
        "total_users": total_users,
        "recent_jobs": recent_jobs,
        "jobs_by_type": [{"type": t, "count": c} for t, c in jobs_by_type]
    }

@app.on_event("startup")
async def startup_event():
    """Start background tasks on app startup"""
    logger.info("Application startup complete")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Application shutdown")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )