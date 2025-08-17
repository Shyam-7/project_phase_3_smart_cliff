from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Correct the DATABASE_URL format if needed, especially for mysql-connector-python
# Example: "mysql+mysqlconnector://user:password@host/db"
engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
