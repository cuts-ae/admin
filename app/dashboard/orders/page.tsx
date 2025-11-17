"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin-layout";
import { api } from "@/lib/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const response = await api.getOrders();
    if (response.success) {
      setOrders(response.data || []);
    }
    setLoading(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-1">View and manage all platform orders</p>
        </div>

        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">Orders management coming soon</p>
        </div>
      </div>
    </AdminLayout>
  );
}
