# backend/app/tasks/scheduler.py
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

def start_scheduler():
    """Start the background scheduler for scraping tasks"""
    
    # Schedule job scraping every 6 hours
    @scheduler.scheduled_job(IntervalTrigger(hours=6))
    def scrape_jobs():
        logger.info("Starting scheduled job scraping...")
        try:
            from ..core.database import SessionLocal
            from ..services.real_scraper_service import RealJobScraperService
            import asyncio
            
            db = SessionLocal()
            scraper = RealJobScraperService(db)
            
            asyncio.run(scraper.run_all_scrapers())
            
            db.close()
            logger.info("Scheduled scraping completed")
        except Exception as e:
            logger.error(f"Scheduled scraping failed: {str(e)}")
    
    # Clean old jobs daily at midnight
    @scheduler.scheduled_job(CronTrigger(hour=0, minute=0))
    def clean_old_jobs():
        logger.info("Cleaning old jobs...")
        try:
            from ..core.database import SessionLocal
            from ..models.job import Job
            
            db = SessionLocal()
            cutoff_date = datetime.now() - timedelta(days=30)
            
            old_jobs = db.query(Job).filter(
                Job.posted_date < cutoff_date,
                Job.is_active == True
            ).all()
            
            for job in old_jobs:
                job.is_active = False
            
            db.commit()
            db.close()
            
            logger.info(f"Deactivated {len(old_jobs)} old jobs")
        except Exception as e:
            logger.error(f"Job cleanup failed: {str(e)}")
    
    # Send daily job alerts at 8 AM
    @scheduler.scheduled_job(CronTrigger(hour=8, minute=0))
    def send_daily_alerts():
        logger.info("Sending daily job alerts...")
        try:
            from ..core.database import SessionLocal
            from ..services.email_service import EmailService
            from ..models.job import Job
            from ..models.job_alert import JobAlert  # Fixed import
            from ..models.user import User
            import asyncio
            
            db = SessionLocal()
            
            # Get all active job alerts
            alerts = db.query(JobAlert).filter(JobAlert.is_active == True).all()
            
            for alert in alerts:
                # Find matching jobs
                query = db.query(Job).filter(Job.is_active == True)
                if alert.keywords:
                    query = query.filter(Job.title.ilike(f"%{alert.keywords}%"))
                if alert.location:
                    query = query.filter(Job.location.ilike(f"%{alert.location}%"))
                
                jobs = query.limit(20).all()
                
                if jobs and alert.user_id:
                    # Get user email
                    user = db.query(User).filter(User.id == alert.user_id).first()
                    if user and user.email:
                        job_list = [{
                            'title': job.title,
                            'company': job.company_name,
                            'location': job.location,
                            'description': job.description
                        } for job in jobs]
                        
                        asyncio.run(EmailService.send_job_alert(user.email, job_list, 'daily'))
                        alert.last_sent_at = datetime.now()
            
            db.commit()
            db.close()
            logger.info(f"Sent alerts to {len(alerts)} users")
        except Exception as e:
            logger.error(f"Alert sending failed: {str(e)}")
    
    scheduler.start()
    logger.info("Scheduler started")

def stop_scheduler():
    """Stop the background scheduler"""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Scheduler stopped")