# Expense Tracker Deployment Guide

This guide provides instructions for deploying the Expense Tracker application to various cloud platforms.

## Prerequisites

- Node.js and npm installed on your local machine
- Git for version control
- A free account on a cloud platform (Render, Heroku, or similar)
- Basic understanding of the command line

## Deployment Options

### Option 1: Deploy on Render (Recommended)

1. **Create a Render account**
   - Sign up at [render.com](https://render.com)

2. **Create a new PostgreSQL database**
   - In the Render dashboard, go to "New" > "PostgreSQL"
   - Name it "expense-tracker-db"
   - Select the free plan
   - Click "Create Database"
   - Note the connection details provided

3. **Deploy the Web Service**
   - In the Render dashboard, go to "New" > "Web Service"
   - Connect your GitHub repository
   - Give it a name like "expense-tracker"
   - Set the following:
     - Environment: Node
     - Build Command: `npm install`
     - Start Command: `npm start`
   - Add the following environment variables:
     - `JWT_SECRET`: (generate a secure random string)
     - `NODE_ENV`: production
     - `DATABASE_TYPE`: postgres
   - Click "Create Web Service"

4. **Run the Database Migration**
   - Once your service is deployed, go to the "Shell" tab
   - Run: `npm run migrate`

### Option 2: Deploy on Heroku

1. **Create a Heroku account**
   - Sign up at [heroku.com](https://heroku.com)

2. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

3. **Login to Heroku**
   ```bash
   heroku login
   ```

4. **Create a new Heroku app**
   ```bash
   heroku create your-expense-tracker
   ```

5. **Add a PostgreSQL database**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

6. **Configure environment variables**
   ```bash
   heroku config:set JWT_SECRET=your_secret_key
   heroku config:set NODE_ENV=production
   heroku config:set DATABASE_TYPE=postgres
   ```

7. **Deploy the application**
   ```bash
   git push heroku main
   ```

8. **Run the database migration**
   ```bash
   heroku run npm run migrate
   ```

### Option 3: Manual Deployment (VPS)

1. **Set up a Virtual Private Server**
   - Choose a provider (DigitalOcean, AWS, etc.)
   - Create a server with Ubuntu
   - SSH into your server

2. **Install Node.js and PostgreSQL**
   ```bash
   curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo apt-get install -y postgresql postgresql-contrib
   ```

3. **Clone your repository**
   ```bash
   git clone https://github.com/yourusername/expense-tracker.git
   cd expense-tracker
   ```

4. **Create a PostgreSQL database**
   ```bash
   sudo -u postgres psql
   ```
   
   In the PostgreSQL shell:
   ```sql
   CREATE DATABASE expense_tracker;
   CREATE USER myuser WITH ENCRYPTED PASSWORD 'mypassword';
   GRANT ALL PRIVILEGES ON DATABASE expense_tracker TO myuser;
   \q
   ```

5. **Configure your environment**
   ```bash
   cp .env.production .env
   ```
   
   Edit the .env file with your database credentials

6. **Install dependencies and run migrations**
   ```bash
   npm install
   npm run migrate
   ```

7. **Start the application**
   ```bash
   npm start
   ```

8. **Set up a process manager (PM2)**
   ```bash
   npm install -g pm2
   pm2 start server.js
   pm2 startup
   pm2 save
   ```

## Troubleshooting

- **Database Connection Issues**: Check your environment variables to ensure they match your database configuration.
- **Application Not Starting**: Check the logs of your deployment service for errors.
- **Missing Modules**: Make sure all dependencies are included in your package.json.

## Security Considerations

1. Always use HTTPS in production
2. Keep your JWT_SECRET secure and complex
3. Regularly update dependencies to patch security vulnerabilities

## Post-Deployment Tasks

1. Set up monitoring
2. Configure backups for your database
3. Set up a custom domain (if applicable)
4. Test the application thoroughly 