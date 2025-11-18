"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin-layout";
import UserDetailModal from "@/components/user-detail-modal";
import { api } from "@/lib/api";
import { Ban, VisibilityOutlined, SearchOutlined, UserCheck, PeopleOutlined, ShoppingBag, Banknote, TrendingUp } from "@mui/icons-material";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  created_at: string;
  last_login?: string;
  total_orders?: number;
  total_spent?: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const response = await api.getUsers();
    if (response.success) {
      setUsers(response.data || []);
    }
    setLoading(false);
  };

  const handleStatusChange = async (userId: number, newStatus: string) => {
    const response = await api.updateUserStatus(userId, newStatus);
    if (response.success) {
      await loadUsers();
    } else {
      alert("Failed to update user status: " + response.error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  // Calculate statistics
  const totalUsers = users.length;
  const customers = users.filter((u) => u.role === "customer");
  const customersWithOrders = customers.filter((u) => (u.total_orders || 0) > 0);
  const totalRevenue = users.reduce((sum, u) => sum + (u.total_spent || 0), 0);
  const activeUsers = users.filter((u) => u.status === "active").length;

  const formatCurrency = (amount: number) => {
    return `AED ${amount.toFixed(2)}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive view and management of all platform users and customers
            </p>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">
                  Total Users
                </p>
                <p className="text-4xl font-bold mt-2">{totalUsers}</p>
                <p className="text-blue-100 text-xs mt-2">All registered accounts</p>
              </div>
              <PeopleOutlined className="w-12 h-12 text-blue-200 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium uppercase tracking-wide">
                  Customers
                </p>
                <p className="text-4xl font-bold mt-2">{customersWithOrders.length}</p>
                <p className="text-green-100 text-xs mt-2">
                  Users with orders ({customers.length} total)
                </p>
              </div>
              <ShoppingBag className="w-12 h-12 text-green-200 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">
                  Total Revenue
                </p>
                <p className="text-4xl font-bold mt-2">
                  {totalRevenue >= 1000
                    ? `${(totalRevenue / 1000).toFixed(1)}K`
                    : totalRevenue.toFixed(0)}
                </p>
                <p className="text-purple-100 text-xs mt-2">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <Banknote className="w-12 h-12 text-purple-200 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium uppercase tracking-wide">
                  Active Users
                </p>
                <p className="text-4xl font-bold mt-2">{activeUsers}</p>
                <p className="text-orange-100 text-xs mt-2">
                  {((activeUsers / totalUsers) * 100).toFixed(1)}% of total
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-200 opacity-80" />
            </div>
          </div>
        </div>

        {/* Key Metrics Banner */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm font-medium text-indigo-700 uppercase tracking-wide mb-2">
                Customer Conversion Rate
              </p>
              <p className="text-3xl font-bold text-indigo-900">
                {customers.length > 0
                  ? ((customersWithOrders.length / customers.length) * 100).toFixed(1)
                  : 0}
                %
              </p>
              <p className="text-xs text-indigo-600 mt-1">
                {customersWithOrders.length} of {customers.length} customers placed orders
              </p>
            </div>
            <div className="text-center border-l border-r border-indigo-200">
              <p className="text-sm font-medium text-purple-700 uppercase tracking-wide mb-2">
                Average Order Value
              </p>
              <p className="text-3xl font-bold text-purple-900">
                {customersWithOrders.length > 0
                  ? formatCurrency(totalRevenue / customersWithOrders.reduce((sum, u) => sum + (u.total_orders || 0), 0))
                  : "AED 0.00"}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Per order across all customers
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-pink-700 uppercase tracking-wide mb-2">
                Average Customer Lifetime Value
              </p>
              <p className="text-3xl font-bold text-pink-900">
                {customersWithOrders.length > 0
                  ? formatCurrency(totalRevenue / customersWithOrders.length)
                  : "AED 0.00"}
              </p>
              <p className="text-xs text-pink-600 mt-1">
                Total spent per customer
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customers Only</option>
                <option value="restaurant_owner">Restaurant Owners</option>
                <option value="driver">Drivers</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              User Directory ({filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 mt-4">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <PeopleOutlined className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No users found</p>
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      User Information
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Contact Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const isCustomer = (user.total_orders || 0) > 0;
                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-blue-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                              {user.name?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {user.name || "N/A"}
                              </p>
                              <p className="text-xs text-gray-500">ID: {user.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm text-gray-900 font-medium">
                              {user.email}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.phone || "N/A"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {isCustomer ? (
                              <>
                                <ShoppingBag className="w-4 h-4 text-green-600 mr-2" />
                                <span className="font-semibold text-green-900">
                                  {user.total_orders || 0}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-400 text-sm">No orders</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {isCustomer ? (
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(user.total_spent || 0)}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                              user.status === "active"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : user.status === "suspended"
                                ? "bg-red-100 text-red-800 border-red-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setSelectedUserId(user.id)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="View Full Details"
                            >
                              <VisibilityOutlined className="w-4 h-4" />
                            </button>
                            {user.status === "active" ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (
                                    confirm(
                                      `Are you sure you want to suspend ${user.name || user.email}?`
                                    )
                                  ) {
                                    handleStatusChange(user.id, "suspended");
                                  }
                                }}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Suspend User"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(user.id, "active");
                                }}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                title="Activate User"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 text-center">
            Showing {filteredUsers.length} of {totalUsers} total users
            {filterRole !== "all" && ` | Filtered by: ${filterRole}`}
            {searchTerm && ` | Search: "${searchTerm}"`}
          </p>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </AdminLayout>
  );
}
