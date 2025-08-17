from fastapi.testclient import TestClient
from app.db.schemas.user.user_schema import User

def get_auth_token(client: TestClient) -> str:
    client.post("/api/auth/register", json={"email": "test@example.com", "password": "testpassword", "name": "Test User"})
    response = client.post("/api/auth/login", data={"username": "test@example.com", "password": "testpassword"})
    return response.json()["access_token"]

def test_get_user_profile(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/users/profile", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"

def test_update_user_profile(client: TestClient):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    response = client.put("/api/users/profile", headers=headers, json={"name": "New Name"})
    if response.status_code != 200:
        print(response.json())
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "New Name"
