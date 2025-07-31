@echo off
echo ===================================================
echo    JOB PORTAL ANALYTICS FIX VERIFICATION
echo ===================================================
echo.

REM Kill any existing processes
echo 🔄 Stopping existing servers...
taskkill /f /im node.exe 2>nul
taskkill /f /im ng.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo 🧪 Running Integration Test...
cd /d "G:\Smartcliff_Learning\Project_Phase_3\job_portal_backend"
node test_integration.js

echo.
echo 🚀 Starting Backend Server...
start "Backend Server" cmd /k "node server.js"

echo.
echo ⏳ Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo 🔍 Testing Analytics API Endpoint...
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNzU0MzgyNn0.rHOO9gvP_RryAqvZDu6j0Y13jqYJNmlEhd0TLkSVA7I" http://localhost:3001/api/analytics/overview

echo.
echo.
echo 🎯 Starting Frontend Server...
cd /d "G:\Smartcliff_Learning\Project_Phase_3\job_portal"
start "Angular Dev Server" cmd /k "ng serve --port 4200"

echo.
echo ⏳ Waiting for Angular to compile...
timeout /t 15 /nobreak >nul

echo.
echo 🌐 Opening Test Pages...
start "" "http://localhost:4200/admin/analytics"
timeout /t 2 /nobreak >nul
start "" "http://localhost:4200/admin/job-management"

echo.
echo ===================================================
echo    ANALYTICS FIX SUMMARY
echo ===================================================
echo.
echo ✅ ISSUES FIXED:
echo    - Analytics now shows ACTIVE JOBS (status='active') not expired jobs
echo    - Job Management shows correct active job count (8)
echo    - Real-time data synchronization with cache-busting
echo    - Auto-refresh every 30 seconds in analytics
echo    - Proper frontend-backend integration
echo.
echo 📊 EXPECTED VALUES:
echo    - Total Jobs: 18
echo    - Active Jobs: 8 (matches job management)
echo    - Inactive Jobs: 9  
echo    - Applications: 56
echo    - Users: 4
echo    - Growth: 100%% (new platform)
echo.
echo 🔗 TEST URLS:
echo    - Analytics: http://localhost:4200/admin/analytics
echo    - Job Management: http://localhost:4200/admin/job-management
echo    - Backend API: http://localhost:3001/api/analytics/overview
echo.
echo 🎯 VERIFICATION STEPS:
echo    1. Check Analytics page shows "8" for Active Jobs
echo    2. Check Job Management shows "8" for Active Jobs  
echo    3. Click Refresh button - values should update immediately
echo    4. Values should auto-refresh every 30 seconds
echo    5. Growth percentages should show 100%% (not 0%%)
echo.
pause
