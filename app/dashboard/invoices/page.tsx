"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin-layout";
import { api } from "@/lib/api";
import { Download, DollarSign, FileText, Calendar } from "lucide-react";
import { downloadInvoicePDF, type InvoiceData } from "@/components/invoice-pdf";

interface Invoice {
  id: number;
  restaurant_id: number;
  restaurant_name: string;
  amount: number;
  status: string;
  period_start: string;
  period_end: string;
  created_at: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    const response = await api.getInvoices();
    if (response.success) {
      setInvoices(response.data || []);
    }
    setLoading(false);
  };

  const handleGenerateInvoice = async () => {
    const response = await api.generateInvoice({
      period: "monthly",
    });
    if (response.success) {
      loadInvoices();
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    setDownloadingId(invoice.id);
    try {
      const response = await api.getInvoiceDetails(invoice.id);

      if (response.success && response.data) {
        const invoiceData: InvoiceData = {
          id: invoice.id,
          invoiceNumber: `INV-${String(invoice.id).padStart(6, "0")}`,
          restaurant_name: invoice.restaurant_name,
          restaurant_address: response.data.restaurant_address || "",
          restaurant_email: response.data.restaurant_email || "",
          restaurant_phone: response.data.restaurant_phone || "",
          amount: invoice.amount,
          status: invoice.status,
          period_start: invoice.period_start,
          period_end: invoice.period_end,
          created_at: invoice.created_at,
          orders: response.data.orders || [],
        };

        const success = downloadInvoicePDF(invoiceData);
        if (!success) {
          alert("Failed to generate PDF. Please try again.");
        }
      } else {
        alert("Failed to fetch invoice details. Please try again.");
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("An error occurred while generating the PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoices Management</h1>
            <p className="text-gray-600 mt-1">Generate and manage restaurant invoices</p>
          </div>
          <button
            onClick={handleGenerateInvoice}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Generate Invoice
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  ${invoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-green-50 rounded-full p-3">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {invoices.filter((inv) => inv.status === "pending").length}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-full p-3">
                <FileText className="w-6 h-6 text-yellow-600" />
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
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No invoices found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice ID
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
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        INV-{String(invoice.id).padStart(6, "0")}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {invoice.restaurant_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(invoice.period_start).toLocaleDateString()} -{" "}
                        {new Date(invoice.period_end).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${invoice.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDownloadPDF(invoice)}
                          disabled={downloadingId === invoice.id}
                          className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          {downloadingId === invoice.id ? "Generating..." : "Download PDF"}
                        </button>
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
