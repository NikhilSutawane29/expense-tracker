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

  // API base URL - always connect to port 5000 for backend
  const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000/api'
    : '/api';
  
  console.log('Using API URL:', API_URL);
  
  // Get DOM elements
  const addBudgetBtn = document.getElementById('add-budget-btn');
  const budgetModal = document.getElementById('budget-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelBudgetBtn = document.getElementById('cancel-budget-btn');
  const budgetForm = document.getElementById('budget-form');
  const modalTitle = document.getElementById('modal-title');
  const budgetTableBody = document.getElementById('budget-table-body');
  const noBudgetsMessage = document.getElementById('no-budgets-message');
  const deleteBudgetModal = document.getElementById('delete-budget-modal');
  const cancelDeleteBudgetBtn = document.getElementById('cancel-delete-budget-btn');
  const confirmDeleteBudgetBtn = document.getElementById('confirm-delete-budget-btn');
  const monthSelector = document.getElementById('month-selector');
  const yearSelector = document.getElementById('year-selector');
  const modalMonthSelector = document.getElementById('modal-month');
  const modalYearSelector = document.getElementById('modal-year');
  const monthYearDisplay = document.getElementById('month-year-display');
  const budgetSummary = document.getElementById('budget-summary');
  const budgetSummaryLoading = document.getElementById('budget-summary-loading');

  // Get user token from localStorage
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No authentication token found');
    window.location.href = '../views/login.html';
    return;
  }

  let currentBudgetId = null;
  let budgets = [];
  let budgetSummaryData = [];
  let isConnectedToServer = false;
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();

  // Initialize year selectors
  function populateYearSelectors() {
    const startYear = 2020;
    const endYear = new Date().getFullYear() + 5;
    
    // Clear existing options
    yearSelector.innerHTML = '';
    modalYearSelector.innerHTML = '';
    
    // Add options for years
    for (let year = startYear; year <= endYear; year++) {
      yearSelector.innerHTML += `<option value="${year}">${year}</option>`;
      modalYearSelector.innerHTML += `<option value="${year}">${year}</option>`;
    }
    
    // Set current year as selected
    yearSelector.value = currentYear;
    modalYearSelector.value = currentYear;
    monthSelector.value = currentMonth;
    modalMonthSelector.value = currentMonth;
  }

  // Set month and year in the display
  function updateMonthYearDisplay() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    monthYearDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  }

  // Format amount to Indian Rupees
  function formatAmount(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Show connection status indicator
  const connectionStatus = document.createElement('div');
  connectionStatus.className = 'fixed bottom-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 z-50';
  connectionStatus.innerHTML = 'Connecting to server...';
  document.body.appendChild(connectionStatus);

  // Test API connection first
  const testConnection = async () => {
    try {
      connectionStatus.innerHTML = 'Connecting to server...';
      connectionStatus.className = 'fixed bottom-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500 text-white z-50';
      
      // Simple request to check if server is running
      const response = await fetch(`${API_URL.replace('/api', '')}/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('Successfully connected to server');
        connectionStatus.innerHTML = 'Connected to server';
        connectionStatus.className = 'fixed bottom-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white z-50';
        isConnectedToServer = true;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
          connectionStatus.style.display = 'none';
        }, 3000);
        
        // If connected, fetch budgets
        await fetchBudgetSummary();
      } else {
        throw new Error('Server is running but returned an error');
      }
    } catch (error) {
      console.error('Failed to connect to server:', error);
      connectionStatus.innerHTML = 'Server connection failed';
      connectionStatus.className = 'fixed bottom-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white z-50';
      
      // Show detailed connection error message
      showNotification(`Cannot connect to the server. Make sure the backend is running on port 5000. Error: ${error.message}`, true);
    }
  };

  // Helper function to show notifications
  const showNotification = (message, isError = false) => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-md ${
      isError ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
    } z-50 transform notification-animate`;
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

  // Fetch budget summary from the server
  const fetchBudgetSummary = async () => {
    try {
      if (!isConnectedToServer) {
        console.warn('Not connected to server. Skipping fetchBudgetSummary.');
        return;
      }
      
      budgetSummaryLoading.classList.remove('hidden');
      
      const response = await fetch(`${API_URL}/budgets/summary?month=${currentMonth}&year=${currentYear}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch budget summary');
      }
      
      const data = await response.json();
      budgetSummaryData = data.data;
      
      renderBudgetSummary();
      renderBudgetTable();
    } catch (error) {
      console.error('Error fetching budget summary:', error);
      showNotification(`Error: ${error.message}`, true);
      
      // Check if unauthorized (likely expired token)
      if (error.message.includes('Not authorized') || error.message.includes('Invalid token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../views/login.html';
      }
    } finally {
      budgetSummaryLoading.classList.add('hidden');
    }
  };

  // Create a new budget
  const createBudget = async (budgetData) => {
    try {
      if (!isConnectedToServer) {
        showNotification('Cannot add budget: Not connected to server', true);
        return;
      }
      
      const response = await fetch(`${API_URL}/budgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(budgetData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create budget');
      }
      
      await fetchBudgetSummary();
      closeModal();
      showNotification('Budget added successfully');
    } catch (error) {
      console.error('Error creating budget:', error);
      showNotification(`Error: ${error.message}`, true);
    }
  };

  // Update an existing budget
  const updateBudget = async (id, budgetData) => {
    try {
      if (!isConnectedToServer) {
        showNotification('Cannot update budget: Not connected to server', true);
        return;
      }
      
      const response = await fetch(`${API_URL}/budgets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(budgetData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update budget');
      }
      
      await fetchBudgetSummary();
      closeModal();
      showNotification('Budget updated successfully');
    } catch (error) {
      console.error('Error updating budget:', error);
      showNotification(`Error: ${error.message}`, true);
    }
  };

  // Delete a budget
  const deleteBudget = async (id) => {
    try {
      if (!isConnectedToServer) {
        showNotification('Cannot delete budget: Not connected to server', true);
        return;
      }
      
      const response = await fetch(`${API_URL}/budgets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete budget');
      }
      
      await fetchBudgetSummary();
      closeDeleteModal();
      showNotification('Budget deleted successfully');
    } catch (error) {
      console.error('Error deleting budget:', error);
      showNotification(`Error: ${error.message}`, true);
    }
  };

  // Render budget summary cards
  const renderBudgetSummary = () => {
    // Remove loading indicator
    budgetSummary.innerHTML = '';
    
    if (budgetSummaryData.length === 0) {
      budgetSummary.innerHTML = `
        <div class="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No budgets found for ${monthYearDisplay.textContent}. Start by adding a budget.</p>
        </div>
      `;
      return;
    }
    
    // Sort: critical (over budget) first, then high percentage, then alphabetical
    const sortedBudgets = [...budgetSummaryData].sort((a, b) => {
      // Over budget items first
      if (a.percentage >= 100 && b.percentage < 100) return -1;
      if (a.percentage < 100 && b.percentage >= 100) return 1;
      
      // Then sort by percentage (higher first)
      if (a.percentage !== b.percentage) return b.percentage - a.percentage;
      
      // Then sort alphabetically
      return a.category.localeCompare(b.category);
    });
    
    // Create budget summary cards
    sortedBudgets.forEach(budget => {
      // Determine color based on percentage
      let colorClass = 'bg-green-100 dark:bg-green-900';
      let progressColorClass = 'bg-green-500';
      
      if (budget.percentage >= 90) {
        colorClass = 'bg-red-100 dark:bg-red-900';
        progressColorClass = 'bg-red-500';
      } else if (budget.percentage >= 75) {
        colorClass = 'bg-yellow-100 dark:bg-yellow-900';
        progressColorClass = 'bg-yellow-500';
      } else if (budget.percentage >= 50) {
        colorClass = 'bg-blue-100 dark:bg-blue-900';
        progressColorClass = 'bg-blue-500';
      }
      
      // Get category icon
      const categoryIcon = getCategoryIcon(budget.category);
      
      const card = document.createElement('div');
      card.className = `${colorClass} rounded-lg p-4 shadow-sm budget-card`;
      
      card.innerHTML = `
        <div class="flex justify-between items-start mb-2">
          <div class="flex items-center">
            <span class="text-lg mr-2 category-icon ${budget.percentage >= 90 ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'}">${categoryIcon}</span>
            <h4 class="text-sm font-medium ${budget.percentage >= 90 ? 'text-red-800 dark:text-red-200' : 'text-gray-800 dark:text-gray-200'}">${budget.category}</h4>
          </div>
          <span class="${budget.percentage >= 100 ? 'bg-red-500' : budget.percentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'} text-white text-xs px-2 py-1 rounded-full">${budget.percentage}%</span>
        </div>
        <div class="mb-2 progress-bar-animate">
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div class="${progressColorClass} h-2.5 rounded-full progress-fill" style="width: ${Math.min(budget.percentage, 100)}%"></div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p class="text-gray-500 dark:text-gray-400">Budget</p>
            <p class="font-medium ${budget.percentage >= 90 ? 'text-red-800 dark:text-red-200' : 'text-gray-800 dark:text-gray-200'}">${formatAmount(budget.budgetAmount)}</p>
          </div>
          <div>
            <p class="text-gray-500 dark:text-gray-400">Spent</p>
            <p class="font-medium ${budget.percentage >= 90 ? 'text-red-800 dark:text-red-200' : 'text-gray-800 dark:text-gray-200'}">${formatAmount(budget.spent)}</p>
          </div>
        </div>
        <div class="mt-2 text-sm">
          <p class="text-gray-500 dark:text-gray-400">Remaining</p>
          <p class="font-medium ${budget.remaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}">${formatAmount(budget.remaining)}</p>
        </div>
      `;
      
      budgetSummary.appendChild(card);
    });
  };

  // Render budget table
  const renderBudgetTable = () => {
    // Clear the table
    budgetTableBody.innerHTML = '';
    
    // Check if there are budgets to display
    if (budgetSummaryData.length === 0) {
      budgetTableBody.innerHTML = '';
      noBudgetsMessage.classList.remove('hidden');
      return;
    }
    
    // Hide the no budgets message
    noBudgetsMessage.classList.add('hidden');
    
    // Sort alphabetically by category
    const sortedBudgets = [...budgetSummaryData].sort((a, b) => 
      a.category.localeCompare(b.category)
    );
    
    // Render budgets
    sortedBudgets.forEach(budget => {
      const row = document.createElement('tr');
      row.className = 'table-row-animate';
      
      // Determine color class based on percentage
      let progressColorClass = 'bg-green-500';
      if (budget.percentage >= 100) {
        progressColorClass = 'bg-red-500';
      } else if (budget.percentage >= 75) {
        progressColorClass = 'bg-yellow-500';
      }
      
      // Get category icon
      const categoryIcon = getCategoryIcon(budget.category);
      
      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center">
            <span class="text-lg mr-2 category-icon text-gray-700 dark:text-gray-300">${categoryIcon}</span>
            <span class="text-sm text-gray-700 dark:text-gray-300">${budget.category}</span>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">${formatAmount(budget.budgetAmount)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">${formatAmount(budget.spent)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm ${budget.remaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}">${formatAmount(budget.remaining)}</td>
        <td class="px-6 py-4 whitespace-nowrap progress-bar-animate">
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div class="${progressColorClass} h-2.5 rounded-full progress-fill" style="width: ${Math.min(budget.percentage, 100)}%"></div>
          </div>
          <span class="text-xs text-gray-500 dark:text-gray-400">${budget.percentage}%</span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button class="edit-budget-btn text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3" data-id="${budget._id}" data-category="${budget.category}" data-amount="${budget.budgetAmount}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-budget-btn text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" data-id="${budget._id}">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;
      
      budgetTableBody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-budget-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const category = btn.getAttribute('data-category');
        const amount = btn.getAttribute('data-amount');
        openEditModal(id, category, amount);
      });
    });
    
    document.querySelectorAll('.delete-budget-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openDeleteModal(id);
      });
    });
  };

  // Function to get category icon
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Food':
        return '<i class="fas fa-utensils"></i>';
      case 'Transportation':
        return '<i class="fas fa-car"></i>';
      case 'Shopping':
        return '<i class="fas fa-shopping-bag"></i>';
      case 'Entertainment':
        return '<i class="fas fa-film"></i>';
      case 'Bills':
        return '<i class="fas fa-file-invoice-dollar"></i>';
      case 'Health':
        return '<i class="fas fa-heartbeat"></i>';
      case 'Other':
        return '<i class="fas fa-box"></i>';
      default:
        return '<i class="fas fa-tag"></i>';
    }
  };

  // Open modal for adding budget
  const openAddModal = () => {
    modalTitle.textContent = 'Add Budget';
    document.getElementById('budget-id').value = '';
    document.getElementById('category').value = '';
    document.getElementById('amount').value = '';
    modalMonthSelector.value = currentMonth;
    modalYearSelector.value = currentYear;
    
    // Enable category selection for new budgets
    document.getElementById('category').disabled = false;
    
    budgetModal.classList.remove('hidden');
  };

  // Open modal for editing budget
  const openEditModal = (id, category, amount) => {
    const budget = budgetSummaryData.find(b => b._id === id);
    if (!budget) return;
    
    modalTitle.textContent = 'Edit Budget';
    document.getElementById('budget-id').value = id;
    document.getElementById('category').value = category;
    document.getElementById('amount').value = amount;
    
    // Disable category selection for existing budgets
    document.getElementById('category').disabled = true;
    
    budgetModal.classList.remove('hidden');
  };

  // Open delete confirmation modal
  const openDeleteModal = (id) => {
    currentBudgetId = id;
    deleteBudgetModal.classList.remove('hidden');
  };

  // Close modals
  const closeModal = () => {
    budgetModal.classList.add('hidden');
  };

  const closeDeleteModal = () => {
    deleteBudgetModal.classList.add('hidden');
    currentBudgetId = null;
  };

  // Event Listeners
  addBudgetBtn.addEventListener('click', openAddModal);
  closeModalBtn.addEventListener('click', closeModal);
  cancelBudgetBtn.addEventListener('click', closeModal);
  
  cancelDeleteBudgetBtn.addEventListener('click', closeDeleteModal);
  confirmDeleteBudgetBtn.addEventListener('click', () => {
    if (currentBudgetId) {
      deleteBudget(currentBudgetId);
    }
  });
  
  monthSelector.addEventListener('change', (e) => {
    currentMonth = parseInt(e.target.value);
    updateMonthYearDisplay();
    fetchBudgetSummary();
  });
  
  yearSelector.addEventListener('change', (e) => {
    currentYear = parseInt(e.target.value);
    updateMonthYearDisplay();
    fetchBudgetSummary();
  });

  // Handle form submission
  budgetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('budget-id').value;
    const category = document.getElementById('category').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const month = parseInt(modalMonthSelector.value);
    const year = parseInt(modalYearSelector.value);
    
    const budgetData = {
      category,
      amount,
      month,
      year
    };
    
    if (id) {
      updateBudget(id, { amount });
    } else {
      createBudget(budgetData);
    }
  });

  // Initialize
  populateYearSelectors();
  updateMonthYearDisplay();
  testConnection();
}); 