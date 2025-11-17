"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin-layout";
import { api } from "@/lib/api";
import { Check, Eye, X } from "lucide-react";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    setLoading(true);
    const response = await api.getDrivers();
    if (response.success) {
      setDrivers(response.data || []);
    }
    setLoading(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Drivers Management</h1>
          <p className="text-gray-600 mt-1">View and manage delivery drivers</p>
        </div>

        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">Drivers management coming soon</p>
        </div>
      </div>
    </AdminLayout>
  );
}
