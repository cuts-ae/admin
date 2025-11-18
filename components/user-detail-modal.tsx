"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  CloseOutlined,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  Edit2,
  Save,
  XCircle,
  FileText,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
} from "@mui/icons-material";

interface UserDetails {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  created_at: string;
  last_login?: string;
  address?: string;
  city?: string;
  emirate?: string;
  postal_code?: string;
  total_orders?: number;
  total_spent?: number;
}

interface Order {
  id: number;
  order_number: string;
  restaurant_name: string;
  status: string;
  total_amount: number;
  created_at: string;
  items_count: number;
  delivery_address?: string;
  payment_method?: string;
  invoice_id?: number;
}

interface UserDetailModalProps {
  userId: number;
  onClose: () => void;
}

export default function UserDetailModal({
  userId,
  onClose,
}: UserDetailModalProps) {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "orders">("info");
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<UserDetails>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    setLoading(true);

    // Load user details
    const userResponse = await api.getUserDetails(userId);
    if (userResponse.success) {
      setUser(userResponse.data);
      setEditedUser(userResponse.data);
    }

    // Load user orders
    const ordersResponse = await api.getUserOrders(userId);
    if (ordersResponse.success) {
      setOrders(ordersResponse.data || []);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const response = await api.updateUser(user.id, editedUser);

    if (response.success) {
      setUser({ ...user, ...editedUser });
      setEditMode(false);
    } else {
      alert("Failed to update user: " + response.error);
    }

    setSaving(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!user) return;

    const response = await api.updateUserStatus(user.id, newStatus);
    if (response.success) {
      setUser({ ...user, status: newStatus });
      setEditedUser({ ...editedUser, status: newStatus });
    } else {
      alert("Failed to update status: " + response.error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "pending":
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "on_delivery":
      case "shipping":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return `AED ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <p className="text-red-600">Failed to load user details</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) =>
    o.status.toLowerCase() === "completed" || o.status.toLowerCase() === "delivered"
  ).length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name || "N/A"}</h2>
              <p className="text-blue-100">User ID: {user.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <CloseOutlined className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-4 px-6">
            <button
              onClick={() => setActiveTab("info")}
              className={`py-4 px-6 font-medium transition-colors relative ${
                activeTab === "info"
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              User Information
              {activeTab === "info" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`py-4 px-6 font-medium transition-colors relative ${
                activeTab === "orders"
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Orders & Invoices
              {activeTab === "orders" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "info" && (
            <div className="space-y-6">
              {/* Edit Controls */}
              <div className="flex justify-between items-center bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-blue-700">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">
                    {editMode ? "Editing User Information" : "View Mode"}
                  </span>
                </div>
                <div className="flex space-x-2">
                  {editMode ? (
                    <>
                      <button
                        onClick={() => {
                          setEditMode(false);
                          setEditedUser(user);
                        }}
                        disabled={saving}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{saving ? "Saving..." : "Save Changes"}</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit User</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Total Orders</p>
                      <p className="text-3xl font-bold text-blue-900 mt-1">{totalOrders}</p>
                    </div>
                    <ShoppingBag className="w-10 h-10 text-blue-600 opacity-50" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">Completed Orders</p>
                      <p className="text-3xl font-bold text-green-900 mt-1">{completedOrders}</p>
                    </div>
                    <CheckCircle className="w-10 h-10 text-green-600 opacity-50" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700">Total Spent</p>
                      <p className="text-3xl font-bold text-purple-900 mt-1">
                        {formatCurrency(totalSpent)}
                      </p>
                    </div>
                    <DollarSign className="w-10 h-10 text-purple-600 opacity-50" />
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 mr-2 text-gray-500" />
                      Full Name
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={editedUser.name || ""}
                        onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                        {user.name || "N/A"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      Email Address
                    </label>
                    {editMode ? (
                      <input
                        type="email"
                        value={editedUser.email || ""}
                        onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                        {user.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      Phone Number
                    </label>
                    {editMode ? (
                      <input
                        type="tel"
                        value={editedUser.phone || ""}
                        onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                        {user.phone || "N/A"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      Member Since
                    </label>
                    <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                      {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                      Street Address
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={editedUser.address || ""}
                        onChange={(e) => setEditedUser({ ...editedUser, address: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                        {user.address || "N/A"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">City</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={editedUser.city || ""}
                        onChange={(e) => setEditedUser({ ...editedUser, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                        {user.city || "N/A"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Emirate</label>
                    {editMode ? (
                      <select
                        value={editedUser.emirate || ""}
                        onChange={(e) => setEditedUser({ ...editedUser, emirate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Emirate</option>
                        <option value="Abu Dhabi">Abu Dhabi</option>
                        <option value="Dubai">Dubai</option>
                        <option value="Sharjah">Sharjah</option>
                        <option value="Ajman">Ajman</option>
                        <option value="Umm Al Quwain">Umm Al Quwain</option>
                        <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                        <option value="Fujairah">Fujairah</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                        {user.emirate || "N/A"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Postal Code</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={editedUser.postal_code || ""}
                        onChange={(e) => setEditedUser({ ...editedUser, postal_code: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                        {user.postal_code || "N/A"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Role</label>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {user.role}
                    </span>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Account Status</label>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                      {!editMode && (
                        <select
                          value={user.status}
                          onChange={(e) => handleStatusChange(e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {user.last_login && (
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                        Last Login
                      </label>
                      <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                        {formatDate(user.last_login)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-blue-700">
                    <ShoppingBag className="w-5 h-5" />
                    <span className="font-semibold">
                      Complete Order History ({orders.length} orders)
                    </span>
                  </div>
                  <div className="text-blue-900 font-bold text-lg">
                    Total: {formatCurrency(totalSpent)}
                  </div>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No orders found</p>
                  <p className="text-gray-500 text-sm mt-2">This user has not placed any orders yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                Order #{order.order_number}
                              </h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm">
                              {order.restaurant_name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              {formatCurrency(order.total_amount)}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                              Items
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {order.items_count} items
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                              Payment
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {order.payment_method || "N/A"}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                              Delivery Address
                            </p>
                            <p className="text-sm text-gray-900">
                              {order.delivery_address || "N/A"}
                            </p>
                          </div>
                        </div>

                        {order.invoice_id && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
                              <div className="flex items-center space-x-2 text-purple-700">
                                <FileText className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  Invoice #{order.invoice_id}
                                </span>
                              </div>
                              <button
                                onClick={() => window.open(`/dashboard/invoices/${order.invoice_id}`, '_blank')}
                                className="text-sm text-purple-700 font-medium hover:text-purple-900 hover:underline"
                              >
                                View Invoice
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
