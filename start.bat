@echo off
echo Starting Daily Expense Tracker...
echo.

echo Checking for MongoDB...
timeout /t 1 > nul

echo Installing backend dependencies...
cd backend
call npm install
echo.

echo Installing frontend dependencies...
cd ../frontend
call npm install
echo.

echo Starting servers...
echo.

echo Starting backend server on port 5000...
start cmd /k "cd backend && npm run dev"

echo Starting frontend server on port 3000...
start cmd /k "cd frontend && npm run dev"

echo.
echo Servers starting... Please wait a moment.
echo.
echo The application will open automatically in 10 seconds...
timeout /t 10 > nul

start http://localhost:3000
echo.
echo Servers are running!
echo * Frontend: http://localhost:3000
echo * Backend: http://localhost:5000
echo.
echo Press any key to stop the servers...
pause > nul 