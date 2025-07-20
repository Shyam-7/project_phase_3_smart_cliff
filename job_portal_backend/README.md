# Job Portal Backend Setup Instructions

## Prerequisites
1. **MySQL 8.0** installed and running
2. **Node.js** (v16 or higher)
3. **npm** package manager

## Database Setup

### Step 1: Create Database
1. Open MySQL Workbench 8.0
2. Connect to your MySQL server
3. Run the `database_setup.sql` script to create tables and sample data

### Step 2: Configure Environment
1. Update the `.env` file with your MySQL credentials:
   ```
   DB_HOST=127.0.0.1
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=job_portal
   JWT_SECRET=a-super-secret-key-that-should-be-long-and-random
   ```

### Step 3: Install Dependencies
```bash
cd job_portal_backend
npm install
```

### Step 4: Start the Backend Server
```bash
npm start
```
The server will run on `http://localhost:3001`

## Frontend Setup

### Step 1: Install Dependencies
```bash
cd job_portal
npm install
```

### Step 2: Start the Angular App
```bash
ng serve
```
The app will run on `http://localhost:4200`

## Login Credentials

### Admin Account
- **Email:** `admin@example.com`
- **Password:** `123456`

### Regular User Accounts
- **Email:** `user@example.com` | **Password:** `123456`
- **Email:** `justsgk07@gmail.com` | **Password:** `123456`

## API Endpoints

The backend provides the following API endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job by ID

### Users
- `GET /api/users/profile` - Get current user profile (requires auth)
- `PUT /api/users/profile` - Update user profile (requires auth)
- `PATCH /api/users/profile` - Update user profile (requires auth)
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)

### Applications
- `POST /api/applications` - Apply for a job (requires auth)

## Database Structure

The MySQL database contains the following tables:
- **users** - User accounts and authentication
- **job_seeker_profiles** - User profile information
- **jobs** - Job postings
- **applications** - Job applications

## Changes Made

1. **Updated Angular Services:**
   - `AuthService` - Now uses MySQL backend API
   - `JobService` - Updated to use new backend with proper authentication
   - `UserService` - Created new service for user profile management

2. **Updated Components:**
   - `UserProfileComponent` - Now uses UserService instead of direct HTTP calls

3. **Backend API:**
   - Added proper authentication middleware
   - Added user profile management endpoints
   - Added job and application management
   - Proper error handling and validation

## Troubleshooting

1. **Database Connection Issues:**
   - Verify MySQL is running
   - Check `.env` file credentials
   - Ensure database `job_portal` exists

2. **CORS Issues:**
   - Backend already configured with CORS for `http://localhost:4200`

3. **Authentication Issues:**
   - Check that JWT tokens are being stored in localStorage
   - Verify API endpoints are receiving proper Authorization headers

## Next Steps

You can now:
1. Run the database setup script
2. Start both backend and frontend
3. Test user registration and login
4. Test job browsing and application features
5. Test user profile management
