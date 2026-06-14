# backend/app/services/real_scraper_service.py
import aiohttp
import asyncio
from bs4 import BeautifulSoup
from typing import List, Dict, Any
from datetime import datetime, timedelta
import logging
from sqlalchemy.orm import Session
from fake_useragent import UserAgent
import re
import json

from ..models.job import Job
from ..models.company import Company
from ..models.scraping_log import ScrapingLog
from ..core.config import settings

logger = logging.getLogger(__name__)

class RealJobScraperService:
    def __init__(self, db: Session):
        self.db = db
        self.ua = UserAgent()
    
    async def scrape_remoteok(self) -> List[Dict[str, Any]]:
        """Scrape real jobs from RemoteOK"""
        jobs = []
        url = "https://remoteok.com/api"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers={'User-Agent': self.ua.random}, timeout=30) as response:
                    if response.status == 200:
                        data = await response.json()
                        for item in data[:30]:  # Get 30 latest jobs
                            if isinstance(item, dict) and 'position' in item:
                                job = {
                                    'external_id': str(item.get('id')),
                                    'title': item.get('position', ''),
                                    'company_name': item.get('company', ''),
                                    'description': item.get('description', '')[:5000],
                                    'requirements': self._extract_requirements(item.get('description', '')),
                                    'location': 'Remote',
                                    'country': 'Global',
                                    'is_remote': True,
                                    'remote_type': 'remote',
                                    'source': 'remoteok',
                                    'source_url': item.get('url', ''),
                                    'posted_date': datetime.now(),
                                    'job_type': 'full-time',
                                    'salary_min': None,
                                    'salary_max': None
                                }
                                
                                # Try to extract salary
                                salary_text = item.get('salary', '')
                                if salary_text:
                                    salary_range = self._extract_salary(salary_text)
                                    if salary_range:
                                        job['salary_min'] = salary_range['min']
                                        job['salary_max'] = salary_range['max']
                                        job['salary_currency'] = salary_range['currency']
                                
                                jobs.append(job)
        except Exception as e:
            logger.error(f"RemoteOK scraping error: {e}")
        
        return jobs
    
    async def scrape_weworkremotely(self) -> List[Dict[str, Any]]:
        """Scrape real jobs from WeWorkRemotely"""
        jobs = []
        url = "https://weworkremotely.com/categories/remote-development-jobs"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers={'User-Agent': self.ua.random}, timeout=30) as response:
                    if response.status == 200:
                        html = await response.text()
                        soup = BeautifulSoup(html, 'html.parser')
                        
                        for listing in soup.select('li.job')[:30]:
                            title_elem = listing.select_one('.title')
                            company_elem = listing.select_one('.company')
                            link_elem = listing.select_one('a')
                            
                            if title_elem and company_elem:
                                job_url = f"https://weworkremotely.com{link_elem['href']}" if link_elem else ''
                                
                                # Get full description from job page
                                description = await self._get_weworkremotely_description(job_url) if job_url else ''
                                
                                job = {
                                    'title': title_elem.text.strip(),
                                    'company_name': company_elem.text.strip(),
                                    'description': description[:5000] if description else '',
                                    'requirements': self._extract_requirements(description),
                                    'location': 'Remote',
                                    'country': 'Global',
                                    'is_remote': True,
                                    'remote_type': 'remote',
                                    'source': 'weworkremotely',
                                    'source_url': job_url,
                                    'posted_date': datetime.now(),
                                    'job_type': 'full-time'
                                }
                                jobs.append(job)
        except Exception as e:
            logger.error(f"WeWorkRemotely scraping error: {e}")
        
        return jobs
    
    async def _get_weworkremotely_description(self, url: str) -> str:
        """Get full job description from WeWorkRemotely job page"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers={'User-Agent': self.ua.random}, timeout=30) as response:
                    if response.status == 200:
                        html = await response.text()
                        soup = BeautifulSoup(html, 'html.parser')
                        description_elem = soup.select_one('.listing-container')
                        if description_elem:
                            return description_elem.get_text(strip=True)
        except Exception:
            pass
        return ''
    
    async def scrape_remotive(self) -> List[Dict[str, Any]]:
        """Scrape real jobs from Remotive"""
        jobs = []
        url = "https://remotive.com/api/remote-jobs"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers={'User-Agent': self.ua.random}, timeout=30) as response:
                    if response.status == 200:
                        data = await response.json()
                        for job in data.get('jobs', [])[:30]:
                            if job.get('title'):
                                job_data = {
                                    'external_id': str(job.get('id')),
                                    'title': job.get('title', ''),
                                    'company_name': job.get('company_name', ''),
                                    'description': job.get('description', '')[:5000],
                                    'requirements': self._extract_requirements(job.get('description', '')),
                                    'location': job.get('candidate_required_location', 'Remote'),
                                    'country': 'Global',
                                    'is_remote': True,
                                    'remote_type': 'remote',
                                    'source': 'remotive',
                                    'source_url': job.get('url', ''),
                                    'posted_date': datetime.now(),
                                    'job_type': job.get('job_type', 'full-time'),
                                    'salary_min': None,
                                    'salary_max': None
                                }
                                
                                # Try to extract salary from description
                                salary_text = job.get('salary', '')
                                if salary_text:
                                    salary_range = self._extract_salary(salary_text)
                                    if salary_range:
                                        job_data['salary_min'] = salary_range['min']
                                        job_data['salary_max'] = salary_range['max']
                                        job_data['salary_currency'] = salary_range['currency']
                                
                                jobs.append(job_data)
        except Exception as e:
            logger.error(f"Remotive scraping error: {e}")
        
        return jobs
    
    async def scrape_github_jobs(self) -> List[Dict[str, Any]]:
        """Scrape real jobs from GitHub Jobs (via API)"""
        jobs = []
        url = "https://jobs.github.com/positions.json"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers={'User-Agent': self.ua.random}, timeout=30) as response:
                    if response.status == 200:
                        data = await response.json()
                        for job in data[:30]:
                            job_data = {
                                'external_id': str(job.get('id')),
                                'title': job.get('title', ''),
                                'company_name': job.get('company', ''),
                                'description': job.get('description', '')[:5000],
                                'requirements': self._extract_requirements(job.get('description', '')),
                                'location': job.get('location', 'Remote'),
                                'country': 'USA',
                                'is_remote': 'remote' in job.get('location', '').lower(),
                                'remote_type': 'remote' if 'remote' in job.get('location', '').lower() else 'onsite',
                                'source': 'github',
                                'source_url': job.get('url', ''),
                                'posted_date': datetime.now(),
                                'job_type': 'full-time'
                            }
                            jobs.append(job_data)
        except Exception as e:
            logger.error(f"github jobs scraping error: {e}")
        
        return jobs
    
    async def scrape_stackoverflow(self) -> List[Dict[str, Any]]:
        """Scrape real jobs from Stack Overflow"""
        jobs = []
        url = "https://stackoverflow.com/jobs/feed"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers={'User-Agent': self.ua.random}, timeout=30) as response:
                    if response.status == 200:
                        xml_content = await response.text()
                        soup = BeautifulSoup(xml_content, 'xml')
                        
                        for entry in soup.find_all('entry')[:30]:
                            title_elem = entry.find('title')
                            company_elem = entry.find('company')
                            location_elem = entry.find('location')
                            
                            if title_elem:
                                job = {
                                    'title': title_elem.text if title_elem else '',
                                    'company_name': company_elem.text if company_elem else '',
                                    'description': entry.find('summary').text[:5000] if entry.find('summary') else '',
                                    'requirements': '',
                                    'location': location_elem.text if location_elem else 'Remote',
                                    'country': 'Global',
                                    'is_remote': 'remote' in str(location_elem).lower() if location_elem else False,
                                    'remote_type': 'remote' if 'remote' in str(location_elem).lower() else 'onsite',
                                    'source': 'stackoverflow',
                                    'source_url': entry.find('link')['href'] if entry.find('link') else '',
                                    'posted_date': datetime.now(),
                                    'job_type': 'full-time'
                                }
                                
                                job['requirements'] = self._extract_requirements(job['description'])
                                jobs.append(job)
        except Exception as e:
            logger.error(f"StackOverflow scraping error: {e}")
        
        return jobs
    
    async def scrape_arc(self) -> List[Dict[str, Any]]:
        """Scrape real jobs from Arc.dev"""
        jobs = []
        url = "https://arc.dev/api/v1/jobs"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers={'User-Agent': self.ua.random}, timeout=30) as response:
                    if response.status == 200:
                        data = await response.json()
                        for job in data.get('jobs', [])[:30]:
                            job_data = {
                                'external_id': str(job.get('id')),
                                'title': job.get('title', ''),
                                'company_name': job.get('company', {}).get('name', ''),
                                'description': job.get('description', '')[:5000],
                                'requirements': self._extract_requirements(job.get('description', '')),
                                'location': 'Remote',
                                'country': 'Global',
                                'is_remote': True,
                                'remote_type': 'remote',
                                'source': 'arc',
                                'source_url': job.get('url', ''),
                                'posted_date': datetime.now(),
                                'job_type': 'full-time',
                                'salary_min': job.get('salary_min'),
                                'salary_max': job.get('salary_max'),
                                'salary_currency': 'USD'
                            }
                            jobs.append(job_data)
        except Exception as e:
            logger.error(f"Arc scraping error: {e}")
        
        return jobs
    
    def _extract_requirements(self, description: str) -> str:
        """Extract requirements from job description"""
        if not description:
            return ''
        
        # Look for common requirement sections
        patterns = [
            r'(?:Requirements|Qualifications|What you\'ll need)[:\s]+(.*?)(?=\n\n|\n[A-Z]|\Z)',
            r'(?:Required Skills|Skills Required)[:\s]+(.*?)(?=\n\n|\n[A-Z]|\Z)',
            r'(?:You have|You bring)[:\s]+(.*?)(?=\n\n|\n[A-Z]|\Z)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, description, re.IGNORECASE | re.DOTALL)
            if match:
                return match.group(1).strip()[:1000]
        
        # If no clear section, return first 500 chars
        return description[:500]
    
    def _extract_salary(self, text: str) -> Dict[str, Any]:
        """Extract salary information from text"""
        patterns = [
            r'\$(\d{2,3}(?:,\d{3})?)\s*-\s*\$(\d{2,3}(?:,\d{3})?)\s*(?:per\s*year|/year|annually)?',
            r'(\d{2,3}(?:,\d{3})?)\s*-\s*(\d{2,3}(?:,\d{3})?)\s*(?:USD|dollars)',
            r'up to\s*\$(\d{2,3}(?:,\d{3})?)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                if len(match.groups()) == 2:
                    min_salary = int(match.group(1).replace(',', ''))
                    max_salary = int(match.group(2).replace(',', ''))
                    return {'min': min_salary, 'max': max_salary, 'currency': 'USD'}
                elif len(match.groups()) == 1:
                    max_salary = int(match.group(1).replace(',', ''))
                    return {'min': max_salary * 0.8, 'max': max_salary, 'currency': 'USD'}
        
        return None
    
    async def run_all_scrapers(self):
        """Run all scrapers and store results"""
        start_time = datetime.now()
        sources = [
            ('remoteok', self.scrape_remoteok),
            ('weworkremotely', self.scrape_weworkremotely),
            ('remotive', self.scrape_remotive),
            ('github', self.scrape_github_jobs),
            ('stackoverflow', self.scrape_stackoverflow),
            ('arc', self.scrape_arc)
        ]
        
        total_jobs_added = 0
        total_jobs_updated = 0
        
        for source_name, scraper_func in sources:
            log_entry = ScrapingLog(
                source=source_name,
                started_at=start_time,
                status='running'
            )
            self.db.add(log_entry)
            self.db.commit()
            
            try:
                logger.info(f"Scraping {source_name}...")
                jobs_data = await scraper_func()
                
                jobs_added = 0
                jobs_updated = 0
                
                for job_data in jobs_data:
                    # Find or create company
                    company = self.db.query(Company).filter(
                        Company.name == job_data.get('company_name')
                    ).first()
                    
                    if not company and job_data.get('company_name'):
                        company = Company(
                            name=job_data['company_name'],
                            slug=job_data['company_name'].lower().replace(' ', '-'),
                            description=''
                        )
                        self.db.add(company)
                        self.db.commit()
                    
                    # Check if job exists
                    existing = self.db.query(Job).filter(
                        Job.external_id == job_data.get('external_id'),
                        Job.source == source_name
                    ).first()
                    
                    if existing:
                        # Update existing job
                        for key, value in job_data.items():
                            if key not in ['external_id', 'source']:
                                setattr(existing, key, value)
                        if company:
                            existing.company_id = company.id
                        existing.updated_at = datetime.now()
                        jobs_updated += 1
                    else:
                        # Create new job
                        new_job = Job(
                            **job_data,
                            company_id=company.id if company else None,
                            is_active=True,
                            created_at=datetime.now(),
                            posted_date=job_data.get('posted_date', datetime.now())
                        )
                        self.db.add(new_job)
                        jobs_added += 1
                
                # Update log
                log_entry.status = 'completed'
                log_entry.jobs_found = len(jobs_data)
                log_entry.jobs_added = jobs_added
                log_entry.jobs_updated = jobs_updated
                log_entry.finished_at = datetime.now()
                self.db.commit()
                
                total_jobs_added += jobs_added
                total_jobs_updated += jobs_updated
                logger.info(f"✅ {source_name}: {jobs_added} new, {jobs_updated} updated")
                
            except Exception as e:
                log_entry.status = 'failed'
                log_entry.error_message = str(e)
                log_entry.finished_at = datetime.now()
                self.db.commit()
                logger.error(f"❌ Failed to scrape {source_name}: {str(e)}")
        
        logger.info(f"🎉 Scraping complete! Total: {total_jobs_added} new, {total_jobs_updated} updated jobs")