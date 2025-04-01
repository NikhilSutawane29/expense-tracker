# Daily Expense Tracker

A responsive web application for tracking daily expenses across different categories.

## Live Demo

Visit the live demo: [Daily Expense Tracker](https://your-username.github.io/daily-expense-tracker)

## Features

- Responsive design that works on mobile, tablet, and desktop
- Track and categorize your expenses
- Dashboard with expense statistics and charts
- Filter expenses by category and date
- Dark mode support

## GitHub Pages Deployment

The app has been configured to run entirely in the browser without requiring a backend server when deployed on GitHub Pages. It uses localStorage to store data and provides a mock API for demo purposes.

### How to Deploy to GitHub Pages

1. **Fork or clone this repository**

2. **Create a GitHub Pages branch**
   - Go to your repository settings
   - Navigate to the "Pages" section
   - Choose branch "main" or "master" and the "/root" folder
   - Click "Save"

3. **Your site will be published at**:
   `https://your-username.github.io/daily-expense-tracker`

## Development

### Local Development

To run this project locally with a backend server:

1. Clone the repository
   ```
   git clone https://github.com/your-username/daily-expense-tracker.git
   cd daily-expense-tracker
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up your .env file with the necessary database connection info

4. Start the development server
   ```
   npm run dev
   ```

5. Open your browser and visit `http://localhost:3000`

## Tech Stack

- HTML5, CSS3, JavaScript (ES6+)
- Chart.js for data visualization
- Express.js (for backend development version)
- MySQL (for backend development version)

## License

MIT License 