from typing import List, Dict, Any
from datetime import datetime, timedelta
import asyncio
import aiohttp
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
import logging
from sqlalchemy.orm import Session
from tenacity import retry, stop_after_attempt, wait_exponential

from ..models.job import Job
from ..models.company import Company
from ..models.scraping_log import ScrapingLog
from ..core.config import settings

logger = logging.getLogger(__name__)

class JobScraperService:
    def __init__(self, db: Session):
        self.db = db
        self.ua = UserAgent()
        self.sources = [
            'linkedin',
            'indeed', 
            'glassdoor',
            'remoteok',
            'weworkremotely'
        ]
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def scrape_source(self, source: str) -> List[Dict[str, Any]]:
        """Scrape jobs from a specific source"""
        try:
            headers = {'User-Agent': self.ua.random}
            
            # This would contain specific scraping logic for each source
            # For demo purposes, returning sample data
            if source == 'remoteok':
                jobs = await self._scrape_remoteok(headers)
            elif source == 'weworkremotely':
                jobs = await self._scrape_weworkremotely(headers)
            else:
                jobs = await self._scrape_generic(source, headers)
            
            return jobs
            
        except Exception as e:
            logger.error(f"Error scraping {source}: {str(e)}")
            return []
    
    async def _scrape_remoteok(self, headers: Dict) -> List[Dict[str, Any]]:
        """Scrape RemoteOK jobs"""
        url = "https://remoteok.com/api"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    jobs = []
                    for item in data[:50]:  # Limit to 50 jobs
                        job = {
                            'external_id': str(item.get('id')),
                            'title': item.get('position'),
                            'company_name': item.get('company'),
                            'description': item.get('description'),
                            'location': 'Remote',
                            'country': 'Global',
                            'is_remote': True,
                            'remote_type': 'remote',
                            'source': 'remoteok',
                            'source_url': item.get('url'),
                            'posted_date': datetime.fromisoformat(item.get('date').replace(' UTC', ''))
                        }
                        jobs.append(job)
                    return jobs
        return []
    
    async def _scrape_weworkremotely(self, headers: Dict) -> List[Dict[str, Any]]:
        """Scrape WeWorkRemotely jobs"""
        url = "https://weworkremotely.com/categories/remote-development-jobs"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    jobs = []
                    
                    for listing in soup.select('li.job')[:50]:
                        title_elem = listing.select_one('.title')
                        company_elem = listing.select_one('.company')
                        
                        if title_elem and company_elem:
                            job = {
                                'title': title_elem.text.strip(),
                                'company_name': company_elem.text.strip(),
                                'location': 'Remote',
                                'country': 'Global',
                                'is_remote': True,
                                'remote_type': 'remote',
                                'source': 'weworkremotely',
                                'source_url': f"https://weworkremotely.com{listing.select_one('a')['href']}",
                                'posted_date': datetime.now()
                            }
                            jobs.append(job)
                    
                    return jobs
        return []
    
    async def _scrape_generic(self, source: str, headers: Dict) -> List[Dict[str, Any]]:
        """Generic scraper for other sources"""
        # This would be implemented for each source
        return []
    
    async def run_all_scrapers(self):
        """Run all scrapers and store results"""
        start_time = datetime.now()
        
        for source in self.sources:
            log_entry = ScrapingLog(
                source=source,
                started_at=start_time,
                status='running'
            )
            self.db.add(log_entry)
            self.db.commit()
            
            try:
                jobs_data = await self.scrape_source(source)
                
                # Process and store jobs
                jobs_added = 0
                jobs_updated = 0
                
                for job_data in jobs_data:
                    existing = self.db.query(Job).filter(
                        Job.external_id == job_data.get('external_id'),
                        Job.source == source
                    ).first()
                    
                    if existing:
                        # Update existing job
                        for key, value in job_data.items():
                            setattr(existing, key, value)
                        jobs_updated += 1
                    else:
                        # Create new job
                        new_job = Job(**job_data)
                        self.db.add(new_job)
                        jobs_added += 1
                
                # Update log
                log_entry.status = 'completed'
                log_entry.jobs_found = len(jobs_data)
                log_entry.jobs_added = jobs_added
                log_entry.jobs_updated = jobs_updated
                log_entry.finished_at = datetime.now()
                self.db.commit()
                
                logger.info(f"Scraped {source}: {jobs_added} new, {jobs_updated} updated")
                
            except Exception as e:
                log_entry.status = 'failed'
                log_entry.error_message = str(e)
                log_entry.finished_at = datetime.now()
                self.db.commit()
                logger.error(f"Failed to scrape {source}: {str(e)}")
        
        # Clean old jobs
        self._clean_old_jobs()
    
    def _clean_old_jobs(self):
        """Deactivate jobs older than 30 days"""
        cutoff_date = datetime.now() - timedelta(days=30)
        old_jobs = self.db.query(Job).filter(
            Job.posted_date < cutoff_date,
            Job.is_active == True
        ).all()
        
        for job in old_jobs:
            job.is_active = False
        
        self.db.commit()
        logger.info(f"Deactivated {len(old_jobs)} old jobs")