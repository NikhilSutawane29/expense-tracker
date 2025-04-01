// API Base URL
const API_URL = '/api';

// Mock data for GitHub Pages deployment
const MOCK_DATA = {
  user: {
    id: 1,
    name: 'Demo User',
    email: 'demo@example.com'
  },
  categories: [
    { id: 1, name: 'Food & Dining', icon: 'fa-utensils' },
    { id: 2, name: 'Transportation', icon: 'fa-car' },
    { id: 3, name: 'Shopping', icon: 'fa-shopping-bag' },
    { id: 4, name: 'Entertainment', icon: 'fa-film' },
    { id: 5, name: 'Bills & Utilities', icon: 'fa-file-invoice' },
    { id: 6, name: 'Health', icon: 'fa-heartbeat' },
    { id: 7, name: 'Travel', icon: 'fa-plane' },
    { id: 8, name: 'Education', icon: 'fa-graduation-cap' },
    { id: 9, name: 'Personal Care', icon: 'fa-spa' },
    { id: 10, name: 'Others', icon: 'fa-ellipsis-h' }
  ],
  expenses: [
    { id: 1, amount: 250, category_id: 1, category_name: 'Food & Dining', date: '2023-06-01T00:00:00.000Z', description: 'Grocery shopping' },
    { id: 2, amount: 50, category_id: 2, category_name: 'Transportation', date: '2023-06-02T00:00:00.000Z', description: 'Fuel' },
    { id: 3, amount: 100, category_id: 3, category_name: 'Shopping', date: '2023-06-03T00:00:00.000Z', description: 'New shirt' },
    { id: 4, amount: 200, category_id: 4, category_name: 'Entertainment', date: '2023-06-04T00:00:00.000Z', description: 'Movie tickets' },
    { id: 5, amount: 1000, category_id: 5, category_name: 'Bills & Utilities', date: '2023-06-05T00:00:00.000Z', description: 'Electricity bill' },
    { id: 6, amount: 500, category_id: 6, category_name: 'Health', date: '2023-06-06T00:00:00.000Z', description: 'Doctor visit' },
    { id: 7, amount: 3000, category_id: 7, category_name: 'Travel', date: '2023-06-10T00:00:00.000Z', description: 'Weekend trip' },
    { id: 8, amount: 1200, category_id: 8, category_name: 'Education', date: '2023-06-15T00:00:00.000Z', description: 'Online course' },
    { id: 9, amount: 150, category_id: 9, category_name: 'Personal Care', date: '2023-06-20T00:00:00.000Z', description: 'Haircut' },
    { id: 10, amount: 80, category_id: 10, category_name: 'Others', date: '2023-06-25T00:00:00.000Z', description: 'Miscellaneous' }
  ]
};

// Check if running on GitHub Pages
const isGitHubPages = window.location.hostname.includes('github.io');

// API Handler Class
class API {
  constructor() {
    this.baseUrl = API_URL;
    this.headers = {
      'Content-Type': 'application/json'
    };
    this.isGitHubPages = isGitHubPages;
    
    // Initialize mock data in localStorage if on GitHub Pages
    if (this.isGitHubPages && !localStorage.getItem('mockExpenses')) {
      localStorage.setItem('mockExpenses', JSON.stringify(MOCK_DATA.expenses));
      localStorage.setItem('mockCategories', JSON.stringify(MOCK_DATA.categories));
      localStorage.setItem('mockUser', JSON.stringify(MOCK_DATA.user));
    }
  }

  // Set JWT token for authenticated requests
  setToken(token) {
    if (token) {
      this.headers['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete this.headers['Authorization'];
      localStorage.removeItem('token');
    }
  }

  // Check if token exists in localStorage
  initializeToken() {
    const token = localStorage.getItem('token');
    if (token) {
      this.setToken(token);
      return true;
    }
    return false;
  }

  // Generic request method
  async request(endpoint, method = 'GET', data = null) {
    // If running on GitHub Pages, use mock data
    if (this.isGitHubPages) {
      return this.mockRequest(endpoint, method, data);
    }
    
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: this.headers
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong');
      }

      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
  
  // Mock request method for GitHub Pages
  async mockRequest(endpoint, method, data) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Auth endpoints
    if (endpoint.startsWith('/auth')) {
      if (endpoint === '/auth/login' && method === 'POST') {
        if (data.email === 'demo@example.com' && data.password === 'password') {
          return {
            status: 'success',
            message: 'Login successful',
            data: {
              user: MOCK_DATA.user,
              token: 'mock-jwt-token'
            }
          };
        } else {
          throw new Error('Invalid credentials');
        }
      }
      
      if (endpoint === '/auth/register' && method === 'POST') {
        return {
          status: 'success',
          message: 'Registration successful',
          data: {
            user: MOCK_DATA.user,
            token: 'mock-jwt-token'
          }
        };
      }
      
      if (endpoint === '/auth/user' && method === 'GET') {
        return {
          status: 'success',
          data: {
            user: MOCK_DATA.user
          }
        };
      }
    }
    
    // Category endpoints
    if (endpoint.startsWith('/categories')) {
      if (endpoint === '/categories' && method === 'GET') {
        const categories = JSON.parse(localStorage.getItem('mockCategories')) || MOCK_DATA.categories;
        return {
          status: 'success',
          data: {
            categories
          }
        };
      }
      
      if (endpoint.match(/\/categories\/\d+/) && method === 'GET') {
        const id = parseInt(endpoint.split('/').pop());
        const categories = JSON.parse(localStorage.getItem('mockCategories')) || MOCK_DATA.categories;
        const category = categories.find(c => c.id === id);
        
        if (!category) {
          throw new Error('Category not found');
        }
        
        return {
          status: 'success',
          data: {
            category
          }
        };
      }
    }
    
    // Expense endpoints
    if (endpoint.startsWith('/expenses')) {
      let expenses = JSON.parse(localStorage.getItem('mockExpenses')) || MOCK_DATA.expenses;
      
      // Get all expenses with optional filters
      if ((endpoint === '/expenses' || endpoint.startsWith('/expenses?')) && method === 'GET') {
        const urlParams = new URLSearchParams(endpoint.includes('?') ? endpoint.split('?')[1] : '');
        
        // Apply filters
        if (urlParams.get('category_id')) {
          const categoryId = parseInt(urlParams.get('category_id'));
          expenses = expenses.filter(e => e.category_id === categoryId);
        }
        
        if (urlParams.get('startDate')) {
          const startDate = new Date(urlParams.get('startDate'));
          expenses = expenses.filter(e => new Date(e.date) >= startDate);
        }
        
        if (urlParams.get('endDate')) {
          const endDate = new Date(urlParams.get('endDate'));
          expenses = expenses.filter(e => new Date(e.date) <= endDate);
        }
        
        return {
          status: 'success',
          data: {
            expenses
          }
        };
      }
      
      // Get single expense
      if (endpoint.match(/\/expenses\/\d+/) && method === 'GET') {
        const id = parseInt(endpoint.split('/').pop());
        const expense = expenses.find(e => e.id === id);
        
        if (!expense) {
          throw new Error('Expense not found');
        }
        
        return {
          status: 'success',
          data: {
            expense
          }
        };
      }
      
      // Create expense
      if (endpoint === '/expenses' && method === 'POST') {
        const newId = Math.max(...expenses.map(e => e.id), 0) + 1;
        const categories = JSON.parse(localStorage.getItem('mockCategories')) || MOCK_DATA.categories;
        const category = categories.find(c => c.id === data.category_id);
        
        if (!category) {
          throw new Error('Invalid category');
        }
        
        const newExpense = {
          id: newId,
          amount: data.amount,
          category_id: data.category_id,
          category_name: category.name,
          date: new Date(data.date).toISOString(),
          description: data.description || ''
        };
        
        expenses.push(newExpense);
        localStorage.setItem('mockExpenses', JSON.stringify(expenses));
        
        return {
          status: 'success',
          message: 'Expense created successfully',
          data: {
            expense: newExpense
          }
        };
      }
      
      // Update expense
      if (endpoint.match(/\/expenses\/\d+/) && method === 'PUT') {
        const id = parseInt(endpoint.split('/').pop());
        const index = expenses.findIndex(e => e.id === id);
        
        if (index === -1) {
          throw new Error('Expense not found');
        }
        
        const categories = JSON.parse(localStorage.getItem('mockCategories')) || MOCK_DATA.categories;
        const category = categories.find(c => c.id === data.category_id);
        
        if (!category) {
          throw new Error('Invalid category');
        }
        
        expenses[index] = {
          ...expenses[index],
          amount: data.amount,
          category_id: data.category_id,
          category_name: category.name,
          date: new Date(data.date).toISOString(),
          description: data.description || ''
        };
        
        localStorage.setItem('mockExpenses', JSON.stringify(expenses));
        
        return {
          status: 'success',
          message: 'Expense updated successfully',
          data: {
            expense: expenses[index]
          }
        };
      }
      
      // Delete expense
      if (endpoint.match(/\/expenses\/\d+/) && method === 'DELETE') {
        const id = parseInt(endpoint.split('/').pop());
        const index = expenses.findIndex(e => e.id === id);
        
        if (index === -1) {
          throw new Error('Expense not found');
        }
        
        expenses.splice(index, 1);
        localStorage.setItem('mockExpenses', JSON.stringify(expenses));
        
        return {
          status: 'success',
          message: 'Expense deleted successfully'
        };
      }
      
      // Get expense summary
      if (endpoint.startsWith('/expenses/summary') && method === 'GET') {
        const urlParams = new URLSearchParams(endpoint.includes('?') ? endpoint.split('?')[1] : '');
        let filteredExpenses = [...expenses];
        
        if (urlParams.get('startDate')) {
          const startDate = new Date(urlParams.get('startDate'));
          filteredExpenses = filteredExpenses.filter(e => new Date(e.date) >= startDate);
        }
        
        if (urlParams.get('endDate')) {
          const endDate = new Date(urlParams.get('endDate'));
          filteredExpenses = filteredExpenses.filter(e => new Date(e.date) <= endDate);
        }
        
        // Group expenses by category
        const summary = [];
        const categoryTotals = {};
        
        filteredExpenses.forEach(expense => {
          if (!categoryTotals[expense.category_id]) {
            categoryTotals[expense.category_id] = {
              category_id: expense.category_id,
              category_name: expense.category_name,
              total_amount: 0,
              count: 0
            };
          }
          
          categoryTotals[expense.category_id].total_amount += parseFloat(expense.amount);
          categoryTotals[expense.category_id].count += 1;
        });
        
        Object.values(categoryTotals).forEach(total => {
          summary.push(total);
        });
        
        return {
          status: 'success',
          data: {
            summary
          }
        };
      }
    }
    
    // Default response if no handler matched
    throw new Error('API endpoint not implemented in mock mode');
  }

  // Auth endpoints
  async register(userData) {
    const result = await this.request('/auth/register', 'POST', userData);
    if (result.data && result.data.token) {
      this.setToken(result.data.token);
    }
    return result;
  }

  async login(credentials) {
    const result = await this.request('/auth/login', 'POST', credentials);
    if (result.data && result.data.token) {
      this.setToken(result.data.token);
    }
    return result;
  }

  async logout() {
    this.setToken(null);
    return { status: 'success', message: 'Logged out successfully' };
  }

  async getCurrentUser() {
    return await this.request('/auth/user');
  }

  // Expense endpoints
  async getExpenses(filters = {}) {
    let queryParams = new URLSearchParams();
    
    if (filters.category_id) {
      queryParams.append('category_id', filters.category_id);
    }
    
    if (filters.startDate) {
      queryParams.append('startDate', filters.startDate);
    }
    
    if (filters.endDate) {
      queryParams.append('endDate', filters.endDate);
    }
    
    const queryString = queryParams.toString();
    return await this.request(`/expenses${queryString ? '?' + queryString : ''}`);
  }

  async getExpense(id) {
    return await this.request(`/expenses/${id}`);
  }

  async createExpense(expenseData) {
    return await this.request('/expenses', 'POST', expenseData);
  }

  async updateExpense(id, expenseData) {
    return await this.request(`/expenses/${id}`, 'PUT', expenseData);
  }

  async deleteExpense(id) {
    return await this.request(`/expenses/${id}`, 'DELETE');
  }

  async getExpenseSummary(startDate, endDate) {
    let queryParams = new URLSearchParams();
    
    if (startDate) {
      queryParams.append('startDate', startDate);
    }
    
    if (endDate) {
      queryParams.append('endDate', endDate);
    }
    
    const queryString = queryParams.toString();
    return await this.request(`/expenses/summary${queryString ? '?' + queryString : ''}`);
  }

  async getMonthlyExpenses(year) {
    return await this.request(`/expenses/monthly?year=${year}`);
  }

  // Category endpoints
  async getCategories() {
    return await this.request('/categories');
  }

  async getCategory(id) {
    return await this.request(`/categories/${id}`);
  }
}

// Create and export API instance
const api = new API(); 