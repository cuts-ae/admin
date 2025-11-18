const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:45000";

export const API_ENDPOINTS = {
  auth: {
    login: `${API_URL}/api/v1/auth/login`,
    register: `${API_URL}/api/v1/auth/register`,
  },
  admin: {
    analytics: `${API_URL}/api/v1/admin/analytics`,
    restaurants: `${API_URL}/api/v1/admin/restaurants`,
    users: `${API_URL}/api/v1/admin/users`,
    invoices: `${API_URL}/api/v1/admin/invoices`,
    orders: `${API_URL}/api/v1/admin/orders`,
    drivers: `${API_URL}/api/v1/admin/drivers`,
  },
};
