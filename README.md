# Daily Expense Tracker

A full-stack web application to track daily expenses. Built with Node.js, Express, MongoDB, HTML, CSS (Tailwind), and JavaScript.

## Features

- User authentication (Login/Signup) with JWT
- Add, edit, and delete expenses
- Filter expenses by category and date
- Expense summary (Total, Monthly, Daily)
- Dark mode toggle
- Responsive design using Tailwind CSS
- Indian Rupees (₹) currency format

## Quick Start

### For Windows Users:

1. Make sure MongoDB is installed and running on your system
2. Double-click the `start.bat` file
3. The application will automatically open in your browser
4. Wait for both servers to start

### For Linux/Mac Users:

1. Make sure MongoDB is installed and running on your system
2. Make the start script executable:
   ```
   chmod +x start.sh
   ```
3. Run the start script:
   ```
   ./start.sh
   ```
4. The application will automatically open in your browser

## Installation (Manual Method)

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)

### Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd daily-expense-tracker
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

4. Configure environment variables:
   - Update MongoDB connection string in `backend/.env`

## Running the Application (Manual Method)

### Step 1: Start the Backend Server

```
cd backend
npm run dev
```

You should see messages confirming:
- "Connected to MongoDB successfully"
- "Server running on http://localhost:5000"

### Step 2: Start the Frontend Server

In a new terminal:

```
cd frontend
npm run dev
```

### Step 3: Open the Application

Open http://localhost:3000 in your browser

## Troubleshooting

### Connection Issues

If you see "Failed to connect to server" errors:

1. Make sure MongoDB is running
2. Verify the backend server is running on port 5000
3. Check the MongoDB connection string in `backend/.env`
4. Restart both servers

### Demo Mode

If the backend server cannot be reached, the application will run in "Demo Mode" with sample data. You'll see a notification indicating this, and:

- Sample expenses will be loaded
- Add/Edit/Delete operations won't work
- A connection status indicator will appear at the bottom right

## Project Structure

```
project/
├── backend/              # Node.js server
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # Express routes
│   ├── .env              # Environment variables
│   ├── index.js          # Server entry point
│   └── package.json      # Backend dependencies
├── frontend/             # Client-side files
│   ├── public/           # Static assets
│   │   ├── css/          # Stylesheets
│   │   ├── js/           # JavaScript files
│   │   └── images/       # Image assets
│   ├── views/            # HTML templates
│   ├── server.js         # Frontend server for testing
│   └── index.html        # Entry point
├── start.bat             # Windows quickstart script
├── start.sh              # Linux/Mac quickstart script
└── README.md             # Project documentation
```

## License

MIT