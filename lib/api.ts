const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:45000";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || "Request failed",
      };
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiRequest("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // Admin endpoints
  getAnalytics: () => apiRequest("/api/v1/admin/analytics"),

  getRestaurants: () => apiRequest("/api/v1/admin/restaurants"),
  approveRestaurant: (id: number) =>
    apiRequest(`/api/v1/admin/restaurants/${id}/approve`, { method: "POST" }),

  getDrivers: () => apiRequest("/api/v1/admin/drivers"),
  approveDriver: (id: number) =>
    apiRequest(`/api/v1/admin/drivers/${id}/approve`, { method: "POST" }),

  getInvoices: () => apiRequest("/api/v1/admin/invoices"),
  getInvoiceDetails: (id: string) => apiRequest(`/api/v1/admin/invoices/${id}`),
  generateInvoice: (data: any) =>
    apiRequest("/api/v1/admin/invoices/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getUsers: () => apiRequest("/api/v1/admin/users"),
  getUserDetails: (id: number) => apiRequest(`/api/v1/admin/users/${id}`),
  updateUser: (id: number, data: any) =>
    apiRequest(`/api/v1/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getUserOrders: (userId: number) => apiRequest(`/api/v1/admin/users/${userId}/orders`),
  updateUserStatus: (id: number, status: string) =>
    apiRequest(`/api/v1/admin/users/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  getOrders: () => apiRequest("/api/v1/admin/orders"),
  getOrderDetails: (id: string) => apiRequest(`/api/v1/admin/orders/${id}`),
  updateOrder: (id: string, data: any) =>
    apiRequest(`/api/v1/admin/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
