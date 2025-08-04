@echo off
echo Starting XO Game Project...
echo.

echo Cleaning ports...
npx kill-port 3000 2>nul || echo Port 3000 cleared
npx kill-port 3001 2>nul || echo Port 3001 cleared
echo.

echo Starting server on port 3001...
start cmd /k "cd /d server && npm run dev"

timeout /t 3 >nul

echo Starting client on port 3000...
start cmd /k "cd /d client && npm run dev"

echo.
echo Project is starting...
echo Client: http://localhost:3000
echo Server: http://localhost:3001
echo.
pause