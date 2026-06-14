from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from ....core.database import get_db
from ....core.security import get_current_admin_user
from ....models.user import User
from ....models.job import Job
from ....models.scraping_log import ScrapingLog
from ....services.scraper_service import JobScraperService

router = APIRouter(tags=["admin"])

@router.get("/admin/stats")
async def get_admin_stats(
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_jobs = db.query(Job).count()
    active_jobs = db.query(Job).filter(Job.is_active == True).count()
    
    # Recent scrapes
    last_scrape = db.query(ScrapingLog).order_by(ScrapingLog.created_at.desc()).first()
    
    return {
        "totalUsers": total_users,
        "activeUsers": active_users,
        "totalJobs": total_jobs,
        "activeJobs": active_jobs,
        "lastScrapeTime": last_scrape.created_at.isoformat() if last_scrape else None,
        "scrapersRunning": False
    }

@router.get("/admin/users")
async def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit
    users = db.query(User).offset(skip).limit(limit).all()
    total = db.query(User).count()
    
    return {
        "users": [{
            "id": str(u.id),
            "email": u.email,
            "firstName": u.first_name,
            "lastName": u.last_name,
            "role": u.role,
            "isActive": u.is_active,
            "isEmailVerified": u.is_email_verified,
            "lastLogin": u.last_login.isoformat() if u.last_login else None,
            "createdAt": u.created_at.isoformat()
        } for u in users],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@router.patch("/admin/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    from uuid import UUID
    
    user = db.query(User).filter(User.id == UUID(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if role not in ["user", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    user.role = role
    db.commit()
    
    return {"message": "User role updated successfully"}

@router.post("/admin/users/{user_id}/ban")
async def ban_user(
    user_id: str,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    from uuid import UUID
    
    user = db.query(User).filter(User.id == UUID(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = False
    db.commit()
    
    return {"message": "User banned successfully"}

@router.post("/admin/scrapers/run")
async def run_scrapers_admin(
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    scraper = JobScraperService(db)
    import asyncio
    asyncio.create_task(scraper.run_all_scrapers())
    return {"message": "Scrapers started successfully"}

@router.get("/admin/scraping-logs")
async def get_scraping_logs(
    limit: int = 50,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    logs = db.query(ScrapingLog).order_by(ScrapingLog.created_at.desc()).limit(limit).all()
    
    return [{
        "id": str(log.id),
        "source": log.source,
        "status": log.status,
        "jobsFound": log.jobs_found,
        "jobsAdded": log.jobs_added,
        "jobsUpdated": log.jobs_updated,
        "error": log.error_message,
        "startedAt": log.started_at.isoformat() if log.started_at else None,
        "finishedAt": log.finished_at.isoformat() if log.finished_at else None,
        "createdAt": log.created_at.isoformat()
    } for log in logs]