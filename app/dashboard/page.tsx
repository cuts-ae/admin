"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin-layout";
import RestaurantMap from "@/components/restaurant-map";
import { api } from "@/lib/api";
import {
  TrendingUpOutlined,
  AttachMoneyOutlined,
  ShoppingCartOutlined,
  PeopleOutlined,
  StorefrontOutlined,
  ViewInArOutlined,
  BarChartOutlined,
  AccessTimeOutlined,
  LocationOnOutlined
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Analytics {
  totalRevenue?: string;
  activeOrders?: string | number;
  totalUsers?: string | number;
  activeRestaurants?: string | number;
  recentOrders?: Array<{ id: number; restaurant: string; total: string; status: string }>;
  topRestaurants?: Array<{ id: number; name: string; orders: number; revenue: string }>;
}

// Mock restaurant locations in Abu Dhabi
const mockRestaurants = [
  { id: 1, name: "FitFresh Abu Dhabi", latitude: 24.4539, longitude: 54.3773, status: "active", orders_today: 45 },
  { id: 2, name: "Healthy Bites Marina", latitude: 24.4700, longitude: 54.3600, status: "active", orders_today: 32 },
  { id: 3, name: "Green Bowl Yas", latitude: 24.4900, longitude: 54.6100, status: "active", orders_today: 28 },
  { id: 4, name: "Fresh Eats Downtown", latitude: 24.4200, longitude: 54.4300, status: "inactive", orders_today: 0 },
  { id: 5, name: "Protein Palace Corniche", latitude: 24.4800, longitude: 54.3500, status: "active", orders_today: 51 },
];

// Mock data for charts
const revenueData = [
  { day: "Mon", revenue: 12400, orders: 85 },
  { day: "Tue", revenue: 15600, orders: 102 },
  { day: "Wed", revenue: 18200, orders: 118 },
  { day: "Thu", revenue: 14800, orders: 95 },
  { day: "Fri", revenue: 22100, orders: 145 },
  { day: "Sat", revenue: 25400, orders: 168 },
  { day: "Sun", revenue: 19800, orders: 132 },
];

const ordersPerHour = [
  { hour: "6AM", orders: 12 },
  { hour: "8AM", orders: 28 },
  { hour: "10AM", orders: 45 },
  { hour: "12PM", orders: 78 },
  { hour: "2PM", orders: 62 },
  { hour: "4PM", orders: 41 },
  { hour: "6PM", orders: 85 },
  { hour: "8PM", orders: 92 },
  { hour: "10PM", orders: 38 },
];

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
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

  const stats = [
    {
      name: "Total Revenue",
      value: "AED 124,850",
      change: "+12.5%",
      trend: "up",
      icon: AttachMoneyOutlined,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      name: "Active Orders",
      value: "156",
      change: "+23%",
      trend: "up",
      icon: ShoppingCartOutlined,
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "Total Customers",
      value: "2,847",
      change: "+8.1%",
      trend: "up",
      icon: PeopleOutlined,
      color: "from-purple-500 to-purple-600",
    },
    {
      name: "Active Restaurants",
      value: "4/5",
      change: "80%",
      trend: "neutral",
      icon: StorefrontOutlined,
      color: "from-orange-500 to-orange-600",
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[600px]">
          <div className="text-center">
            <BarChartOutlined className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
            <p className="text-gray-600">Real-time platform analytics and insights</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-border/40 shadow-sm">
            <AccessTimeOutlined className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700 font-medium">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="bg-white rounded-xl shadow-sm border border-border/40 p-6 hover:shadow-md transition-all"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {stat.trend !== "neutral" && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      stat.trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {stat.change}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Map and Revenue Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Restaurant Map */}
          <div className="bg-white rounded-xl shadow-sm border border-border/40 p-6">
            <div className="flex items-center gap-2 mb-4">
              <LocationOnOutlined className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Restaurant Locations</h3>
            </div>
            <div className="h-[400px]">
              <RestaurantMap restaurants={mockRestaurants} />
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-border/40 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUpOutlined className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Per Hour and Top Restaurants */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Peak Hours */}
          <div className="bg-white rounded-xl shadow-sm border border-border/40 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChartOutlined className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Orders by Hour</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ordersPerHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="hour" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="orders" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Restaurants */}
          <div className="bg-white rounded-xl shadow-sm border border-border/40 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ViewInArOutlined className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Restaurants</h3>
            </div>
            <div className="space-y-4">
              {mockRestaurants
                .filter(r => r.status === "active")
                .sort((a, b) => (b.orders_today || 0) - (a.orders_today || 0))
                .map((restaurant, index) => (
                  <div key={restaurant.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{restaurant.name}</p>
                        <p className="text-sm text-gray-600">{restaurant.orders_today} orders today</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">AED {((restaurant.orders_today || 0) * 85).toFixed(0)}</p>
                      <p className="text-xs text-gray-500">Revenue</p>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
