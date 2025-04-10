// Authentication Check Script
(function() {
  // Get current path
  const currentPath = window.location.pathname;
  
  // Check if we're on a login-related page
  const isLoginPage = currentPath.includes('login.html') || 
                       currentPath === '/' || 
                       currentPath.endsWith('views/') ||
                       currentPath.endsWith('index.html');
  
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  // If no token and not on login page, redirect to login
  if (!token && !isLoginPage) {
    console.log('No authentication token found. Redirecting to login page...');
    window.location.href = currentPath.includes('/views/') ? './login.html' : './views/login.html';
  }
  
  // If token exists and on login page, redirect to dashboard
  if (token && isLoginPage) {
    console.log('User already authenticated. Redirecting to dashboard...');
    window.location.href = currentPath.includes('/views/') ? './dashboard.html' : './views/dashboard.html';
  }
})(); 