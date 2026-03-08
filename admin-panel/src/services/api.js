import axios from "axios";
import { store } from "../app/store";
import { logout } from "../features/auth/authSlice";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3030/api/";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`,
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear state and let ProtectedRoute handle redirect
      store.dispatch(logout());
    }
    return Promise.reject(error);
  },
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post("auth/login", credentials),
  getProfile: () => api.get("auth/profile"),
};

// Product APIs
export const productAPI = {
  getAll: (params) => api.get("products", { params }),
  getById: (id) => api.get(`products/${id}`),
  create: (data) => api.post("products", data),
  update: (id, data) => api.put(`products/${id}`, data),
  delete: (id) => api.delete(`products/${id}`),
};

// Category APIs
export const categoryAPI = {
  getAll: () => api.get("categories"),
  getAdminAll: () => api.get("categories/admin"),
  getById: (id) => api.get(`categories/${id}`),
  create: (data) => api.post("categories", data),
  update: (id, data) => api.put(`categories/${id}`, data),
  delete: (id) => api.delete(`categories/${id}`),
};

// Party APIs
export const partyAPI = {
  getAll: (params) => api.get("parties", { params }),
  getById: (id) => api.get(`parties/${id}`),
  create: (data) => api.post("parties", data),
  update: (id, data) => api.put(`parties/${id}`, data),
  delete: (id) => api.delete(`parties/${id}`),
  getCustomers: (params) => api.get("parties/customers", { params }),
  getSuppliers: (params) => api.get("parties/suppliers", { params }),
};

// Order APIs (Consolidated)
// Order APIs (Unified)
export const orderAPI = {
  getAll: (params) => api.get("orders", { params }), // params can include { status: 'Pending' } etc.
  getById: (id) => api.get(`orders/${id}`),
  updateStatus: (id, status) => api.put(`orders/${id}/status`, { status }),
  delete: (id) => api.delete(`orders/${id}`),

  // Legacy adapters if needed, or we just update the components
  getPending: () => api.get("orders", { params: { status: "Pending" } }),
  getConfirmed: () => api.get("orders", { params: { status: "Confirmed" } }),
  confirm: (id) => api.put(`orders/${id}/status`, { status: "Confirmed" }),
  reject: (id) => api.put(`orders/${id}/status`, { status: "Rejected" }),
};

// Sales Order APIs (Alias for backward compatibility if needed, but pointing to new logic)
export const salesOrderAPI = {
  getAll: (params) => api.get("orders", { params }), // Temporary bridge for Dashboard
  getById: (id) => api.get(`orders/${id}`),
};

// Purchase Order APIs
export const purchaseOrderAPI = {
  getAll: (params) => api.get("purchase-orders", { params }),
  getById: (id) => api.get(`purchase-orders/${id}`),
  create: (data) => api.post("purchase-orders", data),
  update: (id, data) => api.put(`purchase-orders/${id}`, data),
  approve: (id) => api.post(`purchase-orders/${id}/approve`),
  receive: (id) => api.post(`purchase-orders/${id}/receive`),
  cancel: (id) => api.delete(`purchase-orders/${id}`),
};

// Stock APIs
export const stockAPI = {
  getAll: (params) => api.get("stock", { params }),
  getLowStock: () => api.get("stock/low-stock"),
  getById: (id) => api.get(`stock/${id}`),
  adjust: (id, data) => api.post(`stock/${id}/adjust`, data),
};

// Payment APIs
export const paymentAPI = {
  getAll: (params) => api.get("payments", { params }),
  getById: (id) => api.get(`payments/${id}`),
  create: (data) => api.post("payments", data),
  update: (id, data) => api.put(`payments/${id}`, data),
  getOrderPayments: (orderId) => api.get(`payments/order/${orderId}`),
};

// Audit Log APIs
export const auditLogAPI = {
  getAll: (params) => api.get("audit-logs", { params }),
  getEntityLogs: (entityType, entityId) =>
    api.get(`audit-logs/entity/${entityType}/${entityId}`),
};

// Report APIs
export const reportAPI = {
  getSummary: () => api.get("reports/summary"),
};

// Contact/Inquiry APIs
export const contactAPI = {
  getAll: () => api.get("messages"),
  updateStatus: (id, status) => api.put(`messages/${id}/status`, { status }),
  delete: (id) => api.delete(`messages/${id}`),
};

export default api;
