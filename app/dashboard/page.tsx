"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin-layout";
import { api } from "@/lib/api";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Store } from "lucide-react";

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    const response = await api.getAnalytics();
    if (response.success) {
      setAnalytics(response.data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      </AdminLayout>
    );
  }

  const stats = [
    {
      name: "Total Revenue",
      value: analytics?.totalRevenue || "$0",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
    },
    {
      name: "Active Orders",
      value: analytics?.activeOrders || "0",
      change: "+5.2%",
      trend: "up",
      icon: ShoppingCart,
    },
    {
      name: "Total Users",
      value: analytics?.totalUsers || "0",
      change: "+8.1%",
      trend: "up",
      icon: Users,
    },
    {
      name: "Active Restaurants",
      value: analytics?.activeRestaurants || "0",
      change: "-2.3%",
      trend: "down",
      icon: Store,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform overview and analytics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
            return (
              <div key={stat.name} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <TrendIcon
                        className={`w-4 h-4 mr-1 ${
                          stat.trend === "up" ? "text-green-600" : "text-red-600"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          stat.trend === "up" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-full p-3">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
            <div className="space-y-4">
              {analytics?.recentOrders?.length > 0 ? (
                analytics.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">Order #{order.id}</p>
                      <p className="text-sm text-gray-600">{order.restaurant}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${order.total}</p>
                      <p className="text-xs text-gray-500">{order.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent orders</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Restaurants</h3>
            <div className="space-y-4">
              {analytics?.topRestaurants?.length > 0 ? (
                analytics.topRestaurants.map((restaurant: any, index: number) => (
                  <div key={restaurant.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{restaurant.name}</p>
                        <p className="text-sm text-gray-600">{restaurant.orders} orders</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">${restaurant.revenue}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No restaurant data</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
