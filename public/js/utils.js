// Utility Functions

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

// Format date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-IN', options);
};

// Get date range based on selection
const getDateRange = (rangeType) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let startDate = new Date(today);
  let endDate = new Date(today);
  
  switch (rangeType) {
    case 'today':
      // startDate is already today at 00:00
      endDate.setHours(23, 59, 59, 999);
      break;
    
    case 'week':
      // Start of week (Sunday)
      const dayOfWeek = today.getDay();
      startDate.setDate(today.getDate() - dayOfWeek);
      // End of week (Saturday)
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    
    case 'month':
      // Start of month
      startDate.setDate(1);
      // End of month
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    
    case 'year':
      // Start of year
      startDate = new Date(today.getFullYear(), 0, 1);
      // End of year
      endDate = new Date(today.getFullYear(), 11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;
    
    default:
      // Custom range or all, return null for custom handling
      return null;
  }
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

// Generate random colors for charts
const generateColors = (count) => {
  const colors = [
    '#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0',
    '#480ca8', '#b5179e', '#560bad', '#f3722c', '#f8961e',
    '#90be6d', '#43aa8b', '#577590', '#277da1', '#9e2a2b'
  ];
  
  // If we need more colors than in our predefined array
  if (count > colors.length) {
    for (let i = colors.length; i < count; i++) {
      const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
      colors.push(randomColor);
    }
  }
  
  return colors.slice(0, count);
};

// Get icon for a category
const getCategoryIcon = (categoryName) => {
  const icons = {
    'Food': 'fa-utensils',
    'Transportation': 'fa-car',
    'Housing': 'fa-home',
    'Healthcare': 'fa-stethoscope',
    'Entertainment': 'fa-film',
    'Shopping': 'fa-shopping-bag',
    'Education': 'fa-book',
    'Personal Care': 'fa-spa',
    'Bills': 'fa-file-invoice',
    'Others': 'fa-ellipsis-h'
  };
  
  return icons[categoryName] || 'fa-tag';
};

// Show notification
const showNotification = (message, type = 'success') => {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.classList.add('hide');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
};

// Toggle dark mode
const toggleDarkMode = () => {
  const body = document.body;
  const isDarkMode = body.classList.toggle('dark-mode');
  
  // Save preference
  localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
  
  // Update icon
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const icon = themeToggle.querySelector('i');
    if (isDarkMode) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    }
  }
  
  return isDarkMode;
};

// Load dark mode preference
const loadDarkModePreference = () => {
  const darkMode = localStorage.getItem('darkMode');
  
  if (darkMode === 'enabled') {
    toggleDarkMode();
  }
}; 