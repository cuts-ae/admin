"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface InvoiceData {
  id: number;
  invoiceNumber: string;
  restaurant_name: string;
  restaurant_address?: string;
  restaurant_email?: string;
  restaurant_phone?: string;
  amount: number;
  status: string;
  period_start: string;
  period_end: string;
  created_at: string;
  orders?: Array<{
    id: number;
    order_number: string;
    customer_name: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    subtotal: number;
    delivery_fee: number;
    service_fee: number;
    total: number;
    created_at: string;
  }>;
}

export function generateInvoicePDF(invoiceData: InvoiceData) {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors
  const primaryColor: [number, number, number] = [37, 99, 235]; // Blue-600
  const textDark: [number, number, number] = [17, 24, 39]; // Gray-900
  const textLight: [number, number, number] = [107, 114, 128]; // Gray-500
  const bgLight: [number, number, number] = [249, 250, 251]; // Gray-50

  let yPosition = 20;

  // Header - Company Name
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("CUTS.AE", 20, yPosition);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textLight[0], textLight[1], textLight[2]);
  doc.text("Food Delivery Platform", 20, yPosition + 6);

  // Invoice Title and Number (Right aligned)
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("INVOICE", pageWidth - 20, yPosition, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textLight[0], textLight[1], textLight[2]);
  doc.text(invoiceData.invoiceNumber, pageWidth - 20, yPosition + 6, { align: "right" });

  yPosition += 25;

  // Horizontal line
  doc.setDrawColor(229, 231, 235); // Gray-200
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, pageWidth - 20, yPosition);

  yPosition += 15;

  // Invoice Details - Two columns
  const leftColX = 20;
  const rightColX = pageWidth / 2 + 10;

  // Left Column - Bill To
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("BILL TO", leftColX, yPosition);

  yPosition += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(invoiceData.restaurant_name, leftColX, yPosition);
  yPosition += 5;

  doc.setFontSize(9);
  doc.setTextColor(textLight[0], textLight[1], textLight[2]);
  if (invoiceData.restaurant_address) {
    doc.text(invoiceData.restaurant_address, leftColX, yPosition);
    yPosition += 4;
  }
  if (invoiceData.restaurant_email) {
    doc.text(invoiceData.restaurant_email, leftColX, yPosition);
    yPosition += 4;
  }
  if (invoiceData.restaurant_phone) {
    doc.text(invoiceData.restaurant_phone, leftColX, yPosition);
  }

  // Reset yPosition for right column
  yPosition -= (invoiceData.restaurant_address ? 4 : 0) +
               (invoiceData.restaurant_email ? 4 : 0) +
               (invoiceData.restaurant_phone ? 4 : 0) + 11;

  // Right Column - Invoice Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("INVOICE DETAILS", rightColX, yPosition);

  yPosition += 6;

  const details = [
    { label: "Invoice Date:", value: new Date(invoiceData.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
    { label: "Period:", value: `${new Date(invoiceData.period_start).toLocaleDateString()} - ${new Date(invoiceData.period_end).toLocaleDateString()}` },
    { label: "Status:", value: invoiceData.status.toUpperCase() },
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  details.forEach((detail) => {
    doc.setTextColor(textLight[0], textLight[1], textLight[2]);
    doc.text(detail.label, rightColX, yPosition);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(detail.value, rightColX + 25, yPosition);
    yPosition += 4.5;
  });

  yPosition += 15;

  // Orders Table
  if (invoiceData.orders && invoiceData.orders.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text("Order Details", 20, yPosition);

    yPosition += 8;

    const tableData: any[] = [];

    invoiceData.orders.forEach((order) => {
      // Order header row
      tableData.push([
        { content: `Order #${order.order_number}`, colSpan: 2, styles: { fontStyle: "bold", fillColor: bgLight } },
        { content: new Date(order.created_at).toLocaleDateString(), styles: { fontStyle: "bold", fillColor: bgLight } },
        { content: `$${order.total.toFixed(2)}`, styles: { fontStyle: "bold", fillColor: bgLight, halign: "right" } },
      ]);

      // Order items
      if (order.items && order.items.length > 0) {
        order.items.forEach((item) => {
          tableData.push([
            "",
            `${item.name} (x${item.quantity})`,
            "",
            `$${(item.price * item.quantity).toFixed(2)}`,
          ]);
        });
      }

      // Order fees
      tableData.push([
        "",
        "Subtotal",
        "",
        `$${order.subtotal.toFixed(2)}`,
      ]);

      if (order.delivery_fee > 0) {
        tableData.push([
          "",
          "Delivery Fee",
          "",
          `$${order.delivery_fee.toFixed(2)}`,
        ]);
      }

      if (order.service_fee > 0) {
        tableData.push([
          "",
          "Service Fee",
          "",
          `$${order.service_fee.toFixed(2)}`,
        ]);
      }
    });

    autoTable(doc, {
      startY: yPosition,
      head: [["Date", "Description", "Customer", "Amount"]],
      body: tableData,
      theme: "plain",
      styles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: textDark,
      },
      headStyles: {
        fillColor: bgLight,
        textColor: textDark,
        fontStyle: "bold",
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 70 },
        2: { cellWidth: 45 },
        3: { cellWidth: 30, halign: "right" },
      },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Summary Section
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  yPosition += 10;

  // Summary box
  const summaryX = pageWidth - 80;
  const summaryWidth = 60;

  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.rect(summaryX - 5, yPosition - 5, summaryWidth + 10, 35, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textLight[0], textLight[1], textLight[2]);
  doc.text("TOTAL AMOUNT", summaryX, yPosition);

  yPosition += 8;

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`$${invoiceData.amount.toFixed(2)}`, summaryX, yPosition);

  yPosition += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textLight[0], textLight[1], textLight[2]);

  const statusColor = invoiceData.status === "paid"
    ? [34, 197, 94] // Green-500
    : invoiceData.status === "pending"
    ? [234, 179, 8] // Yellow-500
    : [239, 68, 68]; // Red-500

  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`Status: ${invoiceData.status.toUpperCase()}`, summaryX, yPosition);

  // Footer
  yPosition = pageHeight - 30;

  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, pageWidth - 20, yPosition);

  yPosition += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textLight[0], textLight[1], textLight[2]);
  doc.text("Thank you for your business!", 20, yPosition);

  doc.setFontSize(8);
  yPosition += 5;
  doc.text("For questions about this invoice, please contact support@cuts.ae", 20, yPosition);

  // Page number
  doc.text(`Page 1 of 1`, pageWidth - 20, yPosition, { align: "right" });

  // Save the PDF
  const fileName = `${invoiceData.invoiceNumber.replace(/\s+/g, "_")}_${invoiceData.restaurant_name.replace(/\s+/g, "_")}.pdf`;
  doc.save(fileName);
}

export function downloadInvoicePDF(invoiceData: InvoiceData) {
  try {
    generateInvoicePDF(invoiceData);
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
}
