from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from ....core.database import get_db
from ....core.security import get_current_user
from ....models.user import User, UserProfile, UserSkill, WorkExperience, Education
from ....services.resume_perser import ResumeParser

router = APIRouter(prefix="/users", tags=["users"])

class ProfileUpdate(BaseModel):
    headline: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None
    visa_sponsorship: Optional[bool] = None
    remote_preference: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None

class SkillAdd(BaseModel):
    skill_name: str
    years_experience: Optional[float] = None
    proficiency_level: Optional[str] = None

class ExperienceAdd(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None
    current: bool = False
    description: Optional[str] = None

class EducationAdd(BaseModel):
    degree: str
    field_of_study: Optional[str] = None
    institution: str
    location: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None
    current: bool = False
    description: Optional[str] = None

@router.get("/profile")
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    return {
        "user_id": str(current_user.id),
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "avatar": current_user.avatar_url,
        "headline": profile.headline if profile else None,
        "bio": profile.bio if profile else None,
        "location": profile.location if profile else None,
        "country": profile.country if profile else None,
        "phone": profile.phone if profile else None,
        "resume_url": profile.resume_url if profile else None,
        "github_url": profile.github_url if profile else None,
        "linkedin_url": profile.linkedin_url if profile else None,
        "website_url": profile.website_url if profile else None,
        "visa_sponsorship": profile.visa_sponsorship if profile else False,
        "remote_preference": profile.remote_preference if profile else None,
        "salary_min": profile.salary_min if profile else None,
        "salary_max": profile.salary_max if profile else None,
        "skills": [{"name": s.skill_name, "years": s.years_experience, "level": s.proficiency_level} for s in current_user.skills],
        "experience": [{
            "id": str(e.id),
            "title": e.title,
            "company": e.company,
            "location": e.location,
            "start_date": e.start_date.isoformat(),
            "end_date": e.end_date.isoformat() if e.end_date else None,
            "current": e.current,
            "description": e.description
        } for e in current_user.experience],
        "education": [{
            "id": str(e.id),
            "degree": e.degree,
            "field_of_study": e.field_of_study,
            "institution": e.institution,
            "location": e.location,
            "start_date": e.start_date.isoformat(),
            "end_date": e.end_date.isoformat() if e.end_date else None,
            "current": e.current,
            "description": e.description
        } for e in current_user.education]
    }

@router.put("/profile")
async def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
    
    for key, value in profile_data.dict(exclude_unset=True).items():
        setattr(profile, key, value)
    
    db.commit()
    
    return {"message": "Profile updated successfully"}

@router.post("/upload-resume")
async def upload_resume(
    resume: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file type
    if resume.content_type not in ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF and DOCX are allowed.")
    
    # Parse resume
    parser = ResumeParser()
    parsed_data = await parser.parse_resume(await resume.read(), resume.content_type)
    
    # Update user profile with parsed data
    profile = current_user.profile
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
    
    if parsed_data.get("skills"):
        for skill in parsed_data["skills"][:10]:  # Limit to 10 skills
            existing = db.query(UserSkill).filter(
                UserSkill.user_id == current_user.id,
                UserSkill.skill_name.ilike(skill)
            ).first()
            if not existing:
                new_skill = UserSkill(user_id=current_user.id, skill_name=skill)
                db.add(new_skill)
    
    # In production, you would save the file to cloud storage
    # For now, just store a placeholder URL
    profile.resume_url = f"uploads/resumes/{current_user.id}_{resume.filename}"
    
    db.commit()
    
    return {"message": "Resume uploaded and parsed successfully", "data": parsed_data}

@router.post("/skills")
async def add_skill(
    skill_data: SkillAdd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(UserSkill).filter(
        UserSkill.user_id == current_user.id,
        UserSkill.skill_name.ilike(skill_data.skill_name)
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Skill already exists")
    
    new_skill = UserSkill(
        user_id=current_user.id,
        skill_name=skill_data.skill_name,
        years_experience=skill_data.years_experience,
        proficiency_level=skill_data.proficiency_level
    )
    db.add(new_skill)
    db.commit()
    
    return {"message": "Skill added successfully"}

@router.delete("/skills/{skill_name}")
async def remove_skill(
    skill_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skill = db.query(UserSkill).filter(
        UserSkill.user_id == current_user.id,
        UserSkill.skill_name.ilike(skill_name)
    ).first()
    
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    
    db.delete(skill)
    db.commit()
    
    return {"message": "Skill removed successfully"}

@router.post("/experience")
async def add_experience(
    exp_data: ExperienceAdd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from datetime import datetime
    
    new_exp = WorkExperience(
        user_id=current_user.id,
        title=exp_data.title,
        company=exp_data.company,
        location=exp_data.location,
        start_date=datetime.fromisoformat(exp_data.start_date),
        end_date=datetime.fromisoformat(exp_data.end_date) if exp_data.end_date else None,
        current=exp_data.current,
        description=exp_data.description
    )
    db.add(new_exp)
    db.commit()
    
    return {"message": "Experience added successfully", "id": str(new_exp.id)}

@router.post("/education")
async def add_education(
    edu_data: EducationAdd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from datetime import datetime
    
    new_edu = Education(
        user_id=current_user.id,
        degree=edu_data.degree,
        field_of_study=edu_data.field_of_study,
        institution=edu_data.institution,
        location=edu_data.location,
        start_date=datetime.fromisoformat(edu_data.start_date),
        end_date=datetime.fromisoformat(edu_data.end_date) if edu_data.end_date else None,
        current=edu_data.current,
        description=edu_data.description
    )
    db.add(new_edu)
    db.commit()
    
    return {"message": "Education added successfully", "id": str(new_edu.id)}