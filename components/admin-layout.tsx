"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Store,
  FileText,
  Users,
  Truck,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  Clock,
  Search,
} from "@/components/icons";

interface StatWidget {
  label: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  showLastUpdated?: boolean;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showStatusFilter?: boolean;
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  statWidgets?: StatWidget[];
}

export default function AdminLayout({ children, pageTitle, pageSubtitle, showLastUpdated, showSearch, searchValue, onSearchChange, showStatusFilter, statusValue, onStatusChange, statWidgets }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const userData = localStorage.getItem("admin_user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "admin") {
      router.push("/login");
      return;
    }

    setUser(parsedUser);
  }, [router]);

  useEffect(() => {
    if (showLastUpdated) {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showLastUpdated]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/login");
  };

  if (!user) {
    return null;
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Restaurants", href: "/dashboard/restaurants", icon: Store },
    { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
    { name: "Users", href: "/dashboard/users", icon: Users },
    { name: "Drivers", href: "/dashboard/drivers", icon: Truck },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.03),rgba(255,255,255,0))]">
      {/* Dots background pattern */}
      <div className="fixed inset-0 opacity-[0.015] bg-[radial-gradient(circle_at_1px_1px,rgb(0_0_0)_1px,transparent_0)] bg-[size:24px_24px] pointer-events-none" />

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-md border-r border-border/40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-border/40">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-10 h-10 object-contain"
              />
              <div className="flex flex-col justify-center">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">Administrator</h1>
                <p className="text-xs text-muted-foreground leading-tight">Portal</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-border/40 p-4 bg-muted/30">
            <div className="flex items-center mb-4 px-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold mr-3">
                {(user.first_name || user.email).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="relative sticky top-0 z-10 flex items-center justify-between h-16 bg-white/95 backdrop-blur-md border-b border-border/40 px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col justify-center">
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                {pageTitle || navigation.find((item) => item.href === pathname)?.name || "Dashboard"}
              </h2>
              {pageSubtitle && (
                <p className="text-xs text-muted-foreground leading-tight">
                  {pageSubtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {statWidgets && statWidgets.length > 0 && (
              <div className="flex items-center gap-2">
                {statWidgets.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${stat.color}`}>
                      <Icon className="w-4 h-4" />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium leading-none">{stat.label}</span>
                        <span className="text-sm font-bold leading-none mt-0.5">{stat.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {showSearch && onSearchChange && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-64 pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            {showStatusFilter && onStatusChange && (
              <select
                value={statusValue}
                onChange={(e) => onStatusChange(e.target.value)}
                className="pl-3 pr-9 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            )}
            {showLastUpdated && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Last updated: {currentTime.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="relative p-6">{children}</main>
      </div>
    </div>
  );
}
