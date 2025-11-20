"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminLayout from "@/components/admin-layout";
import { api } from "@/lib/api";
import { ArrowLeft, Download, Share, FileText, Edit } from "@/components/icons";
import PDFViewer from "@/components/pdf-viewer";
import { generateCustomerInvoicePDF } from "@/lib/generate-customer-invoice-pdf";

interface OrderItem {
  id: string;
  quantity: number;
  base_price: number;
  item_total: number;
  item_name: string;
  item_description?: string;
  special_instructions?: string;
}

interface InvoiceDetail {
  id: string;
  order_id: string;
  order_number: string;
  invoice_number: number;
  invoice_type: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  restaurant_name: string;
  amount: number;
  status: string;
  notes: string;
  created_at: string;
  items?: OrderItem[];
}

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    setLoading(true);
    const response = await api.getInvoiceDetails(invoiceId);
    if (response.success && response.data) {
      setInvoice(response.data);

      // Generate PDF
      const pdf = await generateCustomerInvoicePDF({
        invoice_number: `${response.data.order_number}-${response.data.invoice_number}`,
        order_number: response.data.order_number,
        customer_name: response.data.customer_name,
        customer_email: response.data.customer_email,
        restaurant_name: response.data.restaurant_name,
        amount: response.data.amount,
        status: response.data.status,
        created_at: response.data.created_at,
        items: response.data.items || [],
      });
      setPdfUrl(pdf);
    }
    setLoading(false);
  };

  const handleDownloadPDF = () => {
    if (!pdfUrl || !invoice) return;

    // Create a temporary link to download the PDF
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Invoice_${invoice.order_number}-${invoice.invoice_number}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    // Share logic
    console.log("Share invoice");
  };

  const handleEdit = () => {
    // Edit logic
    console.log("Edit invoice");
  };

  const handleGenerateNew = () => {
    // Generate new invoice logic
    console.log("Generate new invoice");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">Loading invoice...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!invoice) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">Invoice not found</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.03),rgba(255,255,255,0))]">
      {/* Fixed navbar with back button */}
      <div className="relative sticky top-0 z-10 flex items-center justify-between h-16 bg-white/95 backdrop-blur-md border-b border-border/40 px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">
              Invoice {invoice.order_number}-{invoice.invoice_number}
            </h2>
            <p className="text-xs text-muted-foreground leading-tight">
              {invoice.customer_name} • {new Date(invoice.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Main content with PDF viewer and sidebar */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* PDF Viewer - takes remaining space */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="bg-white rounded-lg shadow-lg h-full border border-border/40 overflow-hidden">
            <PDFViewer pdfUrl={pdfUrl} />
          </div>
        </div>

        {/* Right Sidebar - same width as left sidebar (w-64) */}
        <div className="w-64 bg-white border-l border-border/40 p-6 flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={handleDownloadPDF}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={handleShare}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Share className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={handleEdit}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Invoice
              </button>
              <button
                onClick={handleGenerateNew}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                Generate New
              </button>
            </div>
          </div>

          <div className="border-t border-border/40 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Invoice Details</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-500">Customer</p>
                <p className="font-medium text-gray-900">{invoice.customer_name}</p>
                <p className="text-xs text-gray-500">{invoice.customer_email}</p>
              </div>
              <div>
                <p className="text-gray-500">Restaurant</p>
                <p className="font-medium text-gray-900">{invoice.restaurant_name}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <span
                  className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                    invoice.status === "paid"
                      ? "bg-green-100 text-green-800"
                      : invoice.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
