#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

/**
 * Prepare the application for deployment
 * - Generate a secure JWT secret
 * - Check for common deployment issues
 * - Create production env file
 */

// Generate a secure random JWT secret
const generateJwtSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Create production env file
const createProductionEnvFile = (jwtSecret) => {
  const envContent = `PORT=10000
JWT_SECRET=${jwtSecret}
DB_HOST=\${DB_HOST}
DB_USER=\${DB_USER}
DB_PASS=\${DB_PASS}
DB_NAME=\${DB_NAME}
NODE_ENV=production
DATABASE_TYPE=postgres`;

  fs.writeFileSync(path.join(__dirname, '..', '.env.production'), envContent);
  console.log('✅ Created .env.production file with secure JWT secret');
};

// Check if all dependencies are installed
const checkDependencies = () => {
  console.log('Checking dependencies...');
  try {
    execSync('npm list pg', { stdio: 'ignore' });
    console.log('✅ PostgreSQL driver is installed');
  } catch (error) {
    console.log('❌ PostgreSQL driver is not installed. Installing...');
    execSync('npm install pg', { stdio: 'inherit' });
    console.log('✅ PostgreSQL driver installed');
  }
};

// Check for common deployment issues
const checkDeploymentIssues = () => {
  // Check if package.json has the right start script
  const packageJson = require('../package.json');
  
  if (!packageJson.scripts || !packageJson.scripts.start) {
    console.log('❌ Missing start script in package.json');
    process.exit(1);
  } else {
    console.log('✅ Start script found in package.json');
  }
  
  // Check if node_modules is in .gitignore
  let gitignoreExists = false;
  let nodeModulesIgnored = false;
  
  try {
    const gitignore = fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf8');
    gitignoreExists = true;
    nodeModulesIgnored = gitignore.includes('node_modules');
  } catch (error) {
    // .gitignore doesn't exist
  }
  
  if (!gitignoreExists) {
    console.log('⚠️ No .gitignore file found. Creating one...');
    fs.writeFileSync(path.join(__dirname, '..', '.gitignore'), 'node_modules\n.env\n');
    console.log('✅ Created .gitignore file');
  } else if (!nodeModulesIgnored) {
    console.log('⚠️ node_modules is not in .gitignore. Adding it...');
    fs.appendFileSync(path.join(__dirname, '..', '.gitignore'), '\nnode_modules\n');
    console.log('✅ Added node_modules to .gitignore');
  } else {
    console.log('✅ node_modules is properly ignored in .gitignore');
  }
  
  // Check for .env file
  if (fs.existsSync(path.join(__dirname, '..', '.env'))) {
    console.log('✅ .env file exists');
    
    // Check if .env is in .gitignore
    if (gitignoreExists) {
      const gitignore = fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf8');
      if (!gitignore.includes('.env')) {
        console.log('⚠️ .env is not in .gitignore. Adding it...');
        fs.appendFileSync(path.join(__dirname, '..', '.gitignore'), '\n.env\n');
        console.log('✅ Added .env to .gitignore');
      } else {
        console.log('✅ .env is properly ignored in .gitignore');
      }
    }
  } else {
    console.log('⚠️ No .env file found. Deployment might fail without proper configuration.');
  }
};

// Main function
const main = () => {
  console.log('🚀 Preparing application for deployment...');
  
  const jwtSecret = generateJwtSecret();
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(path.join(__dirname, '..'))) {
    fs.mkdirSync(path.join(__dirname, '..'), { recursive: true });
  }
  
  createProductionEnvFile(jwtSecret);
  checkDependencies();
  checkDeploymentIssues();
  
  console.log('\n✨ Deployment preparation complete!');
  console.log('📖 See DEPLOYMENT.md for detailed deployment instructions.');
};

// Run the script
main(); 