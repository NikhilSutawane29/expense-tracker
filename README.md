# Daily Expense Tracker

A full-stack web application for tracking daily expenses with user authentication, expense management, and visualization using HTML, CSS, JavaScript, Express.js, and MySQL.

## Features

- **User Authentication**: Secure login and signup with JWT and bcrypt
- **Expense Management**: Add, edit, delete, and view expenses
- **Categories**: Organize expenses by categories
- **Dashboard**: Visualize expenses with charts and statistics
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode**: Toggle between light and dark themes

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript, Chart.js
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT, bcrypt
- **Other libraries**: cors, dotenv, morgan

## Project Structure

```
daily-expense-tracker/
├── database/               # Database schema and scripts
├── public/                 # Frontend static files
│   ├── css/                # CSS stylesheets
│   ├── js/                 # JavaScript files
│   └── images/             # Images and icons
├── src/                    # Backend source code
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Express middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   └── utils/              # Utility functions
├── views/                  # Template files (if needed)
├── .env                    # Environment variables
├── package.json            # Project dependencies
├── server.js               # Main application entry point
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MySQL (v5.7 or later)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd daily-expense-tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a MySQL database:
   ```
   mysql -u root -p
   CREATE DATABASE expense_tracker;
   EXIT;
   ```

4. Import the database schema:
   ```
   mysql -u root -p expense_tracker < database/schema.sql
   ```

5. Configure environment variables:
   ```
   # Edit the .env file with your configuration
   PORT=3000
   JWT_SECRET=your_jwt_secret_key
   DB_HOST=localhost
   DB_USER=your_db_username
   DB_PASS=your_db_password
   DB_NAME=expense_tracker
   NODE_ENV=development
   ```

6. Start the server:
   ```
   npm start
   ```

7. For development with auto-reload:
   ```
   npm run dev
   ```

8. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get user profile (protected)

### Expenses

- `GET /api/expenses` - Get all expenses for logged in user
- `GET /api/expenses/:id` - Get a specific expense
- `POST /api/expenses` - Create a new expense
- `PUT /api/expenses/:id` - Update an expense
- `DELETE /api/expenses/:id` - Delete an expense
- `GET /api/expenses/summary` - Get expense summary by category
- `GET /api/expenses/monthly` - Get monthly expense data

### Categories

- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get a specific category
- `POST /api/categories` - Create a new category (protected)

## Deployment

### Backend Deployment on Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the build settings:
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. Add environment variables in the Render dashboard

### Database Deployment using PlanetScale

1. Create a PlanetScale account
2. Create a new database
3. Update your connection details in the .env file

### Frontend Deployment

The frontend is served by the Express backend, so separate deployment is not needed.

## Future Enhancements

- Export expenses to CSV/PDF
- Budget planning and tracking
- Recurring expenses
- Bill reminders
- Mobile application using React Native
- Multi-currency support
- Expense sharing between users

## License

This project is licensed under the ISC License.

## Acknowledgements

- [Chart.js](https://www.chartjs.org/) for data visualization
- [Font Awesome](https://fontawesome.com/) for icons
- [Google Fonts](https://fonts.google.com/) for typography 