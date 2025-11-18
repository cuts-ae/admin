"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DashboardOutlined,
  StorefrontOutlined,
  DescriptionOutlined,
  PeopleOutlined,
  LocalShippingOutlined,
  ShoppingCartOutlined,
  SettingsOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@mui/icons-material";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/login");
  };

  if (!user) {
    return null;
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: DashboardOutlined },
    { name: "Restaurants", href: "/dashboard/restaurants", icon: StorefrontOutlined },
    { name: "Invoices", href: "/dashboard/invoices", icon: DescriptionOutlined },
    { name: "Users", href: "/dashboard/users", icon: PeopleOutlined },
    { name: "Drivers", href: "/dashboard/drivers", icon: LocalShippingOutlined },
    { name: "Orders", href: "/dashboard/orders", icon: ShoppingCartOutlined },
    { name: "Settings", href: "/dashboard/settings", icon: SettingsOutlined },
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
          <div className="flex items-center justify-between h-20 px-6 border-b border-border/40">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Administrator</h1>
                <p className="text-xs text-muted-foreground">Portal</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <CloseOutlined className="w-5 h-5" />
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
                {(user.name || user.email).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name || user.email}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogoutOutlined className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="relative sticky top-0 z-10 flex items-center h-16 bg-white/95 backdrop-blur-md border-b border-border/40 px-6 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
          >
            <MenuOutlined className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {navigation.find((item) => item.href === pathname)?.name || "Dashboard"}
          </h2>
        </div>

        {/* Page content */}
        <main className="relative p-6">{children}</main>
      </div>
    </div>
  );
}
