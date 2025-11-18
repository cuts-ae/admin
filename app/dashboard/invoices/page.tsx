"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin-layout";
import { api } from "@/lib/api";
import { DownloadOutlined, AttachMoneyOutlined, DescriptionOutlined, CalendarMonthOutlined } from "@mui/icons-material";
import { downloadInvoicePDF, type InvoiceData } from "@/components/invoice-pdf";

interface Invoice {
  id: number;
  restaurant_id: number;
  restaurant_name: string;
  period_start: string;
  period_end: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    const response = await api.getInvoices();
    if (response.success && response.data) {
      setInvoices(response.data);
    }
    setLoading(false);
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    const invoiceData: InvoiceData = {
      invoiceNumber: `INV-${invoice.id.toString().padStart(6, '0')}`,
      date: new Date(invoice.created_at).toLocaleDateString(),
      restaurantName: invoice.restaurant_name,
      periodStart: new Date(invoice.period_start).toLocaleDateString(),
      periodEnd: new Date(invoice.period_end).toLocaleDateString(),
      amount: invoice.amount,
      status: invoice.status,
    };

    downloadInvoicePDF(invoiceData);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Invoices</h1>
          <p className="text-gray-600">Manage restaurant invoices and payments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  AED {invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-green-50 rounded-full p-3">
                <AttachMoneyOutlined className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  AED{" "}
                  {invoices
                    .filter((inv) => inv.status === "pending")
                    .reduce((sum, inv) => sum + inv.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-full p-3">
                <DescriptionOutlined className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid Invoices</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {invoices.filter((inv) => inv.status === "paid").length}
                </p>
              </div>
              <div className="bg-blue-50 rounded-full p-3">
                <CalendarMonthOutlined className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No invoices found</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      INV-{invoice.id.toString().padStart(6, '0')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.restaurant_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.period_start).toLocaleDateString()} -{" "}
                      {new Date(invoice.period_end).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      AED {invoice.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          invoice.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : invoice.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleDownloadPDF(invoice)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <DownloadOutlined className="w-4 h-4" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
