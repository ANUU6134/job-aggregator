# backend/app/api/v1/endpoints/salary.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import datetime, timedelta
import statistics

from ....core.database import get_db
from ....models.job import Job

router = APIRouter(prefix="/salary", tags=["salary"])

@router.get("/trends")
async def get_salary_trends(
    job_title: str = Query(..., description="Job title to analyze"),
    location: str = Query(..., description="Location to analyze"),
    db: Session = Depends(get_db)
):
    """Get real salary trends from actual job postings in the database"""
    
    # Search for jobs matching the title and location
    query = db.query(Job).filter(
        Job.is_active == True,
        Job.salary_min.isnot(None),
        Job.salary_max.isnot(None)
    )
    
    # Filter by job title (case insensitive partial match)
    if job_title:
        title_terms = job_title.lower().split()
        for term in title_terms:
            query = query.filter(
                Job.title.ilike(f"%{term}%")
            )
    
    # Filter by location
    if location and location != "Global":
        location_terms = location.lower().split()
        for term in location_terms:
            query = query.filter(
                Job.location.ilike(f"%{term}%")
            )
    
    jobs = query.all()
    
    if not jobs:
        # Return empty result with helpful message
        return []
    
    # Calculate salary statistics
    salaries = []
    for job in jobs:
        if job.salary_min and job.salary_max:
            avg_salary = (job.salary_min + job.salary_max) / 2
            salaries.append(avg_salary)
    
    if not salaries:
        return []
    
    # Calculate statistics
    avg_salary = statistics.mean(salaries)
    median_salary = statistics.median(salaries)
    min_salary = min(salaries)
    max_salary = max(salaries)
    
    # Group salaries by month for trend analysis
    salary_by_month = {}
    for job in jobs:
        if job.posted_date and job.salary_min and job.salary_max:
            month_key = job.posted_date.strftime("%Y-%m")
            avg_job_salary = (job.salary_min + job.salary_max) / 2
            if month_key not in salary_by_month:
                salary_by_month[month_key] = []
            salary_by_month[month_key].append(avg_job_salary)
    
    # Calculate monthly averages
    trend_data = []
    for month in sorted(salary_by_month.keys()):
        month_avg = statistics.mean(salary_by_month[month])
        trend_data.append({
            "date": month,
            "salary": round(month_avg, 2),
            "count": len(salary_by_month[month])
        })
    
    # Calculate year-over-year growth
    percent_change = 0
    if len(trend_data) >= 12:
        old_avg = trend_data[-12]["salary"] if len(trend_data) >= 12 else avg_salary
        percent_change = round(((avg_salary - old_avg) / old_avg) * 100, 1)
    
    # Determine trend direction
    trend = "stable"
    if len(trend_data) >= 3:
        recent = [d["salary"] for d in trend_data[-3:]]
        if recent[0] < recent[1] < recent[2]:
            trend = "increasing"
        elif recent[0] > recent[1] > recent[2]:
            trend = "decreasing"
    
    return [{
        "jobTitle": job_title,
        "location": location if location else "Global",
        "average": round(avg_salary, 2),
        "median": round(median_salary, 2),
        "range": {
            "min": round(min_salary, 2),
            "max": round(max_salary, 2),
            "currency": "USD"
        },
        "trend": trend,
        "percentChange": percent_change,
        "dataPoints": trend_data,
        "totalJobs": len(jobs)
    }]

@router.get("/by-location")
async def get_salary_by_location(
    job_title: str = Query(...),
    db: Session = Depends(get_db)
):
    """Get salary data grouped by location from real job postings"""
    
    # Get all jobs matching the title with salary data
    query = db.query(
        Job.location,
        func.avg((Job.salary_min + Job.salary_max) / 2).label('avg_salary'),
        func.count(Job.id).label('job_count')
    ).filter(
        Job.is_active == True,
        Job.salary_min.isnot(None),
        Job.salary_max.isnot(None),
        Job.location.isnot(None)
    )
    
    # Filter by job title
    if job_title:
        title_terms = job_title.lower().split()
        for term in title_terms:
            query = query.filter(Job.title.ilike(f"%{term}%"))
    
    # Group by location and order by average salary
    results = query.group_by(Job.location).having(
        func.count(Job.id) >= 3  # Only show locations with at least 3 jobs
    ).order_by(func.avg((Job.salary_min + Job.salary_max) / 2).desc()).limit(10).all()
    
    return [{
        "location": r[0],
        "averageSalary": round(r[1], 2) if r[1] else 0,
        "jobCount": r[2]
    } for r in results]

@router.get("/by-experience")
async def get_salary_by_experience(
    job_title: str = Query(...),
    db: Session = Depends(get_db)
):
    """Get salary data grouped by experience level from real job postings"""
    
    experience_levels = ['entry', 'mid', 'senior', 'lead', 'executive']
    result = []
    
    for level in experience_levels:
        jobs = db.query(Job).filter(
            Job.is_active == True,
            Job.experience_level == level,
            Job.salary_min.isnot(None),
            Job.salary_max.isnot(None)
        )
        
        # Filter by job title
        if job_title:
            title_terms = job_title.lower().split()
            for term in title_terms:
                jobs = jobs.filter(Job.title.ilike(f"%{term}%"))
        
        jobs_list = jobs.all()
        
        if jobs_list:
            salaries = [(job.salary_min + job.salary_max) / 2 for job in jobs_list]
            avg_salary = statistics.mean(salaries) if salaries else 0
            result.append({
                "level": level.capitalize(),
                "salary": round(avg_salary, 2),
                "jobCount": len(jobs_list)
            })
        else:
            # Provide estimated values based on mid-level salary
            mid_salary = None
            for r in result:
                if r["level"] == "Mid":
                    mid_salary = r["salary"]
                    break
            
            if mid_salary:
                multipliers = {
                    "Entry": 0.6,
                    "Mid": 1.0,
                    "Senior": 1.3,
                    "Lead": 1.5,
                    "Executive": 1.8
                }
                result.append({
                    "level": level.capitalize(),
                    "salary": round(mid_salary * multipliers[level.capitalize()], 2),
                    "jobCount": 0,
                    "estimated": True
                })
    
    return result

@router.get("/companies")
async def get_salary_by_company(
    job_title: str = Query(...),
    db: Session = Depends(get_db)
):
    """Get salary data grouped by company from real job postings"""
    
    results = db.query(
        Job.company_name,
        func.avg((Job.salary_min + Job.salary_max) / 2).label('avg_salary'),
        func.count(Job.id).label('job_count')
    ).filter(
        Job.is_active == True,
        Job.salary_min.isnot(None),
        Job.salary_max.isnot(None),
        Job.company_name.isnot(None)
    )
    
    # Filter by job title
    if job_title:
        title_terms = job_title.lower().split()
        for term in title_terms:
            results = results.filter(Job.title.ilike(f"%{term}%"))
    
    results = results.group_by(Job.company_name).having(
        func.count(Job.id) >= 2
    ).order_by(func.avg((Job.salary_min + Job.salary_max) / 2).desc()).limit(10).all()
    
    return [{
        "company": r[0],
        "averageSalary": round(r[1], 2) if r[1] else 0,
        "jobCount": r[2]
    } for r in results]