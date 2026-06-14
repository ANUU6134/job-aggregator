# backend/app/api/v1/endpoints/companies.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import asyncio

from ....core.database import get_db
from ....services.company_scrapper_service import CompanyScraperService
from ....models.job import Job

router = APIRouter(tags=["companies"])

@router.get("/companies")
async def get_companies(
    industry: Optional[str] = Query(None, description="Filter by industry"),
    limit: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get real companies from live sources"""
    
    scraper = CompanyScraperService()
    
    # Scrape companies from multiple sources
    companies = await scraper.search_companies(industry=industry or "", limit=limit)
    
    # Update job counts from database and ensure each company has an ID
    for company in companies:
        if 'id' not in company:
            company['id'] = scraper._generate_company_id(company['name'])
        
        job_count = db.query(Job).filter(
            Job.company_name == company['name'],
            Job.is_active == True
        ).count()
        company['openJobs'] = job_count
    
    return companies

@router.get("/companies/{company_id}")
async def get_company(
    company_id: str,
    db: Session = Depends(get_db)
):
    """Get detailed company information"""
    
    scraper = CompanyScraperService()
    companies = await scraper.search_companies(limit=100)
    
    # Find company by ID or name
    company = None
    for comp in companies:
        comp_id = comp.get('id', scraper._generate_company_id(comp['name']))
        if comp_id == company_id or comp['name'].lower() == company_id.lower():
            company = comp
            break
    
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Ensure company has an ID
    if 'id' not in company:
        company['id'] = scraper._generate_company_id(company['name'])
    
    # Get jobs for this company
    jobs = db.query(Job).filter(
        Job.company_name == company['name'],
        Job.is_active == True
    ).order_by(Job.posted_date.desc()).limit(20).all()
    
    return {
        **company,
        "jobs": [{
            "id": str(job.id),
            "title": job.title,
            "location": job.location,
            "job_type": job.job_type,
            "posted_date": job.posted_date.isoformat(),
            "salary_min": job.salary_min,
            "salary_max": job.salary_max
        } for job in jobs]
    }