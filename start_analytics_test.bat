@echo off
echo Starting Analytics Test Environment...

REM Kill any existing processes
taskkill /f /im node.exe 2>nul
taskkill /f /im ng.exe 2>nul

echo.
echo Starting Backend Server...
cd /d "G:\Smartcliff_Learning\Project_Phase_3\job_portal_backend"
start "Backend Server" cmd /k "node server.js"

echo.
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo Testing Analytics API...
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNzU0MzgyNn0.rHOO9gvP_RryAqvZDu6j0Y13jqYJNmlEhd0TLkSVA7I" -H "Content-Type: application/json" http://localhost:3001/api/analytics/overview

echo.
echo.
echo Starting Angular Development Server...
cd /d "G:\Smartcliff_Learning\Project_Phase_3\job_portal"
start "Angular Dev Server" cmd /k "ng serve --port 4200"

echo.
echo Waiting 15 seconds for Angular to compile...
timeout /t 15 /nobreak >nul

echo.
echo Opening Analytics Test Page...
start "" "G:\Smartcliff_Learning\Project_Phase_3\test_analytics_api.html"

echo.
echo Opening Angular Analytics Dashboard...
start "" "http://localhost:4200/admin/analytics"

echo.
echo Analytics Test Environment Started!
echo.
echo Backend Server: http://localhost:3001
echo Frontend Server: http://localhost:4200
echo Analytics Dashboard: http://localhost:4200/admin/analytics
echo Analytics API Test: test_analytics_api.html
echo.
echo Current Database Stats:
echo - Users: 4
echo - Active Jobs: 15  
echo - Applications: 56
echo - Expected Growth: 100%% (new platform)
echo.
pause
