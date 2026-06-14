from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional
from datetime import datetime, timedelta
import uuid


from ....core.database import get_db
from ....core.security import get_current_user
from ....models.user import User
from ....models.job import Job, SavedJob
from ....models.company import Company
from ....services.ai_matcher import AIJobMatcher
from ....services.live_job_search import LiveJobSearchService

router = APIRouter(prefix="/jobs", tags=["jobs"])

def to_uuid(id_str: str):
    """Safely convert string to UUID"""
    try:
        return uuid.UUID(id_str)
    except (ValueError, AttributeError, TypeError):
        return None

# IMPORTANT: Specific routes MUST come before parameterized routes

@router.get("/search")
async def search_jobs(
    keyword: Optional[str] = None,
    location: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search for jobs LIVE from multiple sources including:
    - RemoteOK
    - WeWorkRemotely  
    - Remotive
    - Stack Overflow Jobs
    - GitHub Jobs
    """
    live_search = LiveJobSearchService()
    
    # Search for jobs live
    results = await live_search.search_jobs_live(
        keyword=keyword or "",
        location=location or "",
        page=page,
        limit=limit
    )
    
    # Mark saved jobs for authenticated users
    if current_user and results.get('jobs'):
        from ....models.job import SavedJob
        saved_job_ids = db.query(SavedJob.job_id).filter(
            SavedJob.user_id == current_user.id
        ).all()
        saved_ids = {str(job_id[0]) for job_id in saved_job_ids}
        
        for job in results['jobs']:
            job['is_saved'] = job.get('id') in saved_ids
    
    return results

# backend/app/api/v1/endpoints/jobs.py - Update the get_saved_jobs endpoint

@router.get("/saved")
async def get_saved_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all saved jobs for the current user (both database and live jobs)"""
    
    saved_jobs = db.query(SavedJob).filter(
        SavedJob.user_id == current_user.id
    ).order_by(SavedJob.saved_at.desc()).all()
    
    jobs = []
    for saved in saved_jobs:
        if saved.job_id:
            # Database job
            job = saved.job
            if job:
                jobs.append({
                    "id": str(job.id),
                    "title": job.title,
                    "company": {
                        "id": str(job.company.id) if job.company else None,
                        "name": job.company_name,
                        "logo": job.company.logo_url if job.company else None
                    } if job.company else {"name": job.company_name},
                    "location": job.location,
                    "job_type": job.job_type,
                    "salary": {
                        "min": job.salary_min,
                        "max": job.salary_max,
                        "currency": job.salary_currency,
                        "period": job.salary_period
                    } if job.salary_min else None,
                    "posted_date": job.posted_date.isoformat(),
                    "saved_at": saved.saved_at.isoformat(),
                    "is_saved": True,
                    "is_live_job": False
                })
        elif saved.external_job_id:
            # Live search job - we need to fetch the details
            # For now, return what we have cached
            jobs.append({
                "id": saved.external_job_id,
                "title": saved.job_title or "Live Job",
                "company": {
                    "name": saved.company_name or "External Source",
                    "logo": None
                },
                "location": saved.job_location or "Remote",
                "job_type": "full-time",
                "salary": None,
                "posted_date": saved.saved_at.isoformat(),
                "saved_at": saved.saved_at.isoformat(),
                "is_saved": True,
                "is_live_job": True,
                "source_url": saved.job_url
            })
    
    return jobs

@router.get("/recommended")
async def get_recommended_jobs(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recommended jobs based on user's skills"""
    user_skills = [skill.skill_name.lower() for skill in current_user.skills]
    
    if not user_skills:
        jobs = db.query(Job).filter(Job.is_active == True).order_by(Job.posted_date.desc()).limit(limit).all()
    else:
        jobs = db.query(Job).filter(Job.is_active == True).limit(limit * 2).all()
        
        scored_jobs = []
        for job in jobs:
            job_skills_text = f"{job.title} {job.description}".lower()
            match_count = sum(1 for skill in user_skills if skill in job_skills_text)
            score = match_count / len(user_skills) if user_skills else 0
            scored_jobs.append((score, job))
        
        scored_jobs.sort(key=lambda x: x[0], reverse=True)
        jobs = [job for score, job in scored_jobs[:limit]]
    
    return [{
        "id": str(job.id),
        "title": job.title,
        "company": {
            "name": job.company_name,
            "logo": job.company.logo_url if job.company else None
        } if job.company else {"name": job.company_name},
        "location": job.location,
        "job_type": job.job_type,
        "posted_date": job.posted_date.isoformat()
    } for job in jobs]

# backend/app/api/v1/endpoints/jobs.py - Update the save_job endpoint

@router.post("/save")
async def save_job(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save a job for the current user - handles both database and live search jobs"""
    
    # Parse request body
    try:
        body = await request.json()
        job_id = body.get('job_id')
        job_title = body.get('title', '')
        company_name = body.get('company_name', '')
        job_location = body.get('location', '')
        job_url = body.get('source_url', '')
    except:
        raise HTTPException(status_code=400, detail="Invalid request body")
    
    if not job_id:
        raise HTTPException(status_code=400, detail="Job ID is required")
    
    # Check if it's a UUID (database job) or live job ID
    from uuid import UUID
    is_uuid = False
    try:
        UUID(job_id)
        is_uuid = True
    except ValueError:
        pass
    
    if is_uuid:
        # It's a database job
        job_uuid = UUID(job_id)
        job = db.query(Job).filter(Job.id == job_uuid).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Check if already saved
        existing = db.query(SavedJob).filter(
            SavedJob.user_id == current_user.id,
            SavedJob.job_id == job.id
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Job already saved")
        
        saved_job = SavedJob(
            user_id=current_user.id,
            job_id=job.id
        )
        db.add(saved_job)
        db.commit()
        
        return {"message": "Job saved successfully", "saved": True}
    else:
        # It's a live search job - store with external_job_id
        # Check if already saved
        existing = db.query(SavedJob).filter(
            SavedJob.user_id == current_user.id,
            SavedJob.external_job_id == job_id
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Job already saved")
        
        # Create a saved job record for the live job
        saved_job = SavedJob(
            user_id=current_user.id,
            job_id=None,  # No associated database job
            external_job_id=job_id,  # Store the live job ID
            job_title=job_title,
            company_name=company_name,
            job_location=job_location,
            job_url=job_url
        )
        db.add(saved_job)
        db.commit()
        
        return {"message": "Live job saved successfully", "saved": True}

    
@router.delete("/save/{job_id}")
async def unsave_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a saved job - handles both database jobs and live search jobs"""
    
    # Check if it's a UUID (database job) or live job ID
    from uuid import UUID
    is_uuid = False
    try:
        UUID(job_id)
        is_uuid = True
    except ValueError:
        pass
    
    if is_uuid:
        # It's a database job
        job_uuid = UUID(job_id)
        saved = db.query(SavedJob).filter(
            SavedJob.user_id == current_user.id,
            SavedJob.job_id == job_uuid
        ).first()
    else:
        # It's a live search job - look for external_job_id
        saved = db.query(SavedJob).filter(
            SavedJob.user_id == current_user.id,
            SavedJob.external_job_id == job_id
        ).first()
    
    if not saved:
        raise HTTPException(status_code=404, detail="Saved job not found")
    
    db.delete(saved)
    db.commit()
    
    return {"message": "Job removed from saved"}

# This MUST be the LAST route - it catches /jobs/{job_id}
@router.get("/{job_id}")
async def get_job(
    job_id: str,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific job by ID - handles both database jobs and live search results
    """
    
    # First, try to fetch from live search if it's a numeric ID or non-UUID format
    # Check if it's NOT a valid UUID (live search IDs are typically numeric or have prefixes)
    is_live_search_id = False
    try:
        from uuid import UUID
        UUID(job_id)
        is_live_search_id = False  # It's a valid UUID, try database first
    except ValueError:
        is_live_search_id = True  # Not a UUID, must be from live search
    
    # If it's a live search ID, fetch from live sources
    if is_live_search_id:
        live_search = LiveJobSearchService()
        
        # Search for the specific job by ID from all sources
        all_jobs = await live_search.search_jobs_live(keyword="", location="", page=1, limit=100)
        
        # Find the job with matching ID
        job_data = None
        for job in all_jobs.get('jobs', []):
            if str(job.get('id')) == str(job_id):
                job_data = job
                break
        
        if job_data:
            # Transform to match expected format
            return {
                "id": str(job_data.get('id')),
                "title": job_data.get('title'),
                "company": {
                    "name": job_data.get('company_name', 'Unknown Company'),
                    "logo": None,
                    "description": "",
                    "headquarters": job_data.get('location', ''),
                    "size": "Not specified",
                    "rating": None,
                    "website": job_data.get('source_url', '')
                },
                "company_name": job_data.get('company_name'),
                "description": job_data.get('description', 'No description available.'),
                "requirements": job_data.get('requirements', ''),
                "responsibilities": job_data.get('responsibilities', ''),
                "location": job_data.get('location', 'Remote'),
                "country": job_data.get('country', 'Global'),
                "salary": job_data.get('salary'),
                "salary_min": job_data.get('salary_min'),
                "salary_max": job_data.get('salary_max'),
                "job_type": job_data.get('job_type', 'full-time'),
                "experience_level": job_data.get('experience_level', 'mid'),
                "industry": job_data.get('industry', 'Technology'),
                "remote_type": 'remote' if job_data.get('is_remote') else 'onsite',
                "is_remote": job_data.get('is_remote', True),
                "visa_sponsorship": job_data.get('visa_sponsorship', False),
                "posted_date": job_data.get('posted_date'),
                "source": job_data.get('source', 'Live Search'),
                "source_url": job_data.get('source_url', ''),
                "views": 0,
                "applications": 0,
                "is_saved": False,
                "skills": job_data.get('skills', []),
                "ai_match_score": None
            }
    
    # If not found in live search or it's a UUID, try database lookup
    try:
        from uuid import UUID
        from ....models.job import Job, SavedJob
        
        job_uuid = UUID(job_id)
        job = db.query(Job).filter(Job.id == job_uuid).first()
        
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Increment view count
        job.views_count += 1
        db.commit()
        
        job_dict = {
            "id": str(job.id),
            "title": job.title,
            "company": {
                "id": str(job.company.id) if job.company else None,
                "name": job.company_name,
                "logo": job.company.logo_url if job.company else None,
                "description": job.company.description if job.company else None,
                "headquarters": job.company.headquarters if job.company else None,
                "size": job.company.size if job.company else None,
                "rating": job.company.rating if job.company else None,
                "website": job.company.website if job.company else None
            } if job.company else {"name": job.company_name},
            "description": job.description,
            "requirements": job.requirements,
            "responsibilities": job.responsibilities,
            "location": job.location,
            "country": job.country,
            "salary": {
                "min": job.salary_min,
                "max": job.salary_max,
                "currency": job.salary_currency,
                "period": job.salary_period
            } if job.salary_min else None,
            "job_type": job.job_type,
            "experience_level": job.experience_level,
            "industry": job.industry,
            "remote_type": job.remote_type,
            "is_remote": job.is_remote,
            "visa_sponsorship": job.visa_sponsorship,
            "posted_date": job.posted_date.isoformat(),
            "deadline": job.application_deadline.isoformat() if job.application_deadline else None,
            "skills": [],
            "benefits": [],
            "source": job.source,
            "source_url": job.source_url,
            "views": job.views_count,
            "applications": job.applications_count,
            "is_active": job.is_active,
            "is_featured": job.is_featured
        }
        
        # Check if saved
        if current_user:
            saved = db.query(SavedJob).filter(
                SavedJob.user_id == current_user.id,
                SavedJob.job_id == job.id
            ).first()
            job_dict["is_saved"] = saved is not None
        
        return job_dict
        
    except ValueError as e:
        # Not a valid UUID format
        raise HTTPException(status_code=404, detail=f"Job not found: {str(e)}")