# backend/app/api/v1/endpoints/dashboard.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import List, Dict, Any

from ....core.database import get_db
from ....core.security import get_current_user
from ....models.user import User
from ....models.job import Job, SavedJob
from ....models.application import JobApplication
from ....services.ai_matcher import AIJobMatcher

router = APIRouter(tags=["dashboard"])

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for the current user"""
    
    # Get saved jobs count
    saved_jobs_count = db.query(SavedJob).filter(
        SavedJob.user_id == current_user.id
    ).count()
    
    # Get applications count
    applications_count = db.query(JobApplication).filter(
        JobApplication.user_id == current_user.id
    ).count()
    
    # Get interviews count (applications with status 'interview')
    interviews_count = db.query(JobApplication).filter(
        and_(
            JobApplication.user_id == current_user.id,
            JobApplication.status.in_(['interview', 'interviewing', 'interview_scheduled'])
        )
    ).count()
    
    # Get offers count
    offers_count = db.query(JobApplication).filter(
        and_(
            JobApplication.user_id == current_user.id,
            JobApplication.status.in_(['offer', 'offers'])
        )
    ).count()
    
    # Calculate application rate
    application_rate = 0
    if saved_jobs_count > 0:
        application_rate = round((applications_count / saved_jobs_count) * 100, 1)
    
    return {
        "savedJobs": saved_jobs_count,
        "applications": applications_count,
        "interviews": interviews_count,
        "offers": offers_count,
        "profileViews": 0,
        "applicationRate": application_rate
    }

@router.get("/dashboard/activity")
async def get_recent_activity(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recent user activity"""
    
    activities = []
    
    # Get recent applications
    recent_applications = db.query(JobApplication).filter(
        JobApplication.user_id == current_user.id
    ).order_by(JobApplication.created_at.desc()).limit(limit).all()
    
    for app in recent_applications:
        # Check if job exists (for database jobs) or is a live job
        if app.job:
            job_title = app.job.title
            company_name = app.job.company_name
        else:
            # For live jobs, extract info from notes or use default
            job_title = "Job Application"
            company_name = "External Source"
            if app.notes and "Applied to live job with ID:" in app.notes:
                job_id = app.notes.replace("Applied to live job with ID:", "").strip()
                job_title = f"Live Job (ID: {job_id})"
        
        activities.append({
            "id": str(app.id),
            "type": "application",
            "title": f"Applied to {job_title}",
            "company": company_name,
            "date": app.created_at.isoformat(),
            "status": app.status,
            "icon": "CheckCircle"
        })
    
    # Get recent saved jobs
    recent_saved = db.query(SavedJob).filter(
        SavedJob.user_id == current_user.id
    ).order_by(SavedJob.saved_at.desc()).limit(limit).all()
    
    for saved in recent_saved:
        if saved.job:
            activities.append({
                "id": str(saved.id),
                "type": "saved",
                "title": f"Saved job: {saved.job.title}",
                "company": saved.job.company_name,
                "date": saved.saved_at.isoformat(),
                "icon": "Bookmark",
                "status": "saved"
            })
        else:
            activities.append({
                "id": str(saved.id),
                "type": "saved",
                "title": "Saved job",
                "company": "Unknown Company",
                "date": saved.saved_at.isoformat(),
                "icon": "Bookmark",
                "status": "saved"
            })
    
    # Sort by date and limit
    activities.sort(key=lambda x: x["date"], reverse=True)
    
    return activities[:limit]

@router.get("/dashboard/recommendations")
async def get_dashboard_recommendations(
    limit: int = 5,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized job recommendations for dashboard"""
    
    # Get user's skills
    user_skills = [skill.skill_name.lower() for skill in current_user.skills]
    
    # Find jobs matching user's skills
    query = db.query(Job).filter(Job.is_active == True)
    
    if user_skills:
        # Simple keyword matching
        from sqlalchemy import or_
        skill_conditions = []
        for skill in user_skills[:5]:  # Use top 5 skills
            skill_conditions.append(Job.title.ilike(f"%{skill}%"))
            skill_conditions.append(Job.description.ilike(f"%{skill}%"))
        
        query = query.filter(or_(*skill_conditions))
    
    # Get recent jobs
    jobs = query.order_by(Job.posted_date.desc()).limit(limit).all()
    
    # Calculate match scores
    matcher = AIJobMatcher(db)
    recommendations = []
    
    for job in jobs:
        match_score = matcher.calculate_match_score(current_user, job)
        
        recommendations.append({
            "id": str(job.id),
            "title": job.title,
            "company": job.company_name,
            "location": job.location,
            "jobType": job.job_type,
            "matchScore": match_score,
            "postedDate": job.posted_date.isoformat()
        })
    
    return recommendations

@router.get("/dashboard/activity/chart")
async def get_activity_chart(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get activity data for charts"""
    
    chart_data = []
    
    for i in range(days, 0, -1):
        date = datetime.now() - timedelta(days=i)
        date_start = datetime(date.year, date.month, date.day, 0, 0, 0)
        date_end = datetime(date.year, date.month, date.day, 23, 59, 59)
        
        # Count applications on this day
        applications_count = db.query(JobApplication).filter(
            and_(
                JobApplication.user_id == current_user.id,
                JobApplication.created_at >= date_start,
                JobApplication.created_at <= date_end
            )
        ).count()
        
        # Count saved jobs on this day
        saved_count = db.query(SavedJob).filter(
            and_(
                SavedJob.user_id == current_user.id,
                SavedJob.saved_at >= date_start,
                SavedJob.saved_at <= date_end
            )
        ).count()
        
        chart_data.append({
            "date": date.strftime("%Y-%m-%d"),
            "applications": applications_count,
            "saved": saved_count
        })
    
    return chart_data