from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from datetime import datetime
from ..models.job import Job
from ..models.user import User, UserSkill, WorkExperience

class AIJobMatcher:
    def __init__(self, db: Session):
        self.db = db
    
    def calculate_match_score(self, user: User, job: Job) -> float:
        """Calculate AI match score between user and job"""
        scores = []
        weights = {
            'skills': 0.4,
            'experience': 0.3,
            'location': 0.1,
            'job_type': 0.1,
            'salary': 0.1
        }
        
        # Skills match
        user_skills = [skill.skill_name.lower() for skill in user.skills]
        job_skills = [skill.lower() for skill in job.skills] if hasattr(job, 'skills') else []
        
        if user_skills and job_skills:
            skill_match = len(set(user_skills) & set(job_skills)) / len(set(job_skills))
            scores.append(('skills', skill_match))
        
        # Experience match
        user_experience_years = self._calculate_total_experience(user)
        job_experience_required = self._parse_experience_requirement(job)
        
        if job_experience_required:
            exp_match = min(1.0, user_experience_years / job_experience_required)
            scores.append(('experience', exp_match))
        
        # Location match
        if user.profile and user.profile.remote_preference:
            location_match = 1.0 if job.is_remote or user.profile.remote_preference == 'any' else 0.5
            scores.append(('location', location_match))
        
        # Job type match
        if user.profile and user.profile.preferred_job_types:
            job_type_match = 1.0 if job.job_type in user.profile.preferred_job_types else 0.3
            scores.append(('job_type', job_type_match))
        
        # Calculate weighted score
        total_score = sum(weights[key] * score for key, score in scores if key in weights)
        
        return round(total_score * 100, 1)
    
    def get_missing_skills(self, user: User, job: Job) -> List[str]:
        """Get skills that user is missing for a job"""
        user_skills = set([skill.skill_name.lower() for skill in user.skills])
        job_skills = set([skill.lower() for skill in job.skills]) if hasattr(job, 'skills') else set()
        
        return list(job_skills - user_skills)
    
    def get_skill_recommendations(self, user: User, limit: int = 5) -> List[Dict[str, Any]]:
        """Get personalized skill recommendations based on market trends"""
        # This would integrate with market data to suggest in-demand skills
        recommendations = []
        
        # Analyze saved jobs and applications
        saved_job_skills = self._extract_skills_from_jobs(user.saved_jobs)
        
        # Count skill frequencies
        from collections import Counter
        skill_counts = Counter(saved_job_skills)
        
        # Get top missing skills
        for skill, count in skill_counts.most_common(limit):
            recommendations.append({
                'skill': skill,
                'importance': min(100, count * 20),
                'reason': 'Appears in jobs you\'re interested in'
            })
        
        return recommendations
    
    def _calculate_total_experience(self, user: User) -> float:
        """Calculate total years of experience from work history"""
        total_years = 0.0
        for exp in user.experience:
            if exp.end_date:
                years = (exp.end_date - exp.start_date).days / 365.25
            else:
                years = (datetime.now() - exp.start_date).days / 365.25
            total_years += years
        return total_years
    
    def _parse_experience_requirement(self, job: Job) -> float:
        """Parse years of experience from job requirements"""
        # This would extract experience requirements from job description
        # For now, return default based on experience level
        level_map = {
            'entry': 0,
            'mid': 3,
            'senior': 5,
            'lead': 8,
            'executive': 10
        }
        return level_map.get(job.experience_level, 0)
    
    def _extract_skills_from_jobs(self, saved_jobs) -> List[str]:
        """Extract skills from saved jobs"""
        skills = []
        for saved in saved_jobs:
            if hasattr(saved.job, 'skills'):
                skills.extend(saved.job.skills)
        return skills