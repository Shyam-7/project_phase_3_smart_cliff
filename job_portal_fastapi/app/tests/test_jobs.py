from fastapi.testclient import TestClient

def get_admin_auth_token(client: TestClient) -> str:
    # This is a simplified way to get an admin token for testing.
    # In a real application, you would create an admin user in the test setup.
    client.post("/api/auth/register", json={"email": "admin@example.com", "password": "adminpassword", "name": "Admin User", "role": "admin"})
    response = client.post("/api/auth/login", data={"username": "admin@example.com", "password": "adminpassword"})
    return response.json()["access_token"]

def test_create_job(client: TestClient):
    token = get_admin_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post(
        "/api/jobs/",
        headers=headers,
        json={"title": "Test Job", "company_name": "Test Company", "description": "Test Description"}
    )
    if response.status_code != 201:
        print(response.json())
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Job"

def test_get_jobs(client: TestClient):
    response = client.get("/api/jobs/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
