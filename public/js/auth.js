// Authentication Module
const AuthModule = (() => {
  // DOM Elements
  const authContainer = document.getElementById('auth-container');
  const dashboardContainer = document.getElementById('dashboard-container');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const loginToggle = document.getElementById('login-toggle');
  const signupToggle = document.getElementById('signup-toggle');
  const loginError = document.getElementById('login-error');
  const signupError = document.getElementById('signup-error');
  const userNameDisplay = document.getElementById('user-name');
  const logoutBtn = document.getElementById('logout-btn');

  // State
  let currentUser = null;

  // Check if running on GitHub Pages
  const isGitHubPages = window.location.hostname.includes('github.io');

  // Toggle between login and signup forms
  const toggleForms = (form) => {
    if (form === 'signup') {
      loginForm.classList.add('hidden');
      signupForm.classList.remove('hidden');
      loginToggle.classList.remove('active');
      signupToggle.classList.add('active');
    } else {
      signupForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
      signupToggle.classList.remove('active');
      loginToggle.classList.add('active');
    }
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    loginError.textContent = '';

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      loginError.textContent = 'Please enter both email and password';
      return;
    }

    try {
      const response = await api.login({ email, password });
      currentUser = response.data.user;
      showDashboard();
    } catch (error) {
      loginError.textContent = error.message || 'Invalid credentials';
    }
  };

  // Handle Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    signupError.textContent = '';

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    // Validate input
    if (!name || !email || !password) {
      signupError.textContent = 'Please fill all required fields';
      return;
    }

    if (password !== confirmPassword) {
      signupError.textContent = 'Passwords do not match';
      return;
    }

    if (password.length < 6) {
      signupError.textContent = 'Password must be at least 6 characters';
      return;
    }

    try {
      const response = await api.register({ name, email, password });
      currentUser = response.data.user;
      showDashboard();
    } catch (error) {
      signupError.textContent = error.message || 'Registration failed';
    }
  };

  // Handle Logout
  const handleLogout = () => {
    api.logout();
    currentUser = null;
    showAuthForms();
  };

  // Show Dashboard
  const showDashboard = () => {
    authContainer.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
    
    // Update user display
    if (currentUser) {
      userNameDisplay.textContent = currentUser.name;
    }
    
    // Trigger dashboard initialization
    if (typeof DashboardModule !== 'undefined') {
      DashboardModule.init();
    }
  };

  // Show Auth Forms
  const showAuthForms = () => {
    dashboardContainer.classList.add('hidden');
    authContainer.classList.remove('hidden');
    
    // Reset forms
    loginForm.reset();
    signupForm.reset();
    loginError.textContent = '';
    signupError.textContent = '';
  };

  // Check if user is authenticated
  const checkAuth = async () => {
    if (api.initializeToken()) {
      try {
        const response = await api.getProfile();
        currentUser = response.data.user;
        showDashboard();
        return true;
      } catch (error) {
        api.logout();
        showAuthForms();
      }
    }
    return false;
  };

  // Initialize module
  const init = () => {
    // Event listeners
    loginToggle.addEventListener('click', () => toggleForms('login'));
    signupToggle.addEventListener('click', () => toggleForms('signup'));
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    logoutBtn.addEventListener('click', handleLogout);
    
    // Check authentication on load
    checkAuth();

    // Auto login for GitHub Pages demo
    if (isGitHubPages && !api.initializeToken()) {
      // Add GitHub Pages demo instructions
      const demoInstructions = document.createElement('div');
      demoInstructions.className = 'demo-instructions';
      demoInstructions.innerHTML = `
        <p class="demo-note">This is a demo version running on GitHub Pages.</p>
        <p>Login with the credentials below:</p>
        <p><strong>Email:</strong> demo@example.com</p>
        <p><strong>Password:</strong> password</p>
      `;
      authContainer.insertBefore(demoInstructions, loginForm);
      
      // Fill demo credentials 
      document.getElementById('login-email').value = 'demo@example.com';
      document.getElementById('login-password').value = 'password';
    }
  };

  // Public API
  return {
    init,
    checkAuth,
    getCurrentUser: () => currentUser
  };
})(); 