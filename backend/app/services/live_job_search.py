# backend/app/services/live_job_search.py
import aiohttp
import asyncio
from bs4 import BeautifulSoup
from typing import List, Dict, Any
from datetime import datetime
import logging
from fake_useragent import UserAgent
import re
from concurrent.futures import ThreadPoolExecutor
import json

logger = logging.getLogger(__name__)

class LiveJobSearchService:
    def __init__(self):
        self.ua = UserAgent()
        self.executor = ThreadPoolExecutor(max_workers=10)
    
    async def search_jobs_live(self, keyword: str = "", location: str = "", page: int = 1, limit: int = 20) -> List[Dict[str, Any]]:
        """Search for jobs live from multiple sources"""
        tasks = []
        
        # Add all scrapers
        tasks.append(self.search_remoteok(keyword))
        tasks.append(self.search_weworkremotely(keyword))
        tasks.append(self.search_remotive(keyword))
        tasks.append(self.search_stackoverflow(keyword, location))
        tasks.append(self.search_github(keyword, location))
        
        # Run all searches concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Combine all jobs
        all_jobs = []
        for result in results:
            if isinstance(result, list):
                all_jobs.extend(result)
        
        # Remove duplicates by title and company
        unique_jobs = {}
        for job in all_jobs:
            key = f"{job['title'].lower()}_{job['company_name'].lower()}"
            if key not in unique_jobs:
                unique_jobs[key] = job
        
        # Sort by relevance (keyword match) and date
        sorted_jobs = list(unique_jobs.values())
        if keyword:
            sorted_jobs.sort(key=lambda x: self._relevance_score(x, keyword), reverse=True)
        else:
            sorted_jobs.sort(key=lambda x: x.get('posted_date', datetime.now()), reverse=True)
        
        # Paginate
        start = (page - 1) * limit
        end = start + limit
        
        return {
            "jobs": sorted_jobs[start:end],
            "total": len(sorted_jobs),
            "page": page,
            "pages": (len(sorted_jobs) + limit - 1) // limit
        }
    
    def _relevance_score(self, job: Dict, keyword: str) -> int:
        """Calculate relevance score based on keyword matching"""
        if not keyword:
            return 0
        
        keyword_lower = keyword.lower()
        title_lower = job.get('title', '').lower()
        desc_lower = job.get('description', '').lower()
        
        score = 0
        if keyword_lower in title_lower:
            score += 10
        if keyword_lower in desc_lower:
            score += 3
        
        # Bonus for exact matches
        if title_lower == keyword_lower:
            score += 20
        
        return score
    
    async def search_remoteok(self, keyword: str = "") -> List[Dict[str, Any]]:
        """Search RemoteOK for jobs"""
        jobs = []
        url = "https://remoteok.com/api"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers={'User-Agent': self.ua.random}, timeout=15) as response:
                    if response.status == 200:
                        data = await response.json()
                        for item in data:
                            if isinstance(item, dict) and item.get('position'):
                                title = item.get('position', '')
                                description = item.get('description', '')
                                
                                # Filter by keyword
                                if keyword and keyword.lower() not in title.lower() and keyword.lower() not in description.lower():
                                    continue
                                
                                job = {
                                    'id': str(item.get('id')),
                                    'title': title,
                                    'company_name': item.get('company', ''),
                                    'description': description[:1000],
                                    'location': 'Remote',
                                    'job_type': 'full-time',
                                    'source': 'RemoteOK',
                                    'source_url': item.get('url', ''),
                                    'posted_date': datetime.now(),
                                    'is_remote': True,
                                    'salary': self._extract_salary_from_text(description)
                                }
                                jobs.append(job)
        except Exception as e:
            logger.error(f"RemoteOK search error: {e}")
        
        return jobs[:20]
    
    async def search_weworkremotely(self, keyword: str = "") -> List[Dict[str, Any]]:
        """Search WeWorkRemotely for jobs"""
        jobs = []
        url = "https://weworkremotely.com/categories/remote-development-jobs"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers={'User-Agent': self.ua.random}, timeout=15) as response:
                    if response.status == 200:
                        html = await response.text()
                        soup = BeautifulSoup(html, 'html.parser')
                        
                        for listing in soup.select('li.job')[:30]:
                            title_elem = listing.select_one('.title')
                            company_elem = listing.select_one('.company')
                            link_elem = listing.select_one('a')
                            
                            if title_elem and company_elem:
                                title = title_elem.text.strip()
                                
                                # Filter by keyword
                                if keyword and keyword.lower() not in title.lower():
                                    continue
                                
                                job = {
                                    'id': str(hash(title + company_elem.text.strip())),
                                    'title': title,
                                    'company_name': company_elem.text.strip(),
                                    'description': '',
                                    'location': 'Remote',
                                    'job_type': 'full-time',
                                    'source': 'WeWorkRemotely',
                                    'source_url': f"https://weworkremotely.com{link_elem['href']}" if link_elem else '',
                                    'posted_date': datetime.now(),
                                    'is_remote': True
                                }
                                jobs.append(job)
        except Exception as e:
            logger.error(f"WeWorkRemotely search error: {e}")
        
        return jobs[:20]
    
    async def search_remotive(self, keyword: str = "") -> List[Dict[str, Any]]:
        """Search Remotive for jobs"""
        jobs = []
        url = "https://remotive.com/api/remote-jobs"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers={'User-Agent': self.ua.random}, timeout=15) as response:
                    if response.status == 200:
                        data = await response.json()
                        for job in data.get('jobs', []):
                            title = job.get('title', '')
                            description = job.get('description', '')
                            
                            # Filter by keyword
                            if keyword and keyword.lower() not in title.lower() and keyword.lower() not in description.lower():
                                continue
                            
                            job_data = {
                                'id': str(job.get('id')),
                                'title': title,
                                'company_name': job.get('company_name', ''),
                                'description': description[:1000],
                                'location': job.get('candidate_required_location', 'Remote'),
                                'job_type': job.get('job_type', 'full-time'),
                                'source': 'Remotive',
                                'source_url': job.get('url', ''),
                                'posted_date': datetime.now(),
                                'is_remote': 'remote' in job.get('candidate_required_location', '').lower(),
                                'salary': self._extract_salary_from_text(description)
                            }
                            jobs.append(job_data)
        except Exception as e:
            logger.error(f"Remotive search error: {e}")
        
        return jobs[:20]
    
    async def search_stackoverflow(self, keyword: str = "", location: str = "") -> List[Dict[str, Any]]:
        """Search Stack Overflow Jobs"""
        jobs = []
        search_url = f"https://stackoverflow.com/jobs?q={keyword}&l={location}"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(search_url, headers={'User-Agent': self.ua.random}, timeout=15) as response:
                    if response.status == 200:
                        html = await response.text()
                        soup = BeautifulSoup(html, 'html.parser')
                        
                        for job_card in soup.select('.js-job-item')[:20]:
                            title_elem = job_card.select_one('.job-link')
                            company_elem = job_card.select_one('.fc-black-700')
                            location_elem = job_card.select_one('.fc-black-500')
                            
                            if title_elem:
                                job = {
                                    'id': str(hash(title_elem.text)),
                                    'title': title_elem.text.strip(),
                                    'company_name': company_elem.text.strip() if company_elem else '',
                                    'description': '',
                                    'location': location_elem.text.strip() if location_elem else 'Remote',
                                    'job_type': 'full-time',
                                    'source': 'StackOverflow',
                                    'source_url': f"https://stackoverflow.com{title_elem['href']}" if title_elem.get('href') else '',
                                    'posted_date': datetime.now(),
                                    'is_remote': 'remote' in str(location_elem).lower() if location_elem else False
                                }
                                jobs.append(job)
        except Exception as e:
            logger.error(f"StackOverflow search error: {e}")
        
        return jobs
    
    async def search_github(self, keyword: str = "", location: str = "") -> List[Dict[str, Any]]:
        """Search GitHub Jobs"""
        jobs = []
        url = f"https://jobs.github.com/positions.json?description={keyword}&location={location}"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers={'User-Agent': self.ua.random}, timeout=15) as response:
                    if response.status == 200:
                        data = await response.json()
                        for job in data[:20]:
                            job_data = {
                                'id': str(job.get('id')),
                                'title': job.get('title', ''),
                                'company_name': job.get('company', ''),
                                'description': job.get('description', '')[:1000],
                                'location': job.get('location', 'Remote'),
                                'job_type': 'full-time',
                                'source': 'GitHub',
                                'source_url': job.get('url', ''),
                                'posted_date': datetime.now(),
                                'is_remote': 'remote' in job.get('location', '').lower(),
                                'salary': self._extract_salary_from_text(job.get('description', ''))
                            }
                            jobs.append(job_data)
        except Exception as e:
            logger.error(f"GitHub jobs search error: {e}")
        
        return jobs
    
    def _extract_salary_from_text(self, text: str) -> Dict[str, Any]:
        """Extract salary information from text"""
        if not text:
            return None
        
        patterns = [
            r'\$(\d{2,3}(?:,\d{3})?)\s*-\s*\$(\d{2,3}(?:,\d{3})?)\s*(?:per\s*year|/year|annually)?',
            r'(\d{2,3}(?:,\d{3})?)\s*-\s*(\d{2,3}(?:,\d{3})?)\s*(?:USD|dollars)',
            r'up to\s*\$(\d{2,3}(?:,\d{3})?)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                if len(match.groups()) == 2:
                    try:
                        min_salary = int(match.group(1).replace(',', ''))
                        max_salary = int(match.group(2).replace(',', ''))
                        return {'min': min_salary, 'max': max_salary, 'currency': 'USD'}
                    except:
                        pass
                elif len(match.groups()) == 1:
                    try:
                        max_salary = int(match.group(1).replace(',', ''))
                        return {'min': max_salary * 0.8, 'max': max_salary, 'currency': 'USD'}
                    except:
                        pass
        
        return None