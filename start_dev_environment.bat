@echo off
echo Starting Job Portal Development Environment...

REM Kill any existing processes
taskkill /f /im node.exe 2>nul
taskkill /f /im ng.exe 2>nul

echo.
echo Starting Backend Server...
cd /d "G:\Smartcliff_Learning\Project_Phase_3\job_portal_backend"
start "Backend Server" cmd /k "node server.js"

echo.
echo Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo.
echo Starting Angular Development Server...
cd /d "G:\Smartcliff_Learning\Project_Phase_3\job_portal"
start "Angular Dev Server" cmd /k "ng serve --port 4200"

echo.
echo Waiting 10 seconds for servers to start...
timeout /t 10 /nobreak >nul

echo.
echo Opening application in browser...
start "" "http://localhost:4200/admin/communication"

echo.
echo Development environment is starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:4200
echo Communication Admin: http://localhost:4200/admin/communication
echo.
pause
