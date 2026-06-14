# backend/seed_jobs.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.job import Job
from app.models.company import Company
from datetime import datetime, timedelta
import uuid

def seed_jobs():
    db = SessionLocal()
    
    # Create a sample company
    company = Company(
        id=uuid.uuid4(),
        name="TechCorp Solutions",
        slug="techcorp-solutions",
        description="Leading technology company specializing in software development and cloud solutions.",
        website="https://techcorp.com",
        industry="Technology",
        size="201-500",
        headquarters="San Francisco, CA",
        rating=4.5
    )
    db.add(company)
    db.commit()
    
    # Sample jobs
    jobs = [
        {
            "title": "Senior Frontend Developer",
            "company_name": "TechCorp Solutions",
            "description": "We are looking for a Senior Frontend Developer to join our team. You will be responsible for building modern web applications using React, TypeScript, and Tailwind CSS.",
            "requirements": "5+ years of React experience\nStrong TypeScript skills\nExperience with state management\nGood communication skills",
            "responsibilities": "Build responsive web applications\nCollaborate with backend teams\nMentor junior developers\nWrite clean, maintainable code",
            "location": "San Francisco, CA",
            "country": "USA",
            "salary_min": 120000,
            "salary_max": 160000,
            "salary_currency": "USD",
            "salary_period": "yearly",
            "job_type": "full-time",
            "experience_level": "senior",
            "industry": "Technology",
            "remote_type": "hybrid",
            "is_remote": False,
            "visa_sponsorship": True,
            "posted_date": datetime.now() - timedelta(days=2),
            "source": "direct",
            "is_active": True,
            "is_featured": True
        },
        {
            "title": "Backend Engineer",
            "company_name": "TechCorp Solutions",
            "description": "Join our backend team to build scalable APIs and microservices using Python and FastAPI.",
            "requirements": "3+ years Python experience\nExperience with FastAPI/Django\nDatabase knowledge (PostgreSQL)\nUnderstanding of REST APIs",
            "responsibilities": "Design and implement APIs\nOptimize database queries\nWrite unit tests\nDocument technical specifications",
            "location": "Remote",
            "country": "Global",
            "salary_min": 100000,
            "salary_max": 140000,
            "salary_currency": "USD",
            "salary_period": "yearly",
            "job_type": "full-time",
            "experience_level": "mid",
            "industry": "Technology",
            "remote_type": "remote",
            "is_remote": True,
            "visa_sponsorship": False,
            "posted_date": datetime.now() - timedelta(days=5),
            "source": "direct",
            "is_active": True
        },
        {
            "title": "Full Stack Developer",
            "company_name": "TechCorp Solutions",
            "description": "Looking for a Full Stack Developer proficient in React and Node.js to work on exciting projects.",
            "requirements": "React and Node.js experience\nMongoDB knowledge\nGit version control\nTeam collaboration skills",
            "responsibilities": "Develop full-stack features\nParticipate in code reviews\nTroubleshoot production issues\nWrite technical documentation",
            "location": "New York, NY",
            "country": "USA",
            "salary_min": 90000,
            "salary_max": 130000,
            "salary_currency": "USD",
            "salary_period": "yearly",
            "job_type": "full-time",
            "experience_level": "mid",
            "industry": "Technology",
            "remote_type": "onsite",
            "is_remote": False,
            "visa_sponsorship": True,
            "posted_date": datetime.now() - timedelta(days=1),
            "source": "direct",
            "is_active": True
        },
        {
            "title": "DevOps Engineer",
            "company_name": "TechCorp Solutions",
            "description": "Seeking a DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines.",
            "requirements": "AWS experience\nDocker and Kubernetes\nTerraform or CloudFormation\nCI/CD tools (Jenkins/GitHub Actions)",
            "responsibilities": "Manage cloud infrastructure\nAutomate deployment processes\nMonitor system performance\nImplement security best practices",
            "location": "Remote",
            "country": "Global",
            "salary_min": 110000,
            "salary_max": 150000,
            "salary_currency": "USD",
            "salary_period": "yearly",
            "job_type": "full-time",
            "experience_level": "senior",
            "industry": "Technology",
            "remote_type": "remote",
            "is_remote": True,
            "visa_sponsorship": False,
            "posted_date": datetime.now() - timedelta(days=3),
            "source": "direct",
            "is_active": True
        },
        {
            "title": "Product Manager",
            "company_name": "TechCorp Solutions",
            "description": "Looking for an experienced Product Manager to lead our product development efforts.",
            "requirements": "3+ years product management\nAgile methodology experience\nExcellent communication skills\nTechnical background preferred",
            "responsibilities": "Define product roadmap\nGather requirements from stakeholders\nWork with engineering teams\nTrack product metrics",
            "location": "San Francisco, CA",
            "country": "USA",
            "salary_min": 130000,
            "salary_max": 180000,
            "salary_currency": "USD",
            "salary_period": "yearly",
            "job_type": "full-time",
            "experience_level": "senior",
            "industry": "Technology",
            "remote_type": "hybrid",
            "is_remote": False,
            "visa_sponsorship": True,
            "posted_date": datetime.now() - timedelta(days=7),
            "source": "direct",
            "is_active": True
        }
    ]
    
    for job_data in jobs:
        job = Job(
            id=uuid.uuid4(),
            company_id=company.id,
            **job_data
        )
        db.add(job)
    
    db.commit()
    print(f"Added {len(jobs)} sample jobs to the database!")
    
    db.close()

if __name__ == "__main__":
    seed_jobs()