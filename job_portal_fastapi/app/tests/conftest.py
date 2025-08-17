import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.base import Base
from app.config import settings
import os
from app.api.deps import get_db

# Set environment to testing
os.environ['TESTING'] = 'True'

SQLALCHEMY_DATABASE_URL = settings.test_database_url

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """
    A fixture that provides a test client for the FastAPI application.
    It handles database setup and teardown for each test function.
    """
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass # The db_session fixture will handle closing

    app.dependency_overrides[get_db] = _override_get_db

    with TestClient(app) as c:
        yield c

    # Clean up dependency overrides
    app.dependency_overrides.clear()
