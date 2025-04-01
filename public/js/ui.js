// UI Module
const UIModule = (() => {
  // DOM Elements - Dashboard Pages
  const overviewPage = document.getElementById('overview-page');
  const expensesPage = document.getElementById('expenses-page');
  const categoriesPage = document.getElementById('categories-page');
  
  // DOM Elements - Navigation
  const navLinks = document.querySelectorAll('.sidebar-menu a');
  
  // DOM Elements - Overview
  const dateRangeSelect = document.getElementById('date-range');
  const totalExpensesElem = document.getElementById('total-expenses');
  const avgExpenseElem = document.getElementById('avg-expense');
  const topCategoryElem = document.getElementById('top-category');
  const recentExpensesList = document.getElementById('recent-expenses-list');
  
  // DOM Elements - Tables
  const expenseTableBody = document.getElementById('expense-table-body');
  const expenseCategoryFilter = document.getElementById('expense-category-filter');
  const expenseDateFilter = document.getElementById('expense-date-filter');
  
  // DOM Elements - Categories
  const categoriesContainer = document.getElementById('categories-container');
  
  // DOM Elements - Modals
  const expenseModal = document.getElementById('expense-modal');
  const expenseForm = document.getElementById('expense-form');
  const expenseModalTitle = document.getElementById('expense-modal-title');
  const expenseModalClose = document.getElementById('expense-modal-close');
  const expenseCancel = document.getElementById('expense-cancel');
  const expenseId = document.getElementById('expense-id');
  const expenseAmount = document.getElementById('expense-amount');
  const expenseCategory = document.getElementById('expense-category');
  const expenseDate = document.getElementById('expense-date');
  const expenseDescription = document.getElementById('expense-description');
  
  const deleteModal = document.getElementById('delete-modal');
  const deleteModalClose = document.getElementById('delete-modal-close');
  const deleteCancel = document.getElementById('delete-cancel');
  const deleteConfirm = document.getElementById('delete-confirm');
  
  // DOM Elements - Buttons
  const addExpenseBtn = document.getElementById('add-expense-btn');
  const themeToggle = document.getElementById('theme-toggle');
  
  // Chart instances
  let categoryChart = null;
  let trendChart = null;
  
  // State
  let currentPage = 'overview';
  let expenseToDelete = null;
  let categories = [];
  let currentDateRange = getDateRange('week');
  
  // Initialize charts
  const initCharts = () => {
    // Category chart
    const categoryCtx = document.getElementById('category-chart').getContext('2d');
    categoryChart = new Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderColor: [],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    });
    
    // Trend chart
    const trendCtx = document.getElementById('trend-chart').getContext('2d');
    trendChart = new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Daily Expenses',
          data: [],
          borderColor: '#4361ee',
          tension: 0.1,
          fill: true,
          backgroundColor: 'rgba(67, 97, 238, 0.1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Amount (₹)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        }
      }
    });
  };
  
  // Update category chart
  const updateCategoryChart = (data) => {
    if (!categoryChart) return;
    
    const labels = data.map(item => item.category_name);
    const values = data.map(item => item.total_amount);
    const colors = generateColors(data.length);
    
    categoryChart.data.labels = labels;
    categoryChart.data.datasets[0].data = values;
    categoryChart.data.datasets[0].backgroundColor = colors;
    categoryChart.data.datasets[0].borderColor = colors;
    
    categoryChart.update();
  };
  
  // Update trend chart
  const updateTrendChart = (expenses) => {
    if (!trendChart) return;
    
    // Group expenses by date
    const expensesByDate = {};
    
    expenses.forEach(expense => {
      const date = expense.date.split('T')[0];
      if (!expensesByDate[date]) {
        expensesByDate[date] = 0;
      }
      expensesByDate[date] += parseFloat(expense.amount);
    });
    
    // Sort dates
    const sortedDates = Object.keys(expensesByDate).sort();
    
    const labels = sortedDates.map(date => formatDate(date));
    const values = sortedDates.map(date => expensesByDate[date]);
    
    trendChart.data.labels = labels;
    trendChart.data.datasets[0].data = values;
    
    trendChart.update();
  };
  
  // Populate category dropdowns
  const populateCategoryDropdowns = () => {
    // Clear existing options except the default one
    expenseCategory.innerHTML = '<option value="">Select Category</option>';
    expenseCategoryFilter.innerHTML = '<option value="">All Categories</option>';
    
    // Add categories to dropdowns
    categories.forEach(category => {
      const option1 = document.createElement('option');
      option1.value = category.id;
      option1.textContent = category.name;
      expenseCategory.appendChild(option1);
      
      const option2 = document.createElement('option');
      option2.value = category.id;
      option2.textContent = category.name;
      expenseCategoryFilter.appendChild(option2);
    });
  };
  
  // Render recent expenses
  const renderRecentExpenses = (expenses) => {
    recentExpensesList.innerHTML = '';
    
    // Get the 5 most recent expenses
    const recentExpenses = expenses.slice(0, 5);
    
    if (recentExpenses.length === 0) {
      recentExpensesList.innerHTML = '<p class="no-data">No recent expenses found</p>';
      return;
    }
    
    recentExpenses.forEach(expense => {
      const expenseItem = document.createElement('div');
      expenseItem.className = 'expense-item';
      
      const categoryIcon = getCategoryIcon(expense.category_name);
      
      expenseItem.innerHTML = `
        <div class="expense-item-left">
          <div class="expense-category-icon">
            <i class="fas ${categoryIcon}"></i>
          </div>
          <div class="expense-details">
            <h4>${expense.category_name}</h4>
            <span class="expense-date">${formatDate(expense.date)}</span>
          </div>
        </div>
        <div class="expense-amount">${formatCurrency(expense.amount)}</div>
      `;
      
      recentExpensesList.appendChild(expenseItem);
    });
  };
  
  // Render all expenses
  const renderExpensesTable = (expenses) => {
    expenseTableBody.innerHTML = '';
    
    if (expenses.length === 0) {
      expenseTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="no-data">No expenses found</td>
        </tr>
      `;
      return;
    }
    
    expenses.forEach(expense => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>${formatDate(expense.date)}</td>
        <td>${expense.category_name}</td>
        <td>${expense.description || '-'}</td>
        <td>${formatCurrency(expense.amount)}</td>
        <td class="table-actions">
          <button class="btn-icon edit-expense" data-id="${expense.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon delete-expense" data-id="${expense.id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      
      expenseTableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-expense').forEach(btn => {
      btn.addEventListener('click', () => openEditExpenseModal(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-expense').forEach(btn => {
      btn.addEventListener('click', () => openDeleteModal(btn.dataset.id));
    });
  };
  
  // Render categories
  const renderCategories = () => {
    categoriesContainer.innerHTML = '';
    
    categories.forEach(category => {
      const categoryCard = document.createElement('div');
      categoryCard.className = 'category-card';
      
      const categoryIcon = getCategoryIcon(category.name);
      
      categoryCard.innerHTML = `
        <div class="category-icon">
          <i class="fas ${categoryIcon}"></i>
        </div>
        <h3 class="category-name">${category.name}</h3>
        <p class="category-description">${category.description || ''}</p>
      `;
      
      categoriesContainer.appendChild(categoryCard);
    });
  };
  
  // Update dashboard stats
  const updateStats = (expenses) => {
    let totalAmount = 0;
    const categoryTotals = {};
    
    expenses.forEach(expense => {
      const amount = parseFloat(expense.amount);
      totalAmount += amount;
      
      // Track category totals
      if (!categoryTotals[expense.category_name]) {
        categoryTotals[expense.category_name] = 0;
      }
      categoryTotals[expense.category_name] += amount;
    });
    
    // Update total expenses
    totalExpensesElem.textContent = formatCurrency(totalAmount);
    
    // Calculate average daily expense
    let avgAmount = 0;
    
    if (expenses.length > 0 && currentDateRange) {
      const start = new Date(currentDateRange.startDate);
      const end = new Date(currentDateRange.endDate);
      const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
      avgAmount = totalAmount / days;
    }
    
    avgExpenseElem.textContent = formatCurrency(avgAmount);
    
    // Find top category
    let topCategory = 'None';
    let topAmount = 0;
    
    Object.entries(categoryTotals).forEach(([category, amount]) => {
      if (amount > topAmount) {
        topCategory = category;
        topAmount = amount;
      }
    });
    
    topCategoryElem.textContent = topCategory;
  };
  
  // Open add expense modal
  const openAddExpenseModal = () => {
    expenseModalTitle.textContent = 'Add Expense';
    expenseId.value = '';
    expenseForm.reset();
    
    // Set today's date as default
    expenseDate.value = new Date().toISOString().split('T')[0];
    
    expenseModal.classList.remove('hidden');
  };
  
  // Open edit expense modal
  const openEditExpenseModal = async (id) => {
    try {
      expenseModalTitle.textContent = 'Edit Expense';
      const response = await api.getExpense(id);
      const expense = response.data.expense;
      
      expenseId.value = expense.id;
      expenseAmount.value = expense.amount;
      expenseCategory.value = expense.category_id;
      expenseDate.value = expense.date.split('T')[0];
      expenseDescription.value = expense.description || '';
      
      expenseModal.classList.remove('hidden');
    } catch (error) {
      showNotification(error.message || 'Failed to load expense', 'error');
    }
  };
  
  // Close expense modal
  const closeExpenseModal = () => {
    expenseModal.classList.add('hidden');
    expenseForm.reset();
  };
  
  // Open delete modal
  const openDeleteModal = (id) => {
    expenseToDelete = id;
    deleteModal.classList.remove('hidden');
  };
  
  // Close delete modal
  const closeDeleteModal = () => {
    deleteModal.classList.add('hidden');
    expenseToDelete = null;
  };
  
  // Handle add/edit expense form submission
  const handleExpenseFormSubmit = async (e) => {
    e.preventDefault();
    
    const isEdit = expenseId.value !== '';
    
    const expenseData = {
      amount: parseFloat(expenseAmount.value),
      category_id: parseInt(expenseCategory.value),
      date: expenseDate.value,
      description: expenseDescription.value
    };
    
    try {
      if (isEdit) {
        await api.updateExpense(expenseId.value, expenseData);
        showNotification('Expense updated successfully');
      } else {
        await api.createExpense(expenseData);
        showNotification('Expense added successfully');
      }
      
      closeExpenseModal();
      loadDashboardData();
      loadExpensesData();
    } catch (error) {
      showNotification(error.message || 'Failed to save expense', 'error');
    }
  };
  
  // Handle delete expense
  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    
    try {
      await api.deleteExpense(expenseToDelete);
      showNotification('Expense deleted successfully');
      closeDeleteModal();
      loadDashboardData();
      loadExpensesData();
    } catch (error) {
      showNotification(error.message || 'Failed to delete expense', 'error');
    }
  };
  
  // Change active page
  const changePage = (page) => {
    currentPage = page;
    
    // Hide all pages
    overviewPage.classList.add('hidden');
    expensesPage.classList.add('hidden');
    categoriesPage.classList.add('hidden');
    
    // Show selected page
    if (page === 'overview') {
      overviewPage.classList.remove('hidden');
    } else if (page === 'expenses') {
      expensesPage.classList.remove('hidden');
    } else if (page === 'categories') {
      categoriesPage.classList.remove('hidden');
    }
    
    // Update active nav link in sidebar
    navLinks.forEach(link => {
      if (link.dataset.page === page) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
    
    // Update active nav link in mobile nav bar
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    mobileNavItems.forEach(item => {
      if (item.dataset.page === page) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  };
  
  // Handle date range change
  const handleDateRangeChange = () => {
    const rangeType = dateRangeSelect.value;
    currentDateRange = getDateRange(rangeType);
    
    if (rangeType === 'custom') {
      // TODO: Implement custom date range selector
      // For now, use this month
      currentDateRange = getDateRange('month');
    }
    
    loadDashboardData();
  };
  
  // Handle expense filter change
  const handleExpenseFilterChange = () => {
    const categoryFilter = expenseCategoryFilter.value;
    const dateFilter = expenseDateFilter.value;
    
    let dateRange = null;
    if (dateFilter !== 'all') {
      dateRange = getDateRange(dateFilter);
      
      if (dateFilter === 'custom') {
        // TODO: Implement custom date range selector
        // For now, use this month
        dateRange = getDateRange('month');
      }
    }
    
    loadExpensesData(categoryFilter, dateRange);
  };
  
  // Load categories
  const loadCategories = async () => {
    try {
      const response = await api.getCategories();
      categories = response.data.categories;
      
      populateCategoryDropdowns();
      renderCategories();
    } catch (error) {
      showNotification('Failed to load categories', 'error');
    }
  };
  
  // Load dashboard data
  const loadDashboardData = async () => {
    if (!currentDateRange) return;
    
    try {
      // Load expenses
      const filters = {
        startDate: currentDateRange.startDate,
        endDate: currentDateRange.endDate
      };
      
      const response = await api.getExpenses(filters);
      const expenses = response.data.expenses;
      
      // Update UI
      updateStats(expenses);
      renderRecentExpenses(expenses);
      updateTrendChart(expenses);
      
      // Load category summary
      const summaryResponse = await api.getExpenseSummary(
        currentDateRange.startDate,
        currentDateRange.endDate
      );
      
      updateCategoryChart(summaryResponse.data.summary);
    } catch (error) {
      showNotification('Failed to load dashboard data', 'error');
    }
  };
  
  // Load expenses data
  const loadExpensesData = async (categoryId = '', dateRange = null) => {
    try {
      const filters = {};
      
      if (categoryId) {
        filters.category_id = categoryId;
      }
      
      if (dateRange) {
        filters.startDate = dateRange.startDate;
        filters.endDate = dateRange.endDate;
      }
      
      const response = await api.getExpenses(filters);
      renderExpensesTable(response.data.expenses);
    } catch (error) {
      showNotification('Failed to load expenses', 'error');
    }
  };
  
  // Initialize UI module
  const init = () => {
    // Load initial data
    loadCategories();
    loadDashboardData();
    loadExpensesData();
    
    // Initialize charts
    initCharts();
    
    // Set up event listeners
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        changePage(link.dataset.page);
      });
    });
    
    // Mobile navigation event listeners
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
      if (item.id !== 'mobile-add-expense') {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          changePage(item.dataset.page);
        });
      }
    });
    
    // Mobile add expense button
    const mobileAddExpense = document.getElementById('mobile-add-expense');
    if (mobileAddExpense) {
      mobileAddExpense.addEventListener('click', (e) => {
        e.preventDefault();
        openAddExpenseModal();
      });
    }
    
    // Add expense button
    addExpenseBtn.addEventListener('click', openAddExpenseModal);
    
    // Expense modal events
    expenseModalClose.addEventListener('click', closeExpenseModal);
    expenseCancel.addEventListener('click', closeExpenseModal);
    expenseForm.addEventListener('submit', handleExpenseFormSubmit);
    
    // Delete modal events
    deleteModalClose.addEventListener('click', closeDeleteModal);
    deleteCancel.addEventListener('click', closeDeleteModal);
    deleteConfirm.addEventListener('click', handleDeleteExpense);
    
    // Filter change events
    dateRangeSelect.addEventListener('change', handleDateRangeChange);
    expenseCategoryFilter.addEventListener('change', handleExpenseFilterChange);
    expenseDateFilter.addEventListener('change', handleExpenseFilterChange);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleDarkMode);
    
    // Load dark mode preference
    loadDarkModePreference();
  };
  
  // Public API
  return {
    init,
    changePage
  };
})(); 