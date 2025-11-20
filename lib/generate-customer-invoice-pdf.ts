import jsPDF from "jspdf";

interface OrderItem {
  id: string;
  quantity: number;
  base_price: number;
  item_total: number;
  item_name: string;
  item_description?: string;
  special_instructions?: string;
}

interface CustomerInvoiceData {
  invoice_number: string;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  restaurant_name: string;
  amount: number;
  status: string;
  created_at: string;
  items?: OrderItem[];
}

// Helper to convert font file to base64
async function loadFontAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix to get just the base64 string
      resolve(base64.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function generateCustomerInvoicePDF(data: CustomerInvoiceData): Promise<string> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Load Geist fonts (Regular, Medium, SemiBold, Bold, Mono)
  try {
    const geistRegular = await loadFontAsBase64('/fonts/Geist-Regular.ttf');
    const geistMedium = await loadFontAsBase64('/fonts/Geist-Medium.ttf');
    const geistSemiBold = await loadFontAsBase64('/fonts/Geist-SemiBold.ttf');
    const geistBold = await loadFontAsBase64('/fonts/Geist-Bold.ttf');
    const geistMonoRegular = await loadFontAsBase64('/fonts/GeistMono-Regular.ttf');
    const geistMonoSemiBold = await loadFontAsBase64('/fonts/GeistMono-SemiBold.ttf');

    pdf.addFileToVFS('Geist-Regular.ttf', geistRegular);
    pdf.addFileToVFS('Geist-Medium.ttf', geistMedium);
    pdf.addFileToVFS('Geist-SemiBold.ttf', geistSemiBold);
    pdf.addFileToVFS('Geist-Bold.ttf', geistBold);
    pdf.addFileToVFS('GeistMono-Regular.ttf', geistMonoRegular);
    pdf.addFileToVFS('GeistMono-SemiBold.ttf', geistMonoSemiBold);

    pdf.addFont('Geist-Regular.ttf', 'Geist', 'normal');
    pdf.addFont('Geist-Medium.ttf', 'Geist', 'medium');
    pdf.addFont('Geist-SemiBold.ttf', 'Geist', 'semibold');
    pdf.addFont('Geist-Bold.ttf', 'Geist', 'bold');
    pdf.addFont('GeistMono-Regular.ttf', 'GeistMono', 'normal');
    pdf.addFont('GeistMono-SemiBold.ttf', 'GeistMono', 'semibold');
  } catch (error) {
    console.error('Failed to load Geist font, falling back to Helvetica:', error);
  }

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12.7; // 0.5 inches = 12.7mm

  // Set Geist font (or Helvetica as fallback)
  try {
    pdf.setFont("Geist");
  } catch {
    pdf.setFont("helvetica");
  }

  // Header - Invoice Title
  pdf.setFontSize(22);
  pdf.setFont("Geist", "semibold");
  pdf.setCharSpace(-0.2); // Tighten letter spacing
  pdf.text("Invoice", margin, margin + 4);
  pdf.setCharSpace(0); // Reset to default

  // Load and add logo (aligned with Invoice text)
  try {
    const logoResponse = await fetch('/logo.png');
    const logoBlob = await logoResponse.blob();
    const logoBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(logoBlob);
    });

    // Add logo to top right (10mm width, aligned with Invoice text baseline)
    const logoWidth = 10;
    const logoHeight = 10; // Assuming square logo
    // Position logo at same Y as Invoice text (margin + 4 for baseline, minus logoHeight to align tops)
    const logoY = margin + 4 - logoHeight + 2; // Adjust to align with text
    pdf.addImage(logoBase64, 'PNG', pageWidth - margin - logoWidth, logoY, logoWidth, logoHeight);
  } catch (error) {
    console.error('Failed to load logo:', error);
  }

  // Invoice details below title
  pdf.setFontSize(10);
  pdf.setFont("Geist", "semibold");
  pdf.setCharSpace(0); // Regular character spacing for invoice details

  const detailsStartY = margin + 15;
  const lineHeight = 5;
  const labelWidth = 35; // Width allocated for labels to align values

  // Invoice number label
  pdf.text("Invoice number", margin, detailsStartY);

  // Invoice number value (monospaced using GeistMono)
  pdf.setFont("GeistMono", "semibold");
  pdf.text(data.invoice_number, margin + labelWidth, detailsStartY);

  // Date of issue
  pdf.setFont("Geist", "semibold"); // Back to regular font
  const issueDate = new Date(data.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  pdf.text("Date of issue", margin, detailsStartY + lineHeight);
  pdf.text(issueDate, margin + labelWidth, detailsStartY + lineHeight);

  // Date due (30 days from issue date)
  const dueDate = new Date(data.created_at);
  dueDate.setDate(dueDate.getDate() + 30);
  const dueDateStr = dueDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  pdf.text("Date due", margin, detailsStartY + lineHeight * 2);
  pdf.text(dueDateStr, margin + labelWidth, detailsStartY + lineHeight * 2);

  // Three-column layout (2 lines below Date due) with increased spacing
  const companyStartY = detailsStartY + lineHeight * 2 + lineHeight * 2;
  const col1X = margin; // Left column - Cuts AE
  const col2X = margin + 65; // Center column - Bill To (increased spacing)
  const col3X = margin + 130; // Right column - Billed By (increased spacing)

  // Left column - Invoice By
  pdf.setFont("Geist", "semibold");
  pdf.text("Invoice By", col1X, companyStartY);

  pdf.setFont("Geist", "normal");
  pdf.text("Cuts AE LLC", col1X, companyStartY + lineHeight); // Company name same size as body
  pdf.text("Villa 123, Khalifa City A", col1X, companyStartY + lineHeight * 2); // Address line 1
  pdf.text("Abu Dhabi, United Arab Emirates", col1X, companyStartY + lineHeight * 3); // City, Country
  pdf.text("invoices@cuts.ae", col1X, companyStartY + lineHeight * 4); // Email

  // Center column - Bill To (Customer)
  pdf.setFont("Geist", "semibold");
  pdf.text("Bill To", col2X, companyStartY);

  pdf.setFont("Geist", "normal");
  pdf.text(data.customer_name, col2X, companyStartY + lineHeight);
  pdf.text("Marina Tower, Al Reem Island", col2X, companyStartY + lineHeight * 2); // Address line 1
  pdf.text("Abu Dhabi, United Arab Emirates", col2X, companyStartY + lineHeight * 3); // City, Country
  if (data.customer_email) {
    pdf.text(data.customer_email, col2X, companyStartY + lineHeight * 4); // Email
  }

  // Right column - Billed By (Restaurant)
  pdf.setFont("Geist", "semibold");
  pdf.text("Billed By", col3X, companyStartY);

  pdf.setFont("Geist", "normal");
  pdf.text(data.restaurant_name, col3X, companyStartY + lineHeight);
  pdf.text("Building 5, Downtown Dubai", col3X, companyStartY + lineHeight * 2); // Address line 1
  pdf.text("Dubai, United Arab Emirates", col3X, companyStartY + lineHeight * 3); // City, Country
  pdf.text("restaurant@example.ae", col3X, companyStartY + lineHeight * 4); // Email

  // Order Items Table
  const tableStartY = companyStartY + lineHeight * 6 + 10;
  pdf.setTextColor(0);
  pdf.setFontSize(10);

  // Table header
  pdf.setFont("Geist", "semibold");
  const colDescription = margin;
  const colQty = pageWidth - margin - 95;
  const colUnitPrice = pageWidth - margin - 50;
  const colAmount = pageWidth - margin;

  pdf.text("Description", colDescription, tableStartY);
  pdf.text("Qty", colQty, tableStartY, { align: "right" });
  pdf.text("Unit price", colUnitPrice, tableStartY, { align: "right" });
  pdf.text("Amount", colAmount, tableStartY, { align: "right" });

  // Table header line
  const headerLineY = tableStartY + 2;
  pdf.setLineWidth(0.3);
  pdf.line(margin, headerLineY, pageWidth - margin, headerLineY);

  // Table body
  pdf.setFont("Geist", "normal");
  let currentY = tableStartY + 8;
  const items = data.items || [];
  let subtotal = 0;

  items.forEach((item) => {
    pdf.text(item.item_name || "Item", colDescription, currentY);
    pdf.text(item.quantity.toString(), colQty, currentY, { align: "right" });
    pdf.text(`AED ${Number(item.base_price).toFixed(2)}`, colUnitPrice, currentY, { align: "right" });
    pdf.text(`AED ${Number(item.item_total).toFixed(2)}`, colAmount, currentY, { align: "right" });

    subtotal += Number(item.item_total);
    currentY += 6;
  });

  // Table footer line
  const footerLineY = currentY + 2;
  pdf.setLineWidth(0.3);
  pdf.line(margin, footerLineY, pageWidth - margin, footerLineY);

  // Subtotal, Total, Amount Due
  currentY = footerLineY + 8;
  pdf.setFont("Geist", "semibold");

  const labelCol = pageWidth - margin - 50;
  const amountCol = pageWidth - margin;

  pdf.text("Subtotal", labelCol, currentY);
  pdf.text(`AED ${subtotal.toFixed(2)}`, amountCol, currentY, { align: "right" });

  currentY += 6;
  pdf.text("Total", labelCol, currentY);
  pdf.text(`AED ${Number(data.amount).toFixed(2)}`, amountCol, currentY, { align: "right" });

  currentY += 6;
  pdf.setFont("Geist", "bold");
  pdf.text("Amount due", labelCol, currentY);
  pdf.text(`AED ${Number(data.amount).toFixed(2)}`, amountCol, currentY, { align: "right" });

  // Payment Method Section
  currentY += 12;
  pdf.setTextColor(0);
  pdf.setFontSize(10);
  pdf.setFont("Geist", "semibold");

  const isPaid = data.status.toLowerCase() === 'paid';

  if (isPaid) {
    // Payment method table
    pdf.text("Payment method", colDescription, currentY);
    pdf.text("Card number", colQty - 10, currentY);
    pdf.text("Amount", colAmount, currentY, { align: "right" });

    // Payment method line
    const paymentLineY = currentY + 2;
    pdf.setLineWidth(0.3);
    pdf.line(margin, paymentLineY, pageWidth - margin, paymentLineY);

    // Payment details
    currentY = paymentLineY + 6;
    pdf.setFont("Geist", "normal");
    pdf.text("Credit Card", colDescription, currentY);
    pdf.text("**** **** **** 4242", colQty - 10, currentY);
    pdf.text(`AED ${Number(data.amount).toFixed(2)}`, colAmount, currentY, { align: "right" });

    // Net amount
    currentY += 8;
    pdf.setFont("Geist", "bold");
    pdf.text("Net amount", labelCol, currentY);
    pdf.text("AED 0.00", amountCol, currentY, { align: "right" });
  } else {
    // If unpaid, show net amount equals amount due
    pdf.text("Net amount", labelCol, currentY);
    pdf.text(`AED ${Number(data.amount).toFixed(2)}`, amountCol, currentY, { align: "right" });
  }

  // Footer
  pdf.setTextColor(150);
  pdf.setFontSize(8);
  const footerY = pageHeight - 20;
  pdf.text("Thank you for your business!", pageWidth / 2, footerY, { align: "center" });
  pdf.text("Cuts.ae - Dubai, United Arab Emirates", pageWidth / 2, footerY + 5, { align: "center" });
  pdf.text("support@cuts.ae", pageWidth / 2, footerY + 10, { align: "center" });

  // Return as blob URL
  const pdfBlob = pdf.output("blob");
  return URL.createObjectURL(pdfBlob);
}
