"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin-layout";
import { api } from "@/lib/api";
import RestaurantMap from "@/components/restaurant-map";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Store,
  Trophy,
  BarChart as BarChartIcon,
  Clock,
  MapPin,
} from "@/components/icons";
import { Truck } from "@/components/icons";
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
  Cell,
} from "recharts";

interface Analytics {
  totalRevenue?: string;
  activeOrders?: string | number;
  totalUsers?: string | number;
  activeRestaurants?: string | number;
  recentOrders?: Array<{ id: number; restaurant: string; total: string; status: string }>;
  topRestaurants?: Array<{ id: number; name: string; orders: number; revenue: string }>;
}

interface Restaurant {
  id: number | string;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  is_active: boolean;
  operating_status?: string;
  orders_today?: number;
}

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

const orderStatusData = [
  { status: "Pending", count: 12, color: "#f59e0b" },
  { status: "Confirmed", count: 34, color: "#3b82f6" },
  { status: "Preparing", count: 45, color: "#8b5cf6" },
  { status: "Ready", count: 38, color: "#10b981" },
  { status: "Delivered", count: 127, color: "#059669" },
];

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [analyticsResponse, restaurantsResponse] = await Promise.all([
      api.getAnalytics(),
      api.getRestaurants(),
    ]);
    if (analyticsResponse.success) {
      setAnalytics(analyticsResponse.data);
    }
    if (restaurantsResponse.success) {
      // Extract lat/lng from nested address object
      const restaurantsWithCoords = (restaurantsResponse.data || []).map((r: any) => ({
        ...r,
        latitude: r.address?.latitude || r.latitude,
        longitude: r.address?.longitude || r.longitude,
      }));
      setRestaurants(restaurantsWithCoords);
    }
    setLoading(false);
  };

  const stats = [
    {
      name: "Total Revenue",
      value: "AED 124,850",
      change: "+12.5%",
      trend: "up",
      icon: TrendingUp,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      name: "Active Orders",
      value: "156",
      change: "+23%",
      trend: "up",
      icon: ShoppingCart,
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "Total Customers",
      value: "2,847",
      change: "+8.1%",
      trend: "up",
      icon: Users,
      color: "from-purple-500 to-purple-600",
    },
    {
      name: "Active Restaurants",
      value: "4/5",
      change: "80%",
      trend: "neutral",
      icon: Store,
      color: "from-orange-500 to-orange-600",
    },
    {
      name: "Pending Approvals",
      value: "12",
      change: "3 new",
      trend: "neutral",
      icon: Clock,
      color: "from-amber-500 to-amber-600",
    },
    {
      name: "Active Drivers",
      value: "28",
      change: "+5 today",
      trend: "up",
      icon: Users,
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[600px]">
          <div className="text-center">
            <BarChartIcon className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      pageTitle="Dashboard"
      pageSubtitle="Real-time platform analytics and insights"
      showLastUpdated={true}
    >
      <div className="space-y-6">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="bg-white rounded-xl shadow-sm border border-border/40 p-5 hover:shadow-md transition-all"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center shadow-lg">
                    <Icon className="w-5 h-5 text-white" />
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

        {/* Map and Top Restaurants Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Restaurant Map */}
          <div className="bg-white rounded-xl shadow-sm border border-border/40 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Restaurant Locations</h3>
            </div>
            <div className="h-[340px]">
              <RestaurantMap restaurants={restaurants} />
            </div>
          </div>

          {/* Top Restaurants */}
          <div className="bg-white rounded-xl shadow-sm border border-border/40 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Restaurants</h3>
            </div>
            <div className="space-y-2 h-[340px]">
              {Array.from({ length: 5 }).map((_, index) => {
                const sortedRestaurants = [...restaurants]
                  .sort((a, b) => (b.orders_today || 0) - (a.orders_today || 0));
                const restaurant = sortedRestaurants[index];

                if (restaurant) {
                  return (
                    <div key={restaurant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{restaurant.name}</p>
                          <p className="text-xs text-gray-600">{restaurant.orders_today || 0} orders today</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm">AED {((restaurant.orders_today || 0) * 85).toFixed(0)}</p>
                        <p className="text-xs text-gray-500">Revenue</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={`empty-${index}`} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-400 text-sm">No restaurant</p>
                        <p className="text-xs text-gray-300">-</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-300 text-sm">-</p>
                      <p className="text-xs text-gray-300">-</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Three Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-border/40 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={10} />
                <YAxis stroke="#6b7280" fontSize={10} domain={[1000, 'auto']} />
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

          {/* Order Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-border/40 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderStatusData} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="status" stroke="#6b7280" fontSize={10} />
                <YAxis stroke="#6b7280" fontSize={10} domain={[1, 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#6b7280" radius={[8, 8, 0, 0]}>
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Peak Hours */}
          <div className="bg-white rounded-xl shadow-sm border border-border/40 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChartIcon className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Orders by Hour</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ordersPerHour} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="hour" stroke="#6b7280" fontSize={10} />
                <YAxis stroke="#6b7280" fontSize={10} domain={[1, 'auto']} />
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
        </div>
      </div>
    </AdminLayout>
  );
}
