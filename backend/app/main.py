from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import logging
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from datetime import datetime, timedelta

from app.core.config import settings
from app.core.database import engine, Base, get_db
from app.models.base import Base as ModelBase
from app.models.user import User
from app.models.job import Job
from app.models.company import Company
from app.models.application import JobApplication
from app.api.v1.endpoints import auth, jobs, users, applications, companies, admin, salary, dashboard
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
    
    try:
        # Create database tables
        ModelBase.metadata.create_all(bind=engine)
        logger.info("Database tables created")
    except Exception as e:
        logger.error(f"Database creation error: {e}")
    
    # Start background scheduler
    if not settings.DEBUG:
        try:
            start_scheduler()
            logger.info("Background scheduler started")
        except Exception as e:
            logger.error(f"Scheduler error: {e}")
    
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

# Get CORS origins with fallback
cors_origins = settings.BACKEND_CORS_ORIGINS
logger.info(f"CORS Origins configured: {cors_origins}")

# CORS middleware - with explicit configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all during debugging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]
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
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    try:
        return {"status": "healthy", "service": "JobHub API"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.get("/api/v1/stats")
async def get_platform_stats(db: Session = Depends(get_db)):
    """Get platform statistics"""
    try:
        total_jobs = db.query(Job).filter(Job.is_active == True).count()
        total_companies = db.query(Company).count()
        total_users = db.query(User).count()
        
        jobs_by_type = db.query(Job.job_type, func.count(Job.id)).group_by(Job.job_type).all()
        
        week_ago = datetime.now() - timedelta(days=7)
        recent_jobs = db.query(Job).filter(Job.posted_date >= week_ago).count()
        
        return {
            "total_jobs": total_jobs,
            "total_companies": total_companies,
            "total_users": total_users,
            "recent_jobs": recent_jobs,
            "jobs_by_type": [{"type": t, "count": c} for t, c in jobs_by_type]
        }
    except Exception as e:
        logger.error(f"Stats error: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )