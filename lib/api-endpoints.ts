const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://34.130.93.201:45000/api/v1";

export const API_ENDPOINTS = {
  auth: {
    login: `${API_URL}/auth/login`,
    register: `${API_URL}/auth/register`,
  },
  admin: {
    analytics: `${API_URL}/admin/analytics`,
    restaurants: `${API_URL}/admin/restaurants`,
    users: `${API_URL}/admin/users`,
    invoices: `${API_URL}/admin/invoices`,
    orders: `${API_URL}/admin/orders`,
    drivers: `${API_URL}/admin/drivers`,
  },
};
