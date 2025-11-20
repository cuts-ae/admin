"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin-layout";
import { api } from "@/lib/api";
import { Check, X, Edit, Eye, Search } from "@/components/icons";

interface Restaurant {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: {
    city?: string;
    street?: string;
    country?: string;
    emirate?: string;
    postal_code?: string;
  } | string;
  status: string;
  created_at: string;
  commission_rate?: number;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    setLoading(true);
    const response = await api.getRestaurants();
    if (response.success) {
      setRestaurants(response.data || []);
    }
    setLoading(false);
  };

  const handleApprove = async (id: number) => {
    const response = await api.approveRestaurant(id);
    if (response.success) {
      loadRestaurants();
    }
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || restaurant.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout
      pageTitle="Restaurants"
      pageSubtitle="View and manage all registered restaurants"
      showSearch={true}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      showStatusFilter={true}
      statusValue={filterStatus}
      onStatusChange={setFilterStatus}
    >
      <div className="space-y-6">

        {/* Restaurants Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading restaurants...</p>
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No restaurants found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Restaurant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRestaurants.map((restaurant) => (
                    <tr key={restaurant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{restaurant.name}</p>
                          <p className="text-sm text-gray-500">
                            {typeof restaurant.address === 'string'
                              ? restaurant.address
                              : `${restaurant.address?.street || ''}, ${restaurant.address?.city || ''}, ${restaurant.address?.emirate || ''}`.replace(/(^,\s*|,\s*$|,\s*,)/g, '').trim() || 'No address'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900">{restaurant.email}</p>
                          <p className="text-sm text-gray-500">{restaurant.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            restaurant.status === "active"
                              ? "bg-green-100 text-green-800"
                              : restaurant.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {restaurant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {restaurant.commission_rate || 15}%
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(restaurant.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {restaurant.status === "pending" && (
                            <button
                              onClick={() => handleApprove(restaurant.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Suspend"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
