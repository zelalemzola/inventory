import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Products API
export const productsApi = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
  
  getById: async (id: string) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },
  
  create: async (product: any) => {
    try {
      const response = await api.post('/products', product);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },
  
  update: async (id: string, product: any) => {
    try {
      const response = await api.put(`/products/${id}`, product);
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },
  
  restock: async (id: string, variantId: string, quantity: number) => {
    try {
      const response = await api.post(`/products/${id}/restock`, { variantId, quantity });
      return response.data;
    } catch (error) {
      console.error(`Error restocking product ${id}:`, error);
      throw error;
    }
  },
  
  getCategories: async () => {
    try {
      const response = await api.get('/products/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
  
  getStats: async () => {
    try {
      const response = await api.get('/products/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching product stats:', error);
      throw error;
    }
  },
  
  getTopProducts: async () => {
    try {
      const response = await api.get('/products/top');
      return response.data;
    } catch (error) {
      console.error('Error fetching top products:', error);
      throw error;
    }
  },
  
  getTurnover: async () => {
    try {
      const response = await api.get('/products/turnover');
      return response.data;
    } catch (error) {
      console.error('Error fetching product turnover:', error);
      throw error;
    }
  }
};

// Sales API
export const salesApi = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/sales', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }
  },
  
  getById: async (id: string) => {
    try {
      const response = await api.get(`/sales/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sale ${id}:`, error);
      throw error;
    }
  },
  
  create: async (sale: any) => {
    try {
      const response = await api.post('/sales', sale);
      return response.data;
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  },
  
  update: async (id: string, sale: any) => {
    try {
      const response = await api.put(`/sales/${id}`, sale);
      return response.data;
    } catch (error) {
      console.error(`Error updating sale ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/sales/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting sale ${id}:`, error);
      throw error;
    }
  },
  
  getStats: async (params = {}) => {
    try {
      const response = await api.get('/sales/stats', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching sales stats:', error);
      throw error;
    }
  },
  
  getSalesByCategory: async () => {
    try {
      const response = await api.get('/sales/by-category');
      return response.data;
    } catch (error) {
      console.error('Error fetching sales by category:', error);
      throw error;
    }
  },
  
  getMonthlySales: async () => {
    try {
      const response = await api.get('/sales/monthly');
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly sales:', error);
      throw error;
    }
  },
  
  getProductProfit: async (productId: string) => {
    try {
      const response = await api.get(`/sales/product-profit?productId=${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product profit:', error);
      throw error;
    }
  },
  
  getCategoryProfit: async () => {
    try {
      const response = await api.get('/sales/category-profit');
      return response.data;
    } catch (error) {
      console.error('Error fetching category profit:', error);
      throw error;
    }
  },
  
  getProfitTracking: async () => {
    try {
      const response = await api.get('/sales/profit-tracking');
      return response.data;
    } catch (error) {
      console.error('Error fetching profit tracking:', error);
      throw error;
    }
  },
  
  getProductNames: async () => {
    try {
      const response = await api.get('/sales/product-names');
      return response.data;
    } catch (error) {
      console.error('Error fetching product names:', error);
      throw error;
    }
  }
};

// Notifications API
export const notificationsApi = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },
  
  getById: async (id: string) => {
    try {
      const response = await api.get(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching notification ${id}:`, error);
      throw error;
    }
  },
  
  create: async (notification: any) => {
    try {
      const response = await api.post('/notifications', notification);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },
  
  update: async (id: string, notification: any) => {
    try {
      const response = await api.put(`/notifications/${id}`, notification);
      return response.data;
    } catch (error) {
      console.error(`Error updating notification ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting notification ${id}:`, error);
      throw error;
    }
  },
  
  markAsRead: async (ids: string[]) => {
    try {
      const response = await api.post('/notifications/mark-read', { ids });
      return response.data;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  },
  
  markAllAsRead: async () => {
    try {
      const response = await api.post('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },
  
  getStats: async () => {
    try {
      const response = await api.get('/notifications/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  }
};

// Dashboard API
export const dashboardApi = {
  getData: async () => {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
};

// Price History API
export const priceHistoryApi = {
  getByProduct: async (productId: string) => {
    try {
      const response = await api.get(`/price-history?productId=${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching price history:', error);
      throw error;
    }
  }
};

// Stock History API
export const stockHistoryApi = {
  getByProduct: async (productId: string) => {
    try {
      const response = await api.get(`/stock-history?productId=${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stock history:', error);
      throw error;
    }
  }
};

