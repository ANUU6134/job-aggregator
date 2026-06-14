# backend/app/api/v1/endpoints/applications.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

from ....core.database import get_db
from ....core.security import get_current_user
from ....models.user import User
from ....models.job import Job
from ....models.application import JobApplication, ApplicationInterview

router = APIRouter(prefix="/applications", tags=["applications"])

def to_uuid(id_str: str):
    """Safely convert string to UUID"""
    try:
        return uuid.UUID(id_str)
    except (ValueError, AttributeError, TypeError):
        return None

# backend/app/api/v1/endpoints/applications.py - Update the ApplicationCreate model

class ApplicationCreate(BaseModel):
    job_id: str
    cover_letter: Optional[str] = ""
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    location: Optional[str] = None
    source_url: Optional[str] = None

class ApplicationUpdate(BaseModel):
    status: str
    notes: Optional[str] = None


@router.get("")
async def get_all_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all applications for the current user"""
    applications = db.query(JobApplication).filter(
        JobApplication.user_id == current_user.id
    ).order_by(JobApplication.created_at.desc()).all()
    
    result = []
    for app in applications:
        # Check if this is a live job application (job_id is None)
        if app.job_id is None and app.notes:
            # Parse job details from notes
            job_title = "Live Job Application"
            company_name = "External Source"
            job_location = ""
            
            # Extract details from notes
            if "Title:" in app.notes:
                import re
                title_match = re.search(r'Title: ([^,]+)', app.notes)
                if title_match:
                    job_title = title_match.group(1).strip()
                
                company_match = re.search(r'Company: ([^,]+)', app.notes)
                if company_match:
                    company_name = company_match.group(1).strip()
                
                location_match = re.search(r'Location: ([^,]+)', app.notes)
                if location_match:
                    job_location = location_match.group(1).strip()
            
            result.append({
                "id": str(app.id),
                "job_id": "live_job",
                "status": app.status,
                "applied_at": app.applied_at.isoformat(),
                "notes": app.notes,
                "cover_letter": app.cover_letter,
                "job": {
                    "id": "live_job",
                    "title": job_title,
                    "company": {
                        "name": company_name
                    },
                    "location": job_location,
                    "description": f"This application was submitted to {company_name} for the position of {job_title}."
                },
                "interviews": [{
                    "id": str(i.id),
                    "date": i.scheduled_date.isoformat(),
                    "type": i.interview_type,
                    "description": i.notes or "",  # Use notes field
                    "interviewer": i.interviewer_name,
                    "feedback": i.feedback
                } for i in app.interviews] if app.interviews else []
            })
        elif app.job:
            # Database job
            result.append({
                "id": str(app.id),
                "job_id": str(app.job_id),
                "status": app.status,
                "applied_at": app.applied_at.isoformat(),
                "notes": app.notes,
                "cover_letter": app.cover_letter,
                "job": {
                    "id": str(app.job.id),
                    "title": app.job.title,
                    "company": {
                        "name": app.job.company_name
                    },
                    "location": app.job.location,
                    "description": app.job.description[:500] if app.job.description else ""
                },
                "interviews": [{
                    "id": str(i.id),
                    "date": i.scheduled_date.isoformat(),
                    "type": i.interview_type,
                    "description": i.feedback or ""
                } for i in app.interviews] if app.interviews else []
            })
        else:
            # Fallback for any other case
            result.append({
                "id": str(app.id),
                "job_id": "unknown",
                "status": app.status,
                "applied_at": app.applied_at.isoformat(),
                "notes": app.notes,
                "cover_letter": app.cover_letter,
                "job": {
                    "id": "unknown",
                    "title": "Job Application",
                    "company": {
                        "name": "Unknown Company"
                    },
                    "description": "Application details not available."
                },
                "interviews": []
            })
    
    return result


@router.post("/apply")
async def apply_to_job(
    application_data: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Apply to a job - handles both database jobs and live search jobs"""
    
    print(f"Received application for job_id: {application_data.job_id}")
    
    # Check if job exists in database first
    job = None
    job_title = None
    company_name = None
    job_location = None
    
    try:
        # Try as UUID (database job)
        job_uuid = uuid.UUID(application_data.job_id)
        job = db.query(Job).filter(Job.id == job_uuid).first()
        if job:
            print(f"Found database job: {job.title}")
            job_title = job.title
            company_name = job.company_name
            job_location = job.location
    except ValueError:
        # Not a UUID, it's a live search job
        print(f"Job ID {application_data.job_id} is not a UUID, treating as live job")
        
        # Try to get job details from the request body if provided
        # The frontend should send job details for live jobs
        pass
    
    if not job:
        # For live search jobs, try to get details from the request body
        # The frontend should send job_title and company_name
        job_title = getattr(application_data, 'job_title', None)
        company_name = getattr(application_data, 'company_name', None)
        job_location = getattr(application_data, 'location', None)
        
        # If not provided, use placeholders
        if not job_title:
            job_title = f"Job #{application_data.job_id[:8]}"
        if not company_name:
            company_name = "External Source"
        
        # Create a record for the live job
        application = JobApplication(
            user_id=current_user.id,
            job_id=None,  # No job in database
            cover_letter=application_data.cover_letter,
            status="applied",
            notes=f"Applied to live job - Title: {job_title}, Company: {company_name}, Location: {job_location or 'Not specified'}, Original ID: {application_data.job_id}"
        )
        db.add(application)
        db.commit()
        
        return {
            "message": "Application submitted successfully for live job",
            "application_id": str(application.id),
            "job_title": job_title,
            "company_name": company_name
        }
    
    # Check if already applied to this database job
    existing = db.query(JobApplication).filter(
        JobApplication.user_id == current_user.id,
        JobApplication.job_id == job.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")
    
    # Create new application for database job
    application = JobApplication(
        user_id=current_user.id,
        job_id=job.id,
        cover_letter=application_data.cover_letter,
        status="applied"
    )
    db.add(application)
    
    # Increment application count on the job
    job.applications_count += 1
    db.commit()
    
    return {
        "message": "Application submitted successfully",
        "application_id": str(application.id),
        "job_title": job.title,
        "company_name": job.company_name
    }

@router.get("/my-applications")
async def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all applications for the current user"""
    
    applications = db.query(JobApplication).filter(
        JobApplication.user_id == current_user.id
    ).order_by(JobApplication.created_at.desc()).all()
    
    result = []
    for app in applications:
        result.append({
            "id": str(app.id),
            "job_id": str(app.job_id) if app.job_id else "live_job",
            "status": app.status,
            "applied_at": app.applied_at.isoformat(),
            "notes": app.notes,
            "cover_letter": app.cover_letter
        })
    
    return result

@router.get("/{application_id}")
async def get_application(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app_uuid = to_uuid(application_id)
    if app_uuid is None:
        raise HTTPException(status_code=404, detail="Application not found")
    
    application = db.query(JobApplication).filter(
        JobApplication.id == app_uuid,
        JobApplication.user_id == current_user.id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return {
        "id": str(application.id),
        "job": {
            "id": str(application.job.id) if application.job else None,
            "title": application.job.title if application.job else "Live Job",
            "company": {
                "name": application.job.company_name if application.job else "Unknown Company"
            },
            "description": application.job.description if application.job else ""
        } if application.job else None,
        "status": application.status,
        "applied_at": application.applied_at.isoformat(),
        "notes": application.notes,
        "cover_letter": application.cover_letter,
        "interviews": [{
            "id": str(i.id),
            "date": i.scheduled_date.isoformat(),
            "type": i.interview_type,
            "interviewer": i.interviewer_name,
            "feedback": i.feedback
        } for i in application.interviews]
    }

@router.patch("/{application_id}")
async def update_application(
    application_id: str,
    update_data: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app_uuid = to_uuid(application_id)
    if app_uuid is None:
        raise HTTPException(status_code=404, detail="Application not found")
    
    application = db.query(JobApplication).filter(
        JobApplication.id == app_uuid,
        JobApplication.user_id == current_user.id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    application.status = update_data.status
    if update_data.notes:
        application.notes = update_data.notes
    
    db.commit()
    
    return {"message": "Application updated successfully"}

# backend/app/api/v1/endpoints/applications.py - Fix the add_interview endpoint

@router.post("/{application_id}/interviews")
async def add_interview(
    application_id: str,
    interview_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add an interview to an application"""
    app_uuid = to_uuid(application_id)
    if app_uuid is None:
        raise HTTPException(status_code=404, detail="Application not found")
    
    application = db.query(JobApplication).filter(
        JobApplication.id == app_uuid,
        JobApplication.user_id == current_user.id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Parse the date
    from datetime import datetime
    scheduled_date = datetime.fromisoformat(interview_data.get('date', ''))
    
    new_interview = ApplicationInterview(
        application_id=application.id,
        scheduled_date=scheduled_date,
        interview_type=interview_data.get('type', 'phone'),
        interviewer_name=interview_data.get('interviewer'),
        notes=interview_data.get('description', ''),  # Use notes field for description
        status='scheduled'
    )
    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)
    
    return {
        "message": "Interview scheduled successfully", 
        "id": str(new_interview.id),
        "interview": {
            "id": str(new_interview.id),
            "date": new_interview.scheduled_date.isoformat(),
            "type": new_interview.interview_type,
            "description": new_interview.notes,
            "interviewer": new_interview.interviewer_name
        }
    }

# backend/app/api/v1/endpoints/applications.py - Add this endpoint

@router.delete("/{application_id}")
async def delete_application(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an application"""
    app_uuid = to_uuid(application_id)
    if app_uuid is None:
        raise HTTPException(status_code=404, detail="Application not found")
    
    application = db.query(JobApplication).filter(
        JobApplication.id == app_uuid,
        JobApplication.user_id == current_user.id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    db.delete(application)
    db.commit()
    
    return {"message": "Application deleted successfully"}