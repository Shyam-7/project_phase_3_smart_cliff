import pytest
from fastapi.testclient import TestClient
from fastapi_backend.app.main import app
from fastapi_backend.app.database import get_db
from unittest.mock import MagicMock, patch

# Mock database connection
@pytest.fixture
def db_session_mock():
    db = MagicMock()
    cursor = db.cursor.return_value

    # Mock for get_all_jobs
    cursor.fetchall.return_value = [
        {
            "id": 1, "title": "Test Job", "company_name": "Test Company", "location": "Test Location",
            "employment_type": "Full-time", "category": "IT", "created_at": "2023-01-01T12:00:00",
            "status": "active", "salary_min": 5000000, "salary_max": 7000000
        }
    ]

    # Mock for get_job_by_id
    cursor.fetchone.return_value = {
        "id": 1, "title": "Test Job", "company_name": "Test Company", "location": "Test Location",
        "employment_type": "Full-time", "category": "IT", "created_at": "2023-01-01T12:00:00",
        "status": "active", "salary_min": 5000000, "salary_max": 7000000
    }

    return db

client = TestClient(app)

def get_db_override():
    db = MagicMock()
    cursor = db.cursor.return_value
    cursor.fetchall.return_value = []
    cursor.fetchone.return_value = None
    try:
        yield db
    finally:
        pass

app.dependency_overrides[get_db] = get_db_override

def test_read_jobs():
    with patch("fastapi_backend.app.services.job_service.get_all_jobs") as mock_get_all:
        mock_get_all.return_value = [
            {
                "id": 1, "title": "Test Job", "company": "Test Co", "company_name": "Test Co",
                "location": "Test Location", "salaryRange": "50-70 LPA", "postedDate": "2023-01-01T00:00:00",
                "created_at": "2023-01-01T00:00:00", "employment_type": "Full-time", "category": "IT",
                "status": "active", "logoText": "T", "color": "#ffffff"
            }
        ]
        response = client.get("/api/jobs")
        assert response.status_code == 200
        assert len(response.json()) > 0
        assert response.json()[0]["title"] == "Test Job"

def test_read_job():
    with patch("fastapi_backend.app.services.job_service.get_job_by_id") as mock_get_job:
        mock_get_job.return_value = {
            "id": 1, "title": "Test Job", "company": "Test Co", "company_name": "Test Co",
            "location": "Test Location", "salaryRange": "50-70 LPA", "postedDate": "2023-01-01T00:00:00",
            "created_at": "2023-01-01T00:00:00", "employment_type": "Full-time", "category": "IT",
            "status": "active", "logoText": "T", "color": "#ffffff"
        }
        response = client.get("/api/jobs/1")
        assert response.status_code == 200
        assert response.json()["title"] == "Test Job"

def test_read_job_not_found():
    with patch("fastapi_backend.app.services.job_service.get_job_by_id") as mock_get_job:
        mock_get_job.return_value = None
        response = client.get("/api/jobs/999")
        assert response.status_code == 404
        assert response.json() == {"detail": "Job not found"}

# To run tests, use the following command in the terminal:
# pytest
