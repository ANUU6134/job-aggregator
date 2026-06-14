# backend/run_scrapers.py
import sys
import os
import asyncio
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.services.real_scraper_service import RealJobScraperService

async def main():
    print("🚀 Starting real job scraper...")
    print("This will fetch jobs from:")
    print("  • RemoteOK")
    print("  • WeWorkRemotely")
    print("  • Remotive")
    print("  • GitHub Jobs")
    print("  • Stack Overflow")
    print("  • Arc.dev")
    print()
    
    db = SessionLocal()
    scraper = RealJobScraperService(db)
    
    await scraper.run_all_scrapers()
    
    db.close()
    print("\n✅ Scraping completed!")

if __name__ == "__main__":
    asyncio.run(main())