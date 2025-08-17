# Job Portal - FastAPI Backend

This is the FastAPI backend for the Job Portal application.

## Setup

### Prerequisites

- Python 3.8+
- A MySQL database

### 1. Create a virtual environment

It is recommended to use a virtual environment to manage the dependencies for this project.

```bash
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
```

### 2. Install dependencies

Install the required Python libraries from the `requirements.txt` file.

```bash
pip install -r requirements.txt
```

### 3. Configure the environment

Create a `.env` file in the `fastapi_backend` directory by copying the `.env.example` file (if it exists) or by creating a new one.
The `.env` file should contain the following variables:

```
# .env

# Database settings
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_PORT=3306

# JWT settings
SECRET_KEY=your_super_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Replace the placeholder values with your actual database credentials and a secure secret key.

## Running the application

To run the application, use `uvicorn`. The application instance is in `fastapi_backend/app/main.py`.

From the root of the repository, run:

```bash
uvicorn fastapi_backend.app.main:app --reload
```

The application will be available at `http://127.0.0.1:8000`.

You can access the API documentation at `http://127.0.0.1:8000/docs`.
