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
  
  // Show connection status indicator
  const connectionStatus = document.createElement('div');
  connectionStatus.className = 'fixed bottom-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 z-50';
  connectionStatus.innerHTML = 'Connecting to server...';
  document.body.appendChild(connectionStatus);
  
  // Get DOM elements
  const addExpenseBtn = document.getElementById('add-expense-btn');
  const expenseModal = document.getElementById('expense-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const expenseForm = document.getElementById('expense-form');
  const modalTitle = document.getElementById('modal-title');
  const expenseTableBody = document.getElementById('expense-table-body');
  const noExpensesMessage = document.getElementById('no-expenses-message');
  const deleteModal = document.getElementById('delete-modal');
  const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  const totalAmountEl = document.getElementById('total-amount');
  const monthAmountEl = document.getElementById('month-amount');
  const todayAmountEl = document.getElementById('today-amount');
  const categoryFilter = document.getElementById('category-filter');
  const dateFilter = document.getElementById('date-filter');
  
  // Get user token from localStorage
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No authentication token found');
    window.location.href = '../views/login.html';
    return;
  }
  
  let currentExpenseId = null;
  let expenses = [];
  let isConnectedToServer = false;
  
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
        
        // If connected, fetch expenses
        await fetchExpenses();
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
  
  // Initialize date input with current date
  document.getElementById('date').valueAsDate = new Date();
  
  // Helper function to show error notifications
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
  
  // Fetch all expenses
  const fetchExpenses = async () => {
    try {
      if (!isConnectedToServer) {
        console.warn('Not connected to server. Skipping fetchExpenses.');
        return;
      }
      
      const response = await fetch(`${API_URL}/expenses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch expenses');
      }
      
      const data = await response.json();
      expenses = data.data;
      
      renderExpenses();
      updateExpenseSummary();
    } catch (error) {
      console.error('Error fetching expenses:', error);
      showNotification(`Error: ${error.message}`, true);
      
      // Check if unauthorized (likely expired token)
      if (error.message.includes('Not authorized') || error.message.includes('Invalid token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../views/login.html';
      }
    }
  };
  
  // Render expenses to the table
  const renderExpenses = () => {
    // Clear the table
    expenseTableBody.innerHTML = '';
    
    // Filter expenses
    let filteredExpenses = [...expenses];
    
    if (categoryFilter.value) {
      filteredExpenses = filteredExpenses.filter(exp => exp.category === categoryFilter.value);
    }
    
    if (dateFilter.value) {
      const filterDate = new Date(dateFilter.value).toISOString().split('T')[0];
      filteredExpenses = filteredExpenses.filter(exp => {
        const expDate = new Date(exp.date).toISOString().split('T')[0];
        return expDate === filterDate;
      });
    }
    
    // Check if there are expenses to display
    if (filteredExpenses.length === 0) {
      expenseTableBody.innerHTML = '';
      noExpensesMessage.classList.remove('hidden');
      return;
    }
    
    // Hide the no expenses message
    noExpensesMessage.classList.add('hidden');
    
    // Render expenses
    filteredExpenses.forEach(expense => {
      const row = document.createElement('tr');
      row.className = 'table-row-animate';
      
      // Format date
      const date = new Date(expense.date);
      const formattedDate = date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      // Format amount with ₹ symbol
      const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
      }).format(expense.amount);
      
      // Get category icon
      const categoryIcon = getCategoryIcon(expense.category);
      
      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">${formattedDate}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center">
            <span class="text-lg mr-2 category-icon text-gray-700 dark:text-gray-300">${categoryIcon}</span>
            <span class="text-sm text-gray-700 dark:text-gray-300">${expense.category}</span>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">${expense.description || '-'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">${formattedAmount}</td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button class="edit-btn text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3" data-id="${expense._id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-btn text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" data-id="${expense._id}">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;
      
      expenseTableBody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditModal(id);
      });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
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
  
  // Update expense summary
  const updateExpenseSummary = () => {
    // Calculate total amount
    const totalAmount = expenses.reduce((total, expense) => total + expense.amount, 0);
    
    // Calculate this month's expenses
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === thisMonth && expenseDate.getFullYear() === thisYear;
    });
    
    const monthAmount = monthlyExpenses.reduce((total, expense) => total + expense.amount, 0);
    
    // Calculate today's expenses
    const today = new Date().toISOString().split('T')[0];
    
    const todayExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date).toISOString().split('T')[0];
      return expenseDate === today;
    });
    
    const todayAmount = todayExpenses.reduce((total, expense) => total + expense.amount, 0);
    
    // Format and update UI
    totalAmountEl.textContent = new Intl.NumberFormat('en-IN').format(totalAmount);
    monthAmountEl.textContent = new Intl.NumberFormat('en-IN').format(monthAmount);
    todayAmountEl.textContent = new Intl.NumberFormat('en-IN').format(todayAmount);
  };
  
  // Open modal for adding expense
  const openAddModal = () => {
    modalTitle.textContent = 'Add Expense';
    document.getElementById('expense-id').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('category').value = '';
    document.getElementById('description').value = '';
    document.getElementById('date').valueAsDate = new Date();
    
    expenseModal.classList.remove('hidden');
  };
  
  // Open modal for editing expense
  const openEditModal = (id) => {
    const expense = expenses.find(exp => exp._id === id);
    if (!expense) return;
    
    modalTitle.textContent = 'Edit Expense';
    document.getElementById('expense-id').value = expense._id;
    document.getElementById('amount').value = expense.amount;
    document.getElementById('category').value = expense.category;
    document.getElementById('description').value = expense.description || '';
    document.getElementById('date').value = new Date(expense.date).toISOString().split('T')[0];
    
    expenseModal.classList.remove('hidden');
  };
  
  // Open delete confirmation modal
  const openDeleteModal = (id) => {
    currentExpenseId = id;
    deleteModal.classList.remove('hidden');
  };
  
  // Close modals
  const closeModal = () => {
    expenseModal.classList.add('hidden');
  };
  
  const closeDeleteModal = () => {
    deleteModal.classList.add('hidden');
    currentExpenseId = null;
  };
  
  // Create a new expense - with additional connection check
  const createExpense = async (expenseData) => {
    try {
      if (!isConnectedToServer) {
        showNotification('Cannot add expenses: Not connected to server', true);
        return;
      }
      
      const response = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(expenseData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create expense');
      }
      
      await fetchExpenses();
      closeModal();
      showNotification('Expense added successfully');
    } catch (error) {
      console.error('Error creating expense:', error);
      showNotification(`Error: ${error.message}`, true);
    }
  };
  
  // Update an existing expense
  const updateExpense = async (id, expenseData) => {
    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(expenseData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update expense');
      }
      
      await fetchExpenses();
      closeModal();
      showNotification('Expense updated successfully');
    } catch (error) {
      console.error('Error updating expense:', error);
      showNotification(`Error: ${error.message}`, true);
    }
  };
  
  // Delete an expense
  const deleteExpense = async (id) => {
    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete expense');
      }
      
      await fetchExpenses();
      closeDeleteModal();
      showNotification('Expense deleted successfully');
    } catch (error) {
      console.error('Error deleting expense:', error);
      showNotification(`Error: ${error.message}`, true);
    }
  };
  
  // Event Listeners
  addExpenseBtn.addEventListener('click', openAddModal);
  closeModalBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  
  cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  confirmDeleteBtn.addEventListener('click', () => {
    if (currentExpenseId) {
      deleteExpense(currentExpenseId);
    }
  });
  
  // Handle form submission
  expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('expense-id').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;
    
    const expenseData = {
      amount,
      category,
      description,
      date: new Date(date)
    };
    
    if (id) {
      updateExpense(id, expenseData);
    } else {
      createExpense(expenseData);
    }
  });
  
  // Handle filters
  categoryFilter.addEventListener('change', renderExpenses);
  dateFilter.addEventListener('change', renderExpenses);
  
  // Start with a connection test
  testConnection();
}); 