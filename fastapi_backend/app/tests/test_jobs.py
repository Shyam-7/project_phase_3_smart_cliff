from fastapi.testclient import TestClient
from ..main import app
from ..database import get_db
import pytest
from unittest.mock import MagicMock, patch

client = TestClient(app)

# Mock database connection
@pytest.fixture
def db_session():
    db = MagicMock()
    yield db

def override_get_db():
    try:
        db = MagicMock()
        yield db
    finally:
        pass

app.dependency_overrides[get_db] = override_get_db

def test_read_jobs():
    with patch("fastapi_backend.app.services.job_service.get_all_jobs") as mock_get_all_jobs:
        mock_get_all_jobs.return_value = [
            {
                "id": 1,
                "title": "Test Job",
                "company": "Test Company",
                "location": "Test Location",
                "description": "Test Description",
            }
        ]
        response = client.get("/api/jobs")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

def test_read_job():
    with patch("fastapi_backend.app.services.job_service.get_job_by_id") as mock_get_job_by_id:
        mock_get_job_by_id.return_value = {
            "id": 1,
            "title": "Test Job",
            "company": "Test Company",
            "location": "Test Location",
            "description": "Test Description",
        }
        response = client.get("/api/jobs/1")
        assert response.status_code == 200
        assert response.json()["id"] == 1

def test_read_all_jobs_for_admin_unauthenticated():
    response = client.get("/api/jobs/admin/all")
    assert response.status_code == 401 # Unauthorized

def get_admin_token():
    response = client.post(
        "/token",
        data={"username": "admin", "password": "adminpassword"},
    )
    return response.json()["access_token"]

def test_read_all_jobs_for_admin_authenticated():
    token = get_admin_token()
    with patch("fastapi_backend.app.services.job_service.get_all_jobs_for_admin") as mock_get_all_jobs_for_admin:
        mock_get_all_jobs_for_admin.return_value = []
        response = client.get(
            "/api/jobs/admin/all",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)

def test_create_new_job_as_admin():
    token = get_admin_token()
    job_data = {
        "title": "New Test Job",
        "company_name": "New Test Company",
        "location": "New Test Location",
        "employment_type": "Full-time",
        "category": "Testing",
    }
    with patch("fastapi_backend.app.services.job_service.create_job") as mock_create_job:
        mock_create_job.return_value = {
            "id": 2,
            **job_data
        }
        response = client.post(
            "/api/jobs/",
            headers={"Authorization": f"Bearer {token}"},
            json=job_data,
        )
        assert response.status_code == 201
        assert response.json()["title"] == "New Test Job"
