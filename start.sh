#!/bin/bash

echo "Starting Daily Expense Tracker..."
echo

echo "Checking for MongoDB..."
sleep 1

echo "Installing backend dependencies..."
cd backend
npm install
echo

echo "Installing frontend dependencies..."
cd ../frontend
npm install
echo

echo "Starting servers..."
echo

# Start backend server
echo "Starting backend server on port 5000..."
cd ../backend
gnome-terminal -- npm run dev &
# If not using gnome-terminal, try:
# xterm -e "npm run dev" &
# or:
# npm run dev &

# Start frontend server
echo "Starting frontend server on port 3000..."
cd ../frontend
gnome-terminal -- npm run dev &
# If not using gnome-terminal, try:
# xterm -e "npm run dev" &
# or:
# npm run dev &

echo
echo "Servers starting... Please wait a moment."
echo
echo "The application will open automatically in 10 seconds..."
sleep 10

# Open the application in the default browser
if command -v xdg-open > /dev/null; then
  xdg-open http://localhost:3000
elif command -v open > /dev/null; then
  open http://localhost:3000
else
  echo "Please open http://localhost:3000 in your browser"
fi

echo
echo "Servers are running!"
echo "* Frontend: http://localhost:3000"
echo "* Backend: http://localhost:5000"
echo
echo "Press Ctrl+C to stop the servers..."
wait 