# Job Portal - SkillHunt

A modern job portal application built with Angular 19 and JSON Server, featuring user authentication, job search, application management, and admin controls.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v22 recommended) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

### Installation & Setup
1. **Clone or copy the project files to your directory**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Install JSON Server globally:**
   ```bash
   npm install -g json-server
   ```

### Running the Application
1. **Start the backend (JSON Server):**
   ```bash
   npx json-server --watch db.json --port 3000
   ```
2. **Start the frontend (Angular):**
   ```bash
   ng serve
   ```
3. **Access the application:**
   - Frontend: `http://localhost:4200`
   - Backend API: `http://localhost:3000`

## 🔑 Login Credentials

### User Account
- **Email:** `justsgk07@gmail.com`
- **Password:** `123456`
- **Role:** Regular User

### Admin Account
- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Role:** Administrator

### Test User
- **Email:** `user@example.com`
- **Password:** `user123`
- **Role:** Regular User

## 🧭 Navigation Guide

### User Interface
- **Login/Signup:** Access authentication pages
- **Job Search:** Browse and filter available jobs
- **Job Details:** View detailed job descriptions and apply
- **Profile Dropdown:** Access user menu (click profile icon)
  - My Profile: Edit personal information
  - Applied Jobs: View and manage job applications
  - Logout: Sign out of the system

### Admin Interface
- **Dashboard:** Overview of system statistics
- **User Management:** Manage user accounts
- **Job Management:** Add, edit, delete job postings
- **Analytics:** View application and user metrics
- **Communication:** Manage system communications
- **Content Management:** Control site content
### Navigation Flow
- **User Flow:** enter the user credentials after firing the site and its respective json server using "ng serve" and "json-server --watch db.json --port 3000".


- **Admin Flow:** enter the admin credentials after firing the site and its respective json server using "json-server --watch db.json --port 3000"

## 📁 Project Structure

### Core Architecture
```
src/app/
├─ core/                    # Core functionality
│  ├─ auth/                 # Authentication services & guards
│  ├─ models/               # TypeScript interfaces
│  └─ services/             # HTTP services
├─ modules/                 # Feature modules
│  ├─ admin/                # Admin dashboard features
│  ├─ auth/                 # Login/signup components
│  └─ user/                 # User-facing features
└─ shared/                  # Reusable components
   ├─ components/           # UI components
   └─ layouts/              # Page layouts
```

### Key Directories Explained

**🔐 /core/auth/**
- Authentication services, guards, and role-based access control

**📊 /modules/admin/**
- Admin dashboard, user management, job management, analytics

**👤 /modules/user/**
- Job search, job details, applied jobs, user profile, dashboard

**🔗 /shared/components/**
- Reusable UI components (headers, footers, job cards, modals)

**🎨 /shared/layouts/**
- Page layout templates for admin and user interfaces

**🛠️ /pipes/**
- Custom Angular pipes for data transformation

## ✨ Features

- **Authentication:** Secure login/signup with role-based access
- **Job Search:** Filter jobs by title, location, experience, salary
- **Application Management:** Apply to jobs, view status, withdraw applications
- **Profile Management:** Edit user profile and job preferences
- **Admin Controls:** Manage users, jobs, and view analytics
- **Responsive Design:** Works on desktop and mobile devices

## 🔧 Development

- **Framework:** Angular 18+
- **Styling:** Tailwind CSS
- **Backend:** JSON Server (mock API)
- **Icons:** Font Awesome
- **State Management:** RxJS Observables

## 📝 Database Structure

The `db.json` file contains:
- **users:** User accounts and profiles
- **jobs:** Job postings with full details
- **applications:** Job applications and their status
- **sessions:** User session management

---

                                            
