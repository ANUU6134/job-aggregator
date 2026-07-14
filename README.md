# 🚀 Job Aggregator Platform

> **An AI-powered full-stack job aggregation platform that collects opportunities from multiple job sources, intelligently matches candidates with relevant positions, and streamlines the job search process through automation, analytics, and resume management.**

<p align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react\&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript\&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite\&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi\&logoColor=white)
![Python](https://img.shields.io/badge/Python-3-3776AB?logo=python\&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql\&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-Automation-2EAD33?logo=playwright\&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?logo=redis\&logoColor=white)
![Celery](https://img.shields.io/badge/Celery-Workers-37814A?logo=celery\&logoColor=white)

</p>

---

# 🌐 Live Demo

**Frontend**

https://job-aggregator-frontend-oh8y.onrender.com

---

# 📖 Overview

Job Aggregator Platform is a modern recruitment solution designed to simplify job searching by automatically collecting listings from multiple job boards, organizing opportunities in a unified dashboard, and providing intelligent matching based on user skills and experience.

The platform combines scalable web scraping, asynchronous task processing, AI-assisted job recommendations, resume management, and interactive analytics to deliver a seamless job search experience.

---

# ✨ Features

## Intelligent Job Aggregation

* Aggregate jobs from multiple online sources
* Automated scraping using Playwright and Scrapy
* Duplicate job detection
* Scheduled scraping tasks
* Job categorization

---

## AI-Powered Matching

* Intelligent job recommendation engine
* Resume skill extraction
* Job relevance scoring
* Candidate-job matching
* Personalized recommendations

---

## Resume Management

* Upload resumes
* PDF and DOCX parsing
* Skill extraction
* Resume profile management

---

## Job Search

* Advanced search
* Company filters
* Location filters
* Experience filters
* Salary filtering
* Job type filtering
* Bookmark jobs

---

## Dashboard

* Job analytics
* Saved jobs
* Application tracking
* Job statistics
* Activity overview
* Productivity insights

---

## Authentication

* Secure user registration
* JWT authentication
* Protected routes
* Password hashing

---

## Background Processing

* Celery workers
* Redis queue
* Scheduled scraping
* Background processing
* Task retries

---

## Monitoring

* Prometheus metrics
* Logging
* Rate limiting
* Error monitoring
* Sentry integration

---

# 🛠 Technology Stack

## Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS
* React Router
* React Query
* Zustand
* React Hook Form
* Zod
* Axios
* Recharts
* Framer Motion

---

## Backend

* FastAPI
* SQLAlchemy
* PostgreSQL
* Alembic
* Redis
* Celery
* APScheduler
* JWT Authentication
* AsyncIO
* HTTPX

---

## AI & Data Processing

* Scikit-learn
* SpaCy
* NLTK
* Pandas
* NumPy

---

## Web Scraping

* Playwright
* Scrapy
* BeautifulSoup
* Requests
* LXML
* Parsel
* Fake User Agent

---

# 🏗 System Architecture

```text
                        React + TypeScript
                               │
                          React Query
                               │
                           FastAPI API
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
     Authentication      Job Services        Resume Services
          │                    │                    │
          └────────────── SQLAlchemy ORM ───────────┘
                               │
                         PostgreSQL Database
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
      Celery Workers      Redis Queue        Scheduler
                               │
                     Playwright / Scrapy Bots
                               │
                    External Job Board Sources
```

---

# 📂 Project Structure

```text
job-aggregator/

client/
│
├── src/
├── components/
├── pages/
├── hooks/
├── store/
├── services/
└── types/

server/
│
├── app/
├── api/
├── models/
├── schemas/
├── services/
├── scrapers/
├── workers/
├── scheduler/
└── main.py
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/ANUU6134/job-aggregator.git

cd job-aggregator
```

---

## Frontend

```bash
cd client

npm install

npm run dev
```

---

## Backend

Create a virtual environment.

```bash
python -m venv venv
```

Activate it.

Linux/macOS

```bash
source venv/bin/activate
```

Windows

```bash
venv\Scripts\activate
```

Install dependencies.

```bash
pip install -r requirements.txt
```

Run the API.

```bash
uvicorn main:app --reload
```

---

# ⚙ Environment Variables

```env
DATABASE_URL=postgresql://username:password@localhost/database

SECRET_KEY=your_secret_key

REDIS_URL=redis://localhost:6379

OPENAI_API_KEY=your_api_key

CLIENT_URL=http://localhost:5173
```

---

# 📊 Core Modules

* Dashboard
* Authentication
* Job Aggregation
* Resume Manager
* AI Matching
* Job Search
* Saved Jobs
* Analytics
* Administration

---

# 🔒 Security

* JWT Authentication
* Password Hashing
* Protected Endpoints
* Rate Limiting
* Input Validation
* Secure Environment Variables
* SQLAlchemy ORM
* Argon2 Password Hashing

---

# 📈 Scalability

The platform is designed with scalability in mind by incorporating:

* Background task processing
* Asynchronous APIs
* Database migrations
* Worker queues
* Scheduled scraping
* Monitoring and metrics
* Modular architecture

---

# 🚀 Deployment

Frontend

* Render

Backend

* FastAPI
* PostgreSQL
* Redis
* Celery Workers

---

# 🗺 Roadmap

Future enhancements include:

* AI-powered resume generation
* Cover letter generation
* One-click job applications
* Email notifications
* Company insights
* Interview preparation tools
* Chrome browser extension
* Mobile application
* Employer portal
* Multi-language support

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Submit a Pull Request.

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Mohammed Hussen**

Full Stack Developer • Python Developer • Automation Engineer

GitHub: https://github.com/ANUU6134

---

⭐ If you found this project useful, please consider giving it a star.
