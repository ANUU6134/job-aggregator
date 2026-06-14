# backend/app/services/salary_scraper_service.py
import aiohttp
import asyncio
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
import re
import json
from fake_useragent import UserAgent

logger = logging.getLogger(__name__)

class SalaryScraperService:
    def __init__(self):
        self.ua = UserAgent()
    
    async def scrape_salary_data(self, job_title: str, location: str = "") -> Dict[str, Any]:
        """Scrape live salary data from multiple sources"""
        
        # Run all scrapers concurrently
        tasks = [
            self.scrape_glassdoor(job_title, location),
            self.scrape_indeed(job_title, location),
            self.scrape_salarycom(job_title, location),
            self.scrape_payscale(job_title, location),
            self.scrape_levels(job_title),
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Collect all salary data
        all_salaries = []
        sources_data = []
        
        for result in results:
            if isinstance(result, dict) and not isinstance(result, Exception):
                if result.get('salaries'):
                    all_salaries.extend(result['salaries'])
                    sources_data.append(result)
                elif result.get('average'):
                    all_salaries.append(result['average'])
                    sources_data.append(result)
        
        if not all_salaries:
            # Return estimated data based on industry standards
            return self.get_estimated_salary(job_title, location)
        
        # Calculate statistics
        avg_salary = sum(all_salaries) / len(all_salaries)
        median_salary = sorted(all_salaries)[len(all_salaries) // 2]
        
        return {
            "jobTitle": job_title,
            "location": location if location else "United States (National)",
            "average": round(avg_salary, 2),
            "median": round(median_salary, 2),
            "range": {
                "min": round(min(all_salaries), 2),
                "max": round(max(all_salaries), 2),
                "currency": "USD"
            },
            "sources": sources_data,
            "totalSources": len(sources_data),
            "timestamp": datetime.now().isoformat()
        }
    
    async def scrape_glassdoor(self, job_title: str, location: str) -> Dict[str, Any]:
        """Scrape salary data from Glassdoor"""
        try:
            # Format URL
            search_term = f"{job_title} salary {location}".replace(" ", "-")
            url = f"https://www.glassdoor.com/Salaries/{search_term}-salaries-EI_IE.htm"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers={'User-Agent': self.ua.random}, timeout=10) as response:
                    if response.status == 200:
                        html = await response.text()
                        
                        # Look for salary patterns
                        salary_pattern = r'\$(\d{1,3}(?:,\d{3})*)\s*-\s*\$(\d{1,3}(?:,\d{3})*)'
                        match = re.search(salary_pattern, html)
                        
                        if match:
                            min_salary = int(match.group(1).replace(',', ''))
                            max_salary = int(match.group(2).replace(',', ''))
                            avg = (min_salary + max_salary) / 2
                            
                            return {
                                "source": "Glassdoor",
                                "average": avg,
                                "range": {"min": min_salary, "max": max_salary},
                                "salaries": [avg]
                            }
        except Exception as e:
            logger.error(f"Glassdoor scraping error: {e}")
        
        return {"source": "Glassdoor", "salaries": []}
    
    async def scrape_indeed(self, job_title: str, location: str) -> Dict[str, Any]:
        """Scrape salary data from Indeed"""
        try:
            search_term = f"{job_title} salary {location}"
            url = f"https://www.indeed.com/salaries/{search_term.replace(' ', '-')}-Salaries"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers={'User-Agent': self.ua.random}, timeout=10) as response:
                    if response.status == 200:
                        html = await response.text()
                        
                        # Find salary range
                        salary_match = re.search(r'\$(\d{1,3}(?:,\d{3})*)\s*-\s*\$(\d{1,3}(?:,\d{3})*)', html)
                        if salary_match:
                            min_salary = int(salary_match.group(1).replace(',', ''))
                            max_salary = int(salary_match.group(2).replace(',', ''))
                            avg = (min_salary + max_salary) / 2
                            
                            return {
                                "source": "Indeed",
                                "average": avg,
                                "range": {"min": min_salary, "max": max_salary},
                                "salaries": [avg]
                            }
        except Exception as e:
            logger.error(f"Indeed scraping error: {e}")
        
        return {"source": "Indeed", "salaries": []}
    
    async def scrape_salarycom(self, job_title: str, location: str) -> Dict[str, Any]:
        """Scrape salary data from Salary.com"""
        try:
            search_term = f"{job_title} salary {location}"
            url = f"https://www.salary.com/research/salary/listing/{search_term.replace(' ', '-')}"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers={'User-Agent': self.ua.random}, timeout=10) as response:
                    if response.status == 200:
                        html = await response.text()
                        
                        # Extract salary information
                        numbers = re.findall(r'\$(\d{1,3}(?:,\d{3})*)', html)
                        if len(numbers) >= 2:
                            min_salary = int(numbers[0].replace(',', ''))
                            max_salary = int(numbers[1].replace(',', ''))
                            avg = (min_salary + max_salary) / 2
                            
                            return {
                                "source": "Salary.com",
                                "average": avg,
                                "range": {"min": min_salary, "max": max_salary},
                                "salaries": [avg]
                            }
        except Exception as e:
            logger.error(f"Salary.com scraping error: {e}")
        
        return {"source": "Salary.com", "salaries": []}
    
    async def scrape_payscale(self, job_title: str, location: str) -> Dict[str, Any]:
        """Scrape salary data from PayScale"""
        try:
            search_term = f"{job_title} salary {location}"
            url = f"https://www.payscale.com/research/US/Job={search_term.replace(' ', '_')}/Salary"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers={'User-Agent': self.ua.random}, timeout=10) as response:
                    if response.status == 200:
                        html = await response.text()
                        
                        # Find salary figure
                        salary_match = re.search(r'\$(\d{1,3}(?:,\d{3})*)', html)
                        if salary_match:
                            salary = int(salary_match.group(1).replace(',', ''))
                            
                            return {
                                "source": "PayScale",
                                "average": salary,
                                "range": {"min": salary * 0.8, "max": salary * 1.2},
                                "salaries": [salary]
                            }
        except Exception as e:
            logger.error(f"PayScale scraping error: {e}")
        
        return {"source": "PayScale", "salaries": []}
    
    async def scrape_levels(self, job_title: str) -> Dict[str, Any]:
        """Scrape salary data from Levels.fyi"""
        try:
            search_term = job_title.lower().replace(" ", "-")
            url = f"https://www.levels.fyi/companies/{search_term}/salaries"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers={'User-Agent': self.ua.random}, timeout=10) as response:
                    if response.status == 200:
                        html = await response.text()
                        
                        # Find salary numbers
                        salary_matches = re.findall(r'\$(\d{1,3}(?:,\d{3})*)', html)
                        salaries = [int(s.replace(',', '')) for s in salary_matches[:10]]
                        
                        if salaries:
                            avg = sum(salaries) / len(salaries)
                            
                            return {
                                "source": "Levels.fyi",
                                "average": avg,
                                "range": {"min": min(salaries), "max": max(salaries)},
                                "salaries": salaries
                            }
        except Exception as e:
            logger.error(f"Levels.fyi scraping error: {e}")
        
        return {"source": "Levels.fyi", "salaries": []}
    
    def get_estimated_salary(self, job_title: str, location: str) -> Dict[str, Any]:
        """Provide estimated salary data based on job title patterns"""
        
        # Base salary mapping by role type
        salary_map = {
            "software engineer": 120000,
            "frontend developer": 110000,
            "backend developer": 115000,
            "full stack": 118000,
            "data scientist": 125000,
            "devops": 130000,
            "product manager": 135000,
            "project manager": 105000,
            "ux designer": 100000,
            "qa engineer": 90000,
            "sales": 85000,
            "marketing": 80000,
            "hr": 75000,
        }
        
        # Find matching role
        base_salary = 85000  # Default
        job_lower = job_title.lower()
        
        for role, salary in salary_map.items():
            if role in job_lower:
                base_salary = salary
                break
        
        # Location adjustment
        location_adjustment = {
            "san francisco": 1.4,
            "new york": 1.35,
            "seattle": 1.3,
            "los angeles": 1.25,
            "boston": 1.2,
            "austin": 1.15,
            "chicago": 1.1,
            "denver": 1.05,
        }
        
        multiplier = 1.0
        loc_lower = location.lower()
        for loc, adj in location_adjustment.items():
            if loc in loc_lower:
                multiplier = adj
                break
        
        adjusted_salary = base_salary * multiplier
        
        return {
            "jobTitle": job_title,
            "location": location if location else "United States (Estimated)",
            "average": round(adjusted_salary, 2),
            "median": round(adjusted_salary * 0.95, 2),
            "range": {
                "min": round(adjusted_salary * 0.8, 2),
                "max": round(adjusted_salary * 1.3, 2),
                "currency": "USD"
            },
            "isEstimated": True,
            "message": "Based on industry standards and location adjustment"
        }
    
    async def get_salary_trends(self, job_title: str, location: str) -> List[Dict[str, Any]]:
        """Get salary trends over time"""
        
        # Get current salary data
        current_data = await self.scrape_salary_data(job_title, location)
        
        if not current_data.get('average'):
            return []
        
        # Generate historical trend data (simulated based on market trends)
        trend_data = []
        base_salary = current_data['average']
        
        # Generate data for last 12 months
        today = datetime.now()
        
        for i in range(11, -1, -1):  # Go from 11 months ago to now
            # Calculate date
            target_date = today - timedelta(days=30 * i)
            
            # Simulate salary growth over time (slight upward trend)
            # Starting lower 12 months ago, gradually increasing to current
            progress = (11 - i) / 11  # 0 to 1
            salary = base_salary * (0.85 + (0.15 * progress))
            
            trend_data.append({
                "date": target_date.strftime("%Y-%m"),
                "salary": round(salary, 2),
                "count": 100  # Simulated sample size
            })
        
        return trend_data