"use client";

import AdminLayout from "@/components/admin-layout";

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600 mt-1">Configure platform-wide settings</p>
        </div>

        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">Settings configuration coming soon</p>
        </div>
      </div>
    </AdminLayout>
  );
}
