document.addEventListener('DOMContentLoaded', async () => {
  // Get the actual port from the server
  let dynamicPort = 3002; // Default fallback port
  try {
    const portResponse = await fetch('/api/port');
    if (portResponse.ok) {
      const portData = await portResponse.json();
      dynamicPort = portData.port;
      console.log('Using dynamic port:', dynamicPort);
    }
  } catch (err) {
    console.warn('Could not fetch port information, using default port:', dynamicPort);
  }

  // API base URL - handle both development and production environments
  const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? `http://localhost:5000/api`
    : '/api';
  
  console.log('API URL configured as:', API_URL);
  console.log('Window location details:', {
    hostname: window.location.hostname,
    port: window.location.port || dynamicPort,
    protocol: window.location.protocol,
    pathname: window.location.pathname
  });
  
  // Check if user is already logged in
  const token = localStorage.getItem('token');
  const currentPath = window.location.pathname;
  
  if (token) {
    // Redirect to dashboard if already logged in and trying to access login page
    if (currentPath.includes('login.html') || currentPath === '/' || currentPath.endsWith('views/')) {
      window.location.href = '../views/dashboard.html';
    }
  } else {
    // Redirect to login if not logged in and trying to access protected page
    if (currentPath.includes('dashboard.html') || currentPath.includes('budget.html')) {
      window.location.href = '../views/login.html';
    }
  }
  
  // Display username in the header for protected pages
  if (token && (currentPath.includes('dashboard.html') || currentPath.includes('budget.html'))) {
    const user = JSON.parse(localStorage.getItem('user') || '{"name": "User"}');
    document.getElementById('user-name').textContent = user.name;
    
    // Logout functionality
    document.getElementById('logout-btn').addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '../views/login.html';
    });
  }
  
  // Login page functionality
  if (currentPath.includes('login.html') || currentPath === '/' || currentPath.endsWith('views/')) {
    // Tab switching logic
    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    loginTab.addEventListener('click', () => {
      loginTab.classList.add('text-primary', 'dark:text-indigo-400', 'border-primary', 'dark:border-indigo-400');
      loginTab.classList.remove('text-gray-500', 'dark:text-gray-400', 'border-transparent');
      signupTab.classList.remove('text-primary', 'dark:text-indigo-400', 'border-primary', 'dark:border-indigo-400');
      signupTab.classList.add('text-gray-500', 'dark:text-gray-400', 'border-transparent');
      loginForm.classList.remove('hidden');
      signupForm.classList.add('hidden');
    });
    
    signupTab.addEventListener('click', () => {
      signupTab.classList.add('text-primary', 'dark:text-indigo-400', 'border-primary', 'dark:border-indigo-400');
      signupTab.classList.remove('text-gray-500', 'dark:text-gray-400', 'border-transparent');
      loginTab.classList.remove('text-primary', 'dark:text-indigo-400', 'border-primary', 'dark:border-indigo-400');
      loginTab.classList.add('text-gray-500', 'dark:text-gray-400', 'border-transparent');
      signupForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
    });
    
    // Helper to show notifications
    const showNotification = (message, isError = false) => {
      // Create notification element
      const notification = document.createElement('div');
      notification.className = `fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-md shadow-md ${
        isError ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
      } z-50 notification-animate`;
      notification.innerHTML = `
        <div class="flex items-center">
          <span class="mr-2">${isError ? '<i class="fas fa-exclamation-circle"></i>' : '<i class="fas fa-check-circle"></i>'}</span>
          <span>${message}</span>
        </div>
      `;
      
      // Add to DOM
      document.body.appendChild(notification);
      
      // Remove after 3 seconds
      setTimeout(() => {
        notification.classList.add('notification-animate-out');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
    };
    
    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      const submitButton = loginForm.querySelector('button[type="submit"]');
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
      submitButton.disabled = true;
      
      console.log('Attempting login with API URL:', `${API_URL}/auth/login`);
      
      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        
        console.log('Login response status:', response.status);
        const responseText = await response.text();
        
        let data;
        try {
          data = JSON.parse(responseText);
          console.log('Login response data:', data);
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          console.log('Raw response text:', responseText);
          throw new Error('Invalid server response');
        }
        
        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }
        
        // Save token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to dashboard
        window.location.href = '../views/dashboard.html';
      } catch (error) {
        console.error('Login error:', error);
        showNotification(error.message, true);
        
        // Reset button state
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.innerHTML = '<span class="absolute left-0 inset-y-0 flex items-center pl-3"><i class="fas fa-sign-in-alt"></i></span> Sign in';
        submitButton.disabled = false;
      }
    });
    
    // Signup form submission
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      
      const submitButton = signupForm.querySelector('button[type="submit"]');
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
      submitButton.disabled = true;
      
      console.log('Attempting signup with API URL:', `${API_URL}/auth/signup`);
      
      try {
        const response = await fetch(`${API_URL}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, email, password })
        });
        
        console.log('Signup response status:', response.status);
        const responseText = await response.text();
        
        let data;
        try {
          data = JSON.parse(responseText);
          console.log('Signup response data:', data);
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          console.log('Raw response text:', responseText);
          throw new Error('Invalid server response');
        }
        
        if (!response.ok) {
          throw new Error(data.message || 'Signup failed');
        }
        
        // Save token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to dashboard
        window.location.href = '../views/dashboard.html';
      } catch (error) {
        console.error('Signup error:', error);
        showNotification(error.message, true);
        
        // Reset button state
        const submitButton = signupForm.querySelector('button[type="submit"]');
        submitButton.innerHTML = '<span class="absolute left-0 inset-y-0 flex items-center pl-3"><i class="fas fa-user-plus"></i></span> Create Account';
        submitButton.disabled = false;
      }
    });
  }
}); 