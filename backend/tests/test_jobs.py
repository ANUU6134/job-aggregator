# tests/test_jobs.py
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_search_jobs():
    response = client.get("/api/v1/jobs/search?keyword=python&page=1&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "jobs" in data
    assert "total" in data
    assert "page" in data

def test_get_job_details():
    response = client.get("/api/v1/jobs/123e4567-e89b-12d3-a456-426614174000")
    assert response.status_code in [200, 404]

def test_apply_to_job_unauthorized():
    response = client.post("/api/v1/applications/apply", json={"job_id": "test-id"})
    assert response.status_code == 401