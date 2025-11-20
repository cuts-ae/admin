"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin-layout";
import { api } from "@/lib/api";
import { Download, TrendingUp, FileText, Calendar } from "@/components/icons";
import { downloadInvoicePDF, type InvoiceData } from "@/components/invoice-pdf";

interface Invoice {
  id: string;
  order_id: string;
  order_number: string;
  invoice_number: number;
  invoice_type: string;
  customer_name: string;
  customer_email: string;
  restaurant_name: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function InvoicesPage() {
  const router = useRouter();
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
      id: invoice.id,
      invoiceNumber: `INV-${invoice.id.toString().padStart(6, '0')}`,
      restaurant_name: invoice.restaurant_name,
      amount: invoice.amount,
      status: invoice.status,
      created_at: invoice.created_at,
    };

    await downloadInvoicePDF(invoiceData);
  };

  const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  const pendingAmount = invoices.filter((inv) => inv.status === "pending").reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  const paidCount = invoices.filter((inv) => inv.status === "paid").length;

  const statWidgets = [
    {
      label: "Total Revenue",
      value: `AED ${totalRevenue.toFixed(0)}`,
      icon: TrendingUp,
      color: "bg-green-50 text-green-700",
    },
    {
      label: "Pending",
      value: `AED ${pendingAmount.toFixed(0)}`,
      icon: FileText,
      color: "bg-yellow-50 text-yellow-700",
    },
    {
      label: "Paid",
      value: `${paidCount}`,
      icon: Calendar,
      color: "bg-blue-50 text-blue-700",
    },
  ];

  return (
    <AdminLayout
      pageTitle="Invoices"
      pageSubtitle="Manage restaurant invoices and payments"
      statWidgets={statWidgets}
    >
      <div className="space-y-6">

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
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.order_number}-{invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{invoice.customer_name}</p>
                        <p className="text-xs text-gray-500">{invoice.customer_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.restaurant_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      AED {Number(invoice.amount).toFixed(2)}
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
                      {new Date(invoice.created_at).toLocaleDateString()}
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
