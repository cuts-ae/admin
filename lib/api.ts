const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://34.130.93.201:45000/api/v1";

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
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // Admin endpoints
  getAnalytics: () => apiRequest("/admin/analytics"),

  getRestaurants: () => apiRequest("/admin/restaurants"),
  approveRestaurant: (id: number) =>
    apiRequest(`/admin/restaurants/${id}/approve`, { method: "POST" }),

  getDrivers: () => apiRequest("/admin/drivers"),
  approveDriver: (id: number) =>
    apiRequest(`/admin/drivers/${id}/approve`, { method: "POST" }),

  getInvoices: () => apiRequest("/admin/invoices"),
  getInvoiceDetails: (id: number) => apiRequest(`/admin/invoices/${id}`),
  generateInvoice: (data: any) =>
    apiRequest("/admin/invoices/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getUsers: () => apiRequest("/admin/users"),

  getOrders: () => apiRequest("/admin/orders"),
};
