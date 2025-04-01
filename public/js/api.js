// API Base URL
const API_URL = '/api';

// API Handler Class
class API {
  constructor() {
    this.baseUrl = API_URL;
    this.headers = {
      'Content-Type': 'application/json'
    };
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

  async getProfile() {
    return await this.request('/auth/profile');
  }

  logout() {
    this.setToken(null);
  }

  // Expense endpoints
  async getExpenses(filters = {}) {
    let queryString = '';
    if (Object.keys(filters).length) {
      queryString = '?' + new URLSearchParams(filters).toString();
    }
    return await this.request(`/expenses${queryString}`);
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
    const queryString = `?startDate=${startDate}&endDate=${endDate}`;
    return await this.request(`/expenses/summary${queryString}`);
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

  async createCategory(categoryData) {
    return await this.request('/categories', 'POST', categoryData);
  }
}

// Create and export API instance
const api = new API(); 