import mysql.connector
from mysql.connector import pooling
from .config import settings

try:
    db_pool = pooling.MySQLConnectionPool(
        pool_name="job_portal_pool",
        pool_size=5,
        host=settings.DB_HOST,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
        database=settings.DB_NAME,
        port=settings.DB_PORT
    )
    print("Database connection pool created successfully.")

except mysql.connector.Error as err:
    print(f"Error creating database connection pool: {err}")
    exit(1)

def get_db_connection():
    try:
        connection = db_pool.get_connection()
        if connection.is_connected():
            return connection
    except mysql.connector.Error as err:
        print(f"Error getting database connection: {err}")
        return None

def get_db():
    db = get_db_connection()
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection could not be established.")
    try:
        yield db
    finally:
        db.close()
